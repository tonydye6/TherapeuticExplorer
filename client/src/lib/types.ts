// Medical term categories
export enum MedicalTermCategory {
  DIAGNOSIS = 'diagnosis',
  MEDICATION = 'medication',
  PROCEDURE = 'procedure',
  LAB_TEST = 'lab_test',
  VITAL_SIGN = 'vital_sign',
  ANATOMY = 'anatomy',
  MEDICAL_DEVICE = 'medical_device',
  GENETIC_MARKER = 'genetic_marker',
  TREATMENT = 'treatment',
  SYMPTOM = 'symptom',
}

// Highlighted medical term structure
export interface HighlightedTerm {
  term: string;
  category: MedicalTermCategory;
  definition?: string;
  importance?: string; // e.g., "high", "medium", "low"
  range?: [number, number]; // start and end indices in the text
}

// Document processing result
export interface DocumentProcessingResult {
  text: string;
  structuredData: any;
  highlightedText?: string;
  medicalTerms?: HighlightedTerm[];
  confidence: number;
}

// AI model types for badges and visualizations
export enum AIModel {
  CLAUDE = 'Claude',
  GPT = 'GPT-4o',
  GEMINI = 'Gemini',
  MIXED = 'Multi-model'
}

// Search result with relevance score
export interface SearchResult {
  id: number;
  title: string;
  content: string;
  snippet: string;
  score: number;
  source: string;
  date: string;
  type: string;
}

// Vector embedding for semantic search
export interface VectorEmbedding {
  id: number;
  content: string;
  embedding: number[];
  docType: string;
  docId: number;
}

// Common form field errors
export interface FormErrors {
  [key: string]: string;
}