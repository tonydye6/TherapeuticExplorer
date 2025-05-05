import { storage } from '../storage';
import { Document, ModelType } from '@shared/schema';
import { aiRouter } from './aiRouter';

/**
 * Interface for document analysis request
 */
export interface DocumentAnalysisRequest {
  documentId: number;
  analysisType: 'summary' | 'key_findings' | 'patient_impact' | 'custom';
  customPrompt?: string;
  preferredModel?: ModelType;
}

/**
 * Interface for document analysis response
 */
export interface DocumentAnalysisResponse {
  documentId: number;
  documentTitle: string;
  analysisType: string;
  content: string;
  keyFindings?: string[];
  patientImplications?: string[];
  actionItems?: string[];
  references?: string[];
  modelUsed: string;
}

/**
 * Interface for document comparison request
 */
export interface DocumentComparisonRequest {
  documentIds: number[];
  comparisonFocus?: 'findings' | 'methods' | 'results' | 'general';
  customPrompt?: string;
  preferredModel?: ModelType;
}

/**
 * Interface for document comparison response
 */
export interface DocumentComparisonResponse {
  documentTitles: string[];
  comparisonSummary: string;
  commonalities: string[];
  differences: string[];
  relevanceToPatient?: string;
  suggestedQuestions?: string[];
  modelUsed: string;
}

/**
 * Interface for technical term explanation request
 */
export interface TermExplanationRequest {
  documentId: number;
  term: string;
  preferredModel?: ModelType;
}

/**
 * Interface for technical term explanation response
 */
export interface TermExplanationResponse {
  term: string;
  plainLanguageExplanation: string;
  medicalContext: string;
  relevanceToPatient?: string;
  relatedTerms?: string[];
  modelUsed: string;
}

/**
 * Service for analyzing uploaded medical documents
 */
export class DocumentAnalysisService {
  /**
   * Analyze a document based on the given analysis type
   */
  async analyzeDocument(
    request: DocumentAnalysisRequest
  ): Promise<DocumentAnalysisResponse> {
    try {
      console.log(`Analyzing document with ID ${request.documentId}`);
      
      // Retrieve the document
      const document = await storage.getDocumentById(request.documentId);
      
      if (!document) {
        throw new Error(`Document with ID ${request.documentId} not found`);
      }
      
      // Get the document content
      const documentContent = document.content;
      let parsedContent = document.parsedContent;
      
      if (!documentContent && !parsedContent) {
        throw new Error('Document has no content to analyze');
      }
      
      // Prepare the prompt based on analysis type
      let prompt = '';
      
      switch (request.analysisType) {
        case 'summary':
          prompt = this.createSummaryPrompt(document);
          break;
        case 'key_findings':
          prompt = this.createKeyFindingsPrompt(document);
          break;
        case 'patient_impact':
          prompt = this.createPatientImpactPrompt(document);
          break;
        case 'custom':
          if (!request.customPrompt) {
            throw new Error('Custom prompt is required for custom analysis type');
          }
          prompt = `Analyze the following medical document. ${request.customPrompt}\n\nDocument: ${documentContent || JSON.stringify(parsedContent)}`;
          break;
        default:
          throw new Error(`Invalid analysis type: ${request.analysisType}`);
      }
      
      // Process the document with AI
      const aiResponse = await aiRouter.processTextQuery(prompt, request.preferredModel);
      
      // Format the response based on the analysis type
      let response: DocumentAnalysisResponse = {
        documentId: document.id,
        documentTitle: document.title,
        analysisType: request.analysisType,
        content: aiResponse.content,
        modelUsed: aiResponse.modelUsed || request.preferredModel || 'Unknown'
      };
      
      // Parse structured data if available (assuming Claude's JSON mode was used)
      if (aiResponse.structuredOutput) {
        try {
          const structured = aiResponse.structuredOutput as Record<string, any>;
          
          if (structured.keyFindings) {
            response.keyFindings = structured.keyFindings;
          }
          
          if (structured.patientImplications) {
            response.patientImplications = structured.patientImplications;
          }
          
          if (structured.actionItems) {
            response.actionItems = structured.actionItems;
          }
          
          if (structured.references) {
            response.references = structured.references;
          }
        } catch (error) {
          console.warn('Failed to parse structured output from AI response:', error);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw new Error(`Document analysis error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Compare multiple documents and identify commonalities and differences
   */
  async compareDocuments(
    request: DocumentComparisonRequest
  ): Promise<DocumentComparisonResponse> {
    try {
      console.log(`Comparing documents with IDs: ${request.documentIds.join(', ')}`);
      
      if (request.documentIds.length < 2) {
        throw new Error('At least two documents are required for comparison');
      }
      
      // Retrieve all documents
      const documents: Document[] = [];
      const documentTitles: string[] = [];
      
      for (const id of request.documentIds) {
        const doc = await storage.getDocumentById(id);
        
        if (!doc) {
          throw new Error(`Document with ID ${id} not found`);
        }
        
        documents.push(doc);
        documentTitles.push(doc.title);
      }
      
      // Prepare document contents for comparison
      const documentContents = documents.map(doc => {
        return {
          id: doc.id,
          title: doc.title,
          content: doc.content || JSON.stringify(doc.parsedContent)
        };
      });
      
      // Prepare the comparison prompt
      const prompt = this.createComparisonPrompt(documentContents, request.comparisonFocus, request.customPrompt);
      
      // Process the comparison with AI
      const aiResponse = await aiRouter.processTextQuery(prompt, request.preferredModel);
      
      // Format the response
      let response: DocumentComparisonResponse = {
        documentTitles,
        comparisonSummary: aiResponse.content,
        commonalities: [],
        differences: [],
        modelUsed: aiResponse.modelUsed || request.preferredModel || 'Unknown'
      };
      
      // Parse structured data if available
      if (aiResponse.structuredOutput) {
        try {
          const structured = aiResponse.structuredOutput as Record<string, any>;
          
          if (structured.commonalities && Array.isArray(structured.commonalities)) {
            response.commonalities = structured.commonalities;
          }
          
          if (structured.differences && Array.isArray(structured.differences)) {
            response.differences = structured.differences;
          }
          
          if (structured.relevanceToPatient) {
            response.relevanceToPatient = structured.relevanceToPatient;
          }
          
          if (structured.suggestedQuestions && Array.isArray(structured.suggestedQuestions)) {
            response.suggestedQuestions = structured.suggestedQuestions;
          }
        } catch (error) {
          console.warn('Failed to parse structured output from AI response:', error);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error comparing documents:', error);
      throw new Error(`Document comparison error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Explain a technical medical term found in a document in plain language
   */
  async explainTerm(
    request: TermExplanationRequest
  ): Promise<TermExplanationResponse> {
    try {
      console.log(`Explaining medical term '${request.term}' from document ${request.documentId}`);
      
      // Retrieve the document
      const document = await storage.getDocumentById(request.documentId);
      
      if (!document) {
        throw new Error(`Document with ID ${request.documentId} not found`);
      }
      
      // Get the document content
      const documentContent = document.content || JSON.stringify(document.parsedContent);
      
      if (!documentContent) {
        throw new Error('Document has no content');
      }
      
      // Prepare the prompt for term explanation
      const prompt = this.createTermExplanationPrompt(request.term, documentContent);
      
      // Process the term explanation with AI
      const aiResponse = await aiRouter.processTextQuery(prompt, request.preferredModel);
      
      // Format the response
      let response: TermExplanationResponse = {
        term: request.term,
        plainLanguageExplanation: '',
        medicalContext: '',
        modelUsed: aiResponse.modelUsed || request.preferredModel || 'Unknown'
      };
      
      // Parse structured data if available
      if (aiResponse.structuredOutput) {
        try {
          const structured = aiResponse.structuredOutput as Record<string, any>;
          
          response.plainLanguageExplanation = structured.plainLanguageExplanation || '';
          response.medicalContext = structured.medicalContext || '';
          
          if (structured.relevanceToPatient) {
            response.relevanceToPatient = structured.relevanceToPatient;
          }
          
          if (structured.relatedTerms && Array.isArray(structured.relatedTerms)) {
            response.relatedTerms = structured.relatedTerms;
          }
        } catch (error) {
          // If structured parsing fails, use the text content
          console.warn('Failed to parse structured output from AI response:', error);
          response.plainLanguageExplanation = aiResponse.content;
        }
      } else {
        // If no structured output, use the text content
        response.plainLanguageExplanation = aiResponse.content;
      }
      
      return response;
    } catch (error) {
      console.error('Error explaining medical term:', error);
      throw new Error(`Term explanation error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create a prompt for document summary
   */
  private createSummaryPrompt(document: Document): string {
    return `You are Sophera's document analyzer. Please provide a clear, concise summary of the following medical document.
    
    Document Title: ${document.title}
    Document Type: ${document.type || 'Medical document'}
    
    Focus on extracting the most important information that would be relevant to a patient.
    Use plain, accessible language while maintaining medical accuracy.
    Organize the information in a structured, easy-to-understand format.
    
    Please respond in JSON format with the following structure:
    {
      "summary": "A concise summary of the document in 2-3 paragraphs",
      "keyFindings": ["Key finding 1", "Key finding 2", ...],
      "patientImplications": ["Implication 1", "Implication 2", ...],
      "actionItems": ["Suggested action 1", "Suggested action 2", ...]
    }
    
    Document Content:
    ${document.content || JSON.stringify(document.parsedContent)}`;
  }

  /**
   * Create a prompt for extracting key findings
   */
  private createKeyFindingsPrompt(document: Document): string {
    return `You are Sophera's document analyzer. Please extract and explain the key findings from the following medical document.
    
    Document Title: ${document.title}
    Document Type: ${document.type || 'Medical document'}
    
    Focus on identifying the most significant medical findings, test results, or conclusions.
    For each finding, provide a plain language explanation of what it means.
    If possible, include any reference ranges or context to help understand the significance.
    
    Please respond in JSON format with the following structure:
    {
      "keyFindings": [
        {
          "finding": "The specific finding as stated in the document",
          "explanation": "What this means in plain language",
          "significance": "The medical significance of this finding"
        },
        ...
      ],
      "summary": "A brief summary of the overall findings",
      "references": ["Any referenced studies or guidelines mentioned"]
    }
    
    Document Content:
    ${document.content || JSON.stringify(document.parsedContent)}`;
  }

  /**
   * Create a prompt for patient impact analysis
   */
  private createPatientImpactPrompt(document: Document): string {
    return `You are Sophera's document analyzer. Please analyze the following medical document and explain its implications for the patient's care.
    
    Document Title: ${document.title}
    Document Type: ${document.type || 'Medical document'}
    
    Focus on:
    1. How this information might affect the patient's treatment plan
    2. Questions the patient might want to ask their healthcare provider
    3. Practical implications for the patient's daily life or care routine
    4. Any next steps that might be recommended based on this information
    
    Maintain a balanced, hopeful tone while being accurate and honest about the information.
    Use plain, accessible language while maintaining medical accuracy.
    
    Please respond in JSON format with the following structure:
    {
      "summary": "A concise summary of the document's key points",
      "patientImplications": ["Implication 1", "Implication 2", ...],
      "suggestedQuestions": ["Question 1", "Question 2", ...],
      "practicalConsiderations": ["Consideration 1", "Consideration 2", ...],
      "nextSteps": ["Potential next step 1", "Potential next step 2", ...]
    }
    
    Document Content:
    ${document.content || JSON.stringify(document.parsedContent)}`;
  }

  /**
   * Create a prompt for document comparison
   */
  private createComparisonPrompt(
    documents: Array<{id: number, title: string, content: string}>,
    focus?: 'findings' | 'methods' | 'results' | 'general',
    customPrompt?: string
  ): string {
    let focusInstruction = '';
    
    switch (focus) {
      case 'findings':
        focusInstruction = 'Focus specifically on comparing the key findings and conclusions between these documents.';
        break;
      case 'methods':
        focusInstruction = 'Focus specifically on comparing the methods, approaches, or techniques described in these documents.';
        break;
      case 'results':
        focusInstruction = 'Focus specifically on comparing the results, outcomes, or data presented in these documents.';
        break;
      default:
        focusInstruction = 'Provide a general comparison of the content, findings, and implications of these documents.';
    }
    
    let documentContents = '';
    
    for (const doc of documents) {
      documentContents += `\n\nDocument ID: ${doc.id}\nTitle: ${doc.title}\nContent: ${doc.content}`;
    }
    
    return `You are Sophera's document comparison expert. Please compare the following medical documents.
    
    ${focusInstruction}
    ${customPrompt ? '\nAdditional instructions: ' + customPrompt : ''}
    
    For your comparison:
    1. Identify key commonalities between the documents
    2. Highlight important differences
    3. Explain the relevance of these similarities and differences to the patient's understanding
    4. Suggest questions the patient might want to ask their healthcare provider based on this comparison
    
    Please respond in JSON format with the following structure:
    {
      "comparisonSummary": "A concise summary of how these documents relate to each other",
      "commonalities": ["Commonality 1", "Commonality 2", ...],
      "differences": ["Difference 1", "Difference 2", ...],
      "relevanceToPatient": "An explanation of why these similarities and differences matter to the patient",
      "suggestedQuestions": ["Question 1", "Question 2", ...]
    }
    
    Documents:${documentContents}`;
  }

  /**
   * Create a prompt for explaining medical terms
   */
  private createTermExplanationPrompt(term: string, documentContent: string): string {
    return `You are Sophera's medical terminology expert. Please explain the following medical term in plain language.
    
    Term: ${term}
    
    The term appears in this medical document:
    ${documentContent.substring(0, 2000)}${documentContent.length > 2000 ? '...' : ''}
    
    Please provide:
    1. A plain language explanation that a non-medical person can understand
    2. The medical context of this term
    3. Why this term might be relevant to a patient
    4. Related terms that might also be helpful to understand
    
    Please respond in JSON format with the following structure:
    {
      "plainLanguageExplanation": "Simple explanation of the term",
      "medicalContext": "How this term is used in medicine",
      "relevanceToPatient": "Why a patient should understand this term",
      "relatedTerms": ["Related term 1", "Related term 2", ...]
    }`;
  }
}

export const documentAnalysisService = new DocumentAnalysisService();
