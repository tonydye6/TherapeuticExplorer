import { anthropicService } from './anthropic-service';
import { ModelType } from '@shared/schema';

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
      console.log(`Processing emotional support request: ${request.query}`);
      
      // Default to Anthropic for emotional support due to its empathetic capabilities
      const model = request.preferredModel || ModelType.CLAUDE;
      
      // Context about the user's emotional state and journal entries if available
      let context = '';
      if (request.emotionalState) {
        context += `\nThe user has indicated they are feeling: ${request.emotionalState}`;
      }
      
      if (request.recentJournalEntries && request.recentJournalEntries.length > 0) {
        context += `\n\nRecent journal entries from the user:\n`;
        request.recentJournalEntries.forEach((entry, index) => {
          context += `Entry ${index + 1}: ${entry}\n`;
        });
      }
      
      const systemPrompt = `
        You are Sophera, an empathetic support companion for cancer patients. Your role is to provide emotional validation, 
        coping strategies, and supportive responses to someone who may be experiencing distress, anxiety, sadness, 
        or other difficult emotions related to their cancer journey.
        
        Guidelines for your responses:
        1. Lead with validation and empathy. Acknowledge the person's feelings without minimizing them.
        2. Use warm, compassionate language that shows you understand the depth of their experience.
        3. Offer specific, practical coping strategies tailored to their situation.
        4. For serious emotional distress, gently suggest speaking with a healthcare provider or mental health professional.
        5. Maintain a hopeful tone without being unrealistically positive.
        6. Never provide medical advice or attempt to diagnose psychological conditions.
        7. Focus on emotional wellbeing rather than medical solutions.
        8. Include a gentle disclaimer about your role as a supportive AI, not a replacement for professional help.
        
        Analyze the user's message for emotional content, determine the appropriate support type, and 
        respond in a structured JSON format matching the provided interface.
      `;
      
      const prompt = `
        ${context}
        
        User message: "${request.query}"
        
        Respond with an empathetic, supportive message and appropriate coping strategies if relevant.
        Format your response as JSON according to this TypeScript interface:
        
        interface EmotionalSupportResponse {
          message: string; // Your empathetic response (250-400 words)
          supportType: 'validation' | 'coping' | 'resources' | 'referral' | 'general';
          detectedEmotion?: string; // Primary emotion detected
          severity?: 'mild' | 'moderate' | 'severe'; // How intense the emotion seems
          suggestedCopingStrategies?: Array<{
            title: string; // Brief name of the strategy
            description: string; // 1-2 sentence overview
            steps: string[]; // 3-5 concrete actions
            timeRequired: string; // e.g. "5 minutes", "Throughout the day"
            difficulty: 'easy' | 'moderate' | 'challenging';
            resources?: string[];
          }>;
          professionalHelpIndicated: boolean; // True if the person should seek professional help
          disclaimer: string; // Brief reminder that you're an AI companion
          modelUsed: string; // The AI model used to generate this response
        }
      `;
      
      // Use Claude for emotional support responses
      const response = await anthropicService.processTextQuery({
        query: prompt,
        systemPrompt,
        modelSettings: {
          modelName: "claude-3-7-sonnet-20250219",
          temperature: 0.7,
          maxTokens: 1500
        }
      });
      
      if (!response) {
        throw new Error("Failed to get a response from the AI model");
      }
      
      // Extract and validate the JSON response
      try {
        const parsedResponse = JSON.parse(response.text) as EmotionalSupportResponse;
        
        // Set model used
        parsedResponse.modelUsed = "Claude (Anthropic)";
        
        // Ensure required fields are present
        if (!parsedResponse.message || !parsedResponse.supportType) {
          throw new Error("Invalid response format from AI model");
        }
        
        // Ensure disclaimer is present
        if (!parsedResponse.disclaimer) {
          parsedResponse.disclaimer = "I'm an AI companion designed to offer emotional support. While I strive to be helpful, I'm not a substitute for professional mental health care. If you're experiencing severe distress, please reach out to a healthcare provider.";
        }
        
        return parsedResponse;
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.error("Raw response:", response.text);
        
        // Fallback response if parsing fails
        return {
          message: "I'm here to support you during this difficult time. While I couldn't formulate a complete response, please know that your feelings are valid and important. Would you like to try expressing your concerns in a different way?",
          supportType: "general",
          professionalHelpIndicated: false,
          disclaimer: "I'm an AI companion designed to offer emotional support. While I strive to be helpful, I'm not a substitute for professional mental health care.",
          modelUsed: "Claude (Anthropic) with fallback"
        };
      }
    } catch (error) {
      console.error("Error in emotional support service:", error);
      throw new Error(`Failed to provide emotional support: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const emotionalSupportService = new EmotionalSupportService();
