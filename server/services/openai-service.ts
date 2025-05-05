import OpenAI from 'openai';
import { Source } from '@shared/schema';
import { sourceAttributionService } from './sourceAttribution';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Interface for structured OpenAI responses
 */
interface OpenAIResponse {
  text: string;
  sources?: Source[];
  metadata?: any;
}

/**
 * Generates a response using OpenAI's GPT models
 * @param prompt The user prompt/question
 * @param context Optional context information to include in the prompt
 * @param userId User ID for source attribution
 * @returns Structured response with text and metadata
 */
export async function generateResponse(prompt: string, context?: any, userId: string = '1'): Promise<OpenAIResponse> {
  try {
    console.log('Generating response with GPT');
    
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
    
    // Enhanced system instructions with source attribution guidelines
    const systemPrompt = `You are Sophera, an empathetic and informative health companion for cancer patients.
    Your primary purpose is to help patients understand complex medical information in simple language and provide emotional support.
    
    Important guidelines:
    - Always provide information in a clear, compassionate manner
    - Prioritize emotional well-being alongside factual accuracy
    - Never diagnose conditions or predict outcomes
    - Never prescribe treatments or medications
    - Always clarify that you are providing information, not medical advice
    - Be clear about limitations in medical knowledge
    - When sharing medical information, focus on helping users understand their doctor's guidance
    - When you reference research or studies, clearly cite them using standard citation format
    - Include specific article titles, authors, and years when citing research
    - When appropriate, encourage patients to consult with their healthcare team
    
    Remember that you are a companion on the patient's healing journey, not a replacement for medical professionals.
    
    For citations and references:
    - When discussing research findings, use clear citation markers like (Author et al., Year)
    - For statistics or specific claims, always cite your sources
    - For general medical knowledge, still try to reference authoritative sources
    - At the end of detailed responses, include a "Sources:" section with key references`;
    
    // Call the OpenAI API using the GPT-4o model
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt + formattedContext }
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });
    
    // Extract the assistant's message
    const responseText = response.choices[0].message.content;
    
    // Process the response to extract and enhance sources
    const { processedText, sources } = await sourceAttributionService.processResponseWithSources(
      responseText || 'Sorry, I was unable to generate a response.',
      userId
    );
    
    // Prepare the response object with sources
    const result: OpenAIResponse = {
      text: processedText,
      sources: sources,
      metadata: {
        model: response.model,
        usage: response.usage,
        finish_reason: response.choices[0].finish_reason
      }
    };
    
    return result;
  } catch (error) {
    console.error('Error generating OpenAI response:', error);
    throw new Error(`OpenAI error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
