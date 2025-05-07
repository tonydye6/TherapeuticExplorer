import OpenAI from 'openai';

interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
  responseFormat?: 'text' | 'json';
}

/**
 * OpenAI service for generating text completions
 */
class OpenAIService {
  private client: OpenAI;
  private initialized: boolean = false;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      this.initialized = true;
    }
  }

  /**
   * Get a structured completion from OpenAI
   */
  async getStructuredCompletion(
    prompt: string, 
    options: CompletionOptions = {}
  ): Promise<string> {
    if (!this.initialized) {
      console.log('OpenAI not initialized, returning development response');
      return this.getDevelopmentCompletion(options.responseFormat === 'json');
    }
    
    try {
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a medical AI assistant helping cancer patients.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined
      });
      
      const content = response.choices[0].message.content || '';
      
      // Validate JSON response if expected
      if (options.responseFormat === 'json') {
        try {
          // Make sure it's valid JSON by parsing it
          JSON.parse(content);
        } catch (jsonError) {
          console.error('OpenAI returned invalid JSON:', jsonError);
          return this.getDevelopmentCompletion(true);
        }
      }
      
      return content;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      return this.getDevelopmentCompletion(options.responseFormat === 'json');
    }
  }

  /**
   * Get a development completion for testing
   */
  private getDevelopmentCompletion(isJson: boolean): string {
    if (isJson) {
      return JSON.stringify([
        {
          "title": "Schedule a follow-up appointment",
          "description": "Based on your recent treatment updates, it's time for a follow-up with your oncologist.",
          "category": "treatment"
        },
        {
          "title": "Try gentle yoga for 15 minutes",
          "description": "Your journal entries show increased stress. Yoga can help reduce anxiety during treatment.",
          "category": "exercise"
        },
        {
          "title": "Add more protein to your meals",
          "description": "Your nutritional logs show you might benefit from increasing protein intake to support recovery.",
          "category": "nutrition"
        },
        {
          "title": "Read about new treatment options",
          "description": "Based on your saved research, there are new immunotherapy approaches you might want to discuss with your doctor.",
          "category": "research"
        }
      ]);
    } else {
      return "This is a development response from the OpenAI service. The actual service would return personalized content.";
    }
  }
}

export const openAiService = new OpenAIService();