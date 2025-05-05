import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { ModelType } from '@shared/schema';
import { storage } from '../storage';

// Initialize Google Generative AI client with API key
let genAI: GoogleGenerativeAI | null = null;

try {
  if (process.env.GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
} catch (error) {
  console.warn('Failed to initialize Google Generative AI client:', error);
}

/**
 * Interface for creative brainstorming request
 */
export interface CreativeBrainstormRequest {
  userId: string;
  query: string;
  context?: string;
  images?: string[]; // Base64-encoded image data
  existingIdeas?: string[];
  preferredModel?: ModelType;
}

/**
 * Interface for idea in the creative response
 */
export interface CreativeIdea {
  title: string;
  description: string;
  potential: string;
  considerations: string[];
  researchPointers?: string[];
  scientificBasis?: string;
}

/**
 * Interface for creative brainstorming response
 */
export interface CreativeBrainstormResponse {
  summary: string;
  ideas: CreativeIdea[];
  insightsFromImages?: string[];
  suggestedQuestions: string[];
  disclaimer: string;
  modelUsed: string;
}

/**
 * Interface for doctor brief export request
 */
export interface DoctorBriefRequest {
  userId: string;
  explorationType: string;
  selectedIdeas: string[];
  patientNotes?: string;
  questions?: string[];
}

/**
 * Interface for doctor brief export response
 */
export interface DoctorBriefResponse {
  title: string;
  patientInfo: {
    name: string;
    age?: string;
    diagnosis?: string;
    currentTreatment?: string;
  };
  briefSummary: string;
  explorationDetails: {
    type: string;
    ideas: string[];
    patientNotes?: string;
  };
  questionsForDoctor: string[];
  disclaimer: string;
  createdAt: string;
  exportId: string;
}

/**
 * Service for creative exploration and doctor brief generation
 */
export class CreativeSandboxService {
  /**
   * Generate creative brainstorming ideas based on user input
   */
  async generateCreativeIdeas(
    request: CreativeBrainstormRequest
  ): Promise<CreativeBrainstormResponse> {
    try {
      console.log('Generating creative ideas with Gemini');
      
      // Check if Gemini client is initialized
      if (!genAI) {
        throw new Error('Google Generative AI client not initialized. Missing API key.');
      }
      
      // Get user profile for context
      const user = await storage.getUser(request.userId);
      
      // Format the user context
      const userContext = user ? `User Information:\n` +
        `Name: ${user.username}\n` +
        `Diagnosis: ${user.profile?.diagnosis || 'Not specified'}\n` +
        `Treatment Stage: ${user.profile?.treatmentStage || 'Not specified'}\n` : '';
      
      // Format the existing ideas if provided
      const existingIdeasContext = request.existingIdeas && request.existingIdeas.length > 0 ?
        `Previously generated ideas:\n${request.existingIdeas.join('\n')}\n\n` : '';
      
      // Format the additional context if provided
      const additionalContext = request.context ? `Additional context from user:\n${request.context}\n\n` : '';
      
      // Prepare the content parts for the model
      const contentParts: Content[] = [
        { text: `You are Sophera's Creative Exploration Sandbox, a creative brainstorming assistant for cancer patients.
        Your purpose is to help patients explore unconventional ideas and approaches that they might want to discuss with their healthcare team.
        
        Key guidelines:
        - Be creative, open-minded, but responsible
        - Generate innovative ideas that might be worth discussing with healthcare providers
        - Never present ideas as medical advice or guaranteed treatments
        - For each idea, explain the potential reasoning or mechanism that could make it worth exploring
        - Include important safety considerations and precautions for each idea
        - Suggest thoughtful questions the patient could ask their doctor about these ideas
        - Include a clear disclaimer about the explorative nature of these ideas
        - If scientific research exists that relates to an idea, briefly mention it
        - Focus on quality of ideas rather than quantity
        
        IMPORTANT: This is a creative brainstorming exercise. Be creative while being responsible.
        
        ${userContext}${existingIdeasContext}${additionalContext}
        
        The user is exploring: ${request.query}
        
        Respond with JSON in the following format:
        {
          "summary": "Brief summary of the creative exploration",
          "ideas": [
            {
              "title": "Concise name of the idea",
              "description": "Detailed explanation of the idea",
              "potential": "Why this might be worth discussing with healthcare providers",
              "considerations": ["Important safety considerations", "Precautions", "Limitations"],
              "researchPointers": ["Related research areas or studies"],
              "scientificBasis": "Brief explanation of any scientific principles that may relate to this idea"
            }
          ],
          "insightsFromImages": ["If images were provided, insights gained from them"],
          "suggestedQuestions": ["Questions to ask healthcare provider 1", "Question 2"],
          "disclaimer": "Clear disclaimer about the explorative nature of these ideas",
          "modelUsed": "gemini-1.5-pro"
        }` }
      ];
      
      // Add images if provided
      if (request.images && request.images.length > 0) {
        for (const imageData of request.images) {
          contentParts.push({
            inlineData: {
              data: imageData,
              mimeType: 'image/jpeg' // Assuming JPEG format, adjust as needed
            }
          });
        }
      }
      
      // Get Gemini model
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      // Generate creative ideas
      const result = await model.generateContent(contentParts);
      const responseText = result.response.text();
      
      // Parse the JSON response
      let brainstormResponse: CreativeBrainstormResponse;
      
      try {
        brainstormResponse = JSON.parse(responseText);
      } catch (error) {
        console.error('Error parsing creative ideas JSON response:', error);
        
        // Fallback response if parsing fails
        brainstormResponse = {
          summary: "I've explored some creative ideas based on your input, though I wasn't able to format them perfectly.",
          ideas: [{
            title: "Exploration Results",
            description: responseText.substring(0, 1000) + (responseText.length > 1000 ? '...' : ''),
            potential: "See full text for details",
            considerations: ["Please review with healthcare provider before considering any approaches"]
          }],
          suggestedQuestions: ["What do you think about these ideas?", "Are any of these approaches worth exploring in my case?"],
          disclaimer: "These ideas are meant for discussion purposes only. Always consult with your healthcare provider before making any changes to your care plan.",
          modelUsed: "gemini-1.5-pro"
        };
      }
      
      return brainstormResponse;
    } catch (error) {
      console.error('Error generating creative ideas:', error);
      throw new Error(`Creative sandbox error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate a doctor discussion brief based on selected ideas
   */
  async generateDoctorBrief(
    request: DoctorBriefRequest
  ): Promise<DoctorBriefResponse> {
    try {
      console.log('Generating doctor brief');
      
      // Check if Gemini client is initialized
      if (!genAI) {
        throw new Error('Google Generative AI client not initialized. Missing API key.');
      }
      
      // Get user profile for brief
      const user = await storage.getUser(request.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Format selected ideas
      const ideasText = request.selectedIdeas.join('\n- ');
      
      // Format patient notes if provided
      const notesText = request.patientNotes ? `Patient's notes:\n${request.patientNotes}` : '';
      
      // Format questions if provided
      const questionsText = request.questions && request.questions.length > 0 ?
        `Questions to discuss:\n- ${request.questions.join('\n- ')}` : '';
      
      // Prepare the prompt for the model
      const prompt = `Create a concise, professional brief for a patient to share with their doctor about creative approaches they'd like to discuss.
      
      Patient Information:
      Name: ${user.username}
      Diagnosis: ${user.profile?.diagnosis || 'Not specified'}
      Treatment Stage: ${user.profile?.treatmentStage || 'Not specified'}
      
      Exploration Type: ${request.explorationType}
      
      Ideas the patient would like to discuss:
      - ${ideasText}
      
      ${notesText}
      
      ${questionsText}
      
      Format this as a professional, concise document that:
      1. Briefly introduces the patient's interest in discussing these approaches
      2. Clearly presents the ideas in a factual, non-sensationalized way
      3. Includes the patient's questions
      4. Uses professional, medically appropriate language
      5. Maintains a respectful, collaborative tone
      6. Includes a brief disclaimer about the patient seeking professional guidance
      
      Respond with JSON in the following format:
      {
        "title": "Doctor Discussion Brief",
        "patientInfo": {
          "name": "${user.username}",
          "diagnosis": "Diagnosis from profile",
          "currentTreatment": "Treatment info from profile"
        },
        "briefSummary": "A brief 1-2 sentence summary of what the patient wants to discuss",
        "explorationDetails": {
          "type": "${request.explorationType}",
          "ideas": ["Idea 1 formatted professionally", "Idea 2 formatted professionally"],
          "patientNotes": "Formatted version of the patient's notes if provided"
        },
        "questionsForDoctor": ["Question 1", "Question 2"],
        "disclaimer": "Professional disclaimer about seeking medical advice",
        "createdAt": "Current date in ISO format",
        "exportId": "SOPHERA-BRIEF-00001"
      }`;
      
      // Get Gemini model
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      // Generate doctor brief
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Parse the JSON response
      let briefResponse: DoctorBriefResponse;
      
      try {
        briefResponse = JSON.parse(responseText);
      } catch (error) {
        console.error('Error parsing doctor brief JSON response:', error);
        
        // Generate a unique export ID
        const exportId = `SOPHERA-BRIEF-${Date.now().toString().slice(-8)}`;
        
        // Fallback response if parsing fails
        briefResponse = {
          title: "Doctor Discussion Brief",
          patientInfo: {
            name: user.username,
            diagnosis: user.profile?.diagnosis || 'Not specified',
            currentTreatment: user.profile?.currentTreatment || 'Not specified'
          },
          briefSummary: `${user.username} would like to discuss some approaches related to ${request.explorationType}.`,
          explorationDetails: {
            type: request.explorationType,
            ideas: request.selectedIdeas,
            patientNotes: request.patientNotes
          },
          questionsForDoctor: request.questions || ["What is your professional opinion on these approaches?"],
          disclaimer: "This brief was created by Sophera to facilitate discussion with healthcare providers. It is not medical advice. Please consult with your healthcare team before making any changes to your treatment plan.",
          createdAt: new Date().toISOString(),
          exportId: exportId
        };
      }
      
      return briefResponse;
    } catch (error) {
      console.error('Error generating doctor brief:', error);
      throw new Error(`Doctor brief error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const creativeSandboxService = new CreativeSandboxService();
