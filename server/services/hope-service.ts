import { HopeSnippet, QueryType } from '@shared/schema';
import { storage } from '../storage';

/**
 * Hope Module Service (Backend Chunk 9)
 * Provides functionality for retrieving hope snippets and generating
 * hope/support messages tailored to user context
 */

/**
 * Retrieves a hope snippet appropriate to the user's context
 * @param userId User ID to fetch appropriate snippets for
 * @param category Optional category to filter by ('quote', 'story', 'affirmation', etc.)
 */
export async function getContextualHopeSnippet(userId: string, category?: string): Promise<HopeSnippet | undefined> {
  try {
    // First check if there are any user-specific hope snippets
    const allSnippets = await storage.getHopeSnippets();
    const userSnippets = allSnippets.filter(snippet => snippet.userId === userId);
    
    // If user has their own snippets and category is specified, filter by category
    if (userSnippets.length > 0) {
      if (category) {
        const categorySnippets = userSnippets.filter(snippet => snippet.category === category);
        if (categorySnippets.length > 0) {
          // Return a random snippet from the filtered list
          return categorySnippets[Math.floor(Math.random() * categorySnippets.length)];
        }
      } else {
        // Return a random snippet from all user snippets
        return userSnippets[Math.floor(Math.random() * userSnippets.length)];
      }
    }
    
    // Fallback to retrieving a general hope snippet
    return await storage.getRandomHopeSnippet(category);
  } catch (error) {
    console.error('Error fetching contextual hope snippet:', error);
    return undefined;
  }
}

/**
 * Analyzes query text to determine if it's related to hope or emotional support
 * @param queryText The query text to analyze
 * @returns The detected query type (HOPE, EMOTIONAL_SUPPORT, or undefined)
 */
export function analyzeHopeQuery(queryText: string): QueryType | undefined {
  if (!queryText) return undefined;
  
  const lowerQuery = queryText.toLowerCase();
  
  // Check for Hope Module queries (Backend Chunk 9)
  if (lowerQuery.includes('inspire me') ||
      lowerQuery.includes('give me hope') ||
      lowerQuery.includes('hope message') ||
      lowerQuery.includes('hopeful') ||
      lowerQuery.includes('stories of hope') ||
      lowerQuery.includes('success story') ||
      lowerQuery.includes('positive outlook') ||
      lowerQuery.includes('share hope') ||
      lowerQuery.includes('hope quote') ||
      lowerQuery.includes('inspirational quote') ||
      lowerQuery.includes('give me strength') ||
      lowerQuery.includes('uplifting message') ||
      lowerQuery.includes('motivation') ||
      lowerQuery.includes('inspire') ||
      lowerQuery.includes('encouragement') ||
      lowerQuery.includes('success stories') ||
      lowerQuery.includes('overcome') ||
      lowerQuery.includes('triumph') ||
      lowerQuery.includes('positive thinking') ||
      lowerQuery.includes('show me the light')) {
    return QueryType.HOPE;
  }
  
  // Check for Emotional Support queries (Backend Chunk 9)
  if (lowerQuery.includes('feeling down') ||
      lowerQuery.includes('feeling scared') ||
      lowerQuery.includes('emotional support') ||
      lowerQuery.includes('feeling overwhelmed') ||
      lowerQuery.includes('feeling anxious') ||
      lowerQuery.includes('feeling depressed') ||
      lowerQuery.includes('need support') ||
      lowerQuery.includes('support me') ||
      lowerQuery.includes('coping with') ||
      lowerQuery.includes('help me process') ||
      lowerQuery.includes('struggling with emotions') ||
      lowerQuery.includes('emotional help') ||
      lowerQuery.includes('feel sad') ||
      lowerQuery.includes('feel alone') ||
      lowerQuery.includes('feeling isolated') ||
      lowerQuery.includes('need to talk') ||
      lowerQuery.includes('worried about') ||
      lowerQuery.includes('afraid of') ||
      lowerQuery.includes('scared about') ||
      lowerQuery.includes('feeling lost') ||
      lowerQuery.includes('comforting words') ||
      lowerQuery.includes('how to cope') ||
      lowerQuery.includes('need encouragement')) {
    return QueryType.EMOTIONAL_SUPPORT;
  }
  
  // Advanced pattern recognition (sentiment-based)
  if (/(?:i\s+(?:feel|am)\s+(?:so|very|really|extremely)\s+(?:sad|depressed|down|upset|worried|anxious|afraid))/i.test(queryText) ||
      /(?:i\s+(?:need|want|could use)\s+(?:someone|somebody)\s+(?:to talk to|to listen))/i.test(queryText) ||
      /(?:i\s+(?:don't know|can't|cannot)\s+(?:how to|what to)\s+(?:handle|deal with|cope|manage)\s+(?:this|it|everything))/i.test(queryText)) {
    return QueryType.EMOTIONAL_SUPPORT;
  }
  
  return undefined;
}

/**
 * Formats user context specifically for hope-related queries
 * @param context User context data including journal entries, diagnosis info, etc.
 * @param queryType The specific hope-related query type
 * @returns Formatted context string for the AI model
 */
export function formatHopeContext(context: any, queryType: QueryType): string {
  let contextStr = "";
  
  // Add basic user profile information
  if (context.userProfile) {
    contextStr += "USER INFORMATION:\n";
    contextStr += `Name: ${context.userProfile.displayName || context.userProfile.username}\n`;
    
    if (context.userProfile.diagnosis) {
      contextStr += `Diagnosis: ${context.userProfile.diagnosis}\n`;
    }
    
    if (context.userProfile.diagnosisStage) {
      contextStr += `Stage: ${context.userProfile.diagnosisStage}\n`;
    }
    
    if (context.userProfile.diagnosisDate) {
      const date = new Date(context.userProfile.diagnosisDate);
      contextStr += `Diagnosis Date: ${date.toLocaleDateString()}\n`;
    }
    
    // Add preferences if available for more personalized hope messages
    if (context.userProfile.preferences) {
      contextStr += "\nPREFERENCES:\n";
      
      if (context.userProfile.preferences.copingStrategies && context.userProfile.preferences.copingStrategies.length > 0) {
        contextStr += `Coping Strategies: ${context.userProfile.preferences.copingStrategies.join(', ')}\n`;
      }
      
      if (context.userProfile.preferences.supportSystem && context.userProfile.preferences.supportSystem.length > 0) {
        contextStr += `Support System: ${context.userProfile.preferences.supportSystem.join(', ')}\n`;
      }
      
      if (context.userProfile.preferences.communicationStyle) {
        contextStr += `Communication Style: ${context.userProfile.preferences.communicationStyle}\n`;
      }
      
      if (context.userProfile.preferences.hobbies && context.userProfile.preferences.hobbies.length > 0) {
        contextStr += `Interests/Hobbies: ${context.userProfile.preferences.hobbies.join(', ')}\n`;
      }
    }
  }
  
  // For emotional support, include recent journal entries to understand emotional state
  if (queryType === QueryType.EMOTIONAL_SUPPORT && context.journalLogs && context.journalLogs.length > 0) {
    contextStr += "\nRECENT JOURNAL ENTRIES:\n";
    // Sort by date, newest first
    const sortedLogs = [...context.journalLogs].sort((a, b) => {
      return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
    });
    
    // Only include the most recent 3 logs
    const recentLogs = sortedLogs.slice(0, 3);
    recentLogs.forEach((log: any, index: number) => {
      const date = new Date(log.entryDate);
      contextStr += `Entry ${index + 1} (${date.toLocaleDateString()}):\n`;
      contextStr += `${log.content}\n`;
      if (log.mood) contextStr += `Mood: ${log.mood}\n`;
      if (log.painLevel) contextStr += `Pain Level: ${log.painLevel}/10\n`;
      if (log.symptoms && log.symptoms.length > 0) {
        contextStr += `Symptoms: ${log.symptoms.join(', ')}\n`;
      }
    });
  }
  
  // Include hope snippets that the user has previously responded well to
  // This requires tracking which hope snippets were most effective for this user
  if (context.effectiveHopeSnippets && context.effectiveHopeSnippets.length > 0) {
    contextStr += "\nPREVIOUSLY EFFECTIVE HOPE MESSAGES:\n";
    context.effectiveHopeSnippets.forEach((snippet: any, index: number) => {
      contextStr += `${index + 1}. ${snippet.content}`;
      if (snippet.author) contextStr += ` - ${snippet.author}`;
      contextStr += "\n";
    });
  }
  
  return contextStr;
}

/**
 * Interface for hope response with source attribution
 */
export interface HopeResponse {
  content: string;
  sourceSnippet?: HopeSnippet;
  isCustomGenerated: boolean;
}

/**
 * Generates a hope message for the user based on their context
 * @param userId User ID for retrieving context and hope snippets
 * @param query The user's query
 * @param queryType The type of hope query (HOPE or EMOTIONAL_SUPPORT)
 */
export async function generateHopeMessage(
  userId: string,
  query: string,
  queryType: QueryType
): Promise<HopeResponse> {
  try {
    // First, try to find an appropriate hope snippet
    const category = determineHopeCategory(query, queryType);
    const snippet = await getContextualHopeSnippet(userId, category);
    
    // If we found a suitable snippet, return it
    if (snippet) {
      return {
        content: snippet.content,
        sourceSnippet: snippet,
        isCustomGenerated: false
      };
    }
    
    // Otherwise, we'll need to generate a custom response using AI
    // In a real implementation, we would use the OpenAI or Claude models here
    // via their respective service files, but for now we'll use a template-based approach
    // with contextually appropriate hope messages
    
    let customMessage = "";
    
    // Create messages tailored to the query type and user context
    if (queryType === QueryType.HOPE) {
      const hopeTemplates = [
        "Remember that each day brings new possibilities. Your strength in facing these challenges is truly inspiring.",
        "Hope isn't about expecting the best, but knowing that something good can emerge from whatever happens.",
        "Even in the darkest moments, there is always a path forward. You have the courage to find it.",
        "Your journey may be difficult, but it's shaping you into someone extraordinary. Keep moving forward with hope.",
        "The human spirit is remarkably resilient. Trust in your ability to adapt and overcome."
      ];
      
      // Select a random template
      customMessage = hopeTemplates[Math.floor(Math.random() * hopeTemplates.length)];
    } else if (queryType === QueryType.EMOTIONAL_SUPPORT) {
      const supportTemplates = [
        "It's completely natural to feel overwhelmed sometimes. Be gentle with yourself as you navigate these emotions.",
        "Your feelings are valid. Remember to take time for self-care and reach out to your support network when needed.",
        "During difficult times, focus on one moment at a time. Small steps forward still move you in the right direction.",
        "You're not alone in this journey. Many have walked similar paths and found their way through the darkness.",
        "It takes remarkable courage to face these challenges. Acknowledge your strength, even on the hardest days."
      ];
      
      // Select a random template
      customMessage = supportTemplates[Math.floor(Math.random() * supportTemplates.length)];
    }
    
    return {
      content: customMessage || "We're here to support you on your journey. Stay strong and remember that you're never alone in this.",
      isCustomGenerated: true
    };
  } catch (error) {
    console.error('Error generating hope message:', error);
    return {
      content: "Even in difficult moments, remember that each day brings new possibilities. You have the strength within you.",
      isCustomGenerated: true
    };
  }
}

/**
 * Determines the most appropriate hope category based on the query
 * @param query The user's query text
 * @param queryType The type of hope-related query
 * @returns The most appropriate category ('quote', 'story', 'affirmation', etc.)
 */
function determineHopeCategory(query: string, queryType: QueryType): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('quote') || lowerQuery.includes('saying')) {
    return 'quote';
  }
  
  if (lowerQuery.includes('story') || lowerQuery.includes('example')) {
    return 'story';
  }
  
  if (lowerQuery.includes('affirmation') || lowerQuery.includes('mantra')) {
    return 'affirmation';
  }
  
  // Default categories based on query type
  if (queryType === QueryType.EMOTIONAL_SUPPORT) {
    return 'support';
  }
  
  return 'inspiration';
}
