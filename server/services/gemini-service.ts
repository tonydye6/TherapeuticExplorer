import { GoogleGenerativeAI } from '@google/generative-ai';
import { Source } from '@shared/schema';
import { sourceAttributionService } from './sourceAttribution';

// Initialize Google Generative AI client with API key
// Note: If you want to use this in production, you'll need to get a valid API key
let genAI: GoogleGenerativeAI | null = null;

try {
  if (process.env.GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
} catch (error) {
  console.warn('Failed to initialize Google Generative AI client:', error);
}

/**
 * Interface for structured Gemini responses
 */
interface GeminiResponse {
  text: string;
  sources?: Source[];
  metadata?: any;
}

/**
 * Generates a response using Google's Gemini model
 * @param prompt The user prompt/question
 * @param context Optional context information to include in the prompt
 * @param userId User ID for source attribution
 * @returns Structured response with text and metadata
 */
export async function generateResponse(prompt: string, context?: any, userId: string = '1'): Promise<GeminiResponse> {
  try {
    console.log('Generating response with Gemini');
    
    // Check if Gemini client is initialized
    if (!genAI) {
      throw new Error('Google Generative AI client not initialized. Missing API key.');
    }
    
    // Format context if provided
    let formattedContext = '';
    if (context) {
      if (Array.isArray(context)) {
        formattedContext = '\nContext:\n' + context.map((c, i) => `[${i+1}] ${c.text || c}`).join('\n');
      } else if (typeof context === 'object') {
        formattedContext = '\nContext:\n' + Object.entries(context)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      } else if (typeof context === 'string') {
        formattedContext = '\nContext:\n' + context;
      }
    }
    
    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Create prompt with enhanced source attribution guidelines
    const fullPrompt = `You are Sophera, an empathetic and informative health companion for cancer patients.
    Your primary purpose is to help patients understand complex medical information in simple language and provide emotional support.
    
    Please respond to the following question or statement in a clear, compassionate manner. 
    Never diagnose conditions or predict outcomes, and make it clear you are providing information, not medical advice.
    
    When discussing research findings, please use clear citation markers like (Author et al., Year).
    For statistics or specific claims, always cite your sources.
    At the end of detailed responses, include a "Sources:" section with key references.
    
    Question/Statement: ${prompt}${formattedContext}`;
    
    // Generate response
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    
    // Process the response to extract and enhance sources
    const { processedText, sources } = await sourceAttributionService.processResponseWithSources(
      responseText || 'Sorry, I was unable to generate a response.',
      userId
    );
    
    // Prepare the response object with sources
    return {
      text: processedText,
      sources: sources,
      metadata: {
        model: 'gemini-1.5-pro'
      }
    };
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw new Error(`Gemini error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
