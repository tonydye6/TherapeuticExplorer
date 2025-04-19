import OpenAI from 'openai';
import { Treatment } from '@shared/schema';
import { storage } from '../storage';

interface CompanionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface CompanionOptions {
  patientName?: string;
  diagnosis?: string;
  currentTreatment?: string;
  treatmentHistory?: string[];
  recentSymptoms?: string[];
  userPreferences?: {
    communicationStyle?: 'detailed' | 'concise' | 'encouraging' | 'factual';
    emotionalTone?: 'empathetic' | 'practical' | 'hopeful' | 'neutral';
  };
}

/**
 * Service for generating empathetic, personalized companion responses
 */
export class CompanionService {
  private openai: OpenAI;
  private defaultSystemPrompt: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.defaultSystemPrompt = `
You are THRIVE's Treatment Companion, a compassionate assistant for esophageal cancer patients.

YOUR ROLE:
- Provide emotional support and understanding
- Help patients navigate their treatment journey
- Answer questions with both empathy and accuracy
- Validate feelings and concerns
- Suggest healthy coping strategies
- Encourage resilience while acknowledging difficulty

COMMUNICATION GUIDELINES:
- Always be warm, supportive, and non-judgmental
- Balance honesty with hope and sensitivity
- Use simple, non-technical language when explaining concepts
- Address emotional and psychological aspects of cancer treatment
- Focus on quality of life and well-being, not just medical facts
- Recognize the whole person, not just their disease
- Never promise specific medical outcomes

NEVER PROVIDE SPECIFIC MEDICAL ADVICE like:
- Dosage recommendations
- Treatment modifications
- Diagnosis of new symptoms
- Medical opinions on treatment decisions

Instead, encourage patients to discuss medical concerns with their healthcare team while providing general information and emotional support.

Respond in a conversational, compassionate tone that makes the person feel heard and supported.
`;
  }

  /**
   * Generate a personalized companion message based on user input
   */
  async generateCompanionResponse(
    userId: number,
    userMessage: string,
    previousMessages: CompanionMessage[] = [],
    options?: CompanionOptions
  ): Promise<string> {
    try {
      console.log(`Generating companion response for user ${userId}`);
      
      // Get user profile and active treatments
      const user = await storage.getUser(userId);
      const treatments = await storage.getTreatments(userId);
      const activeTreatments = treatments.filter(t => t.active);
      
      // Build context from user data
      const userContext = this.buildUserContext(user, activeTreatments, options);
      
      // Build conversation history
      const messages: CompanionMessage[] = [
        { role: 'system', content: this.defaultSystemPrompt + userContext }
      ];
      
      // Add previous messages
      messages.push(...previousMessages);
      
      // Add current message
      messages.push({ role: 'user', content: userMessage });
      
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages as any, // Type casting to satisfy OpenAI SDK
        temperature: 0.7, // Slightly increased temperature for more empathetic responses
        max_tokens: 1000,
      });
      
      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error("Failed to get a valid response from the AI model");
      }
      
      return content;
    } catch (error) {
      console.error("Error generating companion response:", error);
      throw new Error(`Failed to generate companion response: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Build additional context about the user for more personalized responses
   */
  private buildUserContext(
    user: any, 
    activeTreatments: Treatment[], 
    options?: CompanionOptions
  ): string {
    if (!user) return '';
    
    const patientName = options?.patientName || user.displayName || "the patient";
    const diagnosis = options?.diagnosis || user.diagnosis || "esophageal cancer";
    
    // Get information about current treatment
    let treatmentInfo = '';
    if (activeTreatments.length > 0) {
      const currentTreatment = activeTreatments[0];
      treatmentInfo = `
Current treatment: ${currentTreatment.name} (${currentTreatment.type})
${currentTreatment.notes ? `Treatment notes: ${currentTreatment.notes}` : ''}
${currentTreatment.startDate ? `Started on: ${new Date(currentTreatment.startDate).toLocaleDateString()}` : ''}
`;
    } else if (options?.currentTreatment) {
      treatmentInfo = `\nCurrent treatment: ${options.currentTreatment}\n`;
    }
    
    // Get treatment history
    const treatmentHistory = options?.treatmentHistory?.length 
      ? `\nTreatment history: ${options.treatmentHistory.join(', ')}\n`
      : '';
    
    // Get recent symptoms
    const symptoms = options?.recentSymptoms?.length 
      ? `\nRecent symptoms reported: ${options.recentSymptoms.join(', ')}\n`
      : '';
    
    // Get communication preferences
    const communicationStyle = options?.userPreferences?.communicationStyle 
      ? `\nPreferred communication style: ${options.userPreferences.communicationStyle}\n`
      : '';
    
    const emotionalTone = options?.userPreferences?.emotionalTone
      ? `\nPreferred emotional tone: ${options.userPreferences.emotionalTone}\n`
      : '';
    
    return `
PATIENT CONTEXT:
Patient name: ${patientName}
Diagnosis: ${diagnosis}
${treatmentInfo}${treatmentHistory}${symptoms}${communicationStyle}${emotionalTone}

Use this context to personalize your response, but do not explicitly reference having this information unless relevant to answering their question.
`;
  }

  /**
   * Generate a response to follow up on treatment progress or symptoms
   */
  async generateFollowUpQuestion(
    userId: number,
    treatmentName: string
  ): Promise<string> {
    try {
      // Get user profile
      const user = await storage.getUser(userId);
      const patientName = user?.displayName || "Patient";
      
      const prompt = `
Generate a single, thoughtful follow-up question to ask ${patientName} about their experience with ${treatmentName}. 
The question should:
- Be specific to this treatment
- Show empathy and understanding
- Invite sharing of both physical and emotional experiences
- Be open-ended rather than yes/no
- Help the patient reflect on their treatment journey

Example topics: symptom management, quality of life, coping strategies, emotional well-being, or support systems.

Respond with ONLY the follow-up question, no additional text.
`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an empathetic cancer treatment companion." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150,
      });
      
      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error("Failed to generate follow-up question");
      }
      
      return content;
    } catch (error) {
      console.error("Error generating follow-up question:", error);
      throw new Error(`Failed to generate follow-up: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate coping strategies for a specific symptom or concern
   */
  async generateCopingStrategies(
    concern: string
  ): Promise<{ strategies: string[], disclaimer: string }> {
    try {
      const prompt = `
A cancer patient is dealing with the following concern or symptom:
"${concern}"

Please provide 3-5 evidence-based coping strategies or self-care approaches that might help. These should be:
1. Practical and actionable
2. Recognize both physical and emotional dimensions
3. Appropriate for cancer patients
4. Based on established research or clinical guidelines

Format your response as a JSON object with two fields:
- "strategies": An array of strategy descriptions (3-5 items)
- "disclaimer": A brief medical disclaimer

Ensure strategies are general enough to avoid constituting specific medical advice.
`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an empathetic cancer treatment companion with expertise in supportive care." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 800,
      });
      
      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error("Failed to generate coping strategies");
      }
      
      try {
        const result = JSON.parse(content);
        return {
          strategies: Array.isArray(result.strategies) ? result.strategies : [],
          disclaimer: result.disclaimer || "These suggestions are not a substitute for medical advice. Always consult your healthcare team before making changes to your care routine."
        };
      } catch (parseError) {
        console.error("Error parsing coping strategies:", parseError);
        throw new Error("Failed to generate valid coping strategies");
      }
    } catch (error) {
      console.error("Error generating coping strategies:", error);
      throw new Error(`Failed to generate coping strategies: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const companionService = new CompanionService();