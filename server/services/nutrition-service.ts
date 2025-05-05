import OpenAI from 'openai';
import { ModelType } from '@shared/schema';

export interface NutritionRecommendationRequest {
  userId: string;
  treatmentName?: string;
  symptoms?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  preferences?: string[];
  nutritionalGoals?: string[];
  recentDietEntries?: string[];
  preferredModel?: ModelType;
}

export interface FoodItem {
  name: string;
  description: string;
  benefits: string[];
  considerations?: string[];
}

export interface RecipeRecommendation {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  nutritionalHighlights: string[];
  prepTime: string;
  difficultyLevel: 'easy' | 'moderate' | 'challenging';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  imagePrompt?: string; // For potential future image generation
}

export interface MealPlan {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
}

export interface NutritionRecommendationResponse {
  summary: string;
  rationale: string;
  nutritionalPrinciples: string[];
  recommendedFoods: FoodItem[];
  foodsToLimit: FoodItem[];
  sampleMealPlan: MealPlan;
  recipeRecommendations: RecipeRecommendation[];
  symptomManagementTips?: string[];
  generalGuidelines: string[];
  disclaimer: string;
  modelUsed: string;
}

/**
 * Service for providing personalized nutrition recommendations
 */
export class NutritionService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  /**
   * Provide personalized nutrition recommendations based on the patient's profile and treatment
   */
  async provideNutritionRecommendations(
    request: NutritionRecommendationRequest
  ): Promise<NutritionRecommendationResponse> {
    try {
      console.log(`Generating nutrition recommendations for user ${request.userId}`);
      
      // Format the context for the AI prompt
      let context = '';
      if (request.treatmentName) {
        context += `\nCurrent treatment: ${request.treatmentName}`;
      }
      
      if (request.symptoms && request.symptoms.length > 0) {
        context += `\nCurrent symptoms: ${request.symptoms.join(', ')}`;
      }
      
      if (request.dietaryRestrictions && request.dietaryRestrictions.length > 0) {
        context += `\nDietary restrictions: ${request.dietaryRestrictions.join(', ')}`;
      }
      
      if (request.allergies && request.allergies.length > 0) {
        context += `\nAllergies: ${request.allergies.join(', ')}`;
      }
      
      if (request.preferences && request.preferences.length > 0) {
        context += `\nFood preferences: ${request.preferences.join(', ')}`;
      }
      
      if (request.nutritionalGoals && request.nutritionalGoals.length > 0) {
        context += `\nNutritional goals: ${request.nutritionalGoals.join(', ')}`;
      }
      
      if (request.recentDietEntries && request.recentDietEntries.length > 0) {
        context += `\n\nRecent diet entries:\n`;
        request.recentDietEntries.forEach((entry, index) => {
          context += `Entry ${index + 1}: ${entry}\n`;
        });
      }
      
      const prompt = `
        You are a nutrition expert specializing in supportive dietary approaches for cancer patients.
        Provide personalized nutrition recommendations for a cancer patient with the following profile:
        
        ${context}
        
        Create detailed, evidence-based nutrition recommendations that address the following aspects:
        1. Foods that may help manage symptoms or support treatment efficacy
        2. Foods that might exacerbate symptoms or interfere with treatment
        3. Balanced nutrition principles appropriate for this situation
        4. Practical meal planning and recipe ideas
        5. Symptom management strategies through nutrition if applicable
        
        Format your response as a detailed JSON object matching this TypeScript interface:
        
        interface NutritionRecommendationResponse {
          summary: string; // Brief overview of your recommendations (3-5 sentences)
          rationale: string; // Explanation of why these recommendations are appropriate
          nutritionalPrinciples: string[]; // 3-5 key principles to follow
          recommendedFoods: Array<{
            name: string; // Category or specific food
            description: string; // Brief description
            benefits: string[]; // Why this food is beneficial
            considerations?: string[]; // Any considerations for consumption
          }>;
          foodsToLimit: Array<{
            name: string; // Category or specific food
            description: string; // Brief description
            benefits: string[]; // Why limiting this food is beneficial 
            considerations?: string[]; // Any considerations
          }>;
          sampleMealPlan: {
            breakfast: string[];
            lunch: string[];
            dinner: string[];
            snacks: string[];
          };
          recipeRecommendations: Array<{
            name: string;
            description: string;
            ingredients: string[];
            instructions: string[];
            nutritionalHighlights: string[];
            prepTime: string;
            difficultyLevel: 'easy' | 'moderate' | 'challenging';
            mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
            imagePrompt?: string; // A brief image description for potential future image generation
          }>;
          symptomManagementTips?: string[];
          generalGuidelines: string[];
          disclaimer: string;
          modelUsed: string;
        }
        
        Important guidelines:
        - Prioritize evidence-based recommendations
        - Focus on practical, realistic approaches that honor preferences and restrictions
        - Include 2-3 recipe recommendations that are simple to prepare
        - Provide symptom-specific guidance if symptoms are mentioned
        - Include a disclaimer about consulting healthcare providers
      `;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert nutritionist specializing in supportive care for cancer patients." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error("Failed to get a valid response from the AI model");
      }
      
      try {
        const recommendations: NutritionRecommendationResponse = JSON.parse(content);
        
        // Validate the response format
        if (!recommendations.summary || 
            !recommendations.rationale || 
            !Array.isArray(recommendations.recommendedFoods) || 
            !Array.isArray(recommendations.foodsToLimit)) {
          throw new Error("Invalid response format from AI model");
        }
        
        // Set model used if not provided
        if (!recommendations.modelUsed) {
          recommendations.modelUsed = "GPT-4o (OpenAI)";
        }
        
        // Ensure disclaimer is present
        if (!recommendations.disclaimer) {
          recommendations.disclaimer = "These nutrition recommendations are for general informational purposes only and are not a substitute for professional medical advice. Always consult with your healthcare team before making significant changes to your diet, especially during cancer treatment.";
        }
        
        return recommendations;
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.error("Raw response:", content);
        throw new Error("Failed to parse the nutrition recommendations from AI response");
      }
    } catch (error) {
      console.error("Error generating nutrition recommendations:", error);
      throw new Error(`Failed to generate nutrition recommendations: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get a recipe recommendation based on specific criteria
   */
  async getRecipeRecommendation(
    criteria: {
      mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      ingredients?: string[];
      dietary?: string[];
      symptom?: string;
      difficulty?: 'easy' | 'moderate' | 'challenging';
      prepTime?: string;
    }
  ): Promise<RecipeRecommendation> {
    try {
      // Format criteria for the prompt
      let criteriaText = '';
      if (criteria.mealType) {
        criteriaText += `\nMeal type: ${criteria.mealType}`;
      }
      
      if (criteria.ingredients && criteria.ingredients.length > 0) {
        criteriaText += `\nPreferred ingredients: ${criteria.ingredients.join(', ')}`;
      }
      
      if (criteria.dietary && criteria.dietary.length > 0) {
        criteriaText += `\nDietary considerations: ${criteria.dietary.join(', ')}`;
      }
      
      if (criteria.symptom) {
        criteriaText += `\nSymptom to address: ${criteria.symptom}`;
      }
      
      if (criteria.difficulty) {
        criteriaText += `\nDifficulty level: ${criteria.difficulty}`;
      }
      
      if (criteria.prepTime) {
        criteriaText += `\nPreferred preparation time: ${criteria.prepTime}`;
      }
      
      const prompt = `
        Create a single recipe recommendation for a cancer patient with the following criteria:
        ${criteriaText}
        
        The recipe should be nutritious, practical to prepare, and appropriate for someone undergoing cancer treatment.
        Format your response as a JSON object matching this TypeScript interface:
        
        interface RecipeRecommendation {
          name: string;
          description: string;
          ingredients: string[];
          instructions: string[];
          nutritionalHighlights: string[];
          prepTime: string;
          difficultyLevel: 'easy' | 'moderate' | 'challenging';
          mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          imagePrompt?: string; // A brief image description for potential future image generation
        }
      `;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert chef specializing in nutritious recipes for people with health challenges." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error("Failed to get a valid recipe recommendation from the AI model");
      }
      
      try {
        const recipe: RecipeRecommendation = JSON.parse(content);
        
        // Validate the response format
        if (!recipe.name || !recipe.description || !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.instructions)) {
          throw new Error("Invalid recipe format from AI model");
        }
        
        return recipe;
      } catch (parseError) {
        console.error("Error parsing recipe response:", parseError);
        console.error("Raw response:", content);
        throw new Error("Failed to parse the recipe recommendation from AI response");
      }
    } catch (error) {
      console.error("Error generating recipe recommendation:", error);
      throw new Error(`Failed to generate recipe recommendation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const nutritionService = new NutritionService();
