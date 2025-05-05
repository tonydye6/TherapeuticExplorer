// Color mapping for different mood states
export const moodColors: Record<string, string> = {
  'excellent': 'bg-green-100 text-green-800',
  'good': 'bg-emerald-100 text-emerald-800',
  'neutral': 'bg-blue-100 text-blue-800',
  'fair': 'bg-amber-100 text-amber-800',
  'poor': 'bg-orange-100 text-orange-800',
  'terrible': 'bg-red-100 text-red-800',
  'anxious': 'bg-purple-100 text-purple-800',
  'depressed': 'bg-indigo-100 text-indigo-800',
  'tired': 'bg-gray-100 text-gray-800',
  'energetic': 'bg-cyan-100 text-cyan-800',
};

// Text descriptions for energy levels
export const energyLevelText: Record<number, string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Moderate',
  4: 'Good',
  5: 'Excellent'
};

// Text descriptions for pain levels
export const painLevelText: Record<number, string> = {
  0: 'None',
  1: 'Minimal',
  2: 'Mild',
  3: 'Uncomfortable',
  4: 'Moderate',
  5: 'Distracting',
  6: 'Distressing',
  7: 'Severe',
  8: 'Intense',
  9: 'Extreme',
  10: 'Unbearable'
};

// Text descriptions for sleep quality
export const sleepQualityText: Record<number, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Fair',
  4: 'Good',
  5: 'Excellent'
};

// Meal type options
export const mealTypes = [
  'Breakfast',
  'Morning Snack',
  'Lunch',
  'Afternoon Snack',
  'Dinner',
  'Evening Snack',
  'Other'
];

// Food categories for organization
export const foodCategories = [
  'Fruits',
  'Vegetables',
  'Proteins',
  'Grains',
  'Dairy',
  'Fats & Oils',
  'Sweets',
  'Beverages',
  'Other'
];

// Common symptoms for journal entries
export const commonSymptoms = [
  'Nausea',
  'Vomiting',
  'Fatigue',
  'Headache',
  'Dizziness',
  'Pain',
  'Fever',
  'Cough',
  'Shortness of breath',
  'Loss of appetite',
  'Weight loss',
  'Difficulty swallowing',
  'Heartburn',
  'Acid reflux',
  'Bloating',
  'Constipation',
  'Diarrhea',
  'Insomnia',
  'Anxiety',
  'Depression',
  'Skin rash',
  'Hair loss',
  'Numbness',
  'Tingling',
  'Weakness'
];

// Helper function to get a color based on a numerical value (e.g., for pain levels)
export function getValueColor(value: number, max: number = 10, reverse: boolean = false): string {
  // Normalize the value to a 0-1 range
  const normalizedValue = value / max;
  
  // If reverse is true, invert the scale (e.g., for pain, higher is worse)
  const effectiveValue = reverse ? 1 - normalizedValue : normalizedValue;
  
  if (effectiveValue >= 0.8) return 'bg-green-100 text-green-800';
  if (effectiveValue >= 0.6) return 'bg-emerald-100 text-emerald-800';
  if (effectiveValue >= 0.4) return 'bg-amber-100 text-amber-800';
  if (effectiveValue >= 0.2) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}
