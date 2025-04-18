// This service handles research-related functionality
// It connects to medical databases and APIs to fetch research information

import { aiRouter, TreatmentInfo, ClinicalTrialInfo, ResearchSummary } from "./aiRouter";
import { ModelType, QueryType } from "@shared/schema";

export type ResearchResults = {
  treatments?: TreatmentInfo[];
  clinicalTrials?: ClinicalTrialInfo[];
  researchSummary?: ResearchSummary;
  sources?: {
    title: string;
    url?: string;
    type: string;
    date?: string;
  }[];
};

// Sample data for development purposes
const sampleTreatments: TreatmentInfo[] = [
  {
    name: "Systemic Chemotherapy + Immunotherapy",
    evidenceLevel: "high",
    benefits: [
      { text: "Increased median survival (12.4 months vs 8.8 months)" },
      { text: "Higher response rate for <span class=\"medical-term\">PD-L1</span> positive tumors" },
      { text: "May shrink liver metastases to make them surgically removable" }
    ],
    sideEffects: [
      { text: "Immunotherapy-related adverse events (10-15%)", warning: true },
      { text: "Standard chemotherapy side effects (fatigue, nausea)", warning: true },
      { text: "<span class=\"medical-term\">PD-L1</span> testing required for optimal selection", info: true }
    ],
    source: "KEYNOTE-590 and CHECKMATE-648 trials"
  },
  {
    name: "Targeted Liver Therapies + Systemic Treatment",
    evidenceLevel: "medium",
    benefits: [
      { text: "Direct targeting of liver lesions" },
      { text: "May improve liver-specific progression-free survival" },
      { text: "Options include <span class=\"medical-term\">TACE</span>, <span class=\"medical-term\">TARE</span>, or <span class=\"medical-term\">SBRT</span>" }
    ],
    sideEffects: [
      { text: "Risk of liver function deterioration", warning: true },
      { text: "Post-embolization syndrome (fatigue, pain, fever)", warning: true },
      { text: "Requires specialized interventional radiology", info: true }
    ],
    source: "Multiple Phase 2 studies"
  },
  {
    name: "HER2-Targeted Therapy (for HER2+ tumors)",
    evidenceLevel: "high",
    benefits: [
      { text: "Significant survival benefit in <span class=\"medical-term\">HER2+</span> patients" },
      { text: "Options include <span class=\"medical-term\">trastuzumab deruxtecan</span> (T-DXd)" },
      { text: "High response rates (>40%) even in heavily pre-treated patients" }
    ],
    sideEffects: [
      { text: "Risk of interstitial lung disease/pneumonitis (10%)", warning: true },
      { text: "Nausea, fatigue, decreased blood counts", warning: true },
      { text: "Only applicable for <span class=\"medical-term\">HER2+</span> tumors (15-20% of cases)", info: true }
    ],
    source: "DESTINY-Gastric01 & DESTINY-Gastric02 trials"
  }
];

const sampleClinicalTrials: ClinicalTrialInfo[] = [
  {
    title: "Pembrolizumab Plus Ramucirumab and Paclitaxel for Advanced Esophageal and Gastric Cancer",
    phase: "2",
    matchScore: 92,
    location: "Memorial Sloan Kettering Cancer Center",
    distance: 32,
    id: "NCT04069273",
    status: "Recruiting"
  },
  {
    title: "Trastuzumab Deruxtecan With Nivolumab in HER2 Expressing Esophagogastric Adenocarcinoma",
    phase: "1/2",
    matchScore: 78,
    location: "Dana-Farber Cancer Institute",
    distance: 45,
    id: "NCT04014075",
    status: "Recruiting"
  }
];

const sampleResearchSummary: ResearchSummary = {
  text: "Current evidence suggests that a multi-modal approach combining systemic therapy (chemotherapy + immunotherapy) with consideration of liver-directed treatments offers the best outcomes for stage 4 esophageal cancer with liver metastasis.\n\nFor patients with HER2+ tumors, the addition of HER2-targeted therapy significantly improves survival outcomes. Recent trials have shown promising results with antibody-drug conjugates like trastuzumab deruxtecan.\n\nThe optimal approach should be discussed with your healthcare team, considering your specific case details, including molecular profiling results and performance status.",
  sources: ["NCCN Guidelines 2023", "ESMO Clinical Practice Guidelines", "Recent Phase 3 Clinical Trials (KEYNOTE-590, CHECKMATE-648)"]
};

class ResearchService {
  // Search for medical literature based on a query
  async searchMedicalLiterature(query: string): Promise<any[]> {
    // In a real implementation, this would connect to PubMed or other APIs
    // For this prototype, we'll return mock data
    
    console.log(`Searching medical literature for: ${query}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        title: "Recent advances in the management of esophageal cancer",
        authors: "Smith J, Johnson A, Williams B",
        journal: "Journal of Clinical Oncology",
        year: 2023,
        abstract: "This review discusses the latest developments in esophageal cancer treatment...",
        url: "https://pubmed.ncbi.nlm.nih.gov/example1"
      },
      {
        title: "Immunotherapy in advanced esophageal cancer",
        authors: "Brown R, Davis T, Miller C",
        journal: "Nature Reviews Cancer",
        year: 2022,
        abstract: "Recent clinical trials have demonstrated significant benefits of immune checkpoint inhibitors...",
        url: "https://pubmed.ncbi.nlm.nih.gov/example2"
      }
    ];
  }
  
  // Search for clinical trials based on a query
  async searchClinicalTrials(query: string): Promise<any[]> {
    // In a real implementation, this would connect to ClinicalTrials.gov API
    // For this prototype, we'll return mock data
    
    console.log(`Searching clinical trials for: ${query}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return sampleClinicalTrials;
  }
  
  // Analyze treatment options based on a query
  async analyzeTreatmentOptions(query: string): Promise<any[]> {
    // In a real implementation, this would use a medical model to analyze treatments
    // For this prototype, we'll return mock data
    
    console.log(`Analyzing treatment options for: ${query}`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return sampleTreatments;
  }
  
  // Perform comprehensive research on a query
  async performResearch(query: string): Promise<ResearchResults> {
    console.log(`Performing comprehensive research for: ${query}`);
    
    const { modelType, queryType } = aiRouter.determineModelForQuery(query);
    
    // Initialize results
    const results: ResearchResults = {
      sources: []
    };
    
    // For treatment-related queries, include treatment information
    if (
      queryType === QueryType.TREATMENT || 
      query.toLowerCase().includes("treatment") ||
      query.toLowerCase().includes("therapy")
    ) {
      results.treatments = await this.analyzeTreatmentOptions(query);
    }
    
    // For clinical trial queries, include trial information
    if (
      queryType === QueryType.CLINICAL_TRIAL || 
      query.toLowerCase().includes("trial") ||
      query.toLowerCase().includes("study")
    ) {
      results.clinicalTrials = await this.searchClinicalTrials(query);
    }
    
    // For research-oriented queries, include a research summary
    if (
      queryType === QueryType.RESEARCH ||
      queryType === QueryType.GENERAL
    ) {
      results.researchSummary = sampleResearchSummary;
    }
    
    // Add sources
    if (results.treatments) {
      results.sources = [
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
      ];
    } else if (results.clinicalTrials) {
      results.sources = [
        {
          title: "ClinicalTrials.gov",
          url: "https://clinicaltrials.gov",
          type: "clinical_trial_database"
        }
      ];
    } else {
      results.sources = [
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
      ];
    }
    
    return results;
  }
}

export const researchService = new ResearchService();
