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
import { medicalTermService } from './medicalTermService';

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

import * as mammoth from 'mammoth';

/**
 * Medical OCR Service
 * Specialized in processing medical documents with OCR and extracting structured information
 * Supports various document formats including:
 * - PDF
 * - Images (JPEG, PNG, TIFF, GIF)
 * - Word documents (DOCX, DOC)
 * - Text documents (TXT, CSV, RTF)
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
    highlightedText?: string;
    medicalTerms?: any[];
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
      } else if (fileType.includes('docx') || fileType.includes('doc')) {
        // Process Word document - dynamically import mammoth
        try {
          const mammoth = await import('mammoth');
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = result.value;
          confidence = 0.95; // Word docs typically extract with high confidence
        } catch (error) {
          console.error('Error processing Word document:', error);
          throw new Error('Failed to process Word document. Make sure mammoth.js is installed.');
        }
      } else if (fileType.includes('csv') || fileType.includes('text/plain') || fileType.includes('txt')) {
        // Process plain text or CSV - simple UTF-8 decoding
        extractedText = fileBuffer.toString('utf-8');
        confidence = 1.0; // Perfect confidence for text files
      } else if (fileType.includes('rtf')) {
        // Process RTF files - this would need a specialized library
        try {
          // Convert RTF to plaintext (simplified approach)
          extractedText = this.stripRtfTags(fileBuffer.toString('utf-8'));
          confidence = 0.85;
        } catch (error) {
          console.error('Error processing RTF document:', error);
          throw new Error('Failed to process RTF document');
        }
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Extract structured medical data from the text
      const structuredData = await this.extractMedicalData(extractedText);
      
      // Highlight medical terms
      const { highlightedText, terms } = await medicalTermService.highlightMedicalTerms(extractedText);

      return {
        text: extractedText,
        structuredData,
        highlightedText,
        medicalTerms: terms,
        confidence,
      };
    } catch (error) {
      console.error('Error processing document with OCR:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`OCR processing failed: ${errorMessage}`);
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
      worker = await createWorker('eng+osd');

      // Set special configuration for medical documents
      await worker.setParameters({
        tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,;:+-_()[]{}!@#$%^&*=<>?/\\"\' ',
        tessedit_pageseg_mode: PSM.AUTO,
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Image OCR processing failed: ${errorMessage}`);
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
        // Getting the text content safely from ContentBlock by using type assertions
        let contentText = '';
        if (message.content.length > 0) {
          const contentBlock = message.content[0] as any;
          contentText = contentBlock.text || '';
        }
        
        // Try to extract JSON object from the response
        const jsonMatch = contentText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        // Fallback: return the raw response
        return { 
          rawExtraction: contentText,
          error: "Failed to parse structured JSON from AI response" 
        };
      } catch (parseError) {
        console.error('Error parsing JSON from AI response:', parseError);
        
        // Safe access to content
        let errorContentText = '';
        if (message.content.length > 0) {
          const contentBlock = message.content[0] as any;
          errorContentText = contentBlock.text || '';
        }
        
        return { 
          rawExtraction: errorContentText,
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
   * Convert RTF to plain text by stripping RTF tags
   * This is a simplified method - a full implementation would use a dedicated RTF parser
   */
  private stripRtfTags(rtfContent: string): string {
    try {
      // Remove RTF header and control words
      let text = rtfContent.replace(/\{\\rtf1.*?\\viewkind.*?\\/s, '');
      
      // Remove other common RTF control words
      text = text.replace(/\\[a-zA-Z0-9]+(-?[0-9]+)?[ ]?/g, '');
      text = text.replace(/\\[\'\"\*\{\}]/g, '');
      
      // Remove curly braces
      text = text.replace(/\{|\}/g, '');
      
      // Replace escaped line breaks with actual line breaks
      text = text.replace(/\\par\s/g, '\n');
      
      // Handle special characters
      text = text.replace(/\\'([0-9a-fA-F]{2})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
      
      // Handle Unicode characters
      text = text.replace(/\\u([0-9]+)\?/g, (match, decimal) => {
        return String.fromCharCode(parseInt(decimal, 10));
      });
      
      return text.trim();
    } catch (error) {
      console.error('Error stripping RTF tags:', error);
      // If RTF parsing fails, return original content with a warning
      return rtfContent + "\n[RTF parsing error - raw content shown]";
    }
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
    } else if (lowerText.includes('operative') && lowerText.includes('note')) {
      return 'Operative Note';
    } else if (lowerText.includes('endoscopy') || lowerText.includes('colonoscopy') || lowerText.includes('gastroscopy')) {
      return 'Endoscopy Report';
    } else if (lowerText.includes('biopsy')) {
      return 'Biopsy Report';
    } else if (lowerText.includes('genetic') || lowerText.includes('genomic')) {
      return 'Genetic Report';
    }
    
    return 'Unknown Medical Document';
  }
}

export const ocrService = new OCRService();