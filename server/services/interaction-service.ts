/**
 * Interaction Analyzer Service
 * Analyzes potential interactions between treatments, medications, supplements, and diet items
 */

import { storage } from "../storage";
import { aiRouter } from "./aiRouter";
import { QueryType, ModelType } from "@shared/schema";
import { Treatment, AlternativeTreatment } from "@shared/schema";

export enum InteractionSeverity {
  NONE = "none",
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  UNKNOWN = "unknown"
}

export interface InteractionDetail {
  item1: string;
  item2: string;
  severity: InteractionSeverity;
  description: string;
  mechanism?: string;
  evidence?: string;
  recommendation?: string;
}

export interface InteractionAnalysisResult {
  interactions: InteractionDetail[];
  summary: string;
  disclaimer: string;
  modelUsed: string;
}

/**
 * Formats treatments, alternative treatments, and diet items for the interaction analysis prompt
 */
function formatItemsForPrompt(treatments: Treatment[], alternativeTreatments: AlternativeTreatment[], dietItems?: string[]): string {
  let prompt = "";
  
  // Add conventional treatments
  if (treatments.length > 0) {
    prompt += "\nConventional Treatments:\n";
    treatments.forEach((treatment, index) => {
      prompt += `${index + 1}. ${treatment.name} (${treatment.type})\n`;
      if (treatment.notes) {
        prompt += `   Notes: ${treatment.notes}\n`;
      }
    });
  }
  
  // Add alternative treatments
  if (alternativeTreatments.length > 0) {
    prompt += "\nAlternative/Complementary Treatments:\n";
    alternativeTreatments.forEach((treatment, index) => {
      prompt += `${index + 1}. ${treatment.name} (${treatment.category})\n`;
      if (treatment.background) {
        prompt += `   Background: ${treatment.background}\n`;
      }
    });
  }
  
  // Add diet items if provided
  if (dietItems && dietItems.length > 0) {
    prompt += "\nDiet & Nutrition Items:\n";
    dietItems.forEach((item, index) => {
      prompt += `${index + 1}. ${item}\n`;
    });
  }
  
  return prompt;
}

/**
 * Analyzes interactions between treatments (conventional, alternative, dietary)
 */
export async function analyzeInteractions(
  userId: string,
  options: {
    includeAlternative?: boolean,
    includeDiet?: boolean,
    dietItems?: string[],
    preferredModel?: ModelType
  } = {}
): Promise<InteractionAnalysisResult> {
  // Set defaults
  const includeAlternative = options.includeAlternative !== false; // Default to true
  const includeDiet = options.includeDiet !== false; // Default to true
  const dietItems = options.dietItems || [];
  
  try {
    // Fetch treatments and alternative treatments
    const treatments = await storage.getTreatments(userId);
    
    let alternativeTreatments: AlternativeTreatment[] = [];
    if (includeAlternative) {
      alternativeTreatments = await storage.getAlternativeTreatments(userId);
    }
    
    // Check if there are enough items to analyze interactions
    const totalItems = treatments.length + alternativeTreatments.length + dietItems.length;
    if (totalItems < 2) {
      return {
        interactions: [],
        summary: "Not enough items to analyze interactions. Please add at least two treatments or items.",
        disclaimer: "This analysis requires multiple items to check for potential interactions.",
        modelUsed: "none"
      };
    }
    
    // Format items for the prompt
    const itemsPrompt = formatItemsForPrompt(treatments, alternativeTreatments, includeDiet ? dietItems : undefined);
    
    // Create the full prompt
    const fullPrompt = `
      Please analyze potential interactions between the following treatments, supplements, and/or diet items.
      Provide your analysis in a structured JSON format that includes potential interactions, their severity, 
      description with mechanism of action when known, and recommendations.
      
      ${itemsPrompt}
      
      For your response, please use the following JSON format:
      {
        "interactions": [
          {
            "item1": "Name of first item",
            "item2": "Name of second item",
            "severity": "none/low/moderate/high/unknown",
            "description": "Detailed description of the interaction",
            "mechanism": "Explanation of how the interaction occurs (when known)",
            "evidence": "Brief note on the quality of evidence for this interaction",
            "recommendation": "Suggestion for managing this interaction"
          },
          ...
        ],
        "summary": "Overall summary of findings",
        "disclaimer": "Standard medical disclaimer"
      }
      
      If no interactions are found, return an empty array for "interactions" with an appropriate summary.
      Focus on explaining the mechanisms of interactions in understandable terms when possible.
      Include dietary interactions only when they are significant.
      Always consider the cancer context in your analysis.
    `;
    
    // Use aiRouter to process the prompt and get the response
    const queryType = QueryType.TREATMENT; // Using TREATMENT type as it's most relevant
    
    // Determine which model to use - prefer Claude for medical analysis if no preference specified
    const preferredModel = options.preferredModel || ModelType.CLAUDE;
    
    // Process the query
    const response = await aiRouter.processQuery(fullPrompt, preferredModel, userId);
    
    // Parse the response content - expecting JSON format
    try {
      const responseObj = JSON.parse(response.content);
      
      // Format into the expected structure
      const result: InteractionAnalysisResult = {
        interactions: responseObj.interactions || [],
        summary: responseObj.summary || "No summary provided",
        disclaimer: responseObj.disclaimer || "This analysis is for informational purposes only and should not replace professional medical advice. Always consult with your healthcare provider before making any changes to your treatment plan.",
        modelUsed: response.modelUsed
      };
      
      return result;
    } catch (error) {
      console.error("Error parsing interaction analysis response:", error);
      console.log("Raw response:", response.content);
      
      // If parsing fails, return a formatted error result
      return {
        interactions: [],
        summary: "There was an error analyzing interactions. Please try again later.",
        disclaimer: "This feature encountered a technical issue. The results may not be complete or accurate.",
        modelUsed: response.modelUsed
      };
    }
  } catch (error) {
    console.error("Error in interaction analysis:", error);
    
    // Return a graceful error response
    return {
      interactions: [],
      summary: "An error occurred while analyzing interactions. Please try again later.",
      disclaimer: "This feature encountered a technical issue and could not complete the analysis.",
      modelUsed: "error"
    };
  }
}

/**
 * Performs a targeted analysis of interactions between specific items
 */
export async function analyzeSpecificInteraction(
  userId: string,
  items: string[],
  preferredModel?: ModelType
): Promise<InteractionDetail | null> {
  if (items.length < 2) {
    return null;
  }
  
  try {
    // Create a focused prompt for these specific items
    const prompt = `
      Please analyze potential interactions between: ${items.join(" and ")}.
      
      Provide your analysis in a structured JSON format with the following fields:
      {
        "item1": "${items[0]}",
        "item2": "${items[1]}",
        "severity": "none/low/moderate/high/unknown",
        "description": "Detailed description of the interaction",
        "mechanism": "Explanation of how the interaction occurs (when known)",
        "evidence": "Brief note on the quality of evidence for this interaction",
        "recommendation": "Suggestion for managing this interaction"
      }
      
      If no interaction is known, set severity to "none" and provide an appropriate description.
      Focus on explaining the mechanism of interaction in understandable terms when possible.
      Consider the cancer treatment context in your analysis.
    `;
    
    // Use aiRouter to process the prompt
    const response = await aiRouter.processQuery(prompt, preferredModel || ModelType.CLAUDE, userId);
    
    // Parse the response
    try {
      const interactionDetail = JSON.parse(response.content) as InteractionDetail;
      return interactionDetail;
    } catch (error) {
      console.error("Error parsing specific interaction response:", error);
      return null;
    }
  } catch (error) {
    console.error("Error in specific interaction analysis:", error);
    return null;
  }
}

// Export the service
export const interactionService = {
  analyzeInteractions,
  analyzeSpecificInteraction
};
