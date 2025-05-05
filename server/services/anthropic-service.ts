import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Interface for structured Claude responses
 */
interface ClaudeResponse {
  text: string;
  sources?: any[];
  metadata?: any;
}

/**
 * Generates a response using Anthropic's Claude models
 * @param prompt The user prompt/question
 * @param context Optional context information to include in the prompt
 * @returns Structured response with text and metadata
 */
export async function generateResponse(prompt: string, context?: any): Promise<ClaudeResponse> {
  try {
    console.log('Generating response with Claude');
    
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
    
    // Clear system instructions focused on health information
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
    - If you reference research or studies, be transparent about their limitations
    - When appropriate, encourage patients to consult with their healthcare team
    
    Remember that you are a companion on the patient's healing journey, not a replacement for medical professionals.`;
    
    // Call the Anthropic API using their Claude model
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229", // Currently the most capable Claude model
      system: systemPrompt,
      messages: [
        { role: "user", content: prompt + formattedContext }
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });
    
    // Extract the assistant's message
    const responseText = response.content[0].type === 'text' ? response.content[0].text : 'No text response available';
    
    // Prepare the response object
    const result: ClaudeResponse = {
      text: responseText || 'Sorry, I was unable to generate a response.',
      metadata: {
        model: response.model,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        },
        stop_reason: response.stop_reason
      }
    };
    
    return result;
  } catch (error) {
    console.error('Error generating Claude response:', error);
    throw new Error(`Claude error: ${error.message}`);
  }
}
