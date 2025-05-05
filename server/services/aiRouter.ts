import { ModelType, QueryType } from '@shared/schema';
import * as openaiService from './openai-service';
import * as claudeService from './anthropic-service';
import * as geminiService from './gemini-service';
import { vertexSearchService } from './vertex-search-service';
import { storage } from '../storage';

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
    [QueryType.INTERACTION]: ModelType.CLAUDE // Use Claude for interaction analysis due to its medical reasoning
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
  } catch (error) {
    console.error(`Error with ${modelToUse}:`, error);
    
    // Try fallback model if available
    const fallbackModel = modelConfig.fallback[modelToUse];
    if (fallbackModel) {
      console.log(`Falling back to ${fallbackModel}`);
      try {
        const fallbackResponse = await callModel(fallbackModel, query);
        return fallbackResponse;
      } catch (fallbackError) {
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
      const openaiResponse = await openaiService.generateResponse(query.content, query.context, query.userId);
      return {
        content: openaiResponse.text,
        modelUsed: ModelType.GPT,
        sources: openaiResponse.sources || [],
        timestamp: new Date(),
        metadata: openaiResponse.metadata
      };
      
    case ModelType.CLAUDE:
      const claudeResponse = await claudeService.generateResponse(query.content, query.context, query.userId);
      return {
        content: claudeResponse.text,
        modelUsed: ModelType.CLAUDE,
        sources: claudeResponse.sources || [],
        timestamp: new Date(),
        metadata: claudeResponse.metadata
      };
      
    case ModelType.GEMINI:
      const geminiResponse = await geminiService.generateResponse(query.content, query.context, query.userId);
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
  
  // Check for interaction queries
  if (lowerQuery.includes('interaction') ||
      lowerQuery.includes('side effect') ||
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
  
  // Check for interaction queries
  if (lowerQuery.includes('interaction') ||
      lowerQuery.includes('side effect') ||
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
  const userProfile = await storage.getUser(userId);
  
  if (!userProfile) {
    throw new Error(`User with ID ${userId} not found`);
  }
  
  const context: UserContext = {
    userProfile
  };
  
  // Fetch additional context based on query type
  switch (queryType) {
    case QueryType.TREATMENT:
      // For treatment queries, fetch user's treatments and conditions
      context.treatments = await storage.getTreatments(userId);
      break;
      
    case QueryType.RESEARCH:
      // For research queries, fetch saved research items
      context.savedResearch = await storage.getResearchItems(userId);
      break;
      
    case QueryType.CLINICAL_TRIAL:
      // For clinical trial queries, fetch saved trials and treatments
      context.treatments = await storage.getTreatments(userId);
      break;
      
    case QueryType.DOCUMENT_QUESTION:
      // For document questions, fetch the user's documents
      try {
        const documents = await storage.getDocuments(userId);
        context.documents = documents;
      } catch (error) {
        console.warn('Error fetching documents for document question:', error);
      }
      break;
      
    case QueryType.ALTERNATIVE_TREATMENT:
      // For alternative treatment queries, fetch relevant alternative treatments
      try {
        const alternativeTreatments = await storage.getAlternativeTreatments(userId);
        context.alternativeTreatments = alternativeTreatments;
        // Also get standard treatments for comparison/integration context
        context.treatments = await storage.getTreatments(userId);
      } catch (error) {
        console.warn('Error fetching alternative treatments:', error);
      }
      break;
      
    case QueryType.INTERACTION:
      // For interaction queries, fetch both treatments and alternative treatments
      try {
        // Fetch both conventional and alternative treatments for interaction analysis
        context.treatments = await storage.getTreatments(userId);
        context.alternativeTreatments = await storage.getAlternativeTreatments(userId);
      } catch (error) {
        console.warn('Error fetching treatments for interaction analysis:', error);
      }
      break;
      
    // Add more cases for other query types as needed
  }
  
  return context;
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
  
  // Add treatment information if available and relevant
  if (context.treatments && context.treatments.length > 0 && 
      (queryType === QueryType.TREATMENT || queryType === QueryType.CLINICAL_TRIAL || 
       queryType === QueryType.ALTERNATIVE_TREATMENT || queryType === QueryType.INTERACTION)) {
    contextStr += "\nCurrent Treatments:\n";
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
    contextStr += "\nAlternative Treatments:\n";
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
    } catch (error) {
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
    } catch (error) {
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
