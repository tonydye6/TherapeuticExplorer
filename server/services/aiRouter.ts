import { ModelType, QueryType } from '@shared/schema';
import * as openaiService from './openai-service';
import * as claudeService from './anthropic-service';
import * as geminiService from './gemini-service';

// Configuration for model routing
const modelConfig = {
  // Primary models for each query type
  primary: {
    [QueryType.MEDICAL_TERM]: ModelType.GPT,  
    [QueryType.RESEARCH]: ModelType.CLAUDE,
    [QueryType.TREATMENT]: ModelType.GPT,
    [QueryType.CLINICAL_TRIAL]: ModelType.GPT,
    [QueryType.GENERAL]: ModelType.GEMINI
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
      const openaiResponse = await openaiService.generateResponse(query.content, query.context);
      return {
        content: openaiResponse.text,
        modelUsed: ModelType.GPT,
        sources: openaiResponse.sources || [],
        timestamp: new Date(),
        metadata: openaiResponse.metadata
      };
      
    case ModelType.CLAUDE:
      const claudeResponse = await claudeService.generateResponse(query.content, query.context);
      return {
        content: claudeResponse.text,
        modelUsed: ModelType.CLAUDE,
        sources: claudeResponse.sources || [],
        timestamp: new Date(),
        metadata: claudeResponse.metadata
      };
      
    case ModelType.GEMINI:
      const geminiResponse = await geminiService.generateResponse(query.content, query.context);
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
 * Process a user message and return an AI response
 */
async function processUserMessage(message: string, userId: string, context?: any, preferredModel?: ModelType): Promise<AIResponse> {
  // Analyze the query type
  const queryType = await analyzeQueryType(message);
  
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
  processQuery: async (content: string, preferredModel?: ModelType, userId: string = "1", context?: any): Promise<AIResponse> => {
    return processUserMessage(content, userId, context, preferredModel);
  },
  determineModelForQuery,
  analyzeQueryType
};
