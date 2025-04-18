# THRIVE: Complete API Integration and Implementation Guide

## Overview

This comprehensive guide provides detailed specifications for integrating external APIs and services into the THRIVE system, with special emphasis on using the latest AI models available: Claude 3.7, GPT-4.1/4o, and Gemini 2.5. It includes authentication methods, request/response formats, error handling, and code examples for each integration.

## Core AI Model Integrations

### 1. Claude 3.7 (Anthropic)

Claude 3.7 is Anthropic's most advanced model, offering superior reasoning, medical knowledge understanding, and nuanced analysis capabilities.

**Authentication Method**: API Key in Authorization header
**Base URL**: `https://api.anthropic.com/v1`
**Primary Endpoint**: `/messages`

**Implementation Example**:
```javascript
async function callClaude3_7(prompt, systemPrompt = "", context = []) {
  const API_KEY = process.env.ANTHROPIC_API_KEY;
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20250218",
        max_tokens: 4096,
        messages: [
          ...context,
          { role: "user", content: prompt }
        ],
        system: systemPrompt
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Claude API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error("Error calling Claude 3.7 API:", error);
    throw error;
  }
}
```

**Optimized Use Cases**:
- Medical literature analysis and synthesis
- Treatment comparison logic
- Complex medical concept explanations
- Research paper summarization
- Nuanced evaluation of treatment options

**System Prompts for Claude 3.7**:
```javascript
const claudeSystemPrompts = {
  MEDICAL_RESEARCH: `You are a world-class oncological researcher specializing in esophageal cancer. You provide detailed, evidence-based information on the latest research findings, treatment approaches, and clinical evidence. Focus on accuracy, depth, and clinical relevance. Always cite your sources clearly.`,
  
  MEDICAL_DETAILS: `You are a leading oncologist specializing in esophageal cancer with 20+ years of clinical experience. Explain medical concepts with precision and clarity, while maintaining medical accuracy. Include relevant anatomy, physiology, and pathology when helpful. Make complex information accessible without oversimplification.`,
  
  EXPLANATION: `You are a patient educator with extensive experience helping esophageal cancer patients understand their condition. Explain complex medical concepts in clear, accessible language. Use helpful analogies when appropriate, avoid jargon when possible, and maintain accuracy while prioritizing clarity.`,
  
  COMPARISON: `You are a medical decision support specialist with expertise in esophageal cancer treatments. Compare options objectively with balanced information on benefits, risks, and evidence quality. Consider individual factors relevant to the patient's case when applicable. Help the user understand practical tradeoffs.`,
  
  DEFAULT: `You are THRIVE, a therapeutic health research intelligent virtual explorer specialized in esophageal cancer. Provide helpful, accurate information while maintaining a supportive and empathetic tone. Consider the user's needs as someone dealing with a serious cancer diagnosis. Balance technical accuracy with emotional sensitivity.`
};
```

### 2. GPT-4.1/GPT-4o (OpenAI)

GPT-4.1 (also known as GPT-4o) is OpenAI's latest model with enhanced capabilities for structured data extraction and clinical analysis.

**Authentication Method**: API Key in Authorization header
**Base URL**: `https://api.openai.com/v1`
**Primary Endpoint**: `/chat/completions`

**Implementation Example**:
```javascript
async function callGPT4_1(prompt, systemPrompt = "", context = []) {
  const API_KEY = process.env.OPENAI_API_KEY;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-2024-05-13",
        messages: [
          { role: "system", content: systemPrompt },
          ...context,
          { role: "user", content: prompt }
        ],
        max_tokens: 4096,
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GPT-4.1 API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling GPT-4.1 API:", error);
    throw error;
  }
}
```

**Optimized Use Cases**:
- Structured data extraction from medical documents
- Clinical trial matching
- Question parsing and intent recognition
- Data formatting and organization
- Medical entity recognition

**System Prompts for GPT-4.1**:
```javascript
const gptSystemPrompts = {
  CLINICAL_TRIALS: `You are a clinical trial navigator with deep expertise in oncology trials, particularly for esophageal cancer. Help identify appropriate trials with precise analysis of eligibility criteria. Explain trial phases, participation requirements, and potential benefits/risks. Focus on actionable information that helps match patients to appropriate trials.`,
  
  DOCUMENT_ANALYSIS: `You are a medical document analyst specializing in oncology records. Extract key information from patient records, lab reports, and medical documentation with high precision. Identify critical values, trends, and clinical implications. Organize information clearly and highlight what's most relevant to esophageal cancer care.`,
  
  DEFAULT: `You are THRIVE, a therapeutic health research intelligent virtual explorer specialized in esophageal cancer. Your primary strength is analyzing structured medical data and extracting precise information from complex documents. Provide clear, organized information to support decision-making.`
};
```

### 3. Gemini 2.5 (Google)

Gemini 2.5 is Google's most advanced model with exceptional deep research capabilities and multimodal understanding.

**Authentication Method**: API Key
**Base URL**: `https://generativelanguage.googleapis.com/v1`
**Primary Endpoint**: `/models/gemini-2.5-pro:generateContent`

**Implementation Example**:
```javascript
async function callGemini2_5(prompt, systemPrompt = "", context = [], multimodalContent = null) {
  const API_KEY = process.env.GEMINI_API_KEY;
  
  try {
    // Prepare messages
    const messages = [
      { role: "user", parts: [{ text: prompt }] }
    ];
    
    // Add multimodal content if provided
    if (multimodalContent) {
      messages[0].parts.push(multimodalContent);
    }
    
    // Add system prompt if provided
    if (systemPrompt) {
      messages.unshift({ role: "system", parts: [{ text: systemPrompt }] });
    }
    
    // Add context if provided
    if (context.length > 0) {
      // Insert context before the user message
      context.forEach(msg => {
        messages.unshift(msg);
      });
    }
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            maxOutputTokens: 16384, // Gemini 2.5 supports longer outputs
            temperature: 0.2
          }
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini 2.5 API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error calling Gemini 2.5 API:", error);
    throw error;
  }
}
```

**Optimized Use Cases**:
- Processing medical images and PDFs
- Long document analysis (books, research papers)
- Multi-step reasoning tasks
- Visual content generation
- Deep research across multiple sources

**System Prompts for Gemini 2.5**:
```javascript
const geminiSystemPrompts = {
  IMAGE_ANALYSIS: `You are an expert in medical imaging analysis specializing in oncological radiology. Analyze medical images related to esophageal cancer with exceptional detail and precision. Identify relevant features, potential abnormalities, and clinical implications. Explain findings clearly, focusing on what's most relevant to patient care.`,
  
  BOOK_ANALYSIS: `You are a medical literature expert specializing in cancer research publications. Analyze books and long-form content on esophageal cancer with comprehensive understanding. Extract key insights, treatment approaches, and clinically relevant information. Synthesize complex information into actionable knowledge.`,
  
  DEFAULT: `You are THRIVE, a therapeutic health research intelligent virtual explorer specialized in esophageal cancer. Your primary strength is deep research and synthesizing information across multiple complex sources. Process and analyze large volumes of information to extract the most relevant insights.`
};
```

### 4. OpenRouter Integration (Optional)

If you'd like to simplify API management or access additional models, OpenRouter provides a unified interface:

**Authentication Method**: API Key
**Base URL**: `https://openrouter.ai/api/v1/chat/completions`

**Implementation Example**:
```javascript
async function callOpenRouter(model, prompt, systemPrompt = "", context = []) {
  const API_KEY = process.env.OPENROUTER_API_KEY;
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://replit.com', // Required for OpenRouter
        'X-Title': 'THRIVE Assistant' // Name of your application
      },
      body: JSON.stringify({
        model: model, // e.g., "anthropic/claude-3-7-sonnet-20250218"
        messages: [
          { role: "system", content: systemPrompt },
          ...context,
          { role: "user", content: prompt }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    throw error;
  }
}
```

## Model Orchestration System

### Enhanced Model Router 

```javascript
class EnhancedModelRouter {
  constructor() {
    this.queryClassifiers = {
      MEDICAL_RESEARCH: /treatment|therapy|approach|study|trial|evidence|research|survival|outcome|efficacy/i,
      MEDICAL_DETAILS: /symptoms|diagnosis|prognosis|staging|markers|tests|pathology|anatomy/i,
      CLINICAL_TRIALS: /trial|recruiting|eligibility|participate|enroll|phase|inclusion|exclusion/i,
      DOCUMENT_ANALYSIS: /analyze|extract|summarize|document|report|scan|record|pdf/i,
      EXPLANATION: /explain|what is|how does|meaning|definition|clarify|understand/i,
      COMPARISON: /compare|versus|difference|better|advantage|disadvantage|tradeoff/i,
      IMAGE_ANALYSIS: /image|scan|xray|ct|mri|pet|radiology|picture/i,
      BOOK_ANALYSIS: /book|chapter|author|publication|read|literature|text/i
    };
    
    // Map query types to the most appropriate model
    this.modelMap = {
      MEDICAL_RESEARCH: 'claude3.7',
      MEDICAL_DETAILS: 'claude3.7',
      CLINICAL_TRIALS: 'gpt4.1',
      DOCUMENT_ANALYSIS: 'gpt4.1',
      EXPLANATION: 'claude3.7',
      COMPARISON: 'claude3.7',
      IMAGE_ANALYSIS: 'gemini2.5',
      BOOK_ANALYSIS: 'gemini2.5',
      DEFAULT: 'claude3.7'
    };
    
    // System prompts imported from above definitions
    this.systemPrompts = {
      'claude3.7': claudeSystemPrompts,
      'gpt4.1': gptSystemPrompts,
      'gemini2.5': geminiSystemPrompts
    };
  }
  
  classifyQuery(query) {
    for (const [type, pattern] of Object.entries(this.queryClassifiers)) {
      if (pattern.test(query)) {
        return type;
      }
    }
    return 'DEFAULT';
  }
  
  async routeQuery(query, context = {}) {
    const queryType = this.classifyQuery(query);
    const modelToUse = this.modelMap[queryType];
    
    console.log(`Routing query "${query.substring(0, 50)}..." to ${modelToUse} model as ${queryType} query type`);
    
    // Get the appropriate system prompt
    const modelCategory = modelToUse.replace(/\.\d+$/, ''); // Strip version numbers
    const systemPrompt = (this.systemPrompts[modelCategory] && this.systemPrompts[modelCategory][queryType]) || 
                          this.systemPrompts[modelCategory].DEFAULT;
    
    // Route to appropriate model
    switch (modelToUse) {
      case 'claude3.7':
        return await callClaude3_7(query, systemPrompt, context.conversationHistory || []);
      case 'gpt4.1':
        return await callGPT4_1(query, systemPrompt, context.conversationHistory || []);
      case 'gemini2.5':
        return await callGemini2_5(query, systemPrompt, context.conversationHistory || [], context.multimodalContent || null);
      default:
        return await callClaude3_7(query, this.systemPrompts['claude3.7'].DEFAULT, context.conversationHistory || []);
    }
  }
}
```

### Response Formatter

Standardizes responses from different AI models into a consistent format:

```javascript
class ResponseFormatter {
  constructor() {}
  
  formatResponse(modelResponse, queryType, sourceInfo = {}) {
    // Extract the main content from the model response
    const content = this.extractContent(modelResponse);
    
    // Format based on query type
    switch (queryType) {
      case 'MEDICAL_RESEARCH':
        return this.formatResearchResponse(content, sourceInfo);
      case 'MEDICAL_DETAILS':
        return this.formatMedicalDetailsResponse(content);
      case 'CLINICAL_TRIALS':
        return this.formatClinicalTrialsResponse(content, sourceInfo);
      case 'DOCUMENT_ANALYSIS':
        return this.formatDocumentAnalysisResponse(content, sourceInfo);
      case 'COMPARISON':
        return this.formatComparisonResponse(content);
      case 'IMAGE_ANALYSIS':
        return this.formatImageAnalysisResponse(content, sourceInfo);
      case 'BOOK_ANALYSIS':
        return this.formatBookAnalysisResponse(content, sourceInfo);
      default:
        return this.formatDefaultResponse(content);
    }
  }
  
  extractContent(modelResponse) {
    // Handle different response formats from different models
    if (typeof modelResponse === 'string') {
      return modelResponse;
    } else if (modelResponse.content) {
      // Claude format
      return modelResponse.content;
    } else if (modelResponse.choices && modelResponse.choices[0].message) {
      // GPT format
      return modelResponse.choices[0].message.content;
    } else if (modelResponse.candidates && modelResponse.candidates[0].content) {
      // Gemini format
      return modelResponse.candidates[0].content.parts[0].text;
    }
    
    // Fallback
    return JSON.stringify(modelResponse);
  }
  
  formatResearchResponse(content, sourceInfo) {
    // Add citation formatting
    const formattedContent = this.addCitations(content, sourceInfo);
    
    return {
      type: 'research',
      content: formattedContent,
      sources: sourceInfo.sources || [],
      hasCitations: sourceInfo.sources && sourceInfo.sources.length > 0
    };
  }
  
  formatMedicalDetailsResponse(content) {
    // Extract definitions for highlighting
    const medicalTerms = this.extractMedicalTerms(content);
    
    return {
      type: 'medical_details',
      content: content,
      medicalTerms: medicalTerms
    };
  }
  
  formatClinicalTrialsResponse(content, sourceInfo) {
    // If sourceInfo contains trial data, format it as cards
    if (sourceInfo.trials && sourceInfo.trials.length > 0) {
      return {
        type: 'clinical_trials',
        content: content,
        trials: sourceInfo.trials,
        displayMode: 'cards'
      };
    }
    
    return {
      type: 'clinical_trials',
      content: content
    };
  }
  
  formatDocumentAnalysisResponse(content, sourceInfo) {
    return {
      type: 'document_analysis',
      content: content,
      documentInfo: sourceInfo.document || {},
      extractedEntities: sourceInfo.entities || []
    };
  }
  
  formatComparisonResponse(content) {
    // Extract comparison elements for table formatting
    const comparisonElements = this.extractComparisonElements(content);
    
    return {
      type: 'comparison',
      content: content,
      comparisonElements: comparisonElements,
      displayMode: comparisonElements.length > 0 ? 'table' : 'text'
    };
  }
  
  formatImageAnalysisResponse(content, sourceInfo) {
    return {
      type: 'image_analysis',
      content: content,
      imageInfo: sourceInfo.image || {},
      findings: sourceInfo.findings || []
    };
  }
  
  formatBookAnalysisResponse(content, sourceInfo) {
    return {
      type: 'book_analysis',
      content: content,
      bookInfo: sourceInfo.book || {},
      keyInsights: sourceInfo.insights || []
    };
  }
  
  formatDefaultResponse(content) {
    return {
      type: 'default',
      content: content
    };
  }
  
  addCitations(content, sourceInfo) {
    if (!sourceInfo.sources || sourceInfo.sources.length === 0) {
      return content;
    }
    
    // Simple citation replacement
    // In a production system, this would be more sophisticated
    let citedContent = content;
    sourceInfo.sources.forEach((source, index) => {
      // Create a citation marker
      const citationMarker = `[${index + 1}]`;
      
      // Add citation information at the end
      citedContent += `\n\n${citationMarker} ${source.title}. ${source.authors ? source.authors.join(', ') : ''} ${source.journal || ''} ${source.date || ''}`;
    });
    
    return citedContent;
  }
  
  extractMedicalTerms(content) {
    // This is a simplified version - in production, use a medical terminology API
    const commonMedicalTerms = [
      'adenocarcinoma', 'squamous cell carcinoma', 'metastasis', 'dysphagia',
      'Barrett\'s esophagus', 'gastroesophageal reflux disease', 'endoscopy',
      'chemotherapy', 'radiation therapy', 'immunotherapy', 'targeted therapy',
      'esophagectomy', 'lymphadenectomy', 'PET scan', 'biopsy'
    ];
    
    const foundTerms = [];
    
    commonMedicalTerms.forEach(term => {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        foundTerms.push(term);
      }
    });
    
    return foundTerms;
  }
  
  extractComparisonElements(content) {
    // This would be more sophisticated in production
    // Simplified version for illustration
    const comparisonElements = [];
    
    // Look for patterns indicating comparison points
    const lines = content.split('\n');
    
    let currentCategory = null;
    
    lines.forEach(line => {
      if (line.match(/^#+\s/)) {
        // This is a heading - might be a category
        currentCategory = line.replace(/^#+\s/, '').trim();
      } else if (line.includes(' vs ') || line.includes(' versus ')) {
        // This might be a comparison point
        comparisonElements.push({
          category: currentCategory,
          text: line
        });
      }
    });
    
    return comparisonElements;
  }
}
```

## Medical Data APIs

### PubMed/NCBI E-utilities

**Authentication Method**: API Key (optional)
**Base URL**: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils`
**Primary Endpoints**: 
- `/esearch.fcgi` (Search)
- `/efetch.fcgi` (Retrieve records)
- `/elink.fcgi` (Find related records)

**Implementation Example**:
```javascript
async function searchPubMed(query, maxResults = 20) {
  const API_KEY = process.env.NCBI_API_KEY || "";
  const BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  
  try {
    // Step 1: Search for IDs
    const searchUrl = new URL(`${BASE_URL}/esearch.fcgi`);
    searchUrl.searchParams.append("db", "pubmed");
    searchUrl.searchParams.append("term", query);
    searchUrl.searchParams.append("retmax", maxResults.toString());
    searchUrl.searchParams.append("retmode", "json");
    searchUrl.searchParams.append("sort", "relevance");
    
    if (API_KEY) {
      searchUrl.searchParams.append("api_key", API_KEY);
    }
    
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error(`PubMed search failed: ${searchResponse.statusText}`);
    }
    
    const searchData = await searchResponse.json();
    const pmids = searchData.esearchresult.idlist;
    
    if (!pmids.length) {
      return [];
    }
    
    // Step 2: Fetch detailed records
    const fetchUrl = new URL(`${BASE_URL}/efetch.fcgi`);
    fetchUrl.searchParams.append("db", "pubmed");
    fetchUrl.searchParams.append("id", pmids.join(","));
    fetchUrl.searchParams.append("retmode", "xml");
    
    if (API_KEY) {
      fetchUrl.searchParams.append("api_key", API_KEY);
    }
    
    const fetchResponse = await fetch(fetchUrl);
    if (!fetchResponse.ok) {
      throw new Error(`PubMed fetch failed: ${fetchResponse.statusText}`);
    }
    
    const xmlText = await fetchResponse.text();
    
    // Step 3: Parse XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Process the XML to extract article information
    const articles = [];
    const articleElements = xmlDoc.getElementsByTagName("PubmedArticle");
    
    for (let i = 0; i < articleElements.length; i++) {
      const article = articleElements[i];
      
      // Extract title
      const titleElement = article.querySelector("ArticleTitle");
      const title = titleElement ? titleElement.textContent : "No title available";
      
      // Extract abstract
      const abstractElements = article.querySelectorAll("AbstractText");
      let abstract = "";
      abstractElements.forEach(element => {
        abstract += element.textContent + " ";
      });
      
      if (!abstract) {
        abstract = "No abstract available";
      }
      
      // Extract authors
      const authorElements = article.querySelectorAll("Author");
      const authors = [];
      
      authorElements.forEach(authorElement => {
        const lastName = authorElement.querySelector("LastName");
        const initials = authorElement.querySelector("Initials");
        
        if (lastName && initials) {
          authors.push(`${lastName.textContent} ${initials.textContent}`);
        }
      });
      
      // Extract journal info
      const journalElement = article.querySelector("Journal Title");
      const journal = journalElement ? journalElement.textContent : "Unknown Journal";
      
      // Extract publication date
      const yearElement = article.querySelector("PubDate Year");
      const monthElement = article.querySelector("PubDate Month");
      
      const year = yearElement ? yearElement.textContent : "Unknown";
      const month = monthElement ? monthElement.textContent : "Unknown";
      
      // Extract PMID
      const pmidElement = article.querySelector("PMID");
      const pmid = pmidElement ? pmidElement.textContent : "Unknown";
      
      articles.push({
        title,
        abstract,
        authors,
        journal,
        date: `${month} ${year}`,
        pmid,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
      });
    }
    
    return articles;
  } catch (error) {
    console.error("Error searching PubMed:", error);
    throw error;
  }
}
```

### ClinicalTrials.gov API

**Authentication Method**: None required
**Base URL**: `https://clinicaltrials.gov/api`
**Primary Endpoint**: `/query/study_fields`

**Implementation Example**:
```javascript
async function searchClinicalTrials(condition, location, distance = 100, maxResults = 20) {
  try {
    const url = new URL('https://clinicaltrials.gov/api/query/study_fields');
    
    // Basic parameters
    url.searchParams.append('expr', `"${condition}" AND AREA[LocationCity]"${location}"`);
    url.searchParams.append('fields', 'NCTId,BriefTitle,OverallStatus,Phase,StudyType,ConditionList,InterventionList,LocationFacility,LocationCity,LocationState,LocationZip,LocationCountry,EligibilityCriteria,StartDate,CompletionDate');
    url.searchParams.append('min_rnk', '1');
    url.searchParams.append('max_rnk', maxResults.toString());
    url.searchParams.append('fmt', 'json');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`ClinicalTrials.gov API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform the response into a more usable format
    const trials = data.StudyFieldsResponse.StudyFields.map(trial => {
      return {
        id: trial.NCTId[0] || 'Unknown',
        title: trial.BriefTitle[0] || 'Unknown Title',
        status: trial.OverallStatus[0] || 'Unknown',
        phase: trial.Phase[0] || 'Not Specified',
        conditions: trial.ConditionList || [],
        interventions: trial.InterventionList || [],
        locations: trial.LocationFacility.map((facility, index) => {
          return {
            facility: facility,
            city: trial.LocationCity[index] || '',
            state: trial.LocationState[index] || '',
            zip: trial.LocationZip[index] || '',
            country: trial.LocationCountry[index] || ''
          };
        }),
        eligibility: trial.EligibilityCriteria[0] || 'Not Specified',
        startDate: trial.StartDate[0] || 'Unknown',
        completionDate: trial.CompletionDate[0] || 'Unknown',
        url: `https://clinicaltrials.gov/study/${trial.NCTId[0]}`
      };
    });
    
    return trials;
  } catch (error) {
    console.error('Error searching clinical trials:', error);
    throw error;
  }
}
```

## Error Handling and Fallback Strategy

### API Error Handler

```javascript
class APIErrorHandler {
  constructor() {
    this.errorCounts = {};
    this.MAX_RETRIES = 3;
    this.BACKOFF_FACTOR = 1.5;
  }
  
  async callWithRetry(apiFunction, params, apiName) {
    let retries = 0;
    let lastError = null;
    
    while (retries < this.MAX_RETRIES) {
      try {
        // Attempt the API call
        const result = await apiFunction(...params);
        
        // Reset error count on success
        this.errorCounts[apiName] = 0;
        
        return result;
      } catch (error) {
        lastError = error;
        retries++;
        
        // Increment error count for this API
        this.errorCounts[apiName] = (this.errorCounts[apiName] || 0) + 1;
        
        console.error(`Error in ${apiName} (attempt ${retries}/${this.MAX_RETRIES}):`, error.message);
        
        // If we have more retries to go, wait before trying again
        if (retries < this.MAX_RETRIES) {
          const delayMs = this.calculateBackoff(retries);
          console.log(`Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    // If we get here, all retries failed
    console.error(`All ${this.MAX_RETRIES} attempts failed for ${apiName}`);
    
    // Check if we should use a fallback
    if (this.shouldUseFallback(apiName)) {
      return this.executeFallback(apiName, params, lastError);
    }
    
    // No fallback available or appropriate, rethrow the error
    throw lastError;
  }
  
  calculateBackoff(retryNumber) {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const exponentialDelay = baseDelay * Math.pow(this.BACKOFF_FACTOR, retryNumber - 1);
    const jitter = Math.random() * 0.5 * exponentialDelay; // Up to 50% jitter
    
    return exponentialDelay + jitter;
  }
  
  shouldUseFallback(apiName) {
    // Logic to determine if we should use a fallback
    // For example, if this API has failed multiple times recently
    return this.errorCounts[apiName] > this.MAX_RETRIES;
  }
  
  executeFallback(apiName, params, originalError) {
    console.log(`Executing fallback for ${apiName}`);
    
    // Different fallbacks for different APIs
    switch (apiName) {
      case 'claude3.7':
        return this.fallbackToGPT(params[0], params[1], params[2]);
      
      case 'gpt4.1':
        return this.fallbackToClaude(params[0], params[1], params[2]);
      
      case 'gemini2.5':
        return this.fallbackToClaude(params[0], params[1], params[2]);
      
      case 'pubmed':
        return this.fallbackToCachedResults(apiName, params[0]);
      
      case 'clinicaltrials':
        return this.fallbackToGeneralInfo(apiName, params[0]);
      
      default:
        // No fallback available
        throw new Error(`No fallback available for ${apiName}: ${originalError.message}`);
    }
  }
  
  async fallbackToGPT(prompt, systemPrompt, context) {
    console.log('Falling back to GPT-4.1');
    return await callGPT4_1(prompt, systemPrompt, context);
  }
  
  async fallbackToClaude(prompt, systemPrompt, context) {
    console.log('Falling back to Claude 3.7');
    return await callClaude3_7(prompt, systemPrompt, context);
  }
  
  fallbackToCachedResults(apiName, query) {
    console.log(`Using cached results for ${apiName} query: ${query}`);
    // This would access a cache of previous results
    // Simplified implementation for illustration
    return {
      source: 'cache',
      results: [],
      message: 'Using cached results due to API issues. Results may not be current.'
    };
  }
  
  fallbackToGeneralInfo(apiName, query) {
    console.log(`Providing general info for ${apiName} query: ${query}`);
    // This would return general information when specific data can't be retrieved
    return {
      source: 'fallback',
      results: [],
      message: 'Unable to retrieve specific information. Here is general guidance instead.'
    };
  }
}
```

## Advanced Use Cases

### Deep Research with Gemini 2.5

```javascript
async function performDeepResearch(topic, context = {}) {
  // Create a comprehensive research prompt
  const researchPrompt = `
    Perform comprehensive research on the following esophageal cancer topic:
    
    ${topic}
    
    Please include:
    1. Latest clinical evidence and research findings
    2. Current recommended approaches and their evidence base
    3. Emerging experimental treatments and their current status
    4. Key experts and research centers making progress in this area
    5. Practical implications for patient care
    
    Focus on information that would be most actionable and relevant for a stage 4 esophageal cancer patient. 
    Organize your findings clearly and cite specific sources when possible.
  `;
  
  // Use Gemini 2.5 for its superior deep research capabilities
  const systemPrompt = `You are a world-class medical researcher specializing in oncology with particular expertise in esophageal cancer. You have access to the latest research papers, clinical trial data, and treatment guidelines. Your analysis is thorough, nuanced, and focuses on clinically relevant information. You provide balanced perspectives and clearly distinguish between established standards of care and experimental approaches.`;
  
  return await callGemini2_5(researchPrompt, systemPrompt, context.conversationHistory || []);
}
```

### Medical Document Analysis with GPT-4.1

```javascript
async function analyzeMedicalDocument(documentContent, documentType, context = {}) {
  // Create a document analysis prompt
  const analysisPrompt = `
    Analyze the following ${documentType} and extract all relevant medical information:
    
    ${documentContent}
    
    Please extract and organize:
    1. Key diagnoses and findings
    2. Relevant test results and their clinical significance
    3. Treatment recommendations
    4. Prognosis indicators
    5. Follow-up recommendations
    
    Additionally, highlight any information specifically relevant to esophageal cancer treatment or management.
    If you find any concerning or critical values that require immediate attention, clearly flag them.
  `;
  
  // Use GPT-4.1 for its superior structured extraction capabilities
  const systemPrompt = `You are an expert medical document analyst specializing in oncology records. Your task is to extract and organize key medical information from ${documentType}s with high accuracy. Focus on clinically relevant details that would impact patient care decisions. Present the information in a clear, structured format that highlights the most important findings.`;
  
  return await callGPT4_1(analysisPrompt, systemPrompt, context.conversationHistory || []);
}
```

### Treatment Comparison with Claude 3.7

```javascript
async function compareTreatments(treatmentA, treatmentB, patientContext, context = {}) {
  // Create a treatment comparison prompt
  const comparisonPrompt = `
    Compare the following two treatment approaches for stage 4 esophageal cancer:
    
    Treatment A: ${treatmentA}
    Treatment B: ${treatmentB}
    
    Patient context:
    ${patientContext}
    
    Please provide:
    1. A side-by-side comparison of key benefits and risks
    2. Efficacy data comparison based on current research
    3. Quality of life considerations for each approach
    4. How each treatment might interact with the patient's specific situation
    5. Questions the patient should discuss with their oncologist
    
    Focus on practical differences that would matter most to the patient's decision-making.
  `;
  
  // Use Claude 3.7 for its superior reasoning and comparison capabilities
  const systemPrompt = `You are a medical decision support specialist with expertise in esophageal cancer treatments. Your role is to objectively compare treatment options with nuanced analysis of benefits, risks, and evidence quality. You consider individual patient factors when relevant and help patients understand practical tradeoffs. You avoid making direct recommendations but provide information that empowers informed decision-making in consultation with healthcare providers.`;
  
  return await callClaude3_7(comparisonPrompt, systemPrompt, context.conversationHistory || []);
}
```

## Data Processing Pipelines

### Medical Document Processor

```javascript
class MedicalDocumentProcessor {
  constructor(llmRouter) {
    this.llmRouter = llmRouter;
    this.errorHandler = new APIErrorHandler();
  }
  
  async processDocument(file, documentType = 'unknown') {
    try {
      // Step 1: Determine document type if not provided
      if (documentType === 'unknown') {
        documentType = this.detectDocumentType(file);
      }
      
      // Step 2: Extract text based on document type
      const extractedText = await this.extractText(file, documentType);
      
      // Step 3: Process the text with appropriate tools
      const processedData = await this.processText(extractedText, documentType);
      
      // Step 4: Enhance with AI analysis
      const enhancedData = await this.enhanceWithAI(processedData, documentType);
      
      return enhancedData;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }
  
  detectDocumentType(file) {
    // Determine document type based on file extension, MIME type, and content
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.pdf')) {
      return 'pdf';
    } else if (fileName.match(/\.(png|jpg|jpeg|tiff|bmp)$/)) {
      return 'image';
    } else if (fileName.match(/\.(doc|docx)$/)) {
      return 'word';
    } else if (fileName.match(/\.(xls|xlsx)$/)) {
      return 'excel';
    } else if (fileName.match(/\.(txt|csv)$/)) {
      return 'text';
    } else {
      // Default to binary
      return 'binary';
    }
  }
  
  async extractText(file, documentType) {
    switch (documentType) {
      case 'pdf':
        return await this.extractTextFromPDF(file);
      case 'image':
        return await this.extractTextFromImage(file);
      case 'word':
        return await this.extractTextFromWord(file);
      case 'excel':
        return await this.extractTextFromExcel(file);
      case 'text':
        return await this.readTextFile(file);
      default:
        throw new Error(`Unsupported document type for text extraction: ${documentType}`);
    }
  }
  
  async extractTextFromImage(file) {
    // This would use OCR, possibly via Gemini's image understanding
    // Simplified for illustration
    
    // Convert file to base64
    const fileBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString('base64');
    
    // Create multimodal content for Gemini
    const multimodalContent = {
      inlineData: {
        mimeType: file.type,
        data: base64Data
      }
    };
    
    // Use Gemini to extract text
    const prompt = "Extract all text visible in this medical document. Format it as closely as possible to the original layout.";
    
    const response = await this.errorHandler.callWithRetry(
      callGemini2_5,
      [prompt, "You are a medical document OCR system. Extract text accurately, preserving formatting where possible.", [], multimodalContent],
      'gemini2.5'
    );
    
    return response;
  }
  
  async readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read text file'));
      };
      
      reader.readAsText(file);
    });
  }
  
  async processText(text, documentType) {
    // Process the extracted text based on document type
    switch (documentType) {
      case 'pdf':
      case 'image':
        // For medical reports, try to extract structured information
        if (this.isMedicalReport(text)) {
          return await this.processMedicalReport(text);
        } else {
          return { text, structure: 'unstructured' };
        }
      
      case 'word':
      case 'text':
        // For general text, perform NLP analysis
        return await this.processGeneralText(text);
      
      case 'excel':
        // For tabular data, extract and structure it
        return await this.processTabularData(text);
      
      default:
        return { text, structure: 'unknown' };
    }
  }
  
  isMedicalReport(text) {
    // Check if the text appears to be a medical report
    const medicalKeywords = [
      'patient', 'diagnosis', 'treatment', 'medication',
      'lab results', 'report', 'history', 'examination',
      'assessment', 'plan', 'procedure', 'findings'
    ];
    
    let keywordCount = 0;
    
    medicalKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        keywordCount++;
      }
    });
    
    // If the text contains several medical keywords, it's likely a medical report
    return keywordCount >= 3;
  }
  
  async processMedicalReport(text) {
    // Use GPT-4.1 for structured extraction from medical reports
    const prompt = `
      Extract structured information from the following medical report. 
      Identify sections like patient information, diagnosis, treatments, medications, lab results, etc.
      Format the output as JSON with appropriate sections.
      
      Medical report:
      ${text}
    `;
    
    const response = await this.errorHandler.callWithRetry(
      callGPT4_1,
      [prompt, "You are a medical document parser specializing in extracting structured information from clinical documents.", []],
      'gpt4.1'
    );
    
    // Attempt to parse the response as JSON
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/```json\n([\s\S]*?)```/) || response.match(/({[\s\S]*})/);
      
      if (jsonMatch && jsonMatch[1]) {
        const jsonStr = jsonMatch[1].trim();
        return JSON.parse(jsonStr);
      }
      
      // If no JSON found, return the full text
      return {
        text,
        structure: 'parsed',
        analysis: response
      };
    } catch (error) {
      console.error('Error parsing structured medical report data:', error);
      
      return {
        text,
        structure: 'failed_parsing',
        analysis: response
      };
    }
  }
  
  async enhanceWithAI(processedData, documentType) {
    // Enhance the processed data with AI analysis
    // The approach varies based on document type
    
    switch (documentType) {
      case 'pdf':
      case 'image':
        if (processedData.structure === 'parsed') {
          // For structured medical reports, add clinical insights
          return await this.addClinicalInsights(processedData);
        } else {
          // For unstructured documents, add general analysis
          return await this.addGeneralAnalysis(processedData);
        }
      
      case 'word':
      case 'text':
        // For general text, add relevance assessment
        return await this.addRelevanceAssessment(processedData);
      
      case 'excel':
        // For tabular data, add trend analysis
        return await this.addTrendAnalysis(processedData);
      
      default:
        return processedData;
    }
  }
  
  async addClinicalInsights(processedData) {
    // Use Claude 3.7 to add clinical insights
    const prompt = `
      Analyze this processed medical document and provide clinical insights:
      
      ${JSON.stringify(processedData, null, 2)}
      
      Focus on:
      1. Key findings and their significance
      2. Potential implications for esophageal cancer treatment
      3. Any concerning values or results
      4. Suggestions for follow-up questions or areas to investigate further
      
      Provide your analysis in a clear, structured format.
    `;
    
    const response = await this.errorHandler.callWithRetry(
      callClaude3_7,
      [prompt, "You are a clinical oncologist specializing in esophageal cancer. Provide insightful analysis of medical documents, highlighting important findings and their implications.", []],
      'claude3.7'
    );
    
    return {
      ...processedData,
      clinicalInsights: response
    };
  }
}
```

## Secure Storage Implementation

### Encrypted Storage Manager

```javascript
class EncryptedStorageManager {
  constructor() {
    this.encryptionKey = null;
    this.initialized = false;
    
    // In-memory storage for illustration
    // In production, use a proper encrypted database or storage solution
    this.storage = {};
  }
  
  async initialize() {
    if (this.initialized) return;
    
    // In production, this would securely generate or retrieve an encryption key
    // For illustration, we'll use a simple key derivation
    this.encryptionKey = await this.deriveKey('THRIVE_SECURE_STORAGE');
    this.initialized = true;
  }
  
  async deriveKey(password) {
    // In production, use a proper key derivation function
    // This is a simplified implementation for illustration
    
    // Convert password to bytes
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    
    // Use SubtleCrypto to derive a key
    const keyMaterial = await crypto.subtle.digest('SHA-256', passwordBytes);
    
    // Import the key
    return await crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  async encrypt(data) {
    await this.initialize();
    
    // Convert data to string if it's not already
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Convert to bytes
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(dataString);
    
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      this.encryptionKey,
      dataBytes
    );
    
    // Combine IV and encrypted data
    const result = new Uint8Array(iv.length + encryptedData.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encryptedData), iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...result));
  }
  
  async decrypt(encryptedString) {
    await this.initialize();
    
    // Convert from base64
    const encryptedData = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));
    
    // Extract IV and data
    const iv = encryptedData.slice(0, 12);
    const data = encryptedData.slice(12);
    
    // Decrypt
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      this.encryptionKey,
      data
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedData);
    
    // Parse JSON if possible
    try {
      return JSON.parse(decryptedString);
    } catch (e) {
      // If it's not valid JSON, return the string as is
      return decryptedString;
    }
  }
  
  async storeData(key, data) {
    const encryptedData = await this.encrypt(data);
    this.storage[key] = encryptedData;
    return true;
  }
  
  async retrieveData(key) {
    if (!this.storage[key]) {
      return null;
    }
    
    return await this.decrypt(this.storage[key]);
  }
  
  async deleteData(key) {
    if (this.storage[key]) {
      delete this.storage[key];
      return true;
    }
    
    return false;
  }
  
  async listKeys(prefix = '') {
    return Object.keys(this.storage).filter(key => key.startsWith(prefix));
  }
}
```

## Performance Optimization Strategies

### Model Selection Optimization

To ensure optimal model usage within API cost constraints:

1. **Tiered Approach**:
   - Use Claude 3.7 for the most complex medical reasoning and synthesis tasks
   - Use GPT-4.1 for structured data extraction and clinical trial matching
   - Use Gemini 2.5 for deep research and multimodal analysis

2. **Response Caching**:
   - Implement a caching layer for common queries to reduce API calls
   - Set appropriate TTL (time-to-live) values based on query type:
     - Long TTL (1 week+) for established medical knowledge
     - Medium TTL (1-3 days) for treatment information
     - Short TTL (hours) for clinical trial data
     - No caching for personalized analysis

3. **Context Window Management**:
   - Optimize token usage by only including relevant conversation history
   - Summarize lengthy documents before sending to models with shorter context windows
   - Use Gemini 2.5 for tasks requiring the longest context windows

### Implementation in Replit

To securely access your API keys in Replit:

```javascript
// In Replit, API keys are available in the process.env object
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
const GPT_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Verify keys are available
function verifyApiKeys() {
  const missingKeys = [];
  
  if (!CLAUDE_API_KEY) missingKeys.push('ANTHROPIC_API_KEY');
  if (!GPT_API_KEY) missingKeys.push('OPENAI_API_KEY');
  if (!GEMINI_API_KEY) missingKeys.push('GEMINI_API_KEY');
  // OpenRouter is optional
  
  if (missingKeys.length > 0) {
    console.error(`Missing API keys: ${missingKeys.join(', ')}`);
    return false;
  }
  
  return true;
}

// Initialize the system
async function initializeSystem() {
  if (!verifyApiKeys()) {
    throw new Error('Cannot initialize THRIVE: Missing required API keys');
  }
  
  console.log('API keys verified, initializing THRIVE system...');
  
  // Initialize model router and other components
  const modelRouter = new EnhancedModelRouter();
  
  // Test connections to all APIs
  try {
    // Simple test prompt
    const testPrompt = "Respond with 'API connection successful' if you receive this message.";
    
    // Test each API
    await callClaude3_7(testPrompt, "", []);
    console.log('✓ Claude 3.7 API connection successful');
    
    await callGPT4_1(testPrompt, "", []);
    console.log('✓ GPT-4.1 API connection successful');
    
    await callGemini2_5(testPrompt, "", []);
    console.log('✓ Gemini 2.5 API connection successful');
    
    console.log('All API connections verified. THRIVE is ready.');
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    throw error;
  }
}
```

## Conclusion

This comprehensive API integration guide provides all the necessary implementation details to create a powerful and effective THRIVE system for Matt's esophageal cancer research. By leveraging the latest AI models (Claude 3.7, GPT-4.1, and Gemini 2.5) alongside medical data APIs and secure storage solutions, THRIVE will be able to provide sophisticated research assistance, document analysis, and treatment insights.

The implementation is designed to work seamlessly with Replit, using the API keys already stored in Replit Secrets for a secure and straightforward deployment. The model router intelligently directs different types of queries to the most appropriate model based on their strengths, ensuring optimal performance while managing API costs.
