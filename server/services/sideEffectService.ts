import OpenAI from 'openai';

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

/**
 * Service for analyzing treatment side effects
 */
export class SideEffectService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Analyze and predict treatment side effects based on patient characteristics
   */
  async analyzeSideEffects(
    treatmentName: string,
    patientCharacteristics: PatientCharacteristics
  ): Promise<SideEffectProfile> {
    try {
      console.log(`Analyzing side effects for ${treatmentName}`);
      
      // Create a prompt that analyzes potential side effects
      const patientProfile = this.formatPatientProfile(patientCharacteristics);
      
      const prompt = `
      As a medical oncologist, analyze the potential side effects of the treatment "${treatmentName}" for the following patient:
      
      ${patientProfile}
      
      Provide a comprehensive side effect profile with the following structure:
      1. Overall risk assessment (percentage)
      2. List of most likely side effects, including:
        - Name and description of each side effect
        - Likelihood (as a percentage)
        - Severity (mild, moderate, or severe)
        - Expected timeframe (when it occurs during treatment)
        - Management options for each side effect
        - Preventative measures
        - Risk factors, noting if any are related to this patient's characteristics
        - Recommended monitoring
      3. Patient-specific considerations based on their profile
      4. Recommended actions before starting treatment
      
      Format your response as a detailed JSON object matching this TypeScript interface:
      
      interface SideEffectProfile {
        treatmentName: string;
        overallRisk: number; // 0-100%
        sideEffects: Array<{
          name: string;
          description: string;
          likelihood: number; // 0-100%
          severity: 'mild' | 'moderate' | 'severe';
          timeframe: string;
          managementOptions: string[];
          preventativeMeasures: string[];
          riskFactors: string[];
          relatedToPatientCharacteristics: boolean;
          recommendedMonitoring: string[];
        }>;
        patientSpecificConsiderations: string[];
        recommendedPretreatmentActions: string[];
      }
      `;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert oncologist specializing in side effect risk analysis." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error("Failed to get a valid response from the AI model");
      }
      
      try {
        const sideEffectProfile: SideEffectProfile = JSON.parse(content);
        
        // Validate the response format
        if (!sideEffectProfile.treatmentName || 
            typeof sideEffectProfile.overallRisk !== 'number' ||
            !Array.isArray(sideEffectProfile.sideEffects)) {
          throw new Error("Invalid response format from AI model");
        }
        
        // Ensure all numeric values are within valid ranges
        sideEffectProfile.overallRisk = Math.min(100, Math.max(0, sideEffectProfile.overallRisk));
        
        sideEffectProfile.sideEffects = sideEffectProfile.sideEffects.map(effect => {
          return {
            ...effect,
            likelihood: Math.min(100, Math.max(0, effect.likelihood)),
            severity: effect.severity || 'moderate',
            managementOptions: Array.isArray(effect.managementOptions) ? effect.managementOptions : [],
            preventativeMeasures: Array.isArray(effect.preventativeMeasures) ? effect.preventativeMeasures : [],
            riskFactors: Array.isArray(effect.riskFactors) ? effect.riskFactors : [],
            recommendedMonitoring: Array.isArray(effect.recommendedMonitoring) ? effect.recommendedMonitoring : [],
          };
        });
        
        return sideEffectProfile;
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.error("Raw response:", content);
        throw new Error("Failed to parse the side effect profile from AI response");
      }
      
    } catch (error) {
      console.error("Error in side effect analysis:", error);
      throw new Error(`Failed to analyze side effects: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Format patient characteristics into a readable string
   */
  private formatPatientProfile(characteristics: PatientCharacteristics): string {
    let profile = [];
    
    if (characteristics.age) profile.push(`Age: ${characteristics.age} years`);
    if (characteristics.gender) profile.push(`Gender: ${characteristics.gender}`);
    if (characteristics.performanceStatus) profile.push(`ECOG Performance Status: ${characteristics.performanceStatus}`);
    if (characteristics.height) profile.push(`Height: ${characteristics.height} cm`);
    if (characteristics.weight) profile.push(`Weight: ${characteristics.weight} kg`);
    
    if (characteristics.height && characteristics.weight) {
      const heightInMeters = characteristics.height / 100;
      const bmi = characteristics.weight / (heightInMeters * heightInMeters);
      profile.push(`BMI: ${bmi.toFixed(1)} kg/m²`);
    }
    
    if (characteristics.smokingStatus) profile.push(`Smoking Status: ${characteristics.smokingStatus}`);
    if (characteristics.alcoholUse) profile.push(`Alcohol Use: ${characteristics.alcoholUse}`);
    
    if (characteristics.comorbidities && characteristics.comorbidities.length > 0) {
      profile.push(`Comorbidities: ${characteristics.comorbidities.join(', ')}`);
    }
    
    if (characteristics.allergies && characteristics.allergies.length > 0) {
      profile.push(`Allergies: ${characteristics.allergies.join(', ')}`);
    }
    
    if (characteristics.currentMedications && characteristics.currentMedications.length > 0) {
      profile.push(`Current Medications: ${characteristics.currentMedications.join(', ')}`);
    }
    
    if (characteristics.priorAdverseReactions && characteristics.priorAdverseReactions.length > 0) {
      profile.push(`Prior Adverse Reactions: ${characteristics.priorAdverseReactions.join(', ')}`);
    }
    
    return profile.join('\n');
  }
}

export const sideEffectService = new SideEffectService();