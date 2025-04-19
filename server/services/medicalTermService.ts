import { ModelType } from '@shared/schema';
import { aiRouter } from './aiRouter';
import Anthropic from '@anthropic-ai/sdk';

// Medical term categories to highlight
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

// Structure for a highlighted medical term
export interface HighlightedTerm {
  term: string;
  category: MedicalTermCategory;
  definition?: string;
  importance?: string; // e.g., "high", "medium", "low"
  range?: [number, number]; // start and end indices in the text
}

class MedicalTermService {
  private anthropic: Anthropic;
  
  constructor() {
    // Initialize the Anthropic client
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Identify and highlight key medical terms in text
   */
  async highlightMedicalTerms(text: string): Promise<{
    highlightedText: string;
    terms: HighlightedTerm[];
  }> {
    try {
      // Extract medical terms using Claude
      const terms = await this.extractMedicalTerms(text);
      
      // Generate highlighted text with HTML spans
      const highlightedText = this.generateHighlightedText(text, terms);
      
      return {
        highlightedText,
        terms,
      };
    } catch (error) {
      console.error('Error highlighting medical terms:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Medical term highlighting failed: ${errorMessage}`);
    }
  }

  /**
   * Extract medical terms from text using AI
   */
  private async extractMedicalTerms(text: string): Promise<HighlightedTerm[]> {
    try {
      const prompt = `
I need you to analyze this medical text and identify key medical terms in these categories:
- Diagnoses (e.g., "esophageal cancer", "Barrett's esophagus")
- Medications (e.g., "cisplatin", "fluorouracil")
- Procedures (e.g., "endoscopy", "esophagectomy")
- Lab tests (e.g., "CBC", "liver function tests")
- Vital signs (e.g., "blood pressure", "heart rate")
- Anatomy (e.g., "esophagus", "gastroesophageal junction")
- Medical devices (e.g., "stent", "feeding tube")
- Genetic markers (e.g., "HER2", "PD-L1")
- Treatments (e.g., "radiation therapy", "immunotherapy")
- Symptoms (e.g., "dysphagia", "weight loss")

For EACH term you identify, provide:
1. The exact term as it appears in the text
2. The category it belongs to (one of the above)
3. A brief, patient-friendly definition (1-2 sentences)
4. The start and end character position in the text (for highlighting)
5. Importance level (high/medium/low) for a patient to understand

Format your response as a valid JSON array of objects like this:
[{
  "term": "exact term",
  "category": "category as listed above",
  "definition": "brief explanation",
  "range": [startIndex, endIndex],
  "importance": "high/medium/low"
}, ...]

Here is the text to analyze:
${text}
`;

      // Use Claude for more advanced medical term extraction
      const message = await this.anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 4000,
        system: "You're an AI trained to identify medical terminology. Always provide complete, accurate JSON.",
        messages: [
          { role: "user", content: prompt }
        ],
      });

      // Extract the JSON response safely
      let contentText = '';
      if (message.content.length > 0) {
        const contentBlock = message.content[0] as any;
        contentText = contentBlock.text || '';
      }
      
      // Try to extract JSON array from the response
      const jsonMatch = contentText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const terms = JSON.parse(jsonMatch[0]) as HighlightedTerm[];
        return terms;
      }
      
      // If no JSON found, return empty array
      console.warn('Failed to extract medical terms JSON from AI response');
      return [];
    } catch (error) {
      console.error('Error extracting medical terms:', error);
      // Return empty array instead of throwing to allow partial functionality
      return [];
    }
  }

  /**
   * Generate highlighted HTML text with term definitions on hover
   */
  private generateHighlightedText(text: string, terms: HighlightedTerm[]): string {
    if (!terms.length) return text;
    
    // Create a simple highlighting approach that doesn't rely on exact positioning
    // This is more robust when dealing with complex medical text
    
    // Create a map of terms to search for
    const termMap = new Map<string, HighlightedTerm>();
    for (const term of terms) {
      if (term.term) {
        termMap.set(term.term.toLowerCase(), term);
      }
    }
    
    // Simple regex-based replacement
    let highlightedText = text;
    
    // Process each term
    for (const [termText, termInfo] of termMap.entries()) {
      // Skip empty terms
      if (!termText.trim()) continue;
      
      // Create a regex that respects word boundaries
      const regex = new RegExp(`\\b${termText}\\b`, 'gi');
      
      // Create the HTML for this term
      const category = termInfo.category || 'unknown';
      const importance = termInfo.importance || 'medium';
      const definition = termInfo.definition ? termInfo.definition.replace(/"/g, '&quot;') : '';
      
      // Replace all occurrences
      highlightedText = highlightedText.replace(regex, (match) => {
        return `<span class="medical-term medical-term-${category} importance-${importance}" 
          title="${definition}" 
          data-term="${termInfo.term}" 
          data-category="${category}">${match}</span>`;
      });
    }
    
    return highlightedText;
  }
  
  /**
   * Filter medical terms by category
   */
  filterTermsByCategory(terms: HighlightedTerm[], category: MedicalTermCategory): HighlightedTerm[] {
    return terms.filter(term => term.category === category);
  }
  
  /**
   * Group medical terms by category
   */
  groupTermsByCategory(terms: HighlightedTerm[]): Record<MedicalTermCategory, HighlightedTerm[]> {
    const result = {} as Record<MedicalTermCategory, HighlightedTerm[]>;
    
    // Initialize empty arrays for each category
    Object.values(MedicalTermCategory).forEach(category => {
      result[category as MedicalTermCategory] = [];
    });
    
    // Group terms by category
    terms.forEach(term => {
      if (term.category in result) {
        result[term.category as MedicalTermCategory].push(term);
      }
    });
    
    return result;
  }
}

export const medicalTermService = new MedicalTermService();