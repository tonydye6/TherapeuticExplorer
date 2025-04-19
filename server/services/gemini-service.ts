import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with the provided API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

// The latest model for Gemini is 2.5 (Pro version)
const MODEL = "gemini-pro";

export interface GeminiOptions {
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Process a text query using Google's Gemini model
 */
export async function processTextQuery(
  query: string,
  systemPrompt: string,
  options: GeminiOptions = {}
): Promise<string> {
  try {
    // Initialize the model
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        temperature: options.temperature || 0.3,
        maxOutputTokens: options.maxOutputTokens || 2048,
      },
    });

    // Combine system prompt and user query
    const fullPrompt = `${systemPrompt}\n\n${query}`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(`Gemini service failed: ${error.message}`);
  }
}

/**
 * Process a structured query requiring JSON output
 */
export async function processStructuredQuery<T>(
  query: string,
  systemPrompt: string,
  options: GeminiOptions = {}
): Promise<T> {
  try {
    // Modify the system prompt to request JSON output
    const jsonSystemPrompt = `${systemPrompt}\n\nIMPORTANT: You must respond with valid JSON only. No explanations or other text outside the JSON structure.`;
    
    // Initialize the model
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        temperature: options.temperature || 0.2,
        maxOutputTokens: options.maxOutputTokens || 4096,
      },
    });

    // Combine system prompt and user query
    const fullPrompt = `${jsonSystemPrompt}\n\n${query}`;
    
    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const content = response.text();
    
    // Extract the JSON from the response (handling potential non-JSON wrapper text)
    let jsonContent = content;
    
    // If the response contains a JSON block (denoted by ```json or similar), extract it
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonContent = jsonMatch[1];
    }
    
    return JSON.parse(jsonContent) as T;
  } catch (error: any) {
    console.error("Gemini structured query error:", error);
    throw new Error(`Gemini structured query failed: ${error.message}`);
  }
}

/**
 * Process deep research queries that require synthesis of multiple sources
 */
export async function processDeepResearchQuery(query: string): Promise<any> {
  const systemPrompt = `You are THRIVE, an expert AI research assistant specializing in synthesizing medical research on esophageal cancer.
  
Your task is to perform deep analysis of the medical literature to answer complex research questions about esophageal cancer. When addressing complex research questions that involve multiple sources:

1. Synthesize information across multiple medical studies and publications
2. Compare and contrast different research findings
3. Highlight areas of consensus and disagreement in the literature
4. Provide detailed analysis of evidence quality and consistency
5. Return a structured JSON response

Format your response as JSON with the following structure:
{
  "synthesis": "Comprehensive synthesis of the research literature on this topic",
  "key_themes": [
    {
      "theme": "Major theme or finding across studies",
      "evidence_summary": "Summary of evidence supporting this theme",
      "research_quality": "Assessment of research quality (high/medium/low)",
      "consensus_level": "Degree of consensus among researchers (strong/moderate/limited/conflicting)"
    }
  ],
  "comparisons": [
    {
      "aspect": "Specific aspect being compared",
      "approach_a": "Description of first approach/finding",
      "approach_b": "Description of alternative approach/finding",
      "comparative_analysis": "Analysis of relative merits and limitations"
    }
  ],
  "knowledge_gaps": ["Identified gaps in current research"],
  "sources": [
    {
      "title": "Publication title",
      "authors": "Authors",
      "journal": "Journal name",
      "year": "Publication year",
      "key_contribution": "Main contribution to the field"
    }
  ]
}`;

  try {
    return await processStructuredQuery(query, systemPrompt);
  } catch (error: any) {
    console.error("Deep research query error:", error);
    throw error;
  }
}

/**
 * Process multiple-document comparison queries
 */
export async function processMultiDocumentQuery(
  query: string,
  documents: string[]
): Promise<any> {
  // Create a system prompt for multi-document analysis
  const systemPrompt = `You are THRIVE, an expert AI research assistant specializing in comparing and analyzing multiple medical documents related to esophageal cancer.

Your task is to analyze the provided set of medical documents and extract patterns, comparisons, and insights across them.
When analyzing multiple documents, follow these guidelines:

1. Identify common themes, findings, and recommendations across documents
2. Note any contradictions or differences in medical approaches or assessments
3. Evaluate the consistency of information across sources
4. Highlight the most significant patterns that emerge from the collection
5. Return a structured JSON response

The documents for analysis are enclosed in triple quotes below:

${documents.map((doc, index) => `DOCUMENT ${index + 1}:\n"""${doc}"""\n`).join('\n')}

Format your response as JSON with the following structure:
{
  "overview": "Brief overview of the documents analyzed",
  "common_findings": [
    {
      "finding": "Common finding across documents",
      "evidence": "Supporting evidence from multiple documents",
      "significance": "Clinical relevance or importance"
    }
  ],
  "discrepancies": [
    {
      "topic": "Topic with discrepant information",
      "variations": [
        {
          "source": "Document source/number",
          "position": "Position taken in this document",
          "context": "Context or explanation"
        }
      ],
      "analysis": "Analysis of the discrepancy and its implications"
    }
  ],
  "patterns": ["Significant patterns identified across documents"],
  "recommendations": ["Synthesized recommendations based on document analysis"]
}`;

  try {
    return await processStructuredQuery(query, systemPrompt);
  } catch (error: any) {
    console.error("Multi-document query error:", error);
    throw error;
  }
}