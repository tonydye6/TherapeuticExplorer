import Anthropic from '@anthropic-ai/sdk';

interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
}

/**
 * Anthropic Claude service for generating text completions
 */
class AnthropicService {
  private client: Anthropic;
  private initialized: boolean = false;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
      this.initialized = true;
    }
  }

  /**
   * Get a completion from Claude
   */
  async getCompletion(
    prompt: string, 
    options: CompletionOptions = {}
  ): Promise<string> {
    if (!this.initialized) {
      console.log('Anthropic not initialized, returning development response');
      return this.getDevelopmentCompletion();
    }
    
    try {
      // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const response = await this.client.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7
      });
      
      return response.content[0].text;
    } catch (error) {
      console.error('Error calling Anthropic:', error);
      return this.getDevelopmentCompletion();
    }
  }

  /**
   * Get a development completion for testing
   */
  private getDevelopmentCompletion(): string {
    return "This is a development response from the Anthropic service. The actual service would return personalized content.";
  }
}

export const anthropicService = new AnthropicService();