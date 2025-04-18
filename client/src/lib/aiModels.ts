import { ModelType, QueryType } from '@shared/schema';

interface AIModelOptions {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

// This is a client-side helper library for AI model routing
// The actual AI calls are made on the server side

// Function to determine which model to use for a given query
export function determineModelForQuery(query: string): {
  modelType: ModelType;
  queryType: QueryType;
} {
  // Default to Claude for most medical research
  let modelType = ModelType.CLAUDE;
  let queryType = QueryType.GENERAL;
  
  const lowerQuery = query.toLowerCase();
  
  // Check for treatment-related queries
  if (
    lowerQuery.includes('treatment') ||
    lowerQuery.includes('therapy') ||
    lowerQuery.includes('medication') ||
    lowerQuery.includes('drug') ||
    lowerQuery.includes('side effect') ||
    lowerQuery.includes('efficacy')
  ) {
    queryType = QueryType.TREATMENT;
    // Claude is good at treatment analysis
    modelType = ModelType.CLAUDE;
  }
  
  // Check for clinical trial related queries
  else if (
    lowerQuery.includes('clinical trial') ||
    lowerQuery.includes('study') ||
    lowerQuery.includes('enrollment') ||
    lowerQuery.includes('eligibility')
  ) {
    queryType = QueryType.CLINICAL_TRIAL;
    // GPT-4 works well for structured data extraction like clinical trials
    modelType = ModelType.GPT;
  }
  
  // Check for medical terminology queries
  else if (
    lowerQuery.includes('what does') ||
    lowerQuery.includes('what is') ||
    lowerQuery.includes('definition') ||
    lowerQuery.includes('mean') ||
    lowerQuery.includes('explain')
  ) {
    queryType = QueryType.MEDICAL_TERM;
    // BioBERT is good for medical terminology, but fall back to Claude
    modelType = ModelType.CLAUDE;
  }
  
  // Check for research-heavy queries
  else if (
    lowerQuery.includes('research') ||
    lowerQuery.includes('studies show') ||
    lowerQuery.includes('evidence') ||
    lowerQuery.includes('literature') ||
    lowerQuery.includes('publication')
  ) {
    queryType = QueryType.RESEARCH;
    // Gemini is good for deep research if it involves multiple sources
    if (
      lowerQuery.includes('compare') ||
      lowerQuery.includes('synthesis') ||
      lowerQuery.includes('multiple')
    ) {
      modelType = ModelType.GEMINI;
    } else {
      modelType = ModelType.CLAUDE;
    }
  }
  
  return {
    modelType,
    queryType
  };
}

// For future integrations with client-side model preview
export function getModelInfo(modelType: ModelType) {
  switch (modelType) {
    case ModelType.CLAUDE:
      return {
        name: 'Claude',
        provider: 'Anthropic',
        description: 'Specialized in nuanced understanding of medical literature and detailed explanations.',
        icon: '🧠'
      };
    case ModelType.GPT:
      return {
        name: 'GPT-4',
        provider: 'OpenAI',
        description: 'Excellent at structured data extraction and clinical trial matching.',
        icon: '🤖'
      };
    case ModelType.GEMINI:
      return {
        name: 'Gemini',
        provider: 'Google',
        description: 'Strong at processing long documents and research synthesis.',
        icon: '🔍'
      };
    case ModelType.BIOBERT:
      return {
        name: 'BioBERT',
        provider: 'Open Source',
        description: 'Specialized in biomedical entity recognition and terminology.',
        icon: '🧬'
      };
    default:
      return {
        name: 'Unknown Model',
        provider: 'Unknown',
        description: 'Information not available.',
        icon: '❓'
      };
  }
}
