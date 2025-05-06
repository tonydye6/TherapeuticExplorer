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
      // Handle both Date objects and string date formats
      const dateStr = patientData.diagnosisDate instanceof Date 
        ? patientData.diagnosisDate.toISOString().split('T')[0]
        : patientData.diagnosisDate;
      summary += `Diagnosis Date: ${dateStr}\n`;
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
   * Compare multiple treatments side-by-side for a single patient
   */
  async compareTreatmentsSideBySide(
    patientData: PatientData,
    treatmentOptions: string[],
    aspectsToCompare: string[] = []
  ): Promise<{
    treatments: TreatmentPrediction[];
    comparisonTable: Record<string, Record<string, string>>;
    plainLanguageSummary: string;
  }> {
    try {
      // Validate inputs
      if (!patientData.diagnosis) {
        throw new Error('Patient diagnosis is required for treatment comparison');
      }
      
      if (!treatmentOptions || treatmentOptions.length < 2) {
        throw new Error('At least two treatment options are required for comparison');
      }
      
      // Default aspects to compare if none specified
      const aspects = aspectsToCompare.length > 0 ? aspectsToCompare : [
        'Effectiveness',
        'Side Effects',
        'Time Commitment',
        'Recovery Period',
        'Impact on Quality of Life',
        'Cost Considerations',
        'Evidence Strength'
      ];
      
      // Get detailed predictions for all treatments
      const predictions = await this.predictTreatmentEffectiveness(patientData, treatmentOptions);
      
      // Generate a comparison table using AI
      const comparisonTable = await this.generateComparisonTable(patientData, predictions, aspects);
      
      // Generate a plain language summary explaining key differences
      const plainLanguageSummary = await this.generatePlainLanguageSummary(patientData, predictions, comparisonTable);
      
      return {
        treatments: predictions,
        comparisonTable,
        plainLanguageSummary
      };
    } catch (error) {
      console.error('Error comparing treatments side by side:', error);
      throw new Error(`Treatment comparison failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Generate a structured comparison table of treatments across different aspects
   */
  private async generateComparisonTable(
    patientData: PatientData,
    treatments: TreatmentPrediction[],
    aspects: string[]
  ): Promise<Record<string, Record<string, string>>> {
    // Create a detailed prompt for the table generation
    const prompt = `
    Based on the patient with ${patientData.diagnosis} and the following treatment predictions, create a detailed comparison table.
    
    PATIENT SUMMARY:
    ${this.createPatientSummary(patientData)}
    
    TREATMENT PREDICTIONS:
    ${JSON.stringify(treatments, null, 2)}
    
    ASPECTS TO COMPARE:
    ${aspects.join('\n')}
    
    Generate a detailed comparison table with treatments as columns and the aspects as rows.
    Format your response as a JSON object with the following structure:
    {
      "aspects": {
        "[Aspect Name]": {
          "[Treatment Name 1]": "[Comparison point in 1-2 sentences]",
          "[Treatment Name 2]": "[Comparison point in 1-2 sentences]",
          ...
        },
        ...
      }
    }
    
    For each cell, provide a concise but informative 1-2 sentence description comparing that aspect for that treatment.
    Use evidence from the treatment predictions where possible.
    Make clear comparisons between treatments (e.g., "Better/worse than Treatment X for...").
    `;
    
    // Use GPT-4o for generating the comparison table
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert in medical treatment comparisons. Create clear, structured, evidence-based comparisons of different treatment options."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    try {
      const content = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(content);
      return result.aspects || {};
    } catch (error) {
      console.error('Error parsing comparison table:', error);
      return {};
    }
  }
  
  /**
   * Generate a plain language summary of the treatment comparison
   */
  private async generatePlainLanguageSummary(
    patientData: PatientData,
    treatments: TreatmentPrediction[],
    comparisonTable: Record<string, Record<string, string>>
  ): Promise<string> {
    // Create a prompt for the plain language summary
    const prompt = `
    Based on the patient with ${patientData.diagnosis} and the detailed treatment comparison, create a plain language summary explaining the key differences between these treatment options.
    
    PATIENT SUMMARY:
    ${this.createPatientSummary(patientData)}
    
    TREATMENTS BEING COMPARED:
    ${treatments.map(t => t.treatmentName).join(', ')}
    
    DETAILED COMPARISON:
    ${JSON.stringify(comparisonTable, null, 2)}
    
    Write a clear, compassionate, jargon-free explanation (500-800 words) of:
    1. The key differences between these treatments in terms of how they work
    2. The main trade-offs to consider (effectiveness vs. side effects, quality of life impacts, etc.)
    3. What factors from this patient's specific situation might make one treatment more suitable than others
    4. Questions the patient might want to discuss with their doctor
    
    Address the patient directly using "you" language. Avoid medical jargon when possible, or explain it clearly when needed.
    Be honest about uncertainties and trade-offs. Emphasize that treatment decisions should always be made with healthcare providers.
    `;
    
    // Use GPT-4o for generating the plain language summary
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a compassionate medical explainer who helps patients understand complex treatment options in simple language. You speak directly to patients with warmth and clarity."
        },
        { role: "user", content: prompt }
      ],
    });
    
    return response.choices[0]?.message?.content || "No explanation available";
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

  /**
   * Generate a plain language explanation of a treatment
   */
  async explainTreatmentInPlainLanguage(
    treatmentName: string,
    diagnosis: string,
    audience: 'patient' | 'caregiver' | 'child' = 'patient'
  ): Promise<{
    explanation: string;
    keywords: string[];
    visualAid?: string;
  }> {
    try {
      // Create a prompt based on the audience
      let promptPrefix = '';
      
      if (audience === 'child') {
        promptPrefix = 'Explain this cancer treatment to a child in very simple terms with metaphors they would understand. Use short sentences, simple words, and a warm, reassuring tone.';
      } else if (audience === 'caregiver') {
        promptPrefix = 'Explain this cancer treatment to a caregiver who wants to support their loved one. Include practical caregiving advice and what to watch for.';
      } else {
        promptPrefix = 'Explain this cancer treatment to a patient in plain, non-technical language. Be warm, honest and supportive while providing practical information.';
      }
      
      const prompt = `
      ${promptPrefix}
      
      Treatment: ${treatmentName}
      Diagnosis: ${diagnosis}
      
      Your explanation should cover:
      1. What the treatment is and how it works in simple terms
      2. What the patient can expect during treatment (procedure, duration, frequency)
      3. Common side effects and how they're typically managed
      4. How this treatment helps with their specific condition
      5. What the patient can do to prepare or support the treatment's effectiveness
      
      IMPORTANT: Use metaphors and everyday comparisons to explain complex concepts. Avoid medical jargon when possible, or immediately explain it in simple terms if it's necessary to use. Be compassionate but honest. Format your response for readability with appropriate paragraphs and bullet points where helpful.
      
      Also include a short list of 5-7 key terms/concepts that would be helpful for the ${audience} to know, with very brief (one sentence) definitions.
      
      Format your response as a JSON object with the following structure:
      {
        "explanation": "Your detailed plain-language explanation",
        "keywords": ["Term 1: brief definition", "Term 2: brief definition", ...],
        "visualAid": "A text description of what would make a helpful visual to accompany this explanation"
      }
      `;
      
      // Use GPT-4o for generating the plain language explanation
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a compassionate medical explainer who specializes in making complex cancer treatments understandable to different audiences. You're known for your warm, clear language and ability to explain difficult concepts through relatable analogies."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      try {
        const content = response.choices[0]?.message?.content || '{}';
        return JSON.parse(content);
      } catch (error) {
        console.error('Error parsing treatment explanation:', error);
        return {
          explanation: "I'm sorry, but there was an error generating the treatment explanation.",
          keywords: []
        };
      }
    } catch (error) {
      console.error('Error explaining treatment in plain language:', error);
      throw new Error(`Failed to generate treatment explanation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const treatmentPredictionService = new TreatmentPredictionService();