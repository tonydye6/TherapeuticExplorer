import { ModelType } from '@shared/schema';
import { aiRouter } from './aiRouter';
import OpenAI from 'openai';

// Treatment response prediction factors
export enum PredictionFactor {
  AGE = 'age',
  GENDER = 'gender',
  TUMOR_STAGE = 'tumor_stage',
  TUMOR_GRADE = 'tumor_grade',
  TUMOR_SIZE = 'tumor_size',
  LYMPH_NODE_INVOLVEMENT = 'lymph_node_involvement',
  METASTASIS = 'metastasis',
  HISTOLOGY = 'histology',
  HISTOLOGICAL_SUBTYPE = 'histological_subtype',
  MOLECULAR_MARKERS = 'molecular_markers',
  COMORBIDITIES = 'comorbidities',
  PREVIOUS_TREATMENTS = 'previous_treatments',
  PERFORMANCE_STATUS = 'performance_status',
  SMOKING_HISTORY = 'smoking_history',
  ALCOHOL_HISTORY = 'alcohol_history',
}

// Structure for a treatment option with effectiveness prediction
export interface TreatmentPrediction {
  treatmentName: string;
  treatmentType: string;
  description: string;
  effectivenessScore: number; // 0-100
  confidenceInterval: [number, number]; // e.g., [75, 85] for 75-85% confidence
  keySupportingFactors: string[];
  potentialChallenges: string[];
  comparisonToStandard: string;
  estimatedSurvivalBenefit?: string;
  qualityOfLifeImpact?: string;
  evidenceLevel: 'high' | 'moderate' | 'low';
  references: Array<{
    title: string;
    authors?: string;
    publication?: string;
    year?: number;
    url?: string;
  }>;
}

// Patient data interface for prediction
export interface PatientData {
  age?: number;
  gender?: string;
  diagnosis: string;
  diagnosisDate?: Date;
  tumorCharacteristics?: {
    stage?: string;
    grade?: string;
    size?: number; // in cm
    location?: string;
    histology?: string;
    histologicalSubtype?: string;
    molecularMarkers?: Record<string, string | boolean>;
    lymphNodeInvolvement?: boolean;
    metastasis?: boolean;
  };
  medicalHistory?: {
    comorbidities?: string[];
    previousCancers?: string[];
    previousTreatments?: string[];
    familyHistory?: string[];
    smokingHistory?: 'never' | 'former' | 'current';
    alcoholHistory?: 'none' | 'light' | 'moderate' | 'heavy';
  };
  performanceStatus?: number; // 0-5 ECOG scale
  biomarkers?: Record<string, string | number | boolean>;
  [key: string]: any; // Allow for additional properties
}

class TreatmentPredictionService {
  private openai: OpenAI;
  
  constructor() {
    // Initialize the OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Predict treatment effectiveness for a specific patient
   */
  async predictTreatmentEffectiveness(
    patientData: PatientData, 
    treatmentOptions?: string[]
  ): Promise<TreatmentPrediction[]> {
    try {
      // Validate patient data
      if (!patientData.diagnosis) {
        throw new Error('Patient diagnosis is required for treatment prediction');
      }

      // If treatment options are not specified, use diagnosis to determine relevant options
      const treatments = treatmentOptions || await this.getRelevantTreatments(patientData.diagnosis);
      
      // Use GPT-4o to analyze and predict treatment effectiveness
      const predictions = await this.analyzeWithAI(patientData, treatments);
      
      return predictions;
    } catch (error) {
      console.error('Error predicting treatment effectiveness:', error);
      throw new Error(`Treatment prediction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get relevant treatment options based on diagnosis
   */
  private async getRelevantTreatments(diagnosis: string): Promise<string[]> {
    // For esophageal cancer, return common treatment approaches
    if (diagnosis.toLowerCase().includes('esophageal') && 
        diagnosis.toLowerCase().includes('cancer')) {
      return [
        'Surgery (Esophagectomy)',
        'Neoadjuvant Chemoradiation + Surgery',
        'Definitive Chemoradiation',
        'Chemotherapy alone',
        'Targeted Therapy (HER2+)',
        'Immunotherapy',
        'Palliative Care',
        'Endoscopic Mucosal Resection (Early Stage)',
        'Photodynamic Therapy',
        'Clinical Trial Enrollment'
      ];
    }
    
    // For other diagnoses, use AI to suggest relevant treatments
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an oncology clinical decision support system. Provide accurate, evidence-based treatment options for cancer diagnoses."
        },
        {
          role: "user",
          content: `List the 8-10 most relevant treatment approaches for a patient with ${diagnosis}. Provide only the treatment names separated by commas, no descriptions or explanations.`
        }
      ],
    });

    // Extract and clean the treatment list
    const content = response.choices[0]?.message?.content || '';
    return content
      .split(',')
      .map(treatment => treatment.trim())
      .filter(treatment => treatment.length > 0);
  }

  /**
   * Analyze patient data and predict treatment effectiveness using AI
   */
  private async analyzeWithAI(
    patientData: PatientData,
    treatments: string[]
  ): Promise<TreatmentPrediction[]> {
    // Create a detailed prompt with patient data and treatment options
    const patientSummary = this.createPatientSummary(patientData);
    
    const prompt = `
Analyze the following patient data for ${patientData.diagnosis} and predict the effectiveness of each treatment option listed.
For each treatment, provide an effectiveness score (0-100), confidence interval, supporting factors, challenges, and estimated survival benefit.

PATIENT SUMMARY:
${patientSummary}

TREATMENT OPTIONS TO ANALYZE:
${treatments.join('\n')}

For each treatment, provide your analysis in JSON format as follows:
[
  {
    "treatmentName": "Treatment name",
    "treatmentType": "Type of treatment (e.g., surgery, chemotherapy, targeted therapy)",
    "description": "Brief description of the treatment",
    "effectivenessScore": 85, 
    "confidenceInterval": [80, 90],
    "keySupportingFactors": ["Factor 1", "Factor 2"],
    "potentialChallenges": ["Challenge 1", "Challenge 2"],
    "comparisonToStandard": "How this compares to standard of care",
    "estimatedSurvivalBenefit": "e.g., '15% improvement in 5-year survival'",
    "qualityOfLifeImpact": "Expected impact on quality of life",
    "evidenceLevel": "high/moderate/low",
    "references": [
      {
        "title": "Study title",
        "authors": "Author names",
        "publication": "Journal name",
        "year": 2023,
        "url": "URL to study if available"
      }
    ]
  }
]

Ensure your predictions are evidence-based and reflect the latest clinical research for ${patientData.diagnosis}.
`;

    // Use GPT-4o for this analysis as it has the most up-to-date medical knowledge
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert in oncology and treatment outcome prediction. Analyze patient data and provide evidence-based predictions of treatment effectiveness. Always include at least 2-3 high-quality references for each prediction."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Extract the JSON response
    try {
      const content = response.choices[0]?.message?.content || '[]';
      return JSON.parse(content);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return [];
    }
  }

  /**
   * Create a detailed summary of patient data for AI analysis
   */
  private createPatientSummary(patientData: PatientData): string {
    let summary = `Diagnosis: ${patientData.diagnosis}\n`;
    
    if (patientData.age) {
      summary += `Age: ${patientData.age}\n`;
    }
    
    if (patientData.gender) {
      summary += `Gender: ${patientData.gender}\n`;
    }
    
    if (patientData.diagnosisDate) {
      summary += `Diagnosis Date: ${patientData.diagnosisDate.toISOString().split('T')[0]}\n`;
    }
    
    // Tumor characteristics
    if (patientData.tumorCharacteristics) {
      summary += "Tumor Characteristics:\n";
      const tc = patientData.tumorCharacteristics;
      
      if (tc.stage) summary += `- Stage: ${tc.stage}\n`;
      if (tc.grade) summary += `- Grade: ${tc.grade}\n`;
      if (tc.size) summary += `- Size: ${tc.size} cm\n`;
      if (tc.location) summary += `- Location: ${tc.location}\n`;
      if (tc.histology) summary += `- Histology: ${tc.histology}\n`;
      if (tc.histologicalSubtype) summary += `- Histological Subtype: ${tc.histologicalSubtype}\n`;
      if (tc.lymphNodeInvolvement !== undefined) summary += `- Lymph Node Involvement: ${tc.lymphNodeInvolvement ? 'Yes' : 'No'}\n`;
      if (tc.metastasis !== undefined) summary += `- Metastasis: ${tc.metastasis ? 'Yes' : 'No'}\n`;
      
      // Molecular markers
      if (tc.molecularMarkers && Object.keys(tc.molecularMarkers).length > 0) {
        summary += "- Molecular Markers:\n";
        for (const [marker, value] of Object.entries(tc.molecularMarkers)) {
          summary += `  * ${marker}: ${value}\n`;
        }
      }
    }
    
    // Medical history
    if (patientData.medicalHistory) {
      summary += "Medical History:\n";
      const mh = patientData.medicalHistory;
      
      if (mh.comorbidities && mh.comorbidities.length > 0) {
        summary += `- Comorbidities: ${mh.comorbidities.join(', ')}\n`;
      }
      
      if (mh.previousCancers && mh.previousCancers.length > 0) {
        summary += `- Previous Cancers: ${mh.previousCancers.join(', ')}\n`;
      }
      
      if (mh.previousTreatments && mh.previousTreatments.length > 0) {
        summary += `- Previous Treatments: ${mh.previousTreatments.join(', ')}\n`;
      }
      
      if (mh.familyHistory && mh.familyHistory.length > 0) {
        summary += `- Family History: ${mh.familyHistory.join(', ')}\n`;
      }
      
      if (mh.smokingHistory) {
        summary += `- Smoking History: ${mh.smokingHistory}\n`;
      }
      
      if (mh.alcoholHistory) {
        summary += `- Alcohol History: ${mh.alcoholHistory}\n`;
      }
    }
    
    // Performance status
    if (patientData.performanceStatus !== undefined) {
      summary += `Performance Status (ECOG): ${patientData.performanceStatus}\n`;
    }
    
    // Biomarkers
    if (patientData.biomarkers && Object.keys(patientData.biomarkers).length > 0) {
      summary += "Biomarkers:\n";
      for (const [marker, value] of Object.entries(patientData.biomarkers)) {
        summary += `- ${marker}: ${value}\n`;
      }
    }
    
    return summary;
  }

  /**
   * Compare treatment effectiveness between two patient profiles
   */
  async compareTreatmentEffectiveness(
    patientA: PatientData,
    patientB: PatientData,
    treatmentOptions: string[]
  ): Promise<{
    patientAResults: TreatmentPrediction[],
    patientBResults: TreatmentPrediction[],
    differenceExplanation: string
  }> {
    // Get predictions for each patient
    const patientAResults = await this.predictTreatmentEffectiveness(patientA, treatmentOptions);
    const patientBResults = await this.predictTreatmentEffectiveness(patientB, treatmentOptions);
    
    // Use AI to explain differences
    const differenceExplanation = await this.explainEffectivenessDifferences(
      patientA, 
      patientB, 
      patientAResults, 
      patientBResults
    );
    
    return {
      patientAResults,
      patientBResults,
      differenceExplanation
    };
  }

  /**
   * Explain differences in treatment effectiveness between two patients
   */
  private async explainEffectivenessDifferences(
    patientA: PatientData,
    patientB: PatientData,
    patientAResults: TreatmentPrediction[],
    patientBResults: TreatmentPrediction[]
  ): Promise<string> {
    // Create a summary of the differences for AI analysis
    const treatmentDifferences: Record<string, { 
      scoreA: number, 
      scoreB: number, 
      difference: number 
    }> = {};
    
    // Match treatments by name
    for (const resultA of patientAResults) {
      const matchingB = patientBResults.find(b => b.treatmentName === resultA.treatmentName);
      if (matchingB) {
        treatmentDifferences[resultA.treatmentName] = {
          scoreA: resultA.effectivenessScore,
          scoreB: matchingB.effectivenessScore,
          difference: resultA.effectivenessScore - matchingB.effectivenessScore
        };
      }
    }
    
    // Use GPT-4o to provide an explanation
    const prompt = `
Compare the predicted treatment effectiveness between these two patients with ${patientA.diagnosis}:

PATIENT A SUMMARY:
${this.createPatientSummary(patientA)}

PATIENT B SUMMARY:
${this.createPatientSummary(patientB)}

TREATMENT EFFECTIVENESS DIFFERENCES:
${Object.entries(treatmentDifferences).map(([treatment, diff]) => 
  `${treatment}: Patient A score: ${diff.scoreA}, Patient B score: ${diff.scoreB}, Difference: ${diff.difference > 0 ? '+' : ''}${diff.difference}`
).join('\n')}

Explain the key factors that likely account for these differences in predicted treatment effectiveness. 
Highlight how specific patient characteristics influence treatment outcomes.
Provide evidence-based reasoning for your explanations.
`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert in precision oncology who can explain differences in treatment response based on patient characteristics. Provide evidence-based, clinically relevant explanations."
        },
        { role: "user", content: prompt }
      ],
    });

    return response.choices[0]?.message?.content || "No explanation available";
  }
}

export const treatmentPredictionService = new TreatmentPredictionService();