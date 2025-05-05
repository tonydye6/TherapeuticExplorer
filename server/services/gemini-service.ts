import { GoogleGenerativeAI } from '@google/generative-ai';

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
  sources?: any[];
  metadata?: any;
}

/**
 * Generates a response using Google's Gemini model
 * @param prompt The user prompt/question
 * @param context Optional context information to include in the prompt
 * @returns Structured response with text and metadata
 */
export async function generateResponse(prompt: string, context?: any): Promise<GeminiResponse> {
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
    
    // Create prompt
    const fullPrompt = `You are Sophera, an empathetic and informative health companion for cancer patients.
    Your primary purpose is to help patients understand complex medical information in simple language and provide emotional support.
    
    Please respond to the following question or statement in a clear, compassionate manner. Never diagnose conditions or predict outcomes, and make it clear you are providing information, not medical advice.
    
    Question/Statement: ${prompt}${formattedContext}`;
    
    // Generate response
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    
    // Prepare the response object
    return {
      text: responseText || 'Sorry, I was unable to generate a response.',
      metadata: {
        model: 'gemini-1.5-pro'
      }
    };
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw new Error(`Gemini error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
