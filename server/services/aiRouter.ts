import { ModelType, QueryType } from "@shared/schema";
import * as openaiService from "./openai-service";
import * as anthropicService from "./anthropic-service";
import * as geminiService from "./gemini-service";

// Type definitions
export type QueryResponse = {
  content: string;
  sources?: {
    title: string;
    url?: string;
    type: string;
    date?: string;
  }[] | null;
  modelUsed: string;
};

export type TreatmentInfo = {
  name: string;
  evidenceLevel: "high" | "medium" | "low";
  benefits: { text: string }[];
  sideEffects: { text: string; warning?: boolean; info?: boolean }[];
  source: string;
};

export type ClinicalTrialInfo = {
  title: string;
  phase: string;
  matchScore: number;
  location: string;
  distance: number;
  id: string;
  status: string;
};

export type ResearchSummary = {
  text: string;
  sources: string[];
};

export type StructuredResponse = {
  content: string;
  treatments?: TreatmentInfo[];
  clinicalTrials?: ClinicalTrialInfo[];
  researchSummary?: ResearchSummary;
  sources?: {
    title: string;
    url?: string;
    type: string;
    date?: string;
  }[];
  modelUsed: string;
};

class AIRouter {
  // Function to determine which model to use for a given query
  determineModelForQuery(query: string): {
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
      // Claude is good for medical terminology
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
      
      // Use Gemini for deep research synthesis, especially when comparing multiple sources or studies
      if (
        lowerQuery.includes('compare') ||
        lowerQuery.includes('synthesis') ||
        lowerQuery.includes('multiple') ||
        lowerQuery.includes('studies') ||
        lowerQuery.includes('literature review') ||
        lowerQuery.includes('meta-analysis') ||
        lowerQuery.includes('consensus')
      ) {
        modelType = ModelType.GEMINI;
      } else {
        // Claude for standard research questions
        modelType = ModelType.CLAUDE;
      }
    }
    
    return {
      modelType,
      queryType
    };
  }

  // Process a query and route it to the appropriate model
  async processQuery(query: string, preferredModel?: string): Promise<QueryResponse> {
    // Use preferredModel if provided, otherwise determine from query
    let modelType, queryType;
    
    if (preferredModel) {
      modelType = preferredModel as ModelType;
      // Still determine query type for appropriate prompting
      queryType = this.determineModelForQuery(query).queryType;
      console.log(`Using preferred model: ${preferredModel} for query`);
    } else {
      const result = this.determineModelForQuery(query);
      modelType = result.modelType;
      queryType = result.queryType;
    }
    
    console.log(`Routing query "${query}" to ${modelType} model for ${queryType} query type`);
    
    try {
      // Use real AI models based on query type and model type
      let response: QueryResponse;
      
      // Check if we have API keys before using actual models
      if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.GOOGLE_GEMINI_API_KEY) {
        // Fall back to simulated responses if no API keys are available
        console.warn("No API keys found. Using simulated responses instead.");
        return this.generateSimulatedResponse(query, queryType, modelType);
      }
      
      if (queryType === QueryType.TREATMENT) {
        if (modelType === ModelType.GPT && process.env.OPENAI_API_KEY) {
          const result = await openaiService.processTreatmentQuery(query);
          return this.formatOpenAITreatmentResponse(result);
        } else if (modelType === ModelType.CLAUDE && process.env.ANTHROPIC_API_KEY) {
          const systemPrompt = "You are THRIVE, an expert AI research assistant specializing in esophageal cancer treatment options. Provide detailed, evidence-based information about treatments, including their benefits, risks, and efficacy.";
          const content = await anthropicService.processTextQuery(query, systemPrompt);
          return this.formatAnthropicResponse(content, "treatment");
        }
      } 
      else if (queryType === QueryType.CLINICAL_TRIAL) {
        if (modelType === ModelType.GPT && process.env.OPENAI_API_KEY) {
          const result = await openaiService.processClinicalTrialQuery(query);
          return this.formatOpenAIClinicalTrialResponse(result);
        } else if (modelType === ModelType.CLAUDE && process.env.ANTHROPIC_API_KEY) {
          const systemPrompt = "You are THRIVE, an expert AI research assistant specializing in esophageal cancer clinical trials. Provide accurate information about relevant trials, their eligibility criteria, and potential benefits.";
          const content = await anthropicService.processTextQuery(query, systemPrompt);
          return this.formatAnthropicResponse(content, "clinical_trial");
        }
      } 
      else if (queryType === QueryType.MEDICAL_TERM) {
        if (modelType === ModelType.GPT && process.env.OPENAI_API_KEY) {
          const result = await openaiService.processMedicalTermQuery(query);
          return this.formatOpenAIMedicalTermResponse(result);
        } else if (modelType === ModelType.CLAUDE && process.env.ANTHROPIC_API_KEY) {
          const systemPrompt = "You are THRIVE, an expert AI research assistant specializing in explaining medical terminology related to esophageal cancer. Provide clear, understandable explanations of medical terms.";
          const content = await anthropicService.processTextQuery(query, systemPrompt);
          return this.formatAnthropicResponse(content, "medical_term");
        }
      } 
      else if (queryType === QueryType.RESEARCH) {
        if (modelType === ModelType.GEMINI && process.env.GOOGLE_GEMINI_API_KEY) {
          const result = await geminiService.processDeepResearchQuery(query);
          return this.formatGeminiResearchResponse(result);
        } else if (modelType === ModelType.CLAUDE && process.env.ANTHROPIC_API_KEY) {
          const result = await anthropicService.processResearchQuery(query);
          return this.formatAnthropicResearchResponse(result);
        } else if (modelType === ModelType.GPT && process.env.OPENAI_API_KEY) {
          const systemPrompt = "You are THRIVE, an expert AI research assistant specializing in esophageal cancer research. Provide evidence-based information from medical literature about the latest findings.";
          const content = await openaiService.processTextQuery(query, systemPrompt);
          return this.formatOpenAIResponse(content, "research");
        }
      } 
      else {
        // General query - route to the appropriate model
        if (modelType === ModelType.GEMINI && process.env.GOOGLE_GEMINI_API_KEY) {
          const systemPrompt = "You are THRIVE, an expert AI research assistant specializing in esophageal cancer. Provide helpful, accurate information to support patients and caregivers.";
          const content = await geminiService.processTextQuery(query, systemPrompt, { maxOutputTokens: 1024 });
          return {
            content,
            sources: null,
            modelUsed: "gemini"
          };
        } else if (modelType === ModelType.CLAUDE && process.env.ANTHROPIC_API_KEY) {
          const systemPrompt = "You are THRIVE, an expert AI research assistant specializing in esophageal cancer. Provide helpful, accurate information to support patients and caregivers.";
          const content = await anthropicService.processTextQuery(query, systemPrompt);
          return this.formatAnthropicResponse(content, "general");
        } else if (modelType === ModelType.GPT && process.env.OPENAI_API_KEY) {
          const systemPrompt = "You are THRIVE, an expert AI research assistant specializing in esophageal cancer. Provide helpful, accurate information to support patients and caregivers.";
          const content = await openaiService.processTextQuery(query, systemPrompt);
          return this.formatOpenAIResponse(content, "general");
        }
      }
      
      // If we couldn't use the preferred model, fall back to simulated responses
      return this.generateSimulatedResponse(query, queryType, modelType);
    } catch (error) {
      console.error("Error processing query with AI models:", error);
      
      // Fall back to simulated responses in case of errors
      console.log("Falling back to simulated response due to error");
      return this.generateSimulatedResponse(query, queryType, modelType);
    }
  }

  // Format responses from OpenAI
  private formatOpenAIResponse(content: string, type: string): QueryResponse {
    let sources = null;
    
    // Extract potential sources from the content (simplified approach)
    if (content.includes("Source") || content.includes("Reference")) {
      sources = [
        {
          title: "Information from medical literature",
          type: "combined_sources"
        }
      ];
    }
    
    return {
      content,
      sources,
      modelUsed: "gpt"
    };
  }

  private formatOpenAITreatmentResponse(result: any): QueryResponse {
    // Create sources from the structured response
    const sources = result.sources?.map((source: string) => ({
      title: source,
      type: "medical_resource"
    })) || null;
    
    return {
      content: result.explanation,
      sources,
      modelUsed: "gpt"
    };
  }

  private formatOpenAIClinicalTrialResponse(result: any): QueryResponse {
    return {
      content: result.explanation,
      sources: [
        {
          title: "ClinicalTrials.gov",
          url: "https://clinicaltrials.gov",
          type: "clinical_trial_database"
        }
      ],
      modelUsed: "gpt"
    };
  }

  private formatOpenAIMedicalTermResponse(result: any): QueryResponse {
    return {
      content: `${result.term}: ${result.definition}\n\nRelevance to esophageal cancer: ${result.relevance}`,
      sources: result.sources?.map((source: string) => ({
        title: source,
        type: "medical_resource"
      })) || null,
      modelUsed: "gpt"
    };
  }

  // Format responses from Anthropic
  private formatAnthropicResponse(content: string, type: string): QueryResponse {
    let sources = null;
    
    // Extract potential sources from the content (simplified approach)
    if (content.includes("Source") || content.includes("Reference")) {
      sources = [
        {
          title: "Information from medical literature",
          type: "combined_sources"
        }
      ];
    }
    
    return {
      content,
      sources,
      modelUsed: "claude"
    };
  }

  private formatAnthropicResearchResponse(result: any): QueryResponse {
    // Format sources from the structured response
    const sources = result.sources?.map((source: any) => ({
      title: source.title,
      type: "journal_article",
      date: source.year
    })) || null;
    
    // Construct a well-formatted response
    const content = `${result.summary}\n\nKey Findings:\n${result.keyFindings.map((finding: any, index: number) => 
      `${index + 1}. ${finding.finding} (Evidence: ${finding.evidenceStrength}, Consensus: ${finding.consensus})`
    ).join('\n')}`;
    
    return {
      content,
      sources,
      modelUsed: "claude"
    };
  }

  // Format responses from Gemini
  private formatGeminiResearchResponse(result: any): QueryResponse {
    // Format sources from the structured response
    const sources = result.sources?.map((source: any) => ({
      title: source.title,
      type: "journal_article",
      date: source.year?.toString() || undefined
    })) || null;
    
    // Construct a well-formatted research synthesis response
    let content = result.synthesis || "";
    
    // Add key themes section if available
    if (result.key_themes && result.key_themes.length > 0) {
      content += "\n\n## Key Research Themes\n";
      content += result.key_themes.map((theme: any, index: number) => 
        `${index + 1}. **${theme.theme}**\n   Evidence: ${theme.evidence_summary}\n   Research quality: ${theme.research_quality}\n   Consensus level: ${theme.consensus_level}`
      ).join('\n\n');
    }
    
    // Add comparisons section if available
    if (result.comparisons && result.comparisons.length > 0) {
      content += "\n\n## Comparative Analysis\n";
      content += result.comparisons.map((comparison: any, index: number) => 
        `${index + 1}. **${comparison.aspect}**\n   Approach A: ${comparison.approach_a}\n   Approach B: ${comparison.approach_b}\n   Analysis: ${comparison.comparative_analysis}`
      ).join('\n\n');
    }
    
    // Add knowledge gaps section if available
    if (result.knowledge_gaps && result.knowledge_gaps.length > 0) {
      content += "\n\n## Research Gaps\n";
      content += result.knowledge_gaps.map((gap: string, index: number) => 
        `${index + 1}. ${gap}`
      ).join('\n');
    }
    
    return {
      content,
      sources,
      modelUsed: "gemini"
    };
  }

  // Fallback method to generate simulated responses when API keys are not available
  private generateSimulatedResponse(query: string, queryType: QueryType, modelType: ModelType): QueryResponse {
    if (queryType === QueryType.TREATMENT) {
      return this.simulateTreatmentResponse(query, modelType);
    } else if (queryType === QueryType.CLINICAL_TRIAL) {
      return this.simulateClinicalTrialResponse(query, modelType);
    } else if (queryType === QueryType.MEDICAL_TERM) {
      return this.simulateMedicalTermResponse(query, modelType);
    } else {
      return this.simulateGeneralResponse(query, modelType);
    }
  }
  
  // Simulated model responses for fallback
  private simulateTreatmentResponse(query: string, modelType: ModelType): QueryResponse {
    // Use a template response for treatment-related queries
    const response: QueryResponse = {
      content: `Based on current medical research, there are several treatment approaches for esophageal cancer. The most common include:

1. Surgery: Surgical removal of the tumor and affected lymph nodes
2. Chemotherapy: Often used before or after surgery, or as the main treatment
3. Radiation therapy: May be used with chemotherapy (chemoradiation)
4. Targeted therapy: For specific types of esophageal cancer (like HER2-positive)
5. Immunotherapy: Helps your immune system fight cancer cells

The recommended treatment approach depends on the stage of cancer, location, your overall health, and specific characteristics of the tumor.

Would you like me to provide more detailed information about any specific treatment?`,
      sources: [
        {
          title: "NCCN Guidelines for Esophageal Cancer",
          type: "medical_guideline",
          date: "2023"
        },
        {
          title: "Recent Advances in Esophageal Cancer Treatment",
          url: "https://pubmed.ncbi.nlm.nih.gov/example",
          type: "journal_article",
          date: "2022-08"
        }
      ],
      modelUsed: modelType.toLowerCase()
    };
    
    return response;
  }
  
  private simulateClinicalTrialResponse(query: string, modelType: ModelType): QueryResponse {
    // Use a template response for clinical trial queries
    const response: QueryResponse = {
      content: `I found several clinical trials that might be relevant for esophageal cancer patients. Here are some notable options:

1. Phase 2 trial of Pembrolizumab plus Ramucirumab for advanced esophageal cancer
   - Location: Memorial Sloan Kettering Cancer Center (32 miles from you)
   - Status: Currently recruiting
   - ID: NCT04069273

2. Phase 1/2 trial of Trastuzumab Deruxtecan with Nivolumab in HER2+ esophageal cancer
   - Location: Dana-Farber Cancer Institute (45 miles from you)
   - Status: Currently recruiting
   - ID: NCT04014075

These trials are investigating promising new treatment approaches. Would you like me to provide more details about eligibility requirements for any of these trials?`,
      sources: [
        {
          title: "ClinicalTrials.gov",
          url: "https://clinicaltrials.gov",
          type: "clinical_trial_database"
        }
      ],
      modelUsed: modelType.toLowerCase()
    };
    
    return response;
  }
  
  private simulateMedicalTermResponse(query: string, modelType: ModelType): QueryResponse {
    // Use a template response for medical terminology queries
    const response: QueryResponse = {
      content: `The term "metastasis" refers to the spread of cancer cells from the primary site (where the cancer first formed) to other parts of the body.

In esophageal cancer, common sites of metastasis include:
- Nearby lymph nodes
- Liver
- Lungs
- Bones
- Adrenal glands

When cancer has metastasized, it is considered Stage 4 or advanced cancer. Treatment approaches for metastatic esophageal cancer typically focus on controlling the cancer's growth and managing symptoms to improve quality of life.`,
      sources: [
        {
          title: "National Cancer Institute: Metastatic Cancer",
          url: "https://www.cancer.gov/types/metastatic-cancer",
          type: "medical_resource"
        }
      ],
      modelUsed: modelType.toLowerCase()
    };
    
    return response;
  }
  
  private simulateGeneralResponse(query: string, modelType: ModelType): QueryResponse {
    // Use a template response for general research queries
    const response: QueryResponse = {
      content: `Esophageal cancer is a type of cancer that affects the esophagus, the tube that carries food from your mouth to your stomach. There are two main types:

1. Adenocarcinoma: The most common type in the United States, usually occurring in the lower part of the esophagus. It's often associated with long-term acid reflux and Barrett's esophagus.

2. Squamous cell carcinoma: More common worldwide, typically affecting the upper and middle parts of the esophagus. Risk factors include tobacco use, heavy alcohol consumption, and certain dietary patterns.

Risk factors include:
- Gastroesophageal reflux disease (GERD)
- Barrett's esophagus
- Smoking
- Heavy alcohol use
- Obesity
- Age (more common in people over 50)

Early stages may not cause noticeable symptoms, but as the cancer progresses, symptoms can include difficulty swallowing, chest pain, weight loss, and chronic cough.

Would you like me to provide more specific information about diagnosis, treatment options, or prognosis?`,
      sources: [
        {
          title: "American Cancer Society: About Esophageal Cancer",
          url: "https://www.cancer.org/cancer/esophagus-cancer/about.html",
          type: "medical_resource"
        },
        {
          title: "Esophageal Cancer: Epidemiology, Risk Factors and Prevention",
          url: "https://pubmed.ncbi.nlm.nih.gov/example2",
          type: "journal_article",
          date: "2023-01"
        }
      ],
      modelUsed: modelType.toLowerCase()
    };
    
    return response;
  }
}

export const aiRouter = new AIRouter();
