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
  private termsCache: Map<string, { terms: HighlightedTerm[], timestamp: number }>;
  private translationCache: Map<string, { translation: string, timestamp: number }>;
  private CACHE_TTL = 3600000; // 1 hour cache
  
  constructor() {
    // Initialize the Anthropic client
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.termsCache = new Map();
    this.translationCache = new Map();
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
      // Cache key is a hash of the text to avoid long keys
      const cacheKey = this.hashString(text);
      
      // Check cache first
      const cached = this.termsCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
        console.log('Using cached medical terms');
        return cached.terms;
      }
      
      // If text is very long, use a simpler regex-based approach
      if (text.length > 5000) {
        console.log('Text is too long for AI extraction, using regex patterns');
        const terms = this.extractMedicalTermsWithRegex(text);
        
        // Cache the results
        this.termsCache.set(cacheKey, {
          terms,
          timestamp: Date.now()
        });
        
        return terms;
      }
      
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
4. Importance level (high/medium/low) for a patient to understand

Format your response as a valid JSON array of objects like this:
[{
  "term": "exact term",
  "category": "category as listed above",
  "definition": "brief explanation",
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
        
        // Cache the results
        this.termsCache.set(cacheKey, {
          terms,
          timestamp: Date.now()
        });
        
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
   * Simple regex-based medical term extraction for long texts
   */
  private extractMedicalTermsWithRegex(text: string): HighlightedTerm[] {
    const terms: HighlightedTerm[] = [];
    
    // Common medical terms by category
    const medicalTerms: Record<MedicalTermCategory, string[]> = {
      [MedicalTermCategory.DIAGNOSIS]: [
        'cancer', 'carcinoma', 'adenocarcinoma', 'tumor', 'malignancy', 'metastasis',
        'esophageal cancer', 'Barrett\'s esophagus', 'dysplasia', 'stage', 'grade'
      ],
      [MedicalTermCategory.MEDICATION]: [
        'carboplatin', 'paclitaxel', 'cisplatin', 'fluorouracil', '5-FU', 'capecitabine',
        'docetaxel', 'oxaliplatin', 'irinotecan', 'leucovorin', 'trastuzumab'
      ],
      [MedicalTermCategory.PROCEDURE]: [
        'endoscopy', 'biopsy', 'esophagectomy', 'surgery', 'resection', 'EGD',
        'stenting', 'dilation', 'ablation', 'intubation'
      ],
      [MedicalTermCategory.LAB_TEST]: [
        'CBC', 'complete blood count', 'hemoglobin', 'WBC', 'platelets', 'CEA',
        'CA 19-9', 'PET scan', 'CT scan', 'MRI', 'endoscopic ultrasound'
      ],
      [MedicalTermCategory.VITAL_SIGN]: [
        'blood pressure', 'heart rate', 'pulse', 'temperature', 'oxygen saturation',
        'respiratory rate', 'weight', 'BMI'
      ],
      [MedicalTermCategory.ANATOMY]: [
        'esophagus', 'stomach', 'GE junction', 'gastroesophageal', 'lymph nodes',
        'diaphragm', 'liver', 'lungs', 'pleura', 'mediastinum'
      ],
      [MedicalTermCategory.MEDICAL_DEVICE]: [
        'stent', 'feeding tube', 'PEG tube', 'NG tube', 'central line',
        'port', 'infusion pump', 'endoscope'
      ],
      [MedicalTermCategory.GENETIC_MARKER]: [
        'HER2', 'PD-L1', 'EGFR', 'TP53', 'KRAS', 'BRAF', 'microsatellite',
        'CPS', 'MSI', 'TMB'
      ],
      [MedicalTermCategory.TREATMENT]: [
        'radiation therapy', 'chemotherapy', 'immunotherapy', 'targeted therapy',
        'neoadjuvant', 'adjuvant', 'palliative', 'chemoradiation', 'radiotherapy',
        'Gy', 'Gray', 'external beam'
      ],
      [MedicalTermCategory.SYMPTOM]: [
        'dysphagia', 'odynophagia', 'weight loss', 'pain', 'fatigue', 'nausea',
        'vomiting', 'heartburn', 'regurgitation', 'reflux', 'bleeding'
      ]
    };
    
    // Definitions for common terms
    const definitions: Record<string, string> = {
      'esophageal cancer': 'Cancer that forms in the tissues of the esophagus, the muscular tube through which food passes from the throat to the stomach.',
      'dysphagia': 'Difficulty swallowing, which is a common symptom of esophageal cancer.',
      'endoscopy': 'A procedure where a thin, flexible tube with a camera is used to examine the inside of the esophagus and stomach.',
      'radiation therapy': 'Treatment using high-energy rays to kill cancer cells or keep them from growing.',
      'chemotherapy': 'Treatment using drugs to stop the growth of cancer cells by killing them or stopping them from dividing.',
      'esophagectomy': 'Surgery to remove part or all of the esophagus, often used to treat esophageal cancer.',
      'adenocarcinoma': 'A type of cancer that begins in glandular cells, commonly found in the lower part of the esophagus.',
      'Barrett\'s esophagus': 'A condition where the lining of the esophagus changes to tissue similar to the intestinal lining, which can lead to esophageal cancer.',
      'metastasis': 'The spread of cancer from one part of the body to another.',
      'biopsy': 'Removal of tissue for examination under a microscope to check for cancer cells.',
      'PET scan': 'A type of imaging test that uses a radioactive substance to look for disease in the body.',
      'stage': 'A way of describing the size of a cancer and how far it has spread.',
      'lymph nodes': 'Small structures that filter harmful substances from the body and help fight infection and disease.'
    };
    
    // Importance levels for categories
    const importanceByCategory: Record<MedicalTermCategory, string> = {
      [MedicalTermCategory.DIAGNOSIS]: 'high',
      [MedicalTermCategory.MEDICATION]: 'medium',
      [MedicalTermCategory.PROCEDURE]: 'high',
      [MedicalTermCategory.LAB_TEST]: 'medium',
      [MedicalTermCategory.VITAL_SIGN]: 'low',
      [MedicalTermCategory.ANATOMY]: 'medium',
      [MedicalTermCategory.MEDICAL_DEVICE]: 'low',
      [MedicalTermCategory.GENETIC_MARKER]: 'medium',
      [MedicalTermCategory.TREATMENT]: 'high',
      [MedicalTermCategory.SYMPTOM]: 'high'
    };
    
    // Process each category
    Object.entries(medicalTerms).forEach(([category, termList]) => {
      const categoryEnum = category as MedicalTermCategory;
      
      termList.forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        let match;
        
        // Find all instances of the term
        while ((match = regex.exec(text)) !== null) {
          terms.push({
            term: match[0],
            category: categoryEnum,
            definition: definitions[term.toLowerCase()] || `A medical term related to ${categoryEnum}`,
            importance: importanceByCategory[categoryEnum] || 'medium'
          });
        }
      });
    });
    
    return terms;
  }
  
  /**
   * Create a simple hash of a string
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
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

  /**
   * Translate medical text into patient-friendly language
   * @param text The medical text to translate
   * @returns Promise containing the translated text
   */
  async translateMedicalText(text: string): Promise<string> {
    try {
      if (!text || text.trim() === '') {
        return '';
      }

      // Cache key is a hash of the text to avoid long keys
      const cacheKey = this.hashString(text);
      
      // Check cache first
      const cached = this.translationCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
        console.log('Using cached medical text translation');
        return cached.translation;
      }

      // If text is very long, break it into chunks
      if (text.length > 4000) {
        console.log('Text is too long, breaking into chunks for translation');
        // Split into paragraphs
        const paragraphs = text.split(/\n\s*\n/);
        let result = '';
        
        // Process each paragraph
        for (const paragraph of paragraphs) {
          if (paragraph.trim() === '') continue;
          const translatedParagraph = await this.translateMedicalText(paragraph);
          result += translatedParagraph + '\n\n';
        }
        
        // Cache the combined result
        this.translationCache.set(cacheKey, {
          translation: result,
          timestamp: Date.now()
        });
        
        return result;
      }

      const prompt = `
Translate the following medical text into patient-friendly language. 
- Replace medical jargon with plain language a layperson can understand
- Keep the meaning and important medical information intact
- Explain abbreviations and specialized terms
- Maintain a compassionate, clear tone
- Do NOT omit important details even if they're technical
- When presenting statistics, explain what they mean for the patient
- For any treatments mentioned, briefly explain their purpose
- Include the original medical terms in parentheses where appropriate

Here is the medical text to translate:
${text}

Translated version:
`;

      // Use Claude for high-quality medical text translation
      const message = await this.anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 4000,
        system: "You're a medical professional who specializes in translating complex medical information into patient-friendly language.",
        messages: [
          { role: "user", content: prompt }
        ],
      });

      // Extract the response
      let translatedText = '';
      if (message.content.length > 0) {
        const contentBlock = message.content[0] as any;
        translatedText = contentBlock.text || '';
      }

      // Cache the result
      this.translationCache.set(cacheKey, {
        translation: translatedText,
        timestamp: Date.now()
      });

      return translatedText;
    } catch (error) {
      console.error('Error translating medical text:', error);
      // Return original text if translation fails
      return `Failed to translate: ${text}`;
    }
  }

  /**
   * Translate a single medical term into plain language
   * @param term The medical term to translate
   * @returns Promise containing the translated explanation
   */
  async translateMedicalTerm(term: string): Promise<string> {
    try {
      if (!term || term.trim() === '') {
        return '';
      }

      // Cache key is a hash of the term to avoid long keys
      const cacheKey = `term_${this.hashString(term)}`;
      
      // Check cache first
      const cached = this.translationCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
        console.log('Using cached medical term translation');
        return cached.translation;
      }

      const prompt = `
Explain the medical term "${term}" in simple, patient-friendly language.
- Provide a clear, concise definition (2-3 sentences)
- Explain why this term might be important for a patient to understand
- Use analogies or everyday comparisons if helpful
- If it's a procedure, briefly explain what happens during it
- If it's a medication, briefly explain what it does
- If it's a condition, briefly explain its effects

Your response should be helpful for someone with no medical background.
`;

      // Use Claude for medical term explanation
      const message = await this.anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
        max_tokens: 1000,
        system: "You're a medical educator who specializes in explaining complex medical terms to patients without medical backgrounds.",
        messages: [
          { role: "user", content: prompt }
        ],
      });

      // Extract the response
      let explanation = '';
      if (message.content.length > 0) {
        const contentBlock = message.content[0] as any;
        explanation = contentBlock.text || '';
      }

      // Cache the result
      this.translationCache.set(cacheKey, {
        translation: explanation,
        timestamp: Date.now()
      });

      return explanation;
    } catch (error) {
      console.error('Error translating medical term:', error);
      // Return a basic response if translation fails
      return `${term} - a medical term (translation unavailable)`;
    }
  }
}

export const medicalTermService = new MedicalTermService();