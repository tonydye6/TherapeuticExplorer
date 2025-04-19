import { OpenAI } from "openai";

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cache for translated terms to improve performance and reduce API calls
interface TermCache {
  [key: string]: {
    explanation: string;
    timestamp: number;
  };
}

// Types for term highlighting functionality
interface HighlightedTerm {
  term: string;
  explanation: string;
}

interface HighlightResult {
  highlightedText: string;
  terms: HighlightedTerm[];
}

// Set cache expiration time (12 hours in milliseconds)
const CACHE_EXPIRATION = 12 * 60 * 60 * 1000;

// In-memory cache for translated terms
const termCache: TermCache = {};

/**
 * Medical terminology translation service
 */
export const medicalTermService = {
  /**
   * Translates medical text to patient-friendly language
   * @param text Medical text to translate
   * @returns Translated patient-friendly text
   */
  async translateMedicalText(text: string): Promise<string> {
    try {
      // Ensure we have a valid API key
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("Missing OpenAI API key in environment variables");
      }

      // Define the system prompt for the translation task
      const systemPrompt = `
        You are a specialized medical translator for cancer patients, particularly those with esophageal cancer.
        Your task is to translate complex medical terminology and explanations into clear, accurate language 
        that a patient without medical training can understand, while maintaining all important medical information.
        
        Guidelines:
        1. Replace medical jargon with everyday language
        2. Explain medical procedures in simple terms
        3. Maintain all important medical information and meaning
        4. Be compassionate and respectful in your language
        5. Add brief explanations in parentheses for terms that cannot be simplified
        6. Keep the same paragraph structure as the original text
        7. Do not add additional information not present in the original text
        8. Do not oversimplify to the point of losing important medical nuance
      `;

      // Use GPT model to translate the text
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Translate this medical text to patient-friendly language: ${text}` }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      // Return the translated text from the response
      return response.choices[0].message.content?.trim() || "Translation unavailable";
    } catch (error) {
      console.error("Error translating medical text:", error);
      throw new Error("Failed to translate medical text");
    }
  },

  /**
   * Translates a specific medical term with detailed explanation
   * @param term Medical term to translate
   * @returns Patient-friendly explanation of the term
   */
  async translateMedicalTerm(term: string): Promise<string> {
    try {
      // Normalize the term (lowercase for cache lookup)
      const normalizedTerm = term.toLowerCase().trim();
      
      // Check if term is in cache and not expired
      const currentTime = Date.now();
      if (
        termCache[normalizedTerm] &&
        currentTime - termCache[normalizedTerm].timestamp < CACHE_EXPIRATION
      ) {
        console.log(`Using cached translation for term: ${normalizedTerm}`);
        return termCache[normalizedTerm].explanation;
      }

      // Ensure we have a valid API key
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("Missing OpenAI API key in environment variables");
      }

      // Define the system prompt for the term explanation task
      const systemPrompt = `
        You are a specialized medical translator for cancer patients, particularly those with esophageal cancer.
        Your task is to explain medical terms in clear, patient-friendly language.
        
        For each term, provide:
        1. A simple definition in everyday language (1 sentence)
        2. A brief explanation of what it means in the context of cancer treatment (1-2 sentences)
        3. Why it might be relevant to a patient (1 sentence)
        
        Keep your total explanation concise (3-4 sentences maximum).
        Be compassionate, accurate and avoid technical jargon in your explanation.
      `;

      // Use GPT model to explain the term
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Explain this medical term in patient-friendly language: "${term}"` }
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      // Get the explanation from the response
      const explanation = response.choices[0].message.content?.trim() || 
        "Explanation unavailable. Please try a different term.";
      
      // Cache the result
      termCache[normalizedTerm] = {
        explanation,
        timestamp: currentTime
      };

      return explanation;
    } catch (error) {
      console.error("Error translating medical term:", error);
      throw new Error("Failed to translate medical term");
    }
  },

  /**
   * Generates a list of common medical terms related to esophageal cancer
   * @returns Array of common medical terms
   */
  async getCommonMedicalTerms(): Promise<string[]> {
    // Static list of common terms related to esophageal cancer
    const commonTerms = [
      "dysphagia",
      "odynophagia",
      "Barrett's esophagus",
      "adenocarcinoma",
      "squamous cell carcinoma",
      "endoscopy",
      "esophageal stricture",
      "reflux",
      "biopsy",
      "staging",
      "metastasis",
      "lymph node",
      "neoadjuvant therapy",
      "adjuvant therapy",
      "esophagectomy",
      "radiation therapy",
      "chemotherapy",
      "immunotherapy",
      "palliative care",
      "gastroesophageal junction"
    ];
    
    return commonTerms;
  },

  /**
   * Highlights medical terms in text with pre-fetched explanations
   * @param text Text to scan for medical terms
   * @returns Highlighted text and term explanations
   */
  async highlightMedicalTerms(text: string): Promise<HighlightResult> {
    try {
      // Common medical terms we want to highlight
      const medicalTerms = await this.getCommonMedicalTerms();
      
      // Create a map to store terms and their explanations
      const termMap = new Map<string, HighlightedTerm>();
      
      // Process each term in parallel to improve performance
      await Promise.all(
        medicalTerms.map(async (term) => {
          // Check if the term appears in the text (case insensitive)
          const termRegex = new RegExp(`\\b${term}\\b`, 'i');
          if (termRegex.test(text)) {
            // Get explanation for the term
            const explanation = await this.translateMedicalTerm(term);
            
            // Store the term and explanation
            const matchedTerm = text.match(termRegex)?.[0] || term;
            termMap.set(matchedTerm, {
              term: matchedTerm,
              explanation
            });
          }
        })
      );
      
      // Create highlighted text with span tags
      let highlightedText = text;
      
      // Sort terms by length (longest first) to handle nested terms correctly
      const sortedTerms = Array.from(termMap.entries())
        .sort((a, b) => b[0].length - a[0].length);
      
      // Replace each term with a highlighted version
      for (const [term, data] of sortedTerms) {
        const termRegex = new RegExp(`\\b${term}\\b`, 'gi');
        highlightedText = highlightedText.replace(
          termRegex, 
          `<span class="highlighted-term" data-term="${term.replace(/"/g, '&quot;')}">${term}</span>`
        );
      }
      
      return {
        highlightedText,
        terms: Array.from(termMap.values())
      };
    } catch (error) {
      console.error("Error highlighting medical terms:", error);
      // Return original text if there's an error
      return {
        highlightedText: text,
        terms: []
      };
    }
  }
};