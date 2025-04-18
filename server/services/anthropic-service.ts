import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const MODEL = "claude-3-7-sonnet-20250219";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AnthropicOptions {
  temperature?: number;
  maxTokens?: number;
}

/**
 * Process a text query using Anthropic's Claude models
 */
export async function processTextQuery(
  query: string, 
  systemPrompt: string,
  options: AnthropicOptions = {}
): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.3,
      system: systemPrompt,
      messages: [
        { role: "user", content: query }
      ]
    });

    // Access the content safely
    if (message.content && message.content.length > 0) {
      const firstContent = message.content[0];
      if ('text' in firstContent) {
        return firstContent.text;
      }
    }
    
    return "No response generated";
  } catch (error: any) {
    console.error("Anthropic API error:", error);
    throw new Error(`Anthropic service failed: ${error.message}`);
  }
}

/**
 * Process a structured query requiring JSON output
 */
export async function processStructuredQuery<T>(
  query: string,
  systemPrompt: string,
  options: AnthropicOptions = {}
): Promise<T> {
  const jsonSystemPrompt = `${systemPrompt}
  
IMPORTANT: You must respond with valid JSON only. No explanations or other text outside the JSON structure.`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.2,
      system: jsonSystemPrompt,
      messages: [
        { role: "user", content: query }
      ]
    });

    // Access the content safely
    let jsonString = "{}";
    if (message.content && message.content.length > 0) {
      const firstContent = message.content[0];
      if ('text' in firstContent) {
        jsonString = firstContent.text;
      }
    }
    
    return JSON.parse(jsonString) as T;
  } catch (error: any) {
    console.error("Anthropic structured query error:", error);
    throw new Error(`Anthropic structured query failed: ${error.message}`);
  }
}

/**
 * Process research literature queries
 */
export async function processResearchQuery(query: string): Promise<any> {
  const systemPrompt = `You are THRIVE, an expert AI research assistant specializing in esophageal cancer medical literature.
  
Your task is to analyze the user's query about medical research and provide accurate, evidence-based information from the literature.
When responding to questions about research, follow these guidelines:

1. Focus on esophageal cancer research from reputable medical journals and institutions
2. Provide accurate summaries of relevant research findings
3. Include information about the strength of evidence and consensus in the field
4. Clearly identify areas where research is ongoing or consensus is lacking
5. Return a structured JSON response

Format your response as JSON with the following structure:
{
  "summary": "Clear summary addressing the user's research question",
  "keyFindings": [
    {
      "finding": "Description of key research finding",
      "evidenceStrength": "strong/moderate/limited",
      "consensus": "high/moderate/low/emerging"
    }
  ],
  "clinicalImplications": ["Relevant clinical implications"],
  "ongoingResearch": ["Areas of active research"],
  "sources": [
    {
      "title": "Source title",
      "authors": "Authors",
      "publication": "Journal/Publication",
      "year": "Publication year"
    }
  ]
}`;

  try {
    return await processStructuredQuery(query, systemPrompt);
  } catch (error: any) {
    console.error("Research query error:", error);
    throw error;
  }
}

/**
 * Process document analysis queries
 */
export async function processDocumentAnalysisQuery(document: string): Promise<any> {
  const systemPrompt = `You are THRIVE, an expert AI research assistant specializing in analyzing medical documents related to esophageal cancer.
  
Your task is to analyze the provided medical document and extract key information in a structured format.
When analyzing medical documents, follow these guidelines:

1. Identify the document type (lab report, imaging, clinical notes, pathology, etc.)
2. Extract key information including diagnoses, test results, recommendations, and treatments
3. Highlight any critical or abnormal findings
4. Organize information in a clear, structured format
5. Return a structured JSON response

Format your response as JSON with the following structure:
{
  "documentType": "Type of medical document",
  "summary": "Brief summary of the document's key points",
  "keyFindings": [
    {
      "category": "Category (e.g., diagnosis, lab value, treatment)",
      "finding": "Description of finding",
      "significance": "Interpretation or significance"
    }
  ],
  "diagnoses": ["Any diagnoses mentioned"],
  "recommendations": ["Any recommendations or next steps"],
  "abnormalResults": ["Any abnormal test results or findings"],
  "medications": ["Any medications mentioned"]
}`;

  try {
    return await processStructuredQuery(document, systemPrompt);
  } catch (error: any) {
    console.error("Document analysis error:", error);
    throw error;
  }
}