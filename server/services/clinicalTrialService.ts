// This service handles clinical trial search and recommendation functionality
// It connects to clinical trial databases and provides matching algorithms

import { SavedTrial } from "@shared/schema";

// Types for clinical trial search and filtering
export type ClinicalTrialSearchParams = {
  query?: string;
  phase?: string;
  status?: string;
  distance?: number;
  location?: {
    lat: number;
    lng: number;
  };
};

export type ClinicalTrial = {
  id: string;
  title: string;
  phase: string;
  status: string;
  conditions: string[];
  interventions: string[];
  locations: {
    facility: string;
    city: string;
    state: string;
    country: string;
    distance?: number;
  }[];
  eligibilityCriteria: string;
  contactInformation: {
    name: string;
    phone: string;
    email: string;
  }[];
  lastUpdated: string;
  startDate: string;
  primaryCompletionDate: string;
  sponsor: string;
  matchScore?: number;
};

class ClinicalTrialService {
  // Sample trial data for development purposes
  private sampleTrials: ClinicalTrial[] = [
    {
      id: "NCT04069273",
      title: "Pembrolizumab Plus Ramucirumab and Paclitaxel for Advanced Esophageal and Gastric Cancer",
      phase: "2",
      status: "Recruiting",
      conditions: ["Esophageal Cancer", "Gastric Cancer", "Metastatic Cancer"],
      interventions: ["Pembrolizumab", "Ramucirumab", "Paclitaxel"],
      locations: [
        {
          facility: "Memorial Sloan Kettering Cancer Center",
          city: "New York",
          state: "NY",
          country: "United States",
          distance: 32
        }
      ],
      eligibilityCriteria: "- Diagnosis of advanced or metastatic esophageal, GEJ, or gastric adenocarcinoma\n- Age ≥ 18 years\n- ECOG performance status of 0-1\n- Measurable disease per RECIST 1.1\n- Adequate organ function",
      contactInformation: [
        {
          name: "Clinical Trials Office",
          phone: "212-555-1234",
          email: "trials@mskcc.org"
        }
      ],
      lastUpdated: "2023-08-15",
      startDate: "2022-03-01",
      primaryCompletionDate: "2024-06-30",
      sponsor: "Memorial Sloan Kettering Cancer Center"
    },
    {
      id: "NCT04014075",
      title: "Trastuzumab Deruxtecan With Nivolumab in HER2 Expressing Esophagogastric Adenocarcinoma",
      phase: "1/2",
      status: "Recruiting",
      conditions: ["HER2-positive Esophageal Cancer", "Gastric Cancer", "Adenocarcinoma"],
      interventions: ["Trastuzumab Deruxtecan", "Nivolumab"],
      locations: [
        {
          facility: "Dana-Farber Cancer Institute",
          city: "Boston",
          state: "MA",
          country: "United States",
          distance: 45
        }
      ],
      eligibilityCriteria: "- Histologically confirmed HER2-expressing esophagogastric adenocarcinoma\n- Age ≥ 18 years\n- ECOG performance status of 0-1\n- Measurable disease per RECIST 1.1\n- No prior treatment with HER2-targeted antibody-drug conjugates",
      contactInformation: [
        {
          name: "Clinical Research Coordinator",
          phone: "617-555-9876",
          email: "clinicaltrials@dfci.harvard.edu"
        }
      ],
      lastUpdated: "2023-09-10",
      startDate: "2022-05-15",
      primaryCompletionDate: "2024-12-31",
      sponsor: "Dana-Farber Cancer Institute"
    },
    {
      id: "NCT05356741",
      title: "Study of M7824 in Locally Advanced Esophageal Cancer",
      phase: "3",
      status: "Recruiting",
      conditions: ["Esophageal Cancer", "Locally Advanced Cancer"],
      interventions: ["M7824 (Bintrafusp Alfa)", "Standard Chemoradiation"],
      locations: [
        {
          facility: "Johns Hopkins Medical Center",
          city: "Baltimore",
          state: "MD",
          country: "United States",
          distance: 62
        }
      ],
      eligibilityCriteria: "- Histologically confirmed locally advanced esophageal squamous cell carcinoma or adenocarcinoma\n- No distant metastasis\n- Age ≥ 18 years\n- ECOG performance status of 0-1\n- No prior systemic therapy",
      contactInformation: [
        {
          name: "Study Coordinator",
          phone: "410-555-4321",
          email: "trials@jhmi.edu"
        }
      ],
      lastUpdated: "2023-07-22",
      startDate: "2022-08-01",
      primaryCompletionDate: "2025-01-31",
      sponsor: "Johns Hopkins University"
    },
    {
      id: "NCT04161794",
      title: "Tislelizumab Plus Chemotherapy Versus Chemotherapy Alone in Recurrent or Metastatic Esophageal Squamous Cell Carcinoma",
      phase: "3",
      status: "Active, not recruiting",
      conditions: ["Esophageal Squamous Cell Carcinoma", "Metastatic Cancer", "Recurrent Cancer"],
      interventions: ["Tislelizumab", "Chemotherapy"],
      locations: [
        {
          facility: "MD Anderson Cancer Center",
          city: "Houston",
          state: "TX",
          country: "United States",
          distance: 115
        }
      ],
      eligibilityCriteria: "- Histologically confirmed recurrent or metastatic ESCC\n- Age ≥ 18 years\n- ECOG performance status of 0-1\n- Measurable disease per RECIST 1.1\n- No prior systemic therapy for recurrent/metastatic disease",
      contactInformation: [
        {
          name: "Clinical Research Department",
          phone: "713-555-7890",
          email: "clinicaltrials@mdanderson.org"
        }
      ],
      lastUpdated: "2023-06-30",
      startDate: "2022-02-15",
      primaryCompletionDate: "2024-09-30",
      sponsor: "BeiGene"
    },
    {
      id: "NCT03543683",
      title: "Durvalumab, Tremelimumab, and Radiation Therapy in Treating Patients With Esophageal or Gastric Cancer",
      phase: "2",
      status: "Recruiting",
      conditions: ["Esophageal Cancer", "Gastric Cancer", "Gastroesophageal Junction Adenocarcinoma"],
      interventions: ["Durvalumab", "Tremelimumab", "Radiation Therapy"],
      locations: [
        {
          facility: "Stanford Medical Center",
          city: "Stanford",
          state: "CA",
          country: "United States",
          distance: 212
        }
      ],
      eligibilityCriteria: "- Histologically confirmed esophageal or gastric cancer\n- Age ≥ 18 years\n- ECOG performance status of 0-2\n- Measurable disease per RECIST 1.1\n- No prior immunotherapy",
      contactInformation: [
        {
          name: "Stanford Cancer Clinical Trials Office",
          phone: "650-555-2345",
          email: "cancertrials@stanford.edu"
        }
      ],
      lastUpdated: "2023-05-12",
      startDate: "2022-04-01",
      primaryCompletionDate: "2024-08-31",
      sponsor: "Stanford University"
    },
    {
      id: "NCT03604991",
      title: "Cabozantinib With Pembrolizumab in Treating Patients With Advanced Cancers of the Digestive System",
      phase: "2",
      status: "Recruiting",
      conditions: ["Esophageal Cancer", "Colorectal Cancer", "Pancreatic Cancer", "Hepatocellular Carcinoma", "Gastric Cancer"],
      interventions: ["Cabozantinib", "Pembrolizumab"],
      locations: [
        {
          facility: "Mayo Clinic",
          city: "Rochester",
          state: "MN",
          country: "United States",
          distance: 187
        }
      ],
      eligibilityCriteria: "- Histologically confirmed advanced cancer of the digestive system\n- Age ≥ 18 years\n- ECOG performance status of 0-1\n- Measurable disease per RECIST 1.1\n- No more than 2 prior systemic therapies",
      contactInformation: [
        {
          name: "Mayo Clinic Clinical Trials Office",
          phone: "507-555-6789",
          email: "digestivetrials@mayo.edu"
        }
      ],
      lastUpdated: "2023-04-05",
      startDate: "2022-06-15",
      primaryCompletionDate: "2024-10-31",
      sponsor: "Mayo Clinic"
    }
  ];

  // Search for clinical trials based on search parameters
  async searchTrials(params: ClinicalTrialSearchParams): Promise<ClinicalTrial[]> {
    console.log(`Searching clinical trials with parameters:`, params);
    
    // In a real implementation, this would connect to ClinicalTrials.gov API or similar
    // For this prototype, we'll filter our sample data based on the search parameters
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let results = [...this.sampleTrials];
    
    // Filter by query (search in title and conditions)
    if (params.query) {
      const lowercaseQuery = params.query.toLowerCase();
      results = results.filter(trial => 
        trial.title.toLowerCase().includes(lowercaseQuery) || 
        trial.conditions.some(condition => condition.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    // Filter by phase
    if (params.phase && params.phase !== "all") {
      results = results.filter(trial => trial.phase.includes(params.phase!));
    }
    
    // Filter by status
    if (params.status && params.status !== "all") {
      if (params.status === "recruiting") {
        results = results.filter(trial => trial.status.toLowerCase() === "recruiting");
      } else if (params.status === "active") {
        results = results.filter(trial => trial.status.toLowerCase().includes("active"));
      }
    }
    
    // Filter by distance
    if (params.distance) {
      results = results.filter(trial => 
        trial.locations.some(location => 
          location.distance !== undefined && location.distance <= params.distance!
        )
      );
    }
    
    // Add match scores for the filtered trials
    results = results.map(trial => ({
      ...trial,
      matchScore: this.calculateTrialMatchScore(trial)
    }));
    
    // Sort by match score (descending)
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    
    return results;
  }
  
  // Calculate match score for a clinical trial
  private calculateTrialMatchScore(trial: ClinicalTrial): number {
    // In a real implementation, this would compare patient profile against trial eligibility
    // For this prototype, we'll use a simple scoring mechanism
    
    // Base score
    let score = 70;
    
    // Bonus for recruiting status
    if (trial.status === "Recruiting") {
      score += 10;
    }
    
    // Bonus for later phase trials
    if (trial.phase === "3") {
      score += 8;
    } else if (trial.phase === "2" || trial.phase.includes("2")) {
      score += 5;
    }
    
    // Bonus for specific esophageal cancer focus
    if (trial.conditions.some(c => c.toLowerCase().includes("esophageal"))) {
      score += 15;
    }
    
    // Penalty for distance (if available)
    const closestLocation = trial.locations.reduce((closest, location) => {
      if (location.distance === undefined) return closest;
      if (closest === null || location.distance < closest) return location.distance;
      return closest;
    }, null as number | null);
    
    if (closestLocation !== null) {
      if (closestLocation > 100) {
        score -= 10;
      } else if (closestLocation > 50) {
        score -= 5;
      }
    }
    
    // Cap the score between 0-100
    return Math.min(100, Math.max(0, score));
  }
  
  // Find detailed information for a specific trial
  async getTrialById(trialId: string): Promise<ClinicalTrial | null> {
    console.log(`Getting trial details for ID: ${trialId}`);
    
    // In a real implementation, this would fetch from the API
    // For this prototype, we'll search our sample data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const trial = this.sampleTrials.find(trial => trial.id === trialId);
    return trial || null;
  }
  
  // Get matching trials for a patient profile
  async getMatchingTrials(patientProfile: {
    diagnosis: string;
    stage: string;
    age: number;
    priorTreatments: string[];
    location?: { lat: number; lng: number };
  }): Promise<ClinicalTrial[]> {
    console.log(`Finding matching trials for patient profile:`, patientProfile);
    
    // In a real implementation, this would use a more sophisticated matching algorithm
    // For this prototype, we'll search using the diagnosis and filter by relevance
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Search using diagnosis
    const searchParams: ClinicalTrialSearchParams = {
      query: patientProfile.diagnosis
    };
    
    let trials = await this.searchTrials(searchParams);
    
    // Add more detailed match scores based on patient profile
    trials = trials.map(trial => {
      let score = trial.matchScore || 70;
      
      // Adjust score based on stage (if mentioned in eligibility)
      if (trial.eligibilityCriteria.toLowerCase().includes(patientProfile.stage.toLowerCase())) {
        score += 10;
      }
      
      // Adjust for prior treatments
      if (patientProfile.priorTreatments.length > 0) {
        const priorTreatmentsInEligibility = patientProfile.priorTreatments.filter(
          treatment => trial.eligibilityCriteria.toLowerCase().includes(treatment.toLowerCase())
        ).length;
        
        if (priorTreatmentsInEligibility > 0) {
          score += 5 * priorTreatmentsInEligibility;
        }
      }
      
      return {
        ...trial,
        matchScore: Math.min(100, score)
      };
    });
    
    // Sort by match score (descending)
    trials.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    
    return trials;
  }
}

export const clinicalTrialService = new ClinicalTrialService();
