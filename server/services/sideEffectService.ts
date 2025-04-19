import OpenAI from "openai";

export interface PatientCharacteristics {
  age?: number;
  gender?: string;
  performanceStatus?: string;
  comorbidities?: string[];
  allergies?: string[];
  currentMedications?: string[];
  height?: number;
  weight?: number;
  smokingStatus?: string;
  alcoholUse?: string;
  priorAdverseReactions?: string[];
}

export interface TreatmentSideEffect {
  name: string;
  description: string;
  likelihood: number;   // 0-100%
  severity: 'mild' | 'moderate' | 'severe';
  timeframe: string;    // e.g., "First 2 weeks", "Throughout treatment"
  managementOptions: string[];
  preventativeMeasures: string[];
  riskFactors: string[];
  relatedToPatientCharacteristics: boolean;
  recommendedMonitoring: string[];
}

export interface SideEffectProfile {
  treatmentName: string;
  overallRisk: number; // 0-100%
  sideEffects: TreatmentSideEffect[];
  patientSpecificConsiderations: string[];
  recommendedPretreatmentActions: string[];
}

export class SideEffectService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required.");
    }
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Analyze and predict treatment side effects based on patient characteristics
   */
  async analyzeSideEffects(
    treatmentName: string,
    patientCharacteristics: PatientCharacteristics
  ): Promise<SideEffectProfile> {
    try {
      // Create a detailed patient profile for analysis
      const patientProfile = this.formatPatientProfile(patientCharacteristics);
      
      // Generate the prompt for side effect analysis
      const prompt = `
Analyze the potential side effects of ${treatmentName} for a patient with the following characteristics:

${patientProfile}

Provide a detailed side effect profile including:
1. Overall risk assessment
2. Specific side effects with likelihood, severity, and timeframe
3. Patient-specific considerations based on their characteristics
4. Management strategies for each side effect
5. Preventative measures that can be taken

Format your response as a JSON object with the following structure:
{
  "treatmentName": "${treatmentName}",
  "overallRisk": number (0-100),
  "sideEffects": [
    {
      "name": "Side effect name",
      "description": "Brief description",
      "likelihood": number (0-100),
      "severity": "mild" | "moderate" | "severe",
      "timeframe": "When this occurs during treatment",
      "managementOptions": ["Option 1", "Option 2"],
      "preventativeMeasures": ["Measure 1", "Measure 2"],
      "riskFactors": ["Factor 1", "Factor 2"],
      "relatedToPatientCharacteristics": boolean,
      "recommendedMonitoring": ["Monitoring 1", "Monitoring 2"]
    }
  ],
  "patientSpecificConsiderations": ["Consideration 1", "Consideration 2"],
  "recommendedPretreatmentActions": ["Action 1", "Action 2"]
}
`;

      // Use GPT-4o for this analysis as it has the most up-to-date medical knowledge
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert in medical oncology and pharmacology. Analyze treatment side effects based on patient characteristics and provide evidence-based predictions of side effect profiles. Your analysis should be thorough but presented in a way that's understandable to patients."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      // Parse the response
      const content = response.choices[0]?.message?.content || '{}';
      const sideEffectProfile = JSON.parse(content) as SideEffectProfile;
      
      return sideEffectProfile;
    } catch (error) {
      console.error('Error analyzing side effects:', error);
      throw new Error(`Side effect analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Format patient characteristics into a readable string
   */
  private formatPatientProfile(characteristics: PatientCharacteristics): string {
    const { 
      age, gender, performanceStatus, comorbidities, allergies, 
      currentMedications, height, weight, smokingStatus, alcoholUse, 
      priorAdverseReactions 
    } = characteristics;

    let profile = '';
    
    if (age) profile += `Age: ${age} years\n`;
    if (gender) profile += `Gender: ${gender}\n`;
    if (performanceStatus) profile += `ECOG Performance Status: ${performanceStatus}\n`;
    
    if (height && weight) {
      const bmi = Math.round((weight / ((height/100) * (height/100))) * 10) / 10;
      profile += `Height: ${height} cm\n`;
      profile += `Weight: ${weight} kg\n`;
      profile += `BMI: ${bmi} kg/m²\n`;
    }
    
    if (comorbidities && comorbidities.length > 0) {
      profile += `Comorbidities: ${comorbidities.join(', ')}\n`;
    }
    
    if (allergies && allergies.length > 0) {
      profile += `Allergies: ${allergies.join(', ')}\n`;
    }
    
    if (currentMedications && currentMedications.length > 0) {
      profile += `Current Medications: ${currentMedications.join(', ')}\n`;
    }
    
    if (smokingStatus) profile += `Smoking Status: ${smokingStatus}\n`;
    if (alcoholUse) profile += `Alcohol Use: ${alcoholUse}\n`;
    
    if (priorAdverseReactions && priorAdverseReactions.length > 0) {
      profile += `Prior Adverse Reactions: ${priorAdverseReactions.join(', ')}\n`;
    }
    
    return profile;
  }
}

export const sideEffectService = new SideEffectService();