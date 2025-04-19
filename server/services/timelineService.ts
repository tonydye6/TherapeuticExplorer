import OpenAI from 'openai';

export interface TimelinePhase {
  id: string;
  name: string;
  description: string;
  startDay: number;
  endDay: number;
  category: 'neoadjuvant' | 'surgery' | 'adjuvant' | 'monitoring' | 'recovery';
  milestones: TimelineMilestone[];
  sideEffects?: {
    common: string[];
    severe: string[];
    timing: string;
  };
}

export interface TimelineMilestone {
  id: string;
  name: string;
  description: string;
  day: number;
  category: 'treatment' | 'assessment' | 'recovery' | 'follow-up';
  important: boolean;
}

export interface TreatmentTimeline {
  treatmentName: string;
  treatmentType: string;
  duration: number; // total days
  phases: TimelinePhase[];
  disclaimer: string;
}

export interface PatientFactors {
  age?: number;
  performanceStatus?: string;
  comorbidities?: string[];
  stage?: string;
  previousTreatments?: string[];
}

/**
 * Service for generating treatment timelines
 */
export class TimelineService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate a treatment timeline for a specific esophageal cancer treatment
   */
  async generateTimeline(
    treatmentName: string,
    patientFactors?: PatientFactors
  ): Promise<TreatmentTimeline> {
    try {
      console.log(`Generating timeline for ${treatmentName}`);
      
      // Format patient factors for prompt
      const patientFactorsText = this.formatPatientFactors(patientFactors);
      
      const prompt = `
      As an oncologist specializing in esophageal cancer, generate a detailed treatment timeline for a patient receiving "${treatmentName}".

      ${patientFactorsText ? `Consider these patient factors:\n${patientFactorsText}\n` : ''}
      
      Include all relevant phases (neoadjuvant, surgery, adjuvant, recovery, monitoring) with appropriate timeframes.
      For each phase, include key milestones (treatments, assessments, recovery markers).
      Include expected side effects for treatment phases.
      Make timeline realistic and medically accurate for esophageal cancer treatment.
      
      Format your response as a detailed JSON object matching this TypeScript interface:
      
      interface TreatmentTimeline {
        treatmentName: string;
        treatmentType: string; // e.g., "multimodal", "surgical", "chemotherapy"
        duration: number; // total days
        phases: Array<{
          id: string; // unique identifier for this phase
          name: string;
          description: string;
          startDay: number;
          endDay: number;
          category: 'neoadjuvant' | 'surgery' | 'adjuvant' | 'monitoring' | 'recovery';
          milestones: Array<{
            id: string; // unique identifier for this milestone
            name: string;
            description: string;
            day: number;
            category: 'treatment' | 'assessment' | 'recovery' | 'follow-up';
            important: boolean; // flag for key milestones
          }>;
          sideEffects?: {
            common: string[];
            severe: string[];
            timing: string; // when side effects typically occur
          };
        }>;
        disclaimer: string; // medical disclaimer about timeline variability
      }
      
      For example, a multimodal approach might include phases for neoadjuvant chemoradiation, surgery, recovery, and adjuvant therapy.
      Make phase durations realistic (e.g., 5-6 weeks for neoadjuvant therapy, 1-2 days for surgery, 4-8 weeks for recovery, etc.).
      Ensure all IDs are unique strings.
      `;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert oncologist specializing in esophageal cancer treatment planning." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      
      if (!content) {
        throw new Error("Failed to get a valid response from the AI model");
      }
      
      try {
        const timeline: TreatmentTimeline = JSON.parse(content);
        
        // Validate the essential parts of the response
        if (!timeline.treatmentName || 
            !timeline.treatmentType || 
            typeof timeline.duration !== 'number' ||
            !Array.isArray(timeline.phases)) {
          throw new Error("Invalid timeline format from AI model");
        }

        // Ensure all phases and milestones have unique IDs
        const phaseIds = new Set();
        const milestoneIds = new Set();
        
        timeline.phases.forEach(phase => {
          if (phaseIds.has(phase.id)) {
            phase.id = `${phase.id}-${Math.random().toString(36).substr(2, 5)}`;
          }
          phaseIds.add(phase.id);
          
          phase.milestones?.forEach(milestone => {
            if (milestoneIds.has(milestone.id)) {
              milestone.id = `${milestone.id}-${Math.random().toString(36).substr(2, 5)}`;
            }
            milestoneIds.add(milestone.id);
          });
        });
        
        return timeline;
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.error("Raw response:", content);
        throw new Error("Failed to parse the treatment timeline from AI response");
      }
    } catch (error) {
      console.error("Error generating treatment timeline:", error);
      throw new Error(`Failed to generate treatment timeline: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Format patient factors into a readable string
   */
  private formatPatientFactors(factors?: PatientFactors): string {
    if (!factors) return "";
    
    const parts = [];
    
    if (factors.age) parts.push(`Age: ${factors.age} years`);
    if (factors.performanceStatus) parts.push(`Performance Status: ${factors.performanceStatus}`);
    if (factors.stage) parts.push(`Cancer Stage: ${factors.stage}`);
    
    if (factors.comorbidities && factors.comorbidities.length > 0) {
      parts.push(`Comorbidities: ${factors.comorbidities.join(', ')}`);
    }
    
    if (factors.previousTreatments && factors.previousTreatments.length > 0) {
      parts.push(`Previous Treatments: ${factors.previousTreatments.join(', ')}`);
    }
    
    return parts.join('\n');
  }
}

export const timelineService = new TimelineService();