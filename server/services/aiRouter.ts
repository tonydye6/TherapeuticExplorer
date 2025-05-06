import { ModelType, QueryType } from '@shared/schema';
import * as openaiService from './openai-service';
import * as claudeService from './anthropic-service';
import * as geminiService from './gemini-service';
import { vertexSearchService } from './vertex-search-service';
import { storage } from '../storage';
import * as firestoreService from './firestore-service';

// Types for context data
interface UserContext {
  userProfile: any;
  planItems?: any[];
  journalLogs?: any[];
  dietLogs?: any[];
  treatments?: any[];
  savedResearch?: any[];
  documents?: any[];
  alternativeTreatments?: any[];
  treatmentDetails?: any[]; // Added for treatment context integration
  treatmentComparisons?: any[]; // For storing treatment comparison information
  treatmentSideEffects?: any[]; // For storing treatment side effects information
  treatmentTimelines?: any[]; // For storing treatment timeline information
}

// Configuration for model routing
const modelConfig = {
  // Primary models for each query type
  primary: {
    [QueryType.MEDICAL_TERM]: ModelType.GPT,  
    [QueryType.RESEARCH]: ModelType.CLAUDE,
    [QueryType.TREATMENT]: ModelType.GPT,
    [QueryType.CLINICAL_TRIAL]: ModelType.GPT,
    [QueryType.GENERAL]: ModelType.GEMINI,
    [QueryType.DOCUMENT_QUESTION]: ModelType.GPT, // Use GPT for document-specific questions
    [QueryType.ALTERNATIVE_TREATMENT]: ModelType.CLAUDE, // Use Claude for alternative treatment questions
    [QueryType.INTERACTION]: ModelType.CLAUDE, // Use Claude for interaction analysis due to its medical reasoning
    // Added for Backend Chunk 7 - Treatment Context Integration
    [QueryType.TREATMENT_SIDE_EFFECT]: ModelType.GPT, // GPT is good at explaining side effects with context
    [QueryType.TREATMENT_COMPARISON]: ModelType.CLAUDE, // Claude is better at analyzing and comparing multiple options
    [QueryType.TREATMENT_TIMELINE]: ModelType.GPT, // GPT for detailed timeline explanations
    [QueryType.TREATMENT_EXPLANATION]: ModelType.GPT, // GPT for plain language treatment explanations
    // Added for Backend Chunk 8 - Creative Exploration Sandbox
    [QueryType.CREATIVE_EXPLORATION]: ModelType.GEMINI, // Gemini is excellent for multi-modal, creative exploration
    [QueryType.DOCTOR_BRIEF]: ModelType.GPT // GPT for structured doctor briefs generation
  },
  
  // Fallback models if primary is unavailable
  fallback: {
    [ModelType.GPT]: ModelType.CLAUDE,
    [ModelType.CLAUDE]: ModelType.GPT,
    [ModelType.GEMINI]: ModelType.GPT,
    [ModelType.BIOBERT]: ModelType.GPT
  }
};

/**
 * Interface representing a query to be routed to the appropriate AI model
 */
interface AIQuery {
  content: string;
  type: QueryType;
  userPreferredModel?: ModelType; // optional user preference for model
  context?: any; // optional context data 
  userId: string;
}

/**
 * Standardized response from any AI model
 */
interface AIResponse {
  content: string;
  modelUsed: ModelType;
  sources?: any[];
  timestamp: Date;
  metadata?: any;
}

/**
 * Routes a query to the appropriate AI model based on query type and configuration
 */
async function routeQuery(query: AIQuery): Promise<AIResponse> {
  console.log(`Routing query of type ${query.type}`);
  
  // Determine the model to use based on type, user preference, or configuration
  const modelToUse = determineModel(query);
  console.log(`Selected model: ${modelToUse}`);
  
  try {
    // Route to the appropriate model service
    const response = await callModel(modelToUse, query);
    return response;
  } catch (error: any) {
    console.error(`Error with ${modelToUse}:`, error);
    
    // Try fallback model if available
    const fallbackModel = modelConfig.fallback[modelToUse];
    if (fallbackModel) {
      console.log(`Falling back to ${fallbackModel}`);
      try {
        const fallbackResponse = await callModel(fallbackModel, query);
        return fallbackResponse;
      } catch (fallbackError: any) {
        console.error(`Error with fallback ${fallbackModel}:`, fallbackError);
        throw new Error(`Both primary and fallback models failed: ${error.message}; ${fallbackError.message}`);
      }
    } else {
      throw error;
    }
  }
}

/**
 * Determines which model to use based on query type and user preference
 */
function determineModel(query: AIQuery): ModelType {
  // User preference overrides defaults if specified
  if (query.userPreferredModel) {
    return query.userPreferredModel;
  }
  
  // Use the configured primary model for this query type
  return modelConfig.primary[query.type];
}

/**
 * Calls the appropriate model service based on the selected model type
 */
async function callModel(modelType: ModelType, query: AIQuery): Promise<AIResponse> {
  switch (modelType) {
    case ModelType.GPT:
      const openaiResponse = await openaiService.generateResponse(
        query.content, 
        query.context, 
        query.userId,
        query.type // Pass query type to service
      );
      return {
        content: openaiResponse.text,
        modelUsed: ModelType.GPT,
        sources: openaiResponse.sources || [],
        timestamp: new Date(),
        metadata: openaiResponse.metadata
      };
      
    case ModelType.CLAUDE:
      const claudeResponse = await claudeService.generateResponse(
        query.content, 
        query.context, 
        query.userId,
        query.type // Pass query type to service
      );
      return {
        content: claudeResponse.text,
        modelUsed: ModelType.CLAUDE,
        sources: claudeResponse.sources || [],
        timestamp: new Date(),
        metadata: claudeResponse.metadata
      };
      
    case ModelType.GEMINI:
      const geminiResponse = await geminiService.generateResponse(
        query.content, 
        query.context, 
        query.userId,
        query.type // Pass query type to service
      );
      return {
        content: geminiResponse.text,
        modelUsed: ModelType.GEMINI,
        sources: geminiResponse.sources || [],
        timestamp: new Date(),
        metadata: geminiResponse.metadata
      };
      
    default:
      throw new Error(`Unsupported model type: ${modelType}`);
  }
}

/**
 * Determines which model to use for a given query text and returns both model and query type
 * @param queryText The text of the query
 * @returns Object containing the selected model type and detected query type
 */
export function determineModelForQuery(queryText: string): { modelType: ModelType, queryType: QueryType } {
  // Analyze the query type
  const queryType = analyzeQueryTypeSync(queryText);
  
  // Determine the best model for this query type based on the configured primary model
  const modelType = modelConfig.primary[queryType];
  
  return { modelType, queryType };
}

/**
 * Synchronous version of query type analysis (used internally)
 */
function analyzeQueryTypeSync(queryText: string): QueryType {
  // Simple rule-based approach, same logic as async version
  const lowerQuery = queryText.toLowerCase();
  
  // Check for document-specific queries first
  if (lowerQuery.includes('document') || 
      lowerQuery.includes('in my files') || 
      lowerQuery.includes('uploaded') || 
      lowerQuery.includes('my records') ||
      lowerQuery.includes('my medical records') ||
      lowerQuery.includes('my notes') ||
      lowerQuery.includes('my documents')) {
    return QueryType.DOCUMENT_QUESTION;
  }
  
  // Check for Creative Exploration Sandbox requests (Backend Chunk 8)
  if (lowerQuery.includes('creative exploration') ||
      lowerQuery.includes('brainstorm') ||
      lowerQuery.includes('let\'s explore') ||
      lowerQuery.includes('think outside the box') ||
      lowerQuery.includes('generate ideas') ||
      lowerQuery.includes('creative ideas') ||
      lowerQuery.includes('creative solutions') ||
      lowerQuery.includes('explore possibilities') ||
      lowerQuery.includes('what if') ||
      lowerQuery.includes('sandbox') ||
      lowerQuery.includes('creativity session')) {
    return QueryType.CREATIVE_EXPLORATION;
  }
  
  // Check for Doctor Brief generation requests (Backend Chunk 8)
  if (lowerQuery.includes('doctor brief') ||
      lowerQuery.includes('medical brief') ||
      lowerQuery.includes('medical summary') ||
      lowerQuery.includes('doctor summary') ||
      lowerQuery.includes('healthcare provider summary') ||
      lowerQuery.includes('doctor report') ||
      lowerQuery.includes('prepare for appointment') ||
      lowerQuery.includes('appointment summary') ||
      lowerQuery.includes('summary for my doctor') ||
      lowerQuery.includes('medical visit preparation')) {
    return QueryType.DOCTOR_BRIEF;
  }
  
  // Check for alternative treatment queries
  if (lowerQuery.includes('alternative treatment') || 
      lowerQuery.includes('holistic') || 
      lowerQuery.includes('complementary') || 
      lowerQuery.includes('integrative') ||
      lowerQuery.includes('natural medicine') ||
      lowerQuery.includes('supplements') ||
      lowerQuery.includes('herbal') ||
      lowerQuery.includes('acupuncture') ||
      lowerQuery.includes('traditional chinese medicine') ||
      lowerQuery.includes('ayurvedic') ||
      lowerQuery.includes('meditation') ||
      lowerQuery.includes('yoga')) {
    return QueryType.ALTERNATIVE_TREATMENT;
  }
  
  // Check for specialized treatment-related queries (Backend Chunk 7)
  
  // Check for treatment side effect queries
  if (lowerQuery.includes('side effect') ||
      lowerQuery.includes('adverse effect') ||
      lowerQuery.includes('negative effect') ||
      lowerQuery.includes('reaction to treatment') ||
      lowerQuery.includes('medication reaction') ||
      lowerQuery.includes('experiencing') ||
      lowerQuery.includes('symptoms from')) {
    return QueryType.TREATMENT_SIDE_EFFECT;
  }
  
  // Check for treatment comparison queries
  if ((lowerQuery.includes('compare') || lowerQuery.includes('comparison') || 
       lowerQuery.includes('versus') || lowerQuery.includes('vs') || 
       lowerQuery.includes('difference between') || lowerQuery.includes('better option')) &&
      (lowerQuery.includes('treatment') || lowerQuery.includes('medication') ||
       lowerQuery.includes('therapy') || lowerQuery.includes('drug') ||
       lowerQuery.includes('medicine'))) {
    return QueryType.TREATMENT_COMPARISON;
  }
  
  // Check for treatment timeline queries
  if ((lowerQuery.includes('timeline') || lowerQuery.includes('schedule') || 
       lowerQuery.includes('how long') || lowerQuery.includes('duration') ||
       lowerQuery.includes('what to expect') || lowerQuery.includes('stages') ||
       lowerQuery.includes('process') || lowerQuery.includes('steps') ||
       lowerQuery.includes('phase')) &&
      (lowerQuery.includes('treatment') || lowerQuery.includes('therapy') ||
       lowerQuery.includes('medication') || lowerQuery.includes('drug'))) {
    return QueryType.TREATMENT_TIMELINE;
  }
  
  // Check for treatment explanation queries
  if ((lowerQuery.includes('explain') || lowerQuery.includes('how does') ||
       lowerQuery.includes('tell me about') || lowerQuery.includes('what is') ||
       lowerQuery.includes('describe') || lowerQuery.includes('details about') ||
       lowerQuery.includes('information on')) &&
      (lowerQuery.includes('treatment') || lowerQuery.includes('therapy') ||
       lowerQuery.includes('medication') || lowerQuery.includes('drug'))) {
    return QueryType.TREATMENT_EXPLANATION;
  }
  
  // Check for interaction queries
  if (lowerQuery.includes('interaction') ||
      lowerQuery.includes('drug interaction') ||
      lowerQuery.includes('contraindication') ||
      lowerQuery.includes('conflict') ||
      lowerQuery.includes('safe to take') ||
      lowerQuery.includes('together with') ||
      lowerQuery.includes('mixed with') ||
      lowerQuery.includes('combining') ||
      lowerQuery.includes('affects') ||
      lowerQuery.includes('react with')) {
    return QueryType.INTERACTION;
  }
  
  if (lowerQuery.includes('what does') || 
      lowerQuery.includes('define') || 
      lowerQuery.includes('meaning of') || 
      lowerQuery.includes('explain term')) {
    return QueryType.MEDICAL_TERM;
  }
  
  if (lowerQuery.includes('research') || 
      lowerQuery.includes('study') || 
      lowerQuery.includes('evidence') || 
      lowerQuery.includes('publication')) {
    return QueryType.RESEARCH;
  }
  
  if (lowerQuery.includes('treatment') || 
      lowerQuery.includes('therapy') || 
      lowerQuery.includes('medication') || 
      lowerQuery.includes('drug')) {
    return QueryType.TREATMENT;
  }
  
  if (lowerQuery.includes('trial') || 
      lowerQuery.includes('clinical trial') || 
      lowerQuery.includes('enrollment') || 
      lowerQuery.includes('participate')) {
    return QueryType.CLINICAL_TRIAL;
  }
  
  // Default to general query
  return QueryType.GENERAL;
}

/**
 * Analyzes a user query to determine its type
 */
export async function analyzeQueryType(queryText: string): Promise<QueryType> {
  // For now, use a simple rule-based approach
  // In a more advanced implementation, this would use embeddings or a classifier
  
  const lowerQuery = queryText.toLowerCase();
  
  // Check for document-specific queries first
  if (lowerQuery.includes('document') || 
      lowerQuery.includes('in my files') || 
      lowerQuery.includes('uploaded') || 
      lowerQuery.includes('my records') ||
      lowerQuery.includes('my medical records') ||
      lowerQuery.includes('my notes') ||
      lowerQuery.includes('my documents')) {
    return QueryType.DOCUMENT_QUESTION;
  }
  
  // Check for Creative Exploration Sandbox requests (Backend Chunk 8)
  if (lowerQuery.includes('creative exploration') ||
      lowerQuery.includes('brainstorm') ||
      lowerQuery.includes('let\'s explore') ||
      lowerQuery.includes('think outside the box') ||
      lowerQuery.includes('generate ideas') ||
      lowerQuery.includes('creative ideas') ||
      lowerQuery.includes('creative solutions') ||
      lowerQuery.includes('explore possibilities') ||
      lowerQuery.includes('what if') ||
      lowerQuery.includes('sandbox') ||
      lowerQuery.includes('creativity session')) {
    return QueryType.CREATIVE_EXPLORATION;
  }
  
  // Check for Doctor Brief generation requests (Backend Chunk 8)
  if (lowerQuery.includes('doctor brief') ||
      lowerQuery.includes('medical brief') ||
      lowerQuery.includes('medical summary') ||
      lowerQuery.includes('doctor summary') ||
      lowerQuery.includes('healthcare provider summary') ||
      lowerQuery.includes('doctor report') ||
      lowerQuery.includes('prepare for appointment') ||
      lowerQuery.includes('appointment summary') ||
      lowerQuery.includes('summary for my doctor') ||
      lowerQuery.includes('medical visit preparation')) {
    return QueryType.DOCTOR_BRIEF;
  }
  
  // Check for alternative treatment queries
  if (lowerQuery.includes('alternative treatment') || 
      lowerQuery.includes('holistic') || 
      lowerQuery.includes('complementary') || 
      lowerQuery.includes('integrative') ||
      lowerQuery.includes('natural medicine') ||
      lowerQuery.includes('supplements') ||
      lowerQuery.includes('herbal') ||
      lowerQuery.includes('acupuncture') ||
      lowerQuery.includes('traditional chinese medicine') ||
      lowerQuery.includes('ayurvedic') ||
      lowerQuery.includes('meditation') ||
      lowerQuery.includes('yoga')) {
    return QueryType.ALTERNATIVE_TREATMENT;
  }
  
  // Check for specialized treatment-related queries (Backend Chunk 7)
  
  // Check for treatment side effect queries
  if (lowerQuery.includes('side effect') ||
      lowerQuery.includes('adverse effect') ||
      lowerQuery.includes('negative effect') ||
      lowerQuery.includes('reaction to treatment') ||
      lowerQuery.includes('medication reaction') ||
      lowerQuery.includes('experiencing') ||
      lowerQuery.includes('symptoms from')) {
    return QueryType.TREATMENT_SIDE_EFFECT;
  }
  
  // Check for treatment comparison queries
  if ((lowerQuery.includes('compare') || lowerQuery.includes('comparison') || 
       lowerQuery.includes('versus') || lowerQuery.includes('vs') || 
       lowerQuery.includes('difference between') || lowerQuery.includes('better option')) &&
      (lowerQuery.includes('treatment') || lowerQuery.includes('medication') ||
       lowerQuery.includes('therapy') || lowerQuery.includes('drug') ||
       lowerQuery.includes('medicine'))) {
    return QueryType.TREATMENT_COMPARISON;
  }
  
  // Check for treatment timeline queries
  if ((lowerQuery.includes('timeline') || lowerQuery.includes('schedule') || 
       lowerQuery.includes('how long') || lowerQuery.includes('duration') ||
       lowerQuery.includes('what to expect') || lowerQuery.includes('stages') ||
       lowerQuery.includes('process') || lowerQuery.includes('steps') ||
       lowerQuery.includes('phase')) &&
      (lowerQuery.includes('treatment') || lowerQuery.includes('therapy') ||
       lowerQuery.includes('medication') || lowerQuery.includes('drug'))) {
    return QueryType.TREATMENT_TIMELINE;
  }
  
  // Check for treatment explanation queries
  if ((lowerQuery.includes('explain') || lowerQuery.includes('how does') ||
       lowerQuery.includes('tell me about') || lowerQuery.includes('what is') ||
       lowerQuery.includes('describe') || lowerQuery.includes('details about') ||
       lowerQuery.includes('information on')) &&
      (lowerQuery.includes('treatment') || lowerQuery.includes('therapy') ||
       lowerQuery.includes('medication') || lowerQuery.includes('drug'))) {
    return QueryType.TREATMENT_EXPLANATION;
  }
  
  // Check for interaction queries
  if (lowerQuery.includes('interaction') ||
      lowerQuery.includes('drug interaction') ||
      lowerQuery.includes('contraindication') ||
      lowerQuery.includes('conflict') ||
      lowerQuery.includes('safe to take') ||
      lowerQuery.includes('together with') ||
      lowerQuery.includes('mixed with') ||
      lowerQuery.includes('combining') ||
      lowerQuery.includes('affects') ||
      lowerQuery.includes('react with')) {
    return QueryType.INTERACTION;
  }
  
  if (lowerQuery.includes('what does') || 
      lowerQuery.includes('define') || 
      lowerQuery.includes('meaning of') || 
      lowerQuery.includes('explain term')) {
    return QueryType.MEDICAL_TERM;
  }
  
  if (lowerQuery.includes('research') || 
      lowerQuery.includes('study') || 
      lowerQuery.includes('evidence') || 
      lowerQuery.includes('publication')) {
    return QueryType.RESEARCH;
  }
  
  if (lowerQuery.includes('treatment') || 
      lowerQuery.includes('therapy') || 
      lowerQuery.includes('medication') || 
      lowerQuery.includes('drug')) {
    return QueryType.TREATMENT;
  }
  
  if (lowerQuery.includes('trial') || 
      lowerQuery.includes('clinical trial') || 
      lowerQuery.includes('enrollment') || 
      lowerQuery.includes('participate')) {
    return QueryType.CLINICAL_TRIAL;
  }
  
  // Default to general query
  return QueryType.GENERAL;
}

/**
 * Fetches user-specific context based on the query type
 */
async function getUserContext(userId: string, queryType: QueryType): Promise<UserContext> {
  console.log(`Fetching context for user ${userId} and query type ${queryType}`);
  
  // Start with the basic user profile
  try {
    // Use Firestore service directly to get user profile
    const userProfile = await firestoreService.getUserProfile(userId);
    
    if (!userProfile) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const context: UserContext = {
      userProfile
    };
    
    // Fetch additional context based on query type
    switch (queryType) {
      // Creative Exploration Sandbox and Doctor Brief (Backend Chunk 8)
      case QueryType.CREATIVE_EXPLORATION:
      case QueryType.DOCTOR_BRIEF:
        try {
          // For creative exploration, fetch comprehensive user context
          // to enable personalized brainstorming and idea generation
          
          // Include all plan items for context
          const planItems = await firestoreService.getPlanItems(userId);
          context.planItems = planItems;
          
          // Include recent journal logs for emotional context and personal experiences
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          context.journalLogs = await firestoreService.getJournalLogs(userId, threeMonthsAgo);
          
          // Include recent diet logs for lifestyle context
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          context.dietLogs = await firestoreService.getDietLogs(userId, oneMonthAgo);
          
          // Include saved research for knowledge context
          if (storage.getResearchItems) {
            context.savedResearch = await storage.getResearchItems(userId);
          }
          
          // Include treatment information
          if (storage.getTreatments) {
            context.treatments = await storage.getTreatments(userId);
          }
          
          // Include alternative treatments for holistic exploration
          if (storage.getAlternativeTreatments) {
            context.alternativeTreatments = await storage.getAlternativeTreatments(userId);
          }
          
          // For doctor brief, we need comprehensive but concise context
          if (queryType === QueryType.DOCTOR_BRIEF) {
            // Limit the amount of information to keep the brief focused
            if (context.journalLogs && context.journalLogs.length > 5) {
              context.journalLogs = context.journalLogs.slice(0, 5); // Only most recent 5 logs
            }
            
            if (context.savedResearch && context.savedResearch.length > 3) {
              context.savedResearch = context.savedResearch.slice(0, 3); // Only most relevant research
            }
          }
        } catch (error: any) {
          console.warn('Error fetching creative exploration context:', error);
        }
        break;
        
      // Treatment specialized query types from Backend Chunk 7
      case QueryType.TREATMENT_SIDE_EFFECT:
      case QueryType.TREATMENT_COMPARISON:
      case QueryType.TREATMENT_TIMELINE:
      case QueryType.TREATMENT_EXPLANATION:
        // For specialized treatment queries, provide comprehensive treatment context
        try {
          // Fetch all treatment-related data for context-aware responses
          const planItems = await firestoreService.getPlanItems(userId);
          context.planItems = planItems.filter((item: any) => 
            item.type === 'medication' || 
            item.type === 'treatment' || 
            item.type === 'procedure' ||
            item.type === 'appointment');
          
          // Get treatment details for comprehensive context
          if (storage.getTreatments) {
            context.treatments = await storage.getTreatments(userId);
          }
          
          // Get journal logs that mention treatments or side effects
          const twoMonthsAgo = new Date();
          twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
          const journalLogs = await firestoreService.getJournalLogs(userId, twoMonthsAgo);
          
          // Filter logs to include only those relevant to treatments
          context.journalLogs = journalLogs.filter((log: any) => {
            if (!log.content) return false;
            const content = log.content.toLowerCase();
            return content.includes('treatment') || 
                  content.includes('medication') || 
                  content.includes('side effect') || 
                  content.includes('reaction') || 
                  content.includes('therapy') || 
                  content.includes('drug');
          });
          
          // For treatment comparison, include research with comparisons
          if (queryType === QueryType.TREATMENT_COMPARISON && storage.getResearchItems) {
            const allResearch = await storage.getResearchItems(userId);
            context.savedResearch = allResearch.filter((item: any) => {
              if (!item.content) return false;
              const content = item.content.toLowerCase();
              return content.includes('compared') || 
                    content.includes('versus') || 
                    content.includes('comparison') || 
                    content.includes('better than') ||
                    content.includes('more effective');
            });
          }
          
          // For side effects, include specific side effect documents
          if (queryType === QueryType.TREATMENT_SIDE_EFFECT) {
            // Build a specialized treatment side effects data structure
            context.treatmentSideEffects = [];
            
            // Process the treatments and collect side effects
            if (context.treatments) {
              context.treatments.forEach((treatment: any) => {
                if (treatment.sideEffects) {
                  context.treatmentSideEffects.push({
                    treatmentName: treatment.name,
                    sideEffects: treatment.sideEffects,
                    treatmentType: treatment.type,
                    active: treatment.active
                  });
                }
              });
            }
          }
          
          // For timeline information, include specific timeline data
          if (queryType === QueryType.TREATMENT_TIMELINE) {
            // Build a specialized treatment timelines data structure
            context.treatmentTimelines = [];
            
            // Process treatments to extract timeline information
            if (context.treatments) {
              context.treatments.forEach((treatment: any) => {
                context.treatmentTimelines.push({
                  treatmentName: treatment.name,
                  startDate: treatment.startDate,
                  endDate: treatment.endDate,
                  treatmentType: treatment.type,
                  notes: treatment.notes,
                  active: treatment.active
                });
              });
            }
          }
        } catch (error: any) {
          console.warn('Error fetching specialized treatment context:', error);
        }
        break;
        
      case QueryType.TREATMENT:
      case QueryType.CLINICAL_TRIAL:
        // For treatment/trial queries, include plan items, treatments from plan
        try {
          // Fetch the user's plan items related to treatment
          const planItems = await firestoreService.getPlanItems(userId);
          context.planItems = planItems.filter((item: any) => 
            item.type === 'medication' || 
            item.type === 'treatment' || 
            item.type === 'procedure' ||
            item.type === 'appointment');
          
          // Maintain backward compatibility with treatments array if still used elsewhere
          if (storage.getTreatments) {
            context.treatments = await storage.getTreatments(userId);
          }
        } catch (error: any) {
          console.warn('Error fetching treatment context:', error);
        }
        break;
        
      case QueryType.RESEARCH:
        // For research queries, fetch saved research items
        try {
          if (storage.getResearchItems) {
            context.savedResearch = await storage.getResearchItems(userId);
          }
        } catch (error: any) {
          console.warn('Error fetching research items:', error);
        }
        break;
        
      case QueryType.DOCUMENT_QUESTION:
        // For document questions, fetch the user's documents
        try {
          if (storage.getDocuments) {
            context.documents = await storage.getDocuments(userId);
          }
        } catch (error: any) {
          console.warn('Error fetching documents for document question:', error);
        }
        break;
        
      case QueryType.ALTERNATIVE_TREATMENT:
        // For alternative treatment queries, fetch relevant alternative treatments
        try {
          // Fetch plan items related to supplements and alternative treatments
          const planItems = await firestoreService.getPlanItems(userId);
          context.planItems = planItems.filter((item: any) => 
            item.type === 'supplement' || 
            item.type === 'alternative' ||
            item.type === 'herb' ||
            item.type === 'vitamin');
          
          // Maintain backward compatibility
          if (storage.getAlternativeTreatments) {
            context.alternativeTreatments = await storage.getAlternativeTreatments(userId);
          }
          if (storage.getTreatments) {
            context.treatments = await storage.getTreatments(userId);
          }
        } catch (error: any) {
          console.warn('Error fetching alternative treatments:', error);
        }
        break;
        
      case QueryType.INTERACTION:
        // For interaction queries, fetch all medications, supplements, etc.
        try {
          // Get all plan items for comprehensive interaction analysis
          const planItems = await firestoreService.getPlanItems(userId);
          context.planItems = planItems.filter((item: any) => 
            item.type === 'medication' || 
            item.type === 'treatment' ||
            item.type === 'supplement' || 
            item.type === 'alternative' ||
            item.type === 'herb' ||
            item.type === 'vitamin' ||
            item.type === 'diet');
          
          // Include recent journal logs for symptoms context
          const today = new Date();
          const twoWeeksAgo = new Date(today);
          twoWeeksAgo.setDate(today.getDate() - 14);
          
          context.journalLogs = await firestoreService.getJournalLogs(userId, twoWeeksAgo);
          
          // Include recent diet logs for dietary factors
          context.dietLogs = await firestoreService.getDietLogs(userId, twoWeeksAgo);
          
          // Maintain backward compatibility
          if (storage.getTreatments) {
            context.treatments = await storage.getTreatments(userId);
          }
          if (storage.getAlternativeTreatments) {
            context.alternativeTreatments = await storage.getAlternativeTreatments(userId);
          }
        } catch (error: any) {
          console.warn('Error fetching interaction analysis context:', error);
        }
        break;
        
      case QueryType.MEDICAL_TERM:
        // For medical term explanations, include diagnosis context
        // User profile already includes diagnosis information
        break;
        
      case QueryType.GENERAL:
        // For general queries, include recent journal logs for current state context
        try {
          // Get journal logs from the past week
          const today = new Date();
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(today.getDate() - 7);
          
          context.journalLogs = await firestoreService.getJournalLogs(userId, oneWeekAgo);
          
          // Include active plan items
          const planItems = await firestoreService.getPlanItems(userId);
          context.planItems = planItems.filter((item: any) => 
            !item.completed && 
            (!item.dueDate || new Date(item.dueDate) >= new Date()));
        } catch (error: any) {
          console.warn('Error fetching general context:', error);
        }
        break;
        
      // Add more cases for other query types as needed
    }
    
    return context;
  } catch (error: any) {
    console.error('Error in getUserContext:', error);
    // Return minimal context to avoid breaking the entire request
    return { userProfile: { id: userId } };
  }
}

/**
 * Formats user context into a coherent prompt context string for LLMs
 */
function formatContextForLLM(context: UserContext, queryType: QueryType): string {
  let contextStr = "";
  
  // Add basic user profile information
  if (context.userProfile) {
    contextStr += "User Information:\n";
    contextStr += `- Name: ${context.userProfile.displayName || context.userProfile.username}\n`;
    
    if (context.userProfile.diagnosis) {
      contextStr += `- Diagnosis: ${context.userProfile.diagnosis}\n`;
    }
    
    if (context.userProfile.diagnosisStage) {
      contextStr += `- Stage: ${context.userProfile.diagnosisStage}\n`;
    }
    
    if (context.userProfile.diagnosisDate) {
      const date = new Date(context.userProfile.diagnosisDate);
      contextStr += `- Diagnosis Date: ${date.toLocaleDateString()}\n`;
    }
  }
  
  // Add specific treatment side effects information for TREATMENT_SIDE_EFFECT queries
  if (queryType === QueryType.TREATMENT_SIDE_EFFECT && context.treatmentSideEffects && context.treatmentSideEffects.length > 0) {
    contextStr += "\nTreatment Side Effects Information:\n";
    context.treatmentSideEffects.forEach((treatmentSideEffect: any, index: number) => {
      contextStr += `- ${treatmentSideEffect.treatmentName} (${treatmentSideEffect.treatmentType}):\n`;
      if (treatmentSideEffect.active === false) {
        contextStr += "  [INACTIVE/COMPLETED]\n";
      }
      
      if (typeof treatmentSideEffect.sideEffects === 'object') {
        // Handle structured side effects data
        if (Array.isArray(treatmentSideEffect.sideEffects)) {
          treatmentSideEffect.sideEffects.forEach((effect: any) => {
            if (typeof effect === 'string') {
              contextStr += `  • ${effect}\n`;
            } else if (typeof effect === 'object') {
              contextStr += `  • ${effect.name || 'Unnamed effect'}\n`;
              if (effect.severity) {
                contextStr += `    Severity: ${effect.severity}\n`;
              }
              if (effect.onset) {
                contextStr += `    Onset: ${effect.onset}\n`;
              }
              if (effect.duration) {
                contextStr += `    Duration: ${effect.duration}\n`;
              }
              if (effect.management) {
                contextStr += `    Management: ${effect.management}\n`;
              }
            }
          });
        } else {
          // Handle object with properties as side effects
          Object.keys(treatmentSideEffect.sideEffects).forEach(key => {
            const value = treatmentSideEffect.sideEffects[key];
            if (typeof value === 'string') {
              contextStr += `  • ${key}: ${value}\n`;
            } else if (typeof value === 'boolean' && value) {
              contextStr += `  • ${key}\n`;
            }
          });
        }
      } else if (typeof treatmentSideEffect.sideEffects === 'string') {
        // Handle string side effects data
        contextStr += `  • ${treatmentSideEffect.sideEffects}\n`;
      }
    });
  }
  
  // Add specific treatment timeline information for TREATMENT_TIMELINE queries
  if (queryType === QueryType.TREATMENT_TIMELINE && context.treatmentTimelines && context.treatmentTimelines.length > 0) {
    contextStr += "\nTreatment Timeline Information:\n";
    context.treatmentTimelines.forEach((timeline: any, index: number) => {
      contextStr += `- ${timeline.treatmentName} (${timeline.treatmentType}):\n`;
      
      if (timeline.active === false) {
        contextStr += "  [INACTIVE/COMPLETED]\n";
      }
      
      if (timeline.startDate) {
        const startDate = new Date(timeline.startDate);
        contextStr += `  Start Date: ${startDate.toLocaleDateString()}\n`;
      }
      
      if (timeline.endDate) {
        const endDate = new Date(timeline.endDate);
        contextStr += `  End Date: ${endDate.toLocaleDateString()}\n`;
      } else if (timeline.active !== false) {
        contextStr += `  End Date: Ongoing\n`;
      }
      
      if (timeline.notes) {
        contextStr += `  Notes: ${timeline.notes}\n`;
      }
    });
  }
  
  // Add specific research data for treatment comparisons
  if (queryType === QueryType.TREATMENT_COMPARISON && context.savedResearch && context.savedResearch.length > 0) {
    contextStr += "\nRelevant Treatment Comparison Research:\n";
    // Only include the first 3 research items to avoid context overflow
    const limitedResearch = context.savedResearch.slice(0, 3);
    limitedResearch.forEach((research: any, index: number) => {
      contextStr += `- ${research.title}\n`;
      if (research.sourceName) {
        contextStr += `  Source: ${research.sourceName}\n`;
      }
      if (research.evidenceLevel) {
        contextStr += `  Evidence Level: ${research.evidenceLevel}\n`;
      }
    });
  }
  
  // For treatment explanation queries, add journal logs mentioning treatments
  if (queryType === QueryType.TREATMENT_EXPLANATION && context.journalLogs && context.journalLogs.length > 0) {
    contextStr += "\nRelevant Journal Entries About Treatments:\n";
    // Only include up to 3 journal entries to avoid context overflow
    const limitedLogs = context.journalLogs.slice(0, 3);
    limitedLogs.forEach((log: any) => {
      const date = new Date(log.entryDate);
      contextStr += `- Journal Entry (${date.toLocaleDateString()}):\n`;
      // Truncate content if too long
      const content = log.content.length > 200 ? log.content.substring(0, 200) + '...' : log.content;
      contextStr += `  ${content}\n`;
    });
  }
  
  // Add plan items if available and relevant
  if (context.planItems && context.planItems.length > 0) {
    contextStr += "\nCurrent Health Plan:\n";
    // Group items by type for better organization
    const groupedItems: Record<string, any[]> = {};
    
    context.planItems.forEach((item: any) => {
      if (!groupedItems[item.type]) {
        groupedItems[item.type] = [];
      }
      groupedItems[item.type].push(item);
    });
    
    // Display items by type groups
    Object.keys(groupedItems).forEach(type => {
      contextStr += `\n${type.charAt(0).toUpperCase() + type.slice(1)}s:\n`;
      
      groupedItems[type].forEach((item: any) => {
        contextStr += `- ${item.title}\n`;
        
        if (item.dueDate) {
          const date = new Date(item.dueDate);
          contextStr += `  Due: ${date.toLocaleDateString()}\n`;
        }
        
        if (item.notes) {
          contextStr += `  Notes: ${item.notes}\n`;
        }
        
        if (item.frequency) {
          contextStr += `  Frequency: ${item.frequency}\n`;
        }
        
        if (item.dosage) {
          contextStr += `  Dosage: ${item.dosage}\n`;
        }
      });
    });
  }
  
  // Add treatment information if available and relevant (legacy support)
  if (context.treatments && context.treatments.length > 0 && 
      (queryType === QueryType.TREATMENT || queryType === QueryType.CLINICAL_TRIAL || 
       queryType === QueryType.ALTERNATIVE_TREATMENT || queryType === QueryType.INTERACTION)) {
    // Only add this section if we don't already have plan items of type 'treatment'
    if (!context.planItems || !context.planItems.some((item: any) => item.type === 'treatment' || item.type === 'medication')) {
      contextStr += "\nCurrent Treatments (Legacy):\n";
      context.treatments.forEach((treatment, index) => {
        contextStr += `- ${treatment.name} (${treatment.type})\n`;
        if (treatment.startDate) {
          const date = new Date(treatment.startDate);
          contextStr += `  Started: ${date.toLocaleDateString()}\n`;
        }
        if (treatment.notes) {
          contextStr += `  Notes: ${treatment.notes}\n`;
        }
      });
    }
  }
  
  // Add journal logs if available and relevant
  if (context.journalLogs && context.journalLogs.length > 0) {
    contextStr += "\nRecent Journal Entries:\n";
    
    // Limit to most recent 3 entries to avoid too much context
    const recentLogs = context.journalLogs.slice(0, 3);
    
    recentLogs.forEach(log => {
      const date = new Date(log.entryDate);
      contextStr += `- Entry from ${date.toLocaleDateString()}\n`;
      
      if (log.mood) {
        contextStr += `  Mood: ${log.mood}\n`;
      }
      
      if (log.painLevel !== null && log.painLevel !== undefined) {
        contextStr += `  Pain Level: ${log.painLevel}/10\n`;
      }
      
      if (log.energyLevel !== null && log.energyLevel !== undefined) {
        contextStr += `  Energy Level: ${log.energyLevel}/10\n`;
      }
      
      if (log.sleepQuality !== null && log.sleepQuality !== undefined) {
        contextStr += `  Sleep Quality: ${log.sleepQuality}/10\n`;
      }
      
      if (log.symptoms && log.symptoms.length > 0) {
        contextStr += `  Symptoms: ${log.symptoms.join(', ')}\n`;
      }
      
      // Include a snippet of the content if available
      if (log.content) {
        const contentSnippet = log.content.length > 100 ? 
          log.content.substring(0, 100) + '...' : log.content;
        contextStr += `  Notes: ${contentSnippet}\n`;
      }
    });
  }
  
  // Add diet logs if available and relevant for treatment and interaction queries
  if (context.dietLogs && context.dietLogs.length > 0 && 
      (queryType === QueryType.INTERACTION || queryType === QueryType.TREATMENT)) {
    contextStr += "\nRecent Diet Information:\n";
    
    // Limit to most recent 3 entries
    const recentDietLogs = context.dietLogs.slice(0, 3);
    
    recentDietLogs.forEach(log => {
      const date = new Date(log.mealDate);
      contextStr += `- Meal on ${date.toLocaleDateString()}\n`;
      
      if (log.mealType) {
        contextStr += `  Type: ${log.mealType}\n`;
      }
      
      if (log.foods && log.foods.length > 0) {
        contextStr += `  Foods: ${log.foods.join(', ')}\n`;
      }
      
      if (log.notes) {
        const notesSnippet = log.notes.length > 100 ? 
          log.notes.substring(0, 100) + '...' : log.notes;
        contextStr += `  Notes: ${notesSnippet}\n`;
      }
    });
  }
  
  // Add research information if available and relevant
  if (context.savedResearch && context.savedResearch.length > 0 && queryType === QueryType.RESEARCH) {
    contextStr += "\nSaved Research:\n";
    context.savedResearch.forEach((item, index) => {
      contextStr += `- ${item.title}\n`;
      if (item.evidenceLevel) {
        contextStr += `  Evidence Level: ${item.evidenceLevel}\n`;
      }
    });
  }
  
  // Add document information if available and relevant for document questions
  if (context.documents && context.documents.length > 0 && queryType === QueryType.DOCUMENT_QUESTION) {
    contextStr += "\nAvailable Documents:\n";
    context.documents.forEach((document, index) => {
      contextStr += `- ${document.title} (${document.type})\n`;
      if (document.dateAdded) {
        const date = new Date(document.dateAdded);
        contextStr += `  Added: ${date.toLocaleDateString()}\n`;
      }
    });
  }
  
  // Add alternative treatment information if available and relevant
  if (context.alternativeTreatments && context.alternativeTreatments.length > 0 && 
      (queryType === QueryType.ALTERNATIVE_TREATMENT || queryType === QueryType.INTERACTION)) {
    // Only add if we don't already have plan items of type 'alternative' or 'supplement'
    if (!context.planItems || !context.planItems.some((item: any) => 
        item.type === 'alternative' || 
        item.type === 'supplement' || 
        item.type === 'herb' || 
        item.type === 'vitamin')) {
      contextStr += "\nAlternative Treatments (Legacy):\n";
      context.alternativeTreatments.forEach((treatment, index) => {
        contextStr += `- ${treatment.name} (${treatment.category})\n`;
        
        if (treatment.background) {
          contextStr += `  Background: ${treatment.background}\n`;
        }
        
        if (treatment.evidenceRating) {
          contextStr += `  Evidence Rating: ${treatment.evidenceRating}\n`;
        }
        
        if (treatment.safetyRating) {
          contextStr += `  Safety Rating: ${treatment.safetyRating}\n`;
        }
        
        // Add a brief excerpt from the description if available
        if (treatment.description) {
          const descriptionSnippet = treatment.description.length > 100 ? 
            treatment.description.substring(0, 100) + '...' : treatment.description;
          contextStr += `  Description: ${descriptionSnippet}\n`;
        }
      });
    }
  }
  
  return contextStr;
}

/**
 * Process a user message and return an AI response
 */
async function processUserMessage(message: string, userId: string, providedContext?: any, preferredModel?: ModelType): Promise<AIResponse> {
  // Analyze the query type
  const queryType = await analyzeQueryType(message);
  
  // Special handling for document questions using Vertex AI Search
  if (queryType === QueryType.DOCUMENT_QUESTION) {
    try {
      console.log('Handling document question with Vertex AI Search');
      const searchResult = await vertexSearchService.searchGroundedAnswer(userId, message);
      
      return {
        content: searchResult.summary,
        modelUsed: ModelType.GPT, // We're not actually using GPT, but need to specify a model type
        sources: searchResult.sources,
        timestamp: new Date(),
        metadata: searchResult.metadata
      };
    } catch (error: any) {
      console.error('Error using Vertex AI Search:', error);
      console.log('Falling back to standard AI processing for document question');
      // Fall through to standard processing if Vertex Search fails
    }
  }
  
  // Fetch user context if not provided
  let context = providedContext;
  if (!context) {
    try {
      const userContext = await getUserContext(userId, queryType);
      context = {
        userInfo: formatContextForLLM(userContext, queryType)
      };
      console.log('Generated context:', context);
    } catch (error: any) {
      console.warn('Error fetching user context:', error);
      // Continue without context rather than failing the request
      context = {};
    }
  }
  
  // Create the AI query
  const query: AIQuery = {
    content: message,
    type: queryType,
    userPreferredModel: preferredModel,
    context,
    userId
  };
  
  // Route to appropriate model
  return routeQuery(query);
}

// Create a standardized interface for the aiRouter to be used in routes.ts
export const aiRouter = {
  processQuery: async (content: string, preferredModel?: ModelType, userId: string = "1", context?: any, options?: { queryType?: QueryType }): Promise<AIResponse> => {
    // If a specific queryType is provided in options, override the auto-detection
    if (options?.queryType) {
      // Create the AI query with the specified type
      const query: AIQuery = {
        content,
        type: options.queryType,
        userPreferredModel: preferredModel,
        context: context || {},
        userId
      };
      
      // Route directly to the appropriate model
      return routeQuery(query);
    } else {
      // Use the standard process with query type detection
      return processUserMessage(content, userId, context, preferredModel);
    }
  },
  
  /**
   * Process a text query that doesn't require as much context as a user message
   * Used primarily for document analysis and other specialized queries
   */
  processTextQuery: async (content: string, preferredModel?: ModelType, userId: string = "1"): Promise<{
    content: string;
    modelUsed: string;
    structuredOutput?: any;
  }> => {
    try {
      // Create a simplified query - using GENERAL type since this is a direct prompt
      const query: AIQuery = {
        content,
        type: QueryType.GENERAL,
        userPreferredModel: preferredModel,
        userId
      };
      
      // Route to appropriate model
      const response = await routeQuery(query);
      
      // Check if the response contains structured JSON
      let structuredOutput = undefined;
      try {
        // Try to parse the content as JSON if it looks like JSON
        if (response.content.trim().startsWith('{') && response.content.trim().endsWith('}')) {
          structuredOutput = JSON.parse(response.content);
        }
      } catch (parseError) {
        // If parsing fails, just proceed with the text response
        console.warn('Failed to parse structured JSON output:', parseError);
      }
      
      return {
        content: response.content,
        modelUsed: response.modelUsed,
        structuredOutput
      };
    } catch (error: any) {
      console.error('Error processing text query:', error);
      throw error;
    }
  },
  
  determineModelForQuery,
  analyzeQueryType,
  // Add the context fetching functionality for use in other parts of the application
  fetchUserContext: async (userId: string, queryType: QueryType): Promise<UserContext> => {
    // Using a different name to avoid recursive call
    const context = await getUserContext(userId, queryType);
    return context;
  },
  formatContextForLLM
};
