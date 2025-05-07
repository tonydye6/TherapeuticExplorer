import { openAiService } from './openai-service';
import { anthropicService } from './anthropic-service';

interface ActionStepGenerated {
  title: string;
  description: string;
  category?: 'exercise' | 'nutrition' | 'mental' | 'treatment' | 'social' | 'research';
  source?: string;
}

/**
 * AI Router service
 * Routes requests to the appropriate AI service based on the type of request
 */
class AIRouter {
  /**
   * Generate personalized action steps using the most appropriate AI model
   */
  async getPersonalizedActionSteps(prompt: string): Promise<ActionStepGenerated[]> {
    try {
      // Use OpenAI by default for health analytics
      const response = await openAiService.getStructuredCompletion(prompt, {
        responseFormat: 'json',
        temperature: 0.7,
        maxTokens: 1500
      });

      const parsedResponse = JSON.parse(response);
      
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Invalid response format from AI');
      }
      
      return parsedResponse.map(item => ({
        title: item.title || 'Action step',
        description: item.description || 'Take this action to improve your health journey.',
        category: item.category,
        source: item.source
      }));
    } catch (error) {
      console.error('Error generating action steps with AI:', error);
      
      // Provide fallback data
      return this.getDefaultActionSteps();
    }
  }

  private getDefaultActionSteps(): ActionStepGenerated[] {
    return [
      {
        title: 'Schedule a follow-up appointment',
        description: 'Based on your recent treatment updates, it's time for a follow-up with your oncologist.',
        category: 'treatment'
      },
      {
        title: 'Try gentle yoga for 15 minutes',
        description: 'Regular gentle exercise can help reduce stress and improve sleep quality during treatment.',
        category: 'exercise'
      },
      {
        title: 'Add more protein to your meals',
        description: 'Increasing protein intake can help support recovery and maintain muscle mass during treatment.',
        category: 'nutrition'
      },
      {
        title: 'Read about new treatment options',
        description: 'Staying informed about emerging treatments can help you have productive conversations with your healthcare team.',
        category: 'research'
      }
    ];
  }
}

export const aiRouter = new AIRouter();