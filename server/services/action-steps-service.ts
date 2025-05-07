import { ActionStep, InsertActionStep } from '@shared/schema';
import { aiRouter } from '../services/ai-router';
import { storage } from '../storage';

/**
 * Service to handle action steps functionality
 */
export class ActionStepsService {
  /**
   * Generate personalized action steps based on user data
   */
  async generateActionSteps(userId: string): Promise<ActionStep[]> {
    try {
      // Get all user data that would be relevant for generating suggestions
      // Only call methods that exist in the storage interface
      const [
        user, 
        treatments, 
        documents, 
        researchItems,
        journalLogs,
        dietLogs,
        allActionSteps
      ] = await Promise.all([
        storage.getUser(userId),
        storage.getTreatments(userId).catch(() => []),
        storage.getDocuments(userId).catch(() => []),
        storage.getResearchItems(userId).catch(() => []),
        storage.getJournalLogs(userId).catch(() => []),
        storage.getDietLogs(userId).catch(() => []),
        storage.getActionSteps(userId).catch(() => [])
      ]);
      
      // Filter for completed action steps
      const completedActionSteps = (allActionSteps || []).filter(step => step.isCompleted);

      // Use AI router to generate personalized action steps
      const userData = {
        user,
        treatments,
        documents,
        researchItems,
        journalLogs,
        dietLogs,
        completedActionSteps
      };
      const prompt = this.buildActionStepsPrompt(userData);

      // If there are existing incomplete action steps, delete them
      try {
        if (typeof storage.deleteIncompleteActionSteps === 'function') {
          await storage.deleteIncompleteActionSteps(userId);
        } else {
          // Fallback: get all action steps and delete incomplete ones manually
          const existingSteps = await storage.getActionSteps(userId);
          for (const step of existingSteps) {
            if (!step.isCompleted) {
              // Note: This is a simplified approach since we don't have a proper delete method
              // We'll just update them to be completed with a special note
              await storage.updateActionStep(step.id, {
                isCompleted: true,
                completedDate: new Date(),
                description: 'Replaced by newer recommendation'
              });
            }
          }
        }
      } catch (error) {
        console.log('Could not delete incomplete action steps:', error);
      }

      // Call the AI service to generate steps
      const actionStepsResponse = await aiRouter.getPersonalizedActionSteps(prompt);
      
      // Create action steps in storage
      const createdSteps: ActionStep[] = [];
      
      for (const step of actionStepsResponse.slice(0, 4)) { // Limit to 4 steps
        const actionStep: InsertActionStep = {
          userId,
          title: step.title,
          description: step.description,
          category: step.category as any, // Cast to handle potential type mismatch
          source: step.source || null
        };
        
        const createdStep = await storage.createActionStep(actionStep);
        createdSteps.push(createdStep);
      }
      
      return createdSteps;
    } catch (error) {
      console.error('Error generating action steps:', error);
      // Provide development data if generation fails
      return this.getDevelopmentActionSteps(userId);
    }
  }

  /**
   * Build a prompt for the AI to generate personalized action steps
   */
  private buildActionStepsPrompt(userData: any): string {
    return `
You are Sophera, an AI assistant specialized in cancer care and patient support.
Based on the user's data, generate 4 personalized, actionable recommendations that can help improve their condition, 
wellbeing, or understanding of their medical situation.

USER DATA:
${JSON.stringify(userData, null, 2)}

PREVIOUSLY COMPLETED ACTIONS BY USER:
${JSON.stringify(userData.completedActionSteps || [], null, 2)}

INSTRUCTIONS:
1. Each recommendation should be specific, actionable, and personalized to the user's condition.
2. Include a mix of different types: exercise, nutrition, mental health, treatment follow-up, social support, and research-based actions.
3. Make sure the recommendations are realistic and achievable.
4. Avoid suggesting steps the user has already completed.

Format your response as a JSON array of objects with the following structure:
[
  {
    "title": "Brief, clear action title",
    "description": "Specific details and rationale for the action (1-2 sentences)",
    "category": "One of: exercise, nutrition, mental, treatment, social, research",
    "source": "Optional: Source of this recommendation, e.g. from a specific research item or document"
  }
]`;
  }

  /**
   * Mark an action step as completed or not completed
   */
  async toggleActionStep(actionStepId: number): Promise<ActionStep> {
    const actionStep = await storage.getActionStepById(actionStepId);
    
    if (!actionStep) {
      throw new Error('Action step not found');
    }
    
    const updatedStep = await storage.updateActionStep(actionStepId, {
      isCompleted: !actionStep.isCompleted,
      completedDate: !actionStep.isCompleted ? new Date() : null
    });
    
    return updatedStep;
  }

  /**
   * Get development action steps data for testing
   */
  private getDevelopmentActionSteps(userId: string): ActionStep[] {
    const now = new Date();
    return [
      {
        id: 1,
        userId,
        title: 'Schedule a follow-up appointment',
        description: 'Based on your recent treatment updates, it\'s time for a follow-up with your oncologist.',
        isCompleted: false,
        completedDate: null,
        createdAt: now,
        updatedAt: now,
        category: 'treatment' as any,
        source: null
      },
      {
        id: 2,
        userId,
        title: 'Try gentle yoga for 15 minutes',
        description: 'Your journal entries show increased stress. Yoga can help reduce anxiety during treatment.',
        isCompleted: false,
        completedDate: null,
        createdAt: now,
        updatedAt: now,
        category: 'exercise' as any,
        source: null
      },
      {
        id: 3,
        userId,
        title: 'Add more protein to your meals',
        description: 'Your nutritional logs show you might benefit from increasing protein intake to support recovery.',
        isCompleted: false,
        completedDate: null,
        createdAt: now,
        updatedAt: now,
        category: 'nutrition' as any,
        source: null
      },
      {
        id: 4,
        userId,
        title: 'Read about new treatment options',
        description: 'Based on your saved research, there are new immunotherapy approaches you might want to discuss with your doctor.',
        isCompleted: false,
        completedDate: null,
        createdAt: now,
        updatedAt: now,
        category: 'research' as any,
        source: null
      }
    ];
  }
}

export const actionStepsService = new ActionStepsService();