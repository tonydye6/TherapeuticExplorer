// This file contains utility functions for working with medical data
// These functions are used on the client-side, but the actual data fetching
// happens on the server side via API calls

// Normalize medical terminology
export function normalizeMedicalTerm(term: string): string {
  // Convert to lowercase for comparison
  const lowerTerm = term.toLowerCase();
  
  // Common abbreviations and their expansions
  const abbreviations: Record<string, string> = {
    'ct': 'computed tomography',
    'mri': 'magnetic resonance imaging',
    'pet': 'positron emission tomography',
    'gi': 'gastrointestinal',
    'ec': 'esophageal cancer',
    'chemo': 'chemotherapy',
    'rad': 'radiation therapy',
    'rad onc': 'radiation oncology',
    'onc': 'oncology',
    'pd-l1': 'programmed death-ligand 1',
    'pd-1': 'programmed death-1',
    'her2': 'human epidermal growth factor receptor 2',
    'iv': 'intravenous',
    'po': 'by mouth',
    'prn': 'as needed',
    'qd': 'once daily',
    'bid': 'twice daily',
    'tid': 'three times daily',
    'qid': 'four times daily',
  };
  
  // Return the expanded form if it's an abbreviation
  if (abbreviations[lowerTerm]) {
    return abbreviations[lowerTerm];
  }
  
  return term;
}

// Format clinical trial phase
export function formatTrialPhase(phase: string): string {
  if (!phase) return 'Unknown Phase';
  
  // Handle "Phase 1/Phase 2" format
  if (phase.includes('/')) {
    return phase.split('/').map(p => formatTrialPhase(p)).join('/');
  }
  
  // Extract numeric part from "Phase X" or just "X"
  const phaseNumber = phase.match(/\d+/);
  if (phaseNumber) {
    return `Phase ${phaseNumber[0]}`;
  }
  
  // Check for early phase
  if (phase.toLowerCase().includes('early')) {
    return 'Early Phase';
  }
  
  return phase;
}

// Calculate match score for clinical trials
export function calculateTrialMatchScore(
  trial: any,
  patientProfile: {
    diagnosis: string;
    stage: string;
    age: number;
    priorTreatments: string[];
    location?: { lat: number; lng: number };
  }
): number {
  // This is a simplified version for the client side
  // The actual matching algorithm runs on the server
  
  let score = 70; // Base score
  
  // Check if diagnosis matches
  if (trial.conditions.some((c: string) => 
    c.toLowerCase().includes(patientProfile.diagnosis.toLowerCase()))) {
    score += 15;
  } else {
    score -= 40; // Major mismatch
  }
  
  // Check if stage is explicitly mentioned
  if (trial.eligibilityCriteria && 
      trial.eligibilityCriteria.toLowerCase().includes(patientProfile.stage.toLowerCase())) {
    score += 10;
  }
  
  // Location proximity bonus
  if (patientProfile.location && trial.distance) {
    if (trial.distance < 25) score += 5;
    else if (trial.distance > 100) score -= 5;
  }
  
  // Cap the score between 0-100
  return Math.min(100, Math.max(0, score));
}

// Format evidence level strings
export function formatEvidenceLevel(level: string): 'high' | 'medium' | 'low' {
  if (!level) return 'low';
  
  const lowerLevel = level.toLowerCase();
  
  if (lowerLevel.includes('high') || lowerLevel.includes('strong') || lowerLevel.includes('1a') || lowerLevel.includes('1b')) {
    return 'high';
  }
  
  if (lowerLevel.includes('moderate') || lowerLevel.includes('medium') || lowerLevel.includes('2a') || lowerLevel.includes('2b')) {
    return 'medium';
  }
  
  return 'low';
}

// Classify medical document types
export function classifyMedicalDocument(title: string, content: string): string {
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  if (
    lowerTitle.includes('lab') || 
    lowerTitle.includes('test') || 
    lowerContent.includes('lab results') ||
    lowerContent.includes('laboratory')
  ) {
    return 'lab_report';
  }
  
  if (
    lowerTitle.includes('ct') || 
    lowerTitle.includes('mri') || 
    lowerTitle.includes('pet') || 
    lowerTitle.includes('scan') ||
    lowerTitle.includes('imaging') ||
    lowerTitle.includes('ultrasound') ||
    lowerTitle.includes('x-ray')
  ) {
    return 'imaging';
  }
  
  if (
    lowerTitle.includes('note') || 
    lowerTitle.includes('visit') || 
    lowerTitle.includes('consult') ||
    lowerTitle.includes('assessment')
  ) {
    return 'notes';
  }
  
  if (
    lowerTitle.includes('book') || 
    lowerTitle.includes('chapter') || 
    lowerContent.includes('isbn')
  ) {
    return 'book';
  }
  
  return 'other';
}

// Extract key health metrics from text
export function extractHealthMetrics(text: string): Record<string, number | null> {
  const metrics: Record<string, number | null> = {
    weight: null,
    temperature: null,
    bloodPressureSystolic: null,
    bloodPressureDiastolic: null,
    heartRate: null,
    oxygenSaturation: null,
  };
  
  // Weight in kg or lbs
  const weightMatch = text.match(/weight[:\s]+(\d+\.?\d*)\s*(kg|lbs?)/i);
  if (weightMatch) {
    let weight = parseFloat(weightMatch[1]);
    // Convert lbs to kg if needed
    if (weightMatch[2].toLowerCase().startsWith('lb')) {
      weight = weight * 0.453592;
    }
    metrics.weight = weight;
  }
  
  // Temperature in C or F
  const tempMatch = text.match(/temp(?:erature)?[:\s]+(\d+\.?\d*)[°\s]*(C|F)/i);
  if (tempMatch) {
    let temp = parseFloat(tempMatch[1]);
    // Convert F to C if needed
    if (tempMatch[2].toUpperCase() === 'F') {
      temp = (temp - 32) * 5/9;
    }
    metrics.temperature = temp;
  }
  
  // Blood pressure
  const bpMatch = text.match(/(?:blood pressure|BP)[:\s]+(\d+)[\/\\](\d+)/i);
  if (bpMatch) {
    metrics.bloodPressureSystolic = parseInt(bpMatch[1]);
    metrics.bloodPressureDiastolic = parseInt(bpMatch[2]);
  }
  
  // Heart rate
  const hrMatch = text.match(/(?:heart rate|pulse|HR)[:\s]+(\d+)/i);
  if (hrMatch) {
    metrics.heartRate = parseInt(hrMatch[1]);
  }
  
  // Oxygen saturation
  const o2Match = text.match(/(?:oxygen saturation|O2 sat|SpO2)[:\s]+(\d+)%?/i);
  if (o2Match) {
    metrics.oxygenSaturation = parseInt(o2Match[1]);
  }
  
  return metrics;
}
