import OpenAI from 'openai';
import { ModelType } from './aiRouter';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export interface RecipeRequest {
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients?: string[];
  dietary?: string[];
  symptom?: string;
  difficulty?: 'easy' | 'moderate' | 'challenging';
  prepTime?: string;
}

/**
 * Service for providing personalized nutrition recommendations
 */
export class NutritionService {
  private openai: OpenAI;

  constructor() {
    this.openai = openai;
  }

  /**
   * Provide personalized nutrition recommendations based on the patient's profile and treatment
   */
  async provideNutritionRecommendations(
    request: NutritionRecommendationRequest
  ): Promise<NutritionRecommendationResponse> {
    try {
      console.log('Generating nutrition recommendations');
      
      // Format the request information for the prompt
      const treatmentInfo = request.treatmentName 
        ? `Current treatment: ${request.treatmentName}\n` 
        : 'No specific treatment information provided.\n';
      
      const symptomsInfo = request.symptoms && request.symptoms.length > 0
        ? `Current symptoms: ${request.symptoms.join(', ')}\n`
        : 'No symptoms reported.\n';
      
      const dietaryRestrictionsInfo = request.dietaryRestrictions && request.dietaryRestrictions.length > 0
        ? `Dietary restrictions: ${request.dietaryRestrictions.join(', ')}\n`
        : 'No dietary restrictions reported.\n';
      
      const allergiesInfo = request.allergies && request.allergies.length > 0
        ? `Allergies: ${request.allergies.join(', ')}\n`
        : 'No allergies reported.\n';
      
      const preferencesInfo = request.preferences && request.preferences.length > 0
        ? `Food preferences: ${request.preferences.join(', ')}\n`
        : 'No specific food preferences reported.\n';
      
      const goalsInfo = request.nutritionalGoals && request.nutritionalGoals.length > 0
        ? `Nutritional goals: ${request.nutritionalGoals.join(', ')}\n`
        : 'No specific nutritional goals reported.\n';
      
      const recentDietInfo = request.recentDietEntries && request.recentDietEntries.length > 0
        ? `Recent diet information:\n${request.recentDietEntries.join('\n')}\n`
        : 'No recent diet information available.\n';
      
      // Construct the prompt for the model
      const systemPrompt = `You are a nutritional expert specializing in supportive care for cancer patients.
      Provide evidence-based, personalized nutritional recommendations for patients undergoing cancer treatments.
      
      Guidelines:
      - Focus on foods that may support healing, reduce side effects, and maintain nutritional status
      - Account for individual factors like dietary restrictions, allergies, and preferences
      - Emphasize practical, easy-to-implement recommendations
      - Include specific meal ideas and recipes suitable for the patient's symptoms and preferences
      - When possible, cite scientific evidence supporting your recommendations
      - For each recommendation, explain both potential benefits and any considerations
      - Always include a disclaimer that recommendations do not replace medical advice
      
      Respond with JSON in the following format:
      {
        "summary": "A brief summary of the nutritional approach",
        "rationale": "Explanation of why these recommendations are appropriate",
        "nutritionalPrinciples": ["List of key nutritional principles"],
        "recommendedFoods": [
          {
            "name": "Food category or specific food",
            "description": "Brief description",
            "benefits": ["Benefits for this patient"],
            "considerations": ["Any considerations or cautions"]
          }
        ],
        "foodsToLimit": [
          {
            "name": "Food category or specific food",
            "description": "Brief description",
            "benefits": ["Reason for limiting"],
            "considerations": ["How to handle cravings or alternatives"]
          }
        ],
        "sampleMealPlan": {
          "breakfast": ["Options for breakfast"],
          "lunch": ["Options for lunch"],
          "dinner": ["Options for dinner"],
          "snacks": ["Options for snacks"]
        },
        "recipeRecommendations": [
          {
            "name": "Recipe name",
            "description": "Brief description",
            "ingredients": ["List of ingredients"],
            "instructions": ["Step by step instructions"],
            "nutritionalHighlights": ["Key nutritional benefits"],
            "prepTime": "Preparation time",
            "difficultyLevel": "easy/moderate/challenging",
            "mealType": "breakfast/lunch/dinner/snack"
          }
        ],
        "symptomManagementTips": ["Tips for managing symptoms through nutrition"],
        "generalGuidelines": ["General nutritional guidelines"],
        "disclaimer": "Medical disclaimer",
        "modelUsed": "GPT-4o"
      }`;
      
      const userPrompt = `Please provide personalized nutrition recommendations based on this patient profile:

${treatmentInfo}${symptomsInfo}${dietaryRestrictionsInfo}${allergiesInfo}${preferencesInfo}${goalsInfo}${recentDietInfo}`;
      
      // Call the OpenAI API
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        response_format: { type: "json_object" }
      });
      
      // Extract and parse the content
      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error("Failed to generate nutrition recommendations");
      }
      
      const recommendations: NutritionRecommendationResponse = JSON.parse(content);
      
      return recommendations;
    } catch (error) {
      console.error('Error generating nutrition recommendations:', error);
      throw new Error(`Nutrition recommendation error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a recipe recommendation based on specific criteria
   */
  async getRecipeRecommendation(
    request: RecipeRequest
  ): Promise<RecipeRecommendation> {
    try {
      console.log('Generating recipe recommendation');
      
      // Format the request parameters
      const mealTypeInfo = request.mealType 
        ? `Meal type: ${request.mealType}\n` 
        : 'No specific meal type requested.\n';
      
      const ingredientsInfo = request.ingredients && request.ingredients.length > 0
        ? `Preferred ingredients: ${request.ingredients.join(', ')}\n`
        : 'No specific ingredients requested.\n';
      
      const dietaryInfo = request.dietary && request.dietary.length > 0
        ? `Dietary considerations: ${request.dietary.join(', ')}\n`
        : 'No specific dietary considerations.\n';
      
      const symptomInfo = request.symptom
        ? `Symptom to address: ${request.symptom}\n`
        : 'No specific symptom to address.\n';
      
      const difficultyInfo = request.difficulty
        ? `Preferred difficulty level: ${request.difficulty}\n`
        : 'No specific difficulty level requested.\n';
      
      const prepTimeInfo = request.prepTime
        ? `Preferred preparation time: ${request.prepTime}\n`
        : 'No specific preparation time requested.\n';
      
      // Construct the prompt for the model
      const systemPrompt = `You are a chef specializing in nutritional cooking for cancer patients.
      Create a single delicious, nutritious recipe that meets the specified criteria.
      
      Guidelines:
      - The recipe should be suitable for cancer patients, considering treatment side effects
      - Make the recipe practical, using commonly available ingredients
      - Include clear, step-by-step instructions
      - Explain the nutritional benefits related to cancer care
      - Consider ease of preparation for patients with limited energy
      - If addressing a specific symptom, explain how the recipe helps
      
      Respond with JSON in the following format:
      {
        "name": "Recipe name",
        "description": "Brief appealing description",
        "ingredients": ["Ingredient 1", "Ingredient 2", etc.],
        "instructions": ["Step 1", "Step 2", etc.],
        "nutritionalHighlights": ["Key nutritional benefit 1", "Key nutritional benefit 2", etc.],
        "prepTime": "Total preparation time",
        "difficultyLevel": "easy/moderate/challenging",
        "mealType": "breakfast/lunch/dinner/snack",
        "imagePrompt": "A detailed description for generating an image of this dish"
      }`;
      
      const userPrompt = `Please create a recipe based on these criteria:

${mealTypeInfo}${ingredientsInfo}${dietaryInfo}${symptomInfo}${difficultyInfo}${prepTimeInfo}`;
      
      // Call the OpenAI API
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        response_format: { type: "json_object" }
      });
      
      // Extract and parse the content
      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error("Failed to generate recipe recommendation");
      }
      
      const recipe: RecipeRecommendation = JSON.parse(content);
      
      return recipe;
    } catch (error) {
      console.error('Error generating recipe recommendation:', error);
      throw new Error(`Recipe recommendation error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const nutritionService = new NutritionService();
