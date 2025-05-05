import { storage } from '../storage';
import { aiRouter } from './aiRouter';
import { ModelType } from '@shared/schema';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';

/**
 * Interface for multimodal query request
 */
export interface MultimodalQueryRequest {
  userId: string;
  message: string;
  images?: string[]; // Base64-encoded image data
  preferredModel?: ModelType;
}

/**
 * Interface for multimodal query response
 */
export interface MultimodalQueryResponse {
  content: string;
  imageAnalysis?: {
    description: string;
    detectedObjects?: string[];
    detectedText?: string;
    visualFindings?: string[];
  }[];
  contextualInsights?: string[];
  modelUsed: string;
}

/**
 * Service for handling multimodal chat queries (text + images)
 */
export class MultimodalService {
  private openai: OpenAI | null = null;
  private genAI: GoogleGenerativeAI | null = null;
  
  constructor() {
    // Initialize OpenAI
    try {
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      }
    } catch (error) {
      console.warn('Failed to initialize OpenAI client:', error);
    }
    
    // Initialize Google Generative AI
    try {
      if (process.env.GOOGLE_API_KEY) {
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      }
    } catch (error) {
      console.warn('Failed to initialize Google Generative AI client:', error);
    }
  }

  /**
   * Process a multimodal query with both text and images
   */
  async processMultimodalQuery(
    request: MultimodalQueryRequest
  ): Promise<MultimodalQueryResponse> {
    try {
      console.log('Processing multimodal query');
      
      // Determine which model to use based on availability and preference
      const modelToUse = this.determineModelToUse(request.preferredModel);
      
      if (!request.images || request.images.length === 0) {
        // If no images, just use the standard query processing
        const aiResponse = await aiRouter.processQuery(request.message, request.preferredModel, request.userId);
        
        return {
          content: aiResponse.content,
          modelUsed: aiResponse.modelUsed
        };
      }
      
      // Process with appropriate multimodal model
      switch (modelToUse) {
        case ModelType.GPT:
          return this.processWithGPT4Vision(request);
        case ModelType.GEMINI:
          return this.processWithGemini(request);
        default:
          throw new Error(`Selected model ${modelToUse} does not support multimodal inputs`);
      }
    } catch (error) {
      console.error('Error processing multimodal query:', error);
      throw new Error(`Multimodal query error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Process multimodal query with GPT-4 Vision
   */
  private async processWithGPT4Vision(
    request: MultimodalQueryRequest
  ): Promise<MultimodalQueryResponse> {
    try {
      if (!this.openai) {
        throw new Error('OpenAI client not initialized. Missing API key.');
      }
      
      // Get user context
      const user = await storage.getUser(request.userId);
      
      // Format the context
      const userContext = user ? `\nUser Information:\nName: ${user.username}\nDiagnosis: ${user.diagnosis || 'Not specified'}` : '';
      
      // Prepare the system message
      const systemMessage = `You are Sophera's medical imaging expert. Your task is to analyze medical images and provide insights.
      Respond in a warm, empathetic manner while maintaining medical accuracy.
      Focus on being clear, helpful, and informative without making diagnostic claims.
      ${userContext}`;
      
      // Prepare the content array with images
      const content: Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: { url: string };
      }> = [
        {
          type: 'text',
          text: `${request.message}\n\nPlease analyze the attached image(s) and provide insights. If there's medical content in the images, explain what you see in simple terms.`
        }
      ];
      
      // Add the images to the content array
      for (const imageData of request.images!) {
        content.push({
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${imageData}`
          }
        });
      }
      
      // Call the OpenAI API
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: 'system', content: systemMessage },
          { 
            role: 'user', 
            // Converting our typed content array to match OpenAI's expected format
            content: content as any
          }
        ],
        max_tokens: 1000
      });
      
      // Format the response
      const aiContent = response.choices[0].message.content || '';
      
      // Parse the structured elements if possible (assuming the model followed instructions for formatting)
      let imageAnalysis: any[] = [];
      let contextualInsights: string[] = [];
      
      try {
        // Extract image analysis using regex patterns (simple approach)
        const analysisPattern = /Image Analysis:(.*?)(Contextual Insights:|$)/s;
        const insightsPattern = /Contextual Insights:(.*?)$/s;
        
        const analysisMatch = aiContent.match(analysisPattern);
        const insightsMatch = aiContent.match(insightsPattern);
        
        if (analysisMatch && analysisMatch[1]) {
          // Try to extract individual image analyses
          const analyses = analysisMatch[1].split(/Image \d+:/);
          for (const analysis of analyses) {
            if (analysis.trim().length > 0) {
              imageAnalysis.push({
                description: analysis.trim()
              });
            }
          }
        }
        
        if (insightsMatch && insightsMatch[1]) {
          // Split insights by bullet points
          const insights = insightsMatch[1].split(/\n-|\n\*/);
          for (const insight of insights) {
            if (insight.trim().length > 0) {
              contextualInsights.push(insight.trim());
            }
          }
        }
      } catch (error) {
        console.warn('Failed to parse structured elements from GPT-4 Vision response:', error);
      }
      
      return {
        content: aiContent,
        imageAnalysis: imageAnalysis.length > 0 ? imageAnalysis : undefined,
        contextualInsights: contextualInsights.length > 0 ? contextualInsights : undefined,
        modelUsed: ModelType.GPT
      };
    } catch (error) {
      console.error('Error processing with GPT-4 Vision:', error);
      throw error;
    }
  }

  /**
   * Process multimodal query with Gemini
   */
  private async processWithGemini(
    request: MultimodalQueryRequest
  ): Promise<MultimodalQueryResponse> {
    try {
      if (!this.genAI) {
        throw new Error('Google Generative AI client not initialized. Missing API key.');
      }
      
      // Get user context
      const user = await storage.getUser(request.userId);
      
      // Format the context
      const userContext = user ? `\nUser Information:\nName: ${user.username}\nDiagnosis: ${user.diagnosis || 'Not specified'}` : '';
      
      // Prepare the prompt
      const promptText = `You are Sophera's medical imaging expert. Your task is to analyze medical images and provide insights.
      Respond in a warm, empathetic manner while maintaining medical accuracy.
      Focus on being clear, helpful, and informative without making diagnostic claims.
      ${userContext}\n\n${request.message}\n\nPlease analyze the attached image(s) and provide insights. If there's medical content in the images, explain what you see in simple terms.\n\nFormat your response in the following sections:\n1. Image Analysis: Describe what you see in the image(s).\n2. Contextual Insights: Provide relevant information based on the image and the user's message.`;
      
      // Create the content parts array
      const parts: any[] = [{ text: promptText }];
      
      // Add images to the content parts
      for (const imageData of request.images!) {
        parts.push({
          inlineData: {
            data: imageData,
            mimeType: 'image/jpeg'
          }
        });
      }
      
      // Get Gemini model
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      // Generate content
      const result = await model.generateContent(parts);
      const responseText = result.response.text();
      
      // Parse the structured elements if possible
      let imageAnalysis: any[] = [];
      let contextualInsights: string[] = [];
      
      try {
        // Extract image analysis using regex patterns (simple approach)
        const analysisPattern = /Image Analysis:(.*?)(Contextual Insights:|$)/s;
        const insightsPattern = /Contextual Insights:(.*?)$/s;
        
        const analysisMatch = responseText.match(analysisPattern);
        const insightsMatch = responseText.match(insightsPattern);
        
        if (analysisMatch && analysisMatch[1]) {
          // Try to extract individual image analyses
          const analyses = analysisMatch[1].split(/Image \d+:/);
          for (const analysis of analyses) {
            if (analysis.trim().length > 0) {
              imageAnalysis.push({
                description: analysis.trim()
              });
            }
          }
        }
        
        if (insightsMatch && insightsMatch[1]) {
          // Split insights by bullet points
          const insights = insightsMatch[1].split(/\n-|\n\*/);
          for (const insight of insights) {
            if (insight.trim().length > 0) {
              contextualInsights.push(insight.trim());
            }
          }
        }
      } catch (error) {
        console.warn('Failed to parse structured elements from Gemini response:', error);
      }
      
      return {
        content: responseText,
        imageAnalysis: imageAnalysis.length > 0 ? imageAnalysis : undefined,
        contextualInsights: contextualInsights.length > 0 ? contextualInsights : undefined,
        modelUsed: ModelType.GEMINI
      };
    } catch (error) {
      console.error('Error processing with Gemini:', error);
      throw error;
    }
  }

  /**
   * Determine which multimodal model to use based on availability and preference
   */
  private determineModelToUse(preferredModel?: ModelType): ModelType {
    // If user has a preferred model that's available and supports multimodal, use it
    if (preferredModel) {
      if (preferredModel === ModelType.GPT && this.openai) {
        return ModelType.GPT;
      }
      
      if (preferredModel === ModelType.GEMINI && this.genAI) {
        return ModelType.GEMINI;
      }
    }
    
    // Otherwise, choose based on availability
    if (this.openai) {
      return ModelType.GPT; // Prefer GPT-4 Vision if available
    }
    
    if (this.genAI) {
      return ModelType.GEMINI; // Fall back to Gemini if GPT not available
    }
    
    // If neither is available, default to GPT and let the error handling take care of it
    return ModelType.GPT;
  }
}

export const multimodalService = new MultimodalService();
