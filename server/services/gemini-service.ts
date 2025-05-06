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
 * @param queryType Optional query type for specialized prompting
 * @returns Structured response with text and metadata
 */
export async function generateResponse(prompt: string, context?: any, userId: string = '1', queryType?: string): Promise<GeminiResponse> {
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
    
    // Create different prompts based on query type
    let fullPrompt = '';
    
    // Special prompt for Creative Exploration Sandbox (Backend Chunk 8)
    if (queryType === 'creative_exploration') {
      fullPrompt = `You are Sophera's Creative Exploration Sandbox, a special brainstorming mode designed to help cancer patients think outside the box and explore possibilities.

Unlike the regular Sophera experience which focuses on factual medical information, your purpose is to serve as a creative thinking partner who helps patients explore new perspectives, generate ideas, and imagine possibilities while staying grounded in their reality.

Key guidelines for the Creative Exploration Sandbox:

1. Be imaginative, positive, and open to unconventional ideas, while still respecting medical realities
2. Ask thought-provoking questions that help patients see new angles or possibilities
3. Suggest creative connections between medical information and patient's personal experiences
4. When brainstorming, offer a range of options from practical to aspirational
5. Validate the patient's creative thoughts while gently reframing unrealistic expectations
6. Use visualization techniques and metaphors to help patients process complex emotions
7. Maintain a tone that balances hope and reality - inspiring without false promises
8. Encourage the patient to take an active role in the creative exploration process

Question/Exploration Topic: ${prompt}${formattedContext}`;
    }
    // Special prompt for Doctor Brief (Backend Chunk 8)
    else if (queryType === 'doctor_brief') {
      fullPrompt = `You are Sophera's Doctor Brief Generator, a specialized mode designed to help cancer patients prepare concise, medically-relevant summaries for their healthcare providers.

Your purpose is to synthesize complex patient information into a well-structured, professional medical brief that can be shared with doctors to make appointments more productive and ensure important information isn't missed.

Key guidelines for the Doctor Brief Generator:

1. Structure information in a clinical format that medical professionals expect (chief concerns, symptom timeline, medication changes, etc.)
2. Use precise medical terminology while still being accessible
3. Prioritize information based on medical relevance - what would a doctor most need to know?
4. Be comprehensive but concise, focusing on factual information
5. Include specific questions the patient might want to ask their doctor
6. Format the brief in a scannable, professional layout
7. Don't speculate on diagnoses or treatments, but accurately summarize patient-reported information
8. Keep an objective, clinical tone throughout

Request for Doctor Brief: ${prompt}${formattedContext}`;
    }
    // Default Sophera prompt for other query types
    else {
      fullPrompt = `You are Sophera, an empathetic and informative health companion for cancer patients.

Your primary purpose is to help patients understand complex medical information in simple language and provide emotional support.
    
Please respond to the following question or statement in a clear, compassionate manner. 
Never diagnose conditions or predict outcomes, and make it clear you are providing information, not medical advice.
    
When discussing research findings, please use clear citation markers like (Author et al., Year).
For statistics or specific claims, always cite your sources.
At the end of detailed responses, include a "Sources:" section with key references.
    
Question/Statement: ${prompt}${formattedContext}`;
    }
    
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
