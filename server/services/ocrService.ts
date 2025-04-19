// Import tesseract directly to avoid import errors
import { createWorker, PSM } from 'tesseract.js';
// Import pdf-parse dynamically to avoid loading test PDF files at startup
import type * as pdfParseType from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { ModelType } from '@shared/schema';
import { aiRouter } from './aiRouter';
import Anthropic from '@anthropic-ai/sdk';

// Promisify fs functions
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Temporary directory for storing files
const TEMP_DIR = path.join(process.cwd(), 'tmp');

/**
 * Medical OCR Service
 * Specialized in processing medical documents with OCR and extracting structured information
 */
class OCRService {
  /**
   * Process a document using OCR and extract medical information
   */
  async processDocument(
    fileBuffer: Buffer,
    fileType: string,
    filename: string
  ): Promise<{
    text: string;
    structuredData: any;
    confidence: number;
  }> {
    try {
      // Create temp directory if it doesn't exist
      try {
        await mkdir(TEMP_DIR, { recursive: true });
      } catch (error) {
        // Directory already exists, ignore
      }

      // Extract text based on file type
      let extractedText = '';
      let confidence = 0;

      if (fileType.includes('pdf')) {
        // Process PDF document
        const result = await this.processPDF(fileBuffer);
        extractedText = result.text;
        confidence = result.confidence;
      } else if (fileType.includes('image')) {
        // Process image using Tesseract
        const result = await this.processImage(fileBuffer, filename);
        extractedText = result.text;
        confidence = result.confidence;
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Extract structured medical data from the text
      const structuredData = await this.extractMedicalData(extractedText);

      return {
        text: extractedText,
        structuredData,
        confidence,
      };
    } catch (error) {
      console.error('Error processing document with OCR:', error);
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  /**
   * Process a PDF document
   */
  private async processPDF(
    pdfBuffer: Buffer
  ): Promise<{ text: string; confidence: number }> {
    try {
      // Dynamically import pdf-parse to avoid loading test PDF files at startup
      const pdfParse = await import('pdf-parse').then(module => module.default);
      
      // Process the PDF document
      const data = await pdfParse(pdfBuffer);
      
      // If text is extractable from the PDF, return it
      if (data.text && data.text.trim().length > 100) {
        return { text: data.text, confidence: 0.9 };
      }
      
      // If not enough text was extracted, the PDF might be scanned
      // Fall back to OCR processing (would need to convert PDF pages to images first)
      // This is a simplified version - a full implementation would extract 
      // images from each page and process them with Tesseract
      return { 
        text: data.text || 'PDF appears to be a scanned document that requires image-based OCR.',
        confidence: data.text ? 0.5 : 0.1
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Process an image using Tesseract OCR
   */
  private async processImage(
    imageBuffer: Buffer,
    filename: string
  ): Promise<{ text: string; confidence: number }> {
    const imagePath = path.join(TEMP_DIR, filename);
    let worker;

    try {
      // Save buffer to temporary file
      await writeFile(imagePath, imageBuffer);

      // Create Tesseract worker
      worker = await tesseract.createWorker('eng+osd');

      // Set special configuration for medical documents
      await worker.setParameters({
        tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,;:+-_()[]{}!@#$%^&*=<>?/\\"\' ',
        tessedit_pageseg_mode: tesseract.PSM.AUTO,
        preserve_interword_spaces: '1',
      });

      // Recognize text
      const result = await worker.recognize(imagePath);
      
      // Calculate average confidence
      const confidence = result.data.confidence / 100;

      return {
        text: result.data.text,
        confidence,
      };
    } catch (error) {
      console.error('Error processing image with Tesseract:', error);
      throw new Error(`Image OCR processing failed: ${error.message}`);
    } finally {
      // Cleanup
      if (worker) await worker.terminate();
      try {
        await unlink(imagePath);
      } catch (error) {
        console.error(`Error removing temporary file ${imagePath}:`, error);
      }
    }
  }

  /**
   * Extract structured medical data from text
   */
  private async extractMedicalData(text: string): Promise<any> {
    try {
      const prompt = `
You are analyzing a medical document that has been processed with OCR. Extract and structure the following information in a JSON format:

1. Document Type (e.g., lab report, radiology report, discharge summary, prescription)
2. Patient Information (name, DOB, medical record number if available)
3. Dates (document date, service date)
4. Relevant medical terms (diagnoses, medications, procedures)
5. Lab values or test results (name, value, reference range)
6. Healthcare providers mentioned (doctors, specialists, etc.)
7. Key clinical findings

If certain information is not found, mark it as null or empty array as appropriate.
Here is the OCR text:

${text}

Format your response as valid JSON.
`;

      // Use Claude for more advanced structured data extraction
      const message = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 2000,
        system: "You're an AI trained to extract structured medical data from OCR text. Always output valid JSON.",
        messages: [
          { role: "user", content: prompt }
        ],
      });

      try {
        // Parse the structured data from the AI response
        const content = message.content[0].text;
        
        // Try to extract JSON object from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        // Fallback: return the raw response
        return { 
          rawExtraction: content,
          error: "Failed to parse structured JSON from AI response" 
        };
      } catch (parseError) {
        console.error('Error parsing JSON from AI response:', parseError);
        return { 
          rawExtraction: message.content[0].text,
          error: "Failed to parse structured JSON from AI response" 
        };
      }
    } catch (error) {
      console.error('Error extracting medical data:', error);
      // Fallback to simple extraction if AI processing fails
      return this.fallbackExtraction(text);
    }
  }

  /**
   * Fallback method for extracting basic data patterns when AI processing fails
   */
  private fallbackExtraction(text: string): any {
    // Simple pattern matching for common medical document elements
    const extractDates = (txt: string): string[] => {
      // Match common date formats (MM/DD/YYYY, YYYY-MM-DD, etc.)
      const dateRegex = /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-](19|20)\d{2}\b|\b(19|20)\d{2}[\/\-](0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12][0-9]|3[01])\b/g;
      return txt.match(dateRegex) || [];
    };

    const extractMRN = (txt: string): string | null => {
      // Look for common MRN patterns (typically labeled as "MRN" or "Medical Record Number")
      const mrnRegex = /(?:MRN|Medical Record(?:\s+Number)?|Record Number)[\s:#]*([A-Z0-9]{5,10})/i;
      const match = txt.match(mrnRegex);
      return match ? match[1] : null;
    };

    const extractLabValues = (txt: string): any[] => {
      // Look for patterns like "TEST: 10.5 mg/dL (REF: 3.5-5.5)"
      const labRegex = /([A-Za-z\s]+):\s*([\d\.]+)\s*([a-zA-Z\/%]+)?\s*(?:\((?:REF|Reference):\s*([\d\.\-]+)\))?/g;
      const labs = [];
      let match;
      
      while ((match = labRegex.exec(txt)) !== null) {
        labs.push({
          test: match[1].trim(),
          value: match[2],
          unit: match[3] || null,
          referenceRange: match[4] || null
        });
      }
      
      return labs;
    };

    // Return basic structured data
    return {
      documentType: this.guessDocumentType(text),
      dates: extractDates(text),
      mrn: extractMRN(text),
      labValues: extractLabValues(text)
    };
  }

  /**
   * Guess the document type based on content
   */
  private guessDocumentType(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('lab') && (lowerText.includes('result') || lowerText.includes('report'))) {
      return 'Lab Report';
    } else if (lowerText.includes('prescription') || lowerText.includes('rx:') || lowerText.includes('sig:')) {
      return 'Prescription';
    } else if (lowerText.includes('radiology') || lowerText.includes('imaging') || lowerText.includes('x-ray') || 
               lowerText.includes('ct scan') || lowerText.includes('mri')) {
      return 'Radiology Report';
    } else if (lowerText.includes('discharge') && lowerText.includes('summary')) {
      return 'Discharge Summary';
    } else if (lowerText.includes('pathology')) {
      return 'Pathology Report';
    } else if (lowerText.includes('surgical') && lowerText.includes('report')) {
      return 'Surgical Report';
    } else if (lowerText.includes('history') && lowerText.includes('physical')) {
      return 'History and Physical';
    } else if (lowerText.includes('progress') && lowerText.includes('note')) {
      return 'Progress Note';
    } else if (lowerText.includes('consultation') || lowerText.includes('consult')) {
      return 'Consultation Note';
    }
    
    return 'Unknown Medical Document';
  }
}

export const ocrService = new OCRService();