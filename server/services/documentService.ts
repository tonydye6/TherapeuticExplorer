// This service handles document processing and analysis functionality
// It extracts information from medical documents and provides structured data

import { ModelType } from "@shared/schema";

// Types for document processing
export type DocumentAnalysisResult = {
  entities: {
    type: string;
    text: string;
    start: number;
    end: number;
    category: string;
  }[];
  keyInfo: {
    labValues?: Record<string, number | string | null>;
    diagnoses?: string[];
    medications?: string[];
    procedures?: string[];
    dates?: {
      type: string;
      date: string;
    }[];
    healthMetrics?: Record<string, number | null>;
  };
  summary: string;
  sourceType: string;
};

// Sample lab report structure for reference
export type LabReport = {
  patientInfo: {
    name: string;
    id: string;
    dob: string;
  };
  testInfo: {
    date: string;
    orderedBy: string;
    labId: string;
  };
  results: {
    name: string;
    value: number | string;
    unit: string;
    referenceRange: string;
    flag?: "H" | "L" | "N";
  }[];
};

class DocumentService {
  // Analyze a document and extract structured information
  async analyzeDocument(content: string): Promise<DocumentAnalysisResult> {
    console.log("Analyzing document content");
    
    // In a real implementation, this would use models like BioBERT or Claude to extract information
    // For this prototype, we'll use simplified analysis

    // Determine document type
    const docType = this.classifyDocumentType(content);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Extract entities using simplified approach
    const entities = this.extractEntities(content);
    
    // Extract key information based on document type
    const keyInfo = this.extractKeyInformation(content, docType);
    
    // Generate summary
    const summary = this.generateSummary(content, docType, entities, keyInfo);
    
    return {
      entities,
      keyInfo,
      summary,
      sourceType: docType
    };
  }
  
  // Classify document type based on content
  private classifyDocumentType(content: string): string {
    const lowerContent = content.toLowerCase();
    
    if (
      lowerContent.includes("lab") || 
      lowerContent.includes("test results") || 
      lowerContent.includes("laboratory report") ||
      lowerContent.includes("cbc") || 
      lowerContent.includes("complete blood count") ||
      lowerContent.includes("chemistry panel") ||
      lowerContent.includes("reference range")
    ) {
      return "lab_report";
    }
    
    if (
      lowerContent.includes("ct scan") || 
      lowerContent.includes("mri") || 
      lowerContent.includes("pet") || 
      lowerContent.includes("imaging") ||
      lowerContent.includes("radiology") ||
      lowerContent.includes("ultrasound") ||
      lowerContent.includes("impression:") ||
      lowerContent.includes("findings:")
    ) {
      return "imaging";
    }
    
    if (
      lowerContent.includes("progress note") || 
      lowerContent.includes("follow-up") || 
      lowerContent.includes("physical examination") ||
      lowerContent.includes("assessment") ||
      lowerContent.includes("plan:") ||
      lowerContent.includes("chief complaint:")
    ) {
      return "notes";
    }
    
    if (
      lowerContent.includes("isbn") || 
      lowerContent.includes("chapter") || 
      lowerContent.includes("book") ||
      lowerContent.includes("edition") ||
      lowerContent.includes("copyright") ||
      lowerContent.includes("published")
    ) {
      return "book";
    }
    
    // Default to "other" if no clear match
    return "other";
  }
  
  // Extract entities from document text
  private extractEntities(content: string): DocumentAnalysisResult["entities"] {
    const entities: DocumentAnalysisResult["entities"] = [];
    
    // Simple pattern matching for common medical entities
    // In a real implementation, this would use NER models
    
    // Match medications (simplified)
    const medicationPatterns = [
      /(\w+umab)/g, // monoclonal antibodies
      /(\w+tinib)/g, // tyrosine kinase inhibitors
      /(\w+ciclib)/g, // CDK inhibitors
      /(\w+olimus)/g, // mTOR inhibitors
      /(\w+afenib)/g, // EGFR inhibitors
      /(5-FU|5-fluorouracil)/gi,
      /(carboplatin|cisplatin)/gi,
      /(docetaxel|paclitaxel)/gi,
      /(rituximab|trastuzumab)/gi
    ];
    
    medicationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        entities.push({
          type: "medication",
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          category: "medication"
        });
      }
    });
    
    // Match lab values (simplified)
    const labPatterns = [
      /(hemoglobin|hgb|hb)[\s:]+([\d\.]+)(\s*g\/dl)/gi,
      /(white blood cell count|wbc)[\s:]+([\d\.]+)(\s*k\/μl|\s*k\/ul|\s*10\^3\/μl)/gi,
      /(platelet count|platelets|plt)[\s:]+([\d\.]+)(\s*k\/μl|\s*k\/ul|\s*10\^3\/μl)/gi,
      /(creatinine|cr)[\s:]+([\d\.]+)(\s*mg\/dl)/gi,
      /(blood urea nitrogen|bun)[\s:]+([\d\.]+)(\s*mg\/dl)/gi,
      /(alanine aminotransferase|alt)[\s:]+([\d\.]+)(\s*u\/l)/gi,
      /(aspartate aminotransferase|ast)[\s:]+([\d\.]+)(\s*u\/l)/gi
    ];
    
    labPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        entities.push({
          type: "lab_value",
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          category: "lab_value"
        });
      }
    });
    
    // Match diagnoses (simplified)
    const diagnosisPatterns = [
      /(esophageal (?:cancer|carcinoma|adenocarcinoma|squamous cell carcinoma|scc))/gi,
      /(metastatic (?:cancer|carcinoma|disease))/gi,
      /(stage [I|II|III|IV][A-C]?)/gi,
      /(liver metastasis|lung metastasis|bone metastasis|metastasis to (?:the )?(?:liver|lung|bone|brain))/gi
    ];
    
    diagnosisPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        entities.push({
          type: "diagnosis",
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          category: "diagnosis"
        });
      }
    });
    
    // Match procedures (simplified)
    const procedurePatterns = [
      /(endoscopy|egd|esophagogastroduodenoscopy)/gi,
      /(ct scan|pet scan|mri)/gi,
      /(biopsy|fine needle aspiration|fna)/gi,
      /(esophagectomy|gastrectomy)/gi,
      /(radiation therapy|radiotherapy|external beam radiation)/gi,
      /(chemotherapy|immunotherapy)/gi
    ];
    
    procedurePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        entities.push({
          type: "procedure",
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          category: "procedure"
        });
      }
    });
    
    return entities;
  }
  
  // Extract structured key information from document
  private extractKeyInformation(content: string, docType: string): DocumentAnalysisResult["keyInfo"] {
    const keyInfo: DocumentAnalysisResult["keyInfo"] = {};
    
    // Extract information based on document type
    if (docType === "lab_report") {
      // Extract lab values
      keyInfo.labValues = this.extractLabValues(content);
    } 
    else if (docType === "imaging") {
      // Extract diagnoses and key findings
      keyInfo.diagnoses = this.extractDiagnosesFromImaging(content);
    }
    else if (docType === "notes") {
      // Extract diagnoses, medications, and procedures
      keyInfo.diagnoses = this.extractDiagnosesFromNotes(content);
      keyInfo.medications = this.extractMedicationsFromNotes(content);
      keyInfo.procedures = this.extractProceduresFromNotes(content);
      keyInfo.healthMetrics = this.extractHealthMetrics(content);
    }
    
    // Extract dates from all document types
    keyInfo.dates = this.extractDates(content);
    
    return keyInfo;
  }
  
  // Extract lab values from lab report
  private extractLabValues(content: string): Record<string, number | string | null> {
    const labValues: Record<string, number | string | null> = {};
    
    // Simple pattern matching for common lab tests
    const labTests = [
      { name: "hemoglobin", pattern: /(hemoglobin|hgb|hb)[\s:]+([\d\.]+)(\s*g\/dl)/i },
      { name: "wbc", pattern: /(white blood cell count|wbc)[\s:]+([\d\.]+)(\s*k\/μl|\s*k\/ul|\s*10\^3\/μl)/i },
      { name: "platelets", pattern: /(platelet count|platelets|plt)[\s:]+([\d\.]+)(\s*k\/μl|\s*k\/ul|\s*10\^3\/μl)/i },
      { name: "creatinine", pattern: /(creatinine|cr)[\s:]+([\d\.]+)(\s*mg\/dl)/i },
      { name: "bun", pattern: /(blood urea nitrogen|bun)[\s:]+([\d\.]+)(\s*mg\/dl)/i },
      { name: "alt", pattern: /(alanine aminotransferase|alt)[\s:]+([\d\.]+)(\s*u\/l)/i },
      { name: "ast", pattern: /(aspartate aminotransferase|ast)[\s:]+([\d\.]+)(\s*u\/l)/i },
      { name: "ca19_9", pattern: /(ca 19-9|ca19-9|ca19_9)[\s:]+([\d\.]+)(\s*u\/ml)/i },
      { name: "cea", pattern: /(carcinoembryonic antigen|cea)[\s:]+([\d\.]+)(\s*ng\/ml)/i },
      { name: "albumin", pattern: /(albumin|alb)[\s:]+([\d\.]+)(\s*g\/dl)/i },
      { name: "total_bilirubin", pattern: /(total bilirubin|tbili)[\s:]+([\d\.]+)(\s*mg\/dl)/i }
    ];
    
    labTests.forEach(test => {
      const match = test.pattern.exec(content);
      if (match) {
        labValues[test.name] = parseFloat(match[2]);
      }
    });
    
    return labValues;
  }
  
  // Extract diagnoses from imaging reports
  private extractDiagnosesFromImaging(content: string): string[] {
    const diagnoses: string[] = [];
    
    // Look for diagnoses in impression or findings sections
    const impressionMatch = /IMPRESSION:|Impression:|FINDINGS:|Findings:/i.exec(content);
    
    if (impressionMatch) {
      const startIndex = impressionMatch.index + impressionMatch[0].length;
      const endIndex = content.indexOf("\n\n", startIndex);
      const impressionText = content.substring(startIndex, endIndex > startIndex ? endIndex : undefined);
      
      // Split impression text into separate findings
      const findings = impressionText.split(/\d+\.|•/).filter(f => f.trim().length > 0);
      findings.forEach(finding => {
        const trimmedFinding = finding.trim();
        if (trimmedFinding.length > 10) {  // Skip very short entries
          diagnoses.push(trimmedFinding);
        }
      });
    }
    
    return diagnoses;
  }
  
  // Extract diagnoses from clinical notes
  private extractDiagnosesFromNotes(content: string): string[] {
    const diagnoses: string[] = [];
    
    // Look for diagnosis/assessment section
    const diagnosisHeaderPatterns = [
      /DIAGNOSIS:|Diagnosis:|ASSESSMENT:|Assessment:|IMPRESSION:|Impression:/i,
      /PROBLEM LIST:|Problem List:/i
    ];
    
    for (const pattern of diagnosisHeaderPatterns) {
      const match = pattern.exec(content);
      if (match) {
        const startIndex = match.index + match[0].length;
        const endIndex = content.indexOf("\n\n", startIndex);
        const diagnosisText = content.substring(startIndex, endIndex > startIndex ? endIndex : undefined);
        
        // Split diagnoses by line or numbered items
        const diagnosisList = diagnosisText.split(/\n|\d+\.|\*|\•/).filter(d => d.trim().length > 0);
        diagnosisList.forEach(diagnosis => {
          const trimmedDiagnosis = diagnosis.trim();
          if (trimmedDiagnosis.length > 5) {  // Skip very short entries
            diagnoses.push(trimmedDiagnosis);
          }
        });
        
        // If we found diagnoses, return them
        if (diagnoses.length > 0) {
          return diagnoses;
        }
      }
    }
    
    return diagnoses;
  }
  
  // Extract medications from clinical notes
  private extractMedicationsFromNotes(content: string): string[] {
    const medications: string[] = [];
    
    // Look for medications section
    const medicationHeaderPatterns = [
      /MEDICATIONS:|Medications:|MEDICATION LIST:|Medication List:|CURRENT MEDICATIONS:|Current Medications:/i
    ];
    
    for (const pattern of medicationHeaderPatterns) {
      const match = pattern.exec(content);
      if (match) {
        const startIndex = match.index + match[0].length;
        const endIndex = content.indexOf("\n\n", startIndex);
        const medicationText = content.substring(startIndex, endIndex > startIndex ? endIndex : undefined);
        
        // Split medications by line or bullet points
        const medicationList = medicationText.split(/\n|\d+\.|\*|\•/).filter(m => m.trim().length > 0);
        medicationList.forEach(medication => {
          const trimmedMedication = medication.trim();
          if (trimmedMedication.length > 3) {  // Skip very short entries
            medications.push(trimmedMedication);
          }
        });
        
        // If we found medications, return them
        if (medications.length > 0) {
          return medications;
        }
      }
    }
    
    return medications;
  }
  
  // Extract procedures from clinical notes
  private extractProceduresFromNotes(content: string): string[] {
    const procedures: string[] = [];
    
    // Look for procedures section
    const procedureHeaderPatterns = [
      /PROCEDURES:|Procedures:|PROCEDURE LIST:|Procedure List:|SURGICAL HISTORY:|Surgical History:/i
    ];
    
    for (const pattern of procedureHeaderPatterns) {
      const match = pattern.exec(content);
      if (match) {
        const startIndex = match.index + match[0].length;
        const endIndex = content.indexOf("\n\n", startIndex);
        const procedureText = content.substring(startIndex, endIndex > startIndex ? endIndex : undefined);
        
        // Split procedures by line or bullet points
        const procedureList = procedureText.split(/\n|\d+\.|\*|\•/).filter(p => p.trim().length > 0);
        procedureList.forEach(procedure => {
          const trimmedProcedure = procedure.trim();
          if (trimmedProcedure.length > 5) {  // Skip very short entries
            procedures.push(trimmedProcedure);
          }
        });
        
        // If we found procedures, return them
        if (procedures.length > 0) {
          return procedures;
        }
      }
    }
    
    return procedures;
  }
  
  // Extract dates from document
  private extractDates(content: string): { type: string; date: string }[] {
    const dates: { type: string; date: string }[] = [];
    
    // Match common date formats with labels
    const datePatterns = [
      { type: "document_date", pattern: /(date of report|report date|date)[\s:]+((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2},? \d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i },
      { type: "service_date", pattern: /(date of service|service date)[\s:]+((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2},? \d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i },
      { type: "collection_date", pattern: /(date collected|collection date|collected on)[\s:]+((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2},? \d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i },
      { type: "diagnosis_date", pattern: /(date of diagnosis|diagnosed on)[\s:]+((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2},? \d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i },
      { type: "procedure_date", pattern: /(procedure date|date of procedure|performed on)[\s:]+((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2},? \d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i }
    ];
    
    datePatterns.forEach(dateDef => {
      const match = dateDef.pattern.exec(content);
      if (match) {
        dates.push({
          type: dateDef.type,
          date: match[2]
        });
      }
    });
    
    // If we didn't find any specific dates, look for any dates in the document
    if (dates.length === 0) {
      const genericDatePattern = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2},? \d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi;
      
      let match;
      while ((match = genericDatePattern.exec(content)) !== null) {
        // Only add if it's in a reasonable format
        if (match[1].length >= 8) {
          dates.push({
            type: "unknown_date",
            date: match[1]
          });
        }
      }
    }
    
    return dates;
  }
  
  // Extract health metrics from clinical notes
  private extractHealthMetrics(content: string): Record<string, number | null> {
    const metrics: Record<string, number | null> = {
      weight: null,
      temperature: null,
      bloodPressureSystolic: null,
      bloodPressureDiastolic: null,
      heartRate: null,
      oxygenSaturation: null,
    };
    
    // Weight in kg or lbs
    const weightMatch = content.match(/weight[:\s]+(\d+\.?\d*)\s*(kg|lbs?)/i);
    if (weightMatch) {
      let weight = parseFloat(weightMatch[1]);
      // Convert lbs to kg if needed
      if (weightMatch[2].toLowerCase().startsWith('lb')) {
        weight = weight * 0.453592;
      }
      metrics.weight = weight;
    }
    
    // Temperature in C or F
    const tempMatch = content.match(/temp(?:erature)?[:\s]+(\d+\.?\d*)[°\s]*(C|F)/i);
    if (tempMatch) {
      let temp = parseFloat(tempMatch[1]);
      // Convert F to C if needed
      if (tempMatch[2].toUpperCase() === 'F') {
        temp = (temp - 32) * 5/9;
      }
      metrics.temperature = temp;
    }
    
    // Blood pressure
    const bpMatch = content.match(/(?:blood pressure|BP)[:\s]+(\d+)[\/\\](\d+)/i);
    if (bpMatch) {
      metrics.bloodPressureSystolic = parseInt(bpMatch[1]);
      metrics.bloodPressureDiastolic = parseInt(bpMatch[2]);
    }
    
    // Heart rate
    const hrMatch = content.match(/(?:heart rate|pulse|HR)[:\s]+(\d+)/i);
    if (hrMatch) {
      metrics.heartRate = parseInt(hrMatch[1]);
    }
    
    // Oxygen saturation
    const o2Match = content.match(/(?:oxygen saturation|O2 sat|SpO2)[:\s]+(\d+)%?/i);
    if (o2Match) {
      metrics.oxygenSaturation = parseInt(o2Match[1]);
    }
    
    return metrics;
  }
  
  // Generate a summary of the document
  private generateSummary(
    content: string, 
    docType: string, 
    entities: DocumentAnalysisResult["entities"],
    keyInfo: DocumentAnalysisResult["keyInfo"]
  ): string {
    // In a real implementation, this would use an LLM to generate a summary
    // For this prototype, we'll create a templated summary based on document type
    
    if (docType === "lab_report") {
      return this.generateLabReportSummary(keyInfo);
    } else if (docType === "imaging") {
      return this.generateImagingSummary(keyInfo);
    } else if (docType === "notes") {
      return this.generateNotesSummary(keyInfo);
    } else if (docType === "book") {
      return "Book excerpt containing medical information related to cancer treatment. The passage contains technical medical terminology and should be reviewed in context with a healthcare provider.";
    } else {
      return "Document contains medical information that has been analyzed to extract key details.";
    }
  }
  
  // Generate summary for lab report
  private generateLabReportSummary(keyInfo: DocumentAnalysisResult["keyInfo"]): string {
    if (!keyInfo.labValues || Object.keys(keyInfo.labValues).length === 0) {
      return "Lab report document with no clear test values extracted.";
    }
    
    const labValues = keyInfo.labValues;
    let abnormalValues: string[] = [];
    
    // Check for abnormal values (this is simplified)
    if (labValues.hemoglobin !== undefined && labValues.hemoglobin < 12) {
      abnormalValues.push(`low hemoglobin (${labValues.hemoglobin} g/dL)`);
    }
    
    if (labValues.wbc !== undefined && (labValues.wbc < 4 || labValues.wbc > 11)) {
      abnormalValues.push(`abnormal white blood cell count (${labValues.wbc} K/μL)`);
    }
    
    if (labValues.platelets !== undefined && labValues.platelets < 150) {
      abnormalValues.push(`low platelet count (${labValues.platelets} K/μL)`);
    }
    
    // Create summary based on findings
    let summary = "Lab report document";
    
    // Add date if available
    if (keyInfo.dates && keyInfo.dates.length > 0) {
      summary += ` from ${keyInfo.dates[0].date}`;
    }
    
    // Add summary of findings
    if (abnormalValues.length > 0) {
      summary += ` showing ${abnormalValues.join(", ")}.`;
    } else {
      summary += " with results extracted. No clearly abnormal values identified from automatic extraction.";
    }
    
    return summary;
  }
  
  // Generate summary for imaging report
  private generateImagingSummary(keyInfo: DocumentAnalysisResult["keyInfo"]): string {
    if (!keyInfo.diagnoses || keyInfo.diagnoses.length === 0) {
      return "Imaging report document with no clear findings extracted.";
    }
    
    let summary = "Imaging report";
    
    // Add date if available
    if (keyInfo.dates && keyInfo.dates.length > 0) {
      summary += ` from ${keyInfo.dates[0].date}`;
    }
    
    // Add findings
    if (keyInfo.diagnoses.length === 1) {
      summary += ` showing: ${keyInfo.diagnoses[0]}`;
    } else if (keyInfo.diagnoses.length > 1) {
      summary += " with key findings:";
      keyInfo.diagnoses.forEach((finding, index) => {
        if (index < 3) { // Only include the first 3 findings to keep it concise
          summary += `\n- ${finding}`;
        }
      });
      
      if (keyInfo.diagnoses.length > 3) {
        summary += `\n- Plus ${keyInfo.diagnoses.length - 3} additional findings`;
      }
    }
    
    return summary;
  }
  
  // Generate summary for clinical notes
  private generateNotesSummary(keyInfo: DocumentAnalysisResult["keyInfo"]): string {
    let summary = "Clinical note";
    
    // Add date if available
    if (keyInfo.dates && keyInfo.dates.length > 0) {
      summary += ` from ${keyInfo.dates[0].date}`;
    }
    
    // Add diagnoses
    if (keyInfo.diagnoses && keyInfo.diagnoses.length > 0) {
      summary += "\nDiagnoses:";
      keyInfo.diagnoses.forEach((diagnosis, index) => {
        if (index < 3) { // Only include the first 3 diagnoses to keep it concise
          summary += `\n- ${diagnosis}`;
        }
      });
      
      if (keyInfo.diagnoses.length > 3) {
        summary += `\n- Plus ${keyInfo.diagnoses.length - 3} additional diagnoses`;
      }
    }
    
    // Add medications
    if (keyInfo.medications && keyInfo.medications.length > 0) {
      summary += "\nMedications:";
      keyInfo.medications.forEach((medication, index) => {
        if (index < 3) { // Only include the first 3 medications to keep it concise
          summary += `\n- ${medication}`;
        }
      });
      
      if (keyInfo.medications.length > 3) {
        summary += `\n- Plus ${keyInfo.medications.length - 3} additional medications`;
      }
    }
    
    // Add procedures
    if (keyInfo.procedures && keyInfo.procedures.length > 0) {
      summary += "\nProcedures:";
      keyInfo.procedures.forEach((procedure, index) => {
        if (index < 3) { // Only include the first 3 procedures to keep it concise
          summary += `\n- ${procedure}`;
        }
      });
      
      if (keyInfo.procedures.length > 3) {
        summary += `\n- Plus ${keyInfo.procedures.length - 3} additional procedures`;
      }
    }
    
    return summary;
  }
  
  // Process a book excerpt
  async processBookExcerpt(title: string, content: string): Promise<any> {
    console.log(`Processing book excerpt: ${title}`);
    
    // In a real implementation, this would use Claude or GPT-4 to analyze the book
    // For this prototype, we'll return a simple analysis
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      title,
      summary: "This book excerpt discusses treatment approaches for esophageal cancer...",
      keyTopics: [
        "Surgical interventions",
        "Chemotherapy protocols",
        "Radiation therapy",
        "Survival statistics",
        "Quality of life considerations"
      ],
      relevanceScore: 85, // 0-100
      contentType: "technical", // technical, patient-oriented, research
      readingLevel: "advanced" // basic, intermediate, advanced
    };
  }
}

export const documentService = new DocumentService();
