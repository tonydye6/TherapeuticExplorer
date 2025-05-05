import { ModelType } from './aiRouter';
import { anthropicService } from './anthropic-service';

export interface EmotionalSupportRequest {
  query: string;
  userId: string;
  emotionalState?: string;
  recentJournalEntries?: string[];
  preferredModel?: ModelType;
}

export interface CopingStrategy {
  title: string;
  description: string;
  steps: string[];
  timeRequired: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  resources?: string[];
}

export interface EmotionalSupportResponse {
  message: string;
  supportType: 'validation' | 'coping' | 'resources' | 'referral' | 'general';
  detectedEmotion?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  suggestedCopingStrategies?: CopingStrategy[];
  professionalHelpIndicated: boolean;
  disclaimer: string;
  modelUsed: string;
}

/**
 * Service for providing emotional support to patients
 */
export class EmotionalSupportService {
  /**
   * Provides empathetic responses and coping strategies based on emotional state
   */
  async provideSupport(
    request: EmotionalSupportRequest
  ): Promise<EmotionalSupportResponse> {
    try {
      console.log('Providing emotional support');
      
      // Format the input for the prompt
      const emotionalContext = request.emotionalState
        ? `The patient has shared their emotional state as: ${request.emotionalState}\n\n`
        : '';
      
      const journalContext = request.recentJournalEntries && request.recentJournalEntries.length > 0
        ? `Recent journal entries:\n${request.recentJournalEntries.join('\n')}\n\n`
        : '';
      
      // Construct the system prompt for empathetic response
      const systemPrompt = `You are an empathetic support companion for cancer patients.
      Your role is to provide emotional validation, practical coping strategies, and compassionate guidance.
      
      Guidelines:
      - ALWAYS prioritize emotional support over information
      - Use a warm, empathetic tone that conveys genuine understanding
      - Validate emotions without judgment or minimization
      - Suggest specific, practical coping strategies suitable for cancer patients
      - Be mindful that patients may have limited energy and emotional resources
      - Recognize signs of serious distress that may require professional mental health support
      - Always include a disclaimer that you're providing supportive care, not therapy
      - Never use platitudes like "stay positive" or "everything happens for a reason"
      - Focus on helping patients feel heard and understood
      
      Analyze the emotional content of the message and respond with JSON in this format:
      {
        "message": "Your empathetic response goes here. This should be conversational, warm, and specifically respond to what the person shared. Validate their emotions and experience.",
        "supportType": "validation, coping, resources, referral, or general",
        "detectedEmotion": "Primary emotion detected in the query",
        "severity": "mild, moderate, or severe",
        "suggestedCopingStrategies": [
          {
            "title": "Name of strategy",
            "description": "Brief explanation of the strategy",
            "steps": ["Step 1", "Step 2", "Step 3"],
            "timeRequired": "Estimated time needed",
            "difficulty": "easy, moderate, or challenging",
            "resources": ["Optional links or resources"]
          }
        ],
        "professionalHelpIndicated": true or false,
        "disclaimer": "Brief disclaimer about the limits of AI support",
        "modelUsed": "Claude"
      }`;
      
      // Format the user's query with any additional context
      const enhancedQuery = `${emotionalContext}${journalContext}Patient message: ${request.query}`;
      
      // Use the Anthropic service's text query processing
      const response = await anthropicService.processTextQuery({
        query: enhancedQuery,
        systemPrompt: systemPrompt,
        modelSettings: {
          modelName: "claude-3-opus-20240229", // Using the most capable model for emotional support
          temperature: 0.7, // Slightly higher temperature for more empathetic responses
          maxTokens: 1500 // Allow longer responses for comprehensive support
        }
      });
      
      // Parse the JSON response
      const content = response.text;
      let supportResponse: EmotionalSupportResponse;
      
      try {
        supportResponse = JSON.parse(content);
      } catch (error) {
        console.error('Error parsing emotional support response JSON:', error);
        
        // Fallback response if parsing fails
        supportResponse = {
          message: content || "I'm here to support you through your journey. While I'm having trouble formatting my response properly, I want you to know that your feelings are valid, and I'm here to listen.",
          supportType: 'general',
          professionalHelpIndicated: false,
          disclaimer: "I'm an AI assistant providing supportive care, not a licensed therapist. If you're experiencing severe distress, please reach out to a healthcare professional or mental health service.",
          modelUsed: "Claude"
        };
      }
      
      return supportResponse;
    } catch (error) {
      console.error('Error generating emotional support response:', error);
      throw new Error(`Emotional support error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const emotionalSupportService = new EmotionalSupportService();
