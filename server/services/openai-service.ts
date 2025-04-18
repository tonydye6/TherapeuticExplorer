import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface OpenAIOptions {
  temperature?: number;
  maxTokens?: number;
}

/**
 * Process a text query using OpenAI's models
 */
export async function processTextQuery(
  query: string, 
  systemPrompt: string,
  options: OpenAIOptions = {}
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: options.temperature || 0.3,
      max_tokens: options.maxTokens || 1024,
    });

    return response.choices[0].message.content || "No response generated";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`OpenAI service failed: ${error.message}`);
  }
}

/**
 * Process a structured query requiring JSON output
 */
export async function processStructuredQuery<T>(
  query: string,
  systemPrompt: string,
  options: OpenAIOptions = {}
): Promise<T> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: options.temperature || 0.2,
      max_tokens: options.maxTokens || 2048,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content) as T;
  } catch (error: any) {
    console.error("OpenAI structured query error:", error);
    throw new Error(`OpenAI structured query failed: ${error.message}`);
  }
}

/**
 * Process clinical trial data
 */
export async function processClinicalTrialQuery(query: string): Promise<any> {
  const systemPrompt = `You are THRIVE, an expert AI research assistant specializing in esophageal cancer clinical trials.
    
Your task is to analyze the user's query about clinical trials and provide structured, accurate information.
When responding to questions about clinical trials, follow these guidelines:

1. Focus on esophageal cancer clinical trials specifically
2. Provide factual, evidence-based information about trial eligibility, phases, and treatments
3. Return a structured JSON response that includes:
   - A clear explanation of relevant trials
   - Key details about locations, eligibility, and treatment approaches
   - Any limitations or considerations the patient should be aware of

Format your response as JSON with the following structure:
{
  "explanation": "Clear explanation of the clinical trial information",
  "trials": [
    {
      "name": "Trial name",
      "phase": "Trial phase",
      "eligibility": ["Key eligibility criteria"],
      "locations": ["Trial locations"],
      "treatments": ["Treatments involved"]
    }
  ],
  "considerations": ["Important considerations for the patient"]
}`;

  try {
    return await processStructuredQuery(query, systemPrompt);
  } catch (error: any) {
    console.error("Clinical trial query error:", error);
    throw error;
  }
}

/**
 * Process treatment option queries
 */
export async function processTreatmentQuery(query: string): Promise<any> {
  const systemPrompt = `You are THRIVE, an expert AI research assistant specializing in esophageal cancer treatments.
    
Your task is to analyze the user's query about treatment options and provide structured, accurate information.
When responding to questions about treatments, follow these guidelines:

1. Focus on evidence-based treatments for esophageal cancer
2. Clearly indicate the level of evidence for each treatment (high, medium, low)
3. Cover benefits and potential side effects
4. Include information about standard of care and emerging approaches when relevant
5. Return a structured JSON response

Format your response as JSON with the following structure:
{
  "explanation": "Clear explanation addressing the user's treatment question",
  "treatments": [
    {
      "name": "Treatment name",
      "evidenceLevel": "high/medium/low",
      "description": "Brief description of the treatment",
      "benefits": ["Key benefits"],
      "sideEffects": [{"text": "Side effect", "severity": "mild/moderate/severe"}],
      "considerations": ["Important considerations"]
    }
  ],
  "sources": ["Reference sources for the information provided"]
}`;

  try {
    return await processStructuredQuery(query, systemPrompt);
  } catch (error: any) {
    console.error("Treatment query error:", error);
    throw error;
  }
}

/**
 * Process medical terminology queries
 */
export async function processMedicalTermQuery(query: string): Promise<any> {
  const systemPrompt = `You are THRIVE, an expert AI research assistant specializing in esophageal cancer and medical terminology.
    
Your task is to explain medical terms clearly to patients. When responding to questions about medical terminology, follow these guidelines:

1. Provide clear, accessible explanations of medical terms
2. Avoid unnecessary jargon and explain concepts in patient-friendly language
3. Include context about how the term relates to esophageal cancer when relevant
4. Return a structured JSON response

Format your response as JSON with the following structure:
{
  "term": "The medical term being explained",
  "definition": "Clear, patient-friendly definition",
  "relevance": "How this term relates to esophageal cancer",
  "relatedTerms": ["Related medical terms"],
  "sources": ["Reference sources for the information provided"]
}`;

  try {
    return await processStructuredQuery(query, systemPrompt);
  } catch (error: any) {
    console.error("Medical term query error:", error);
    throw error;
  }
}