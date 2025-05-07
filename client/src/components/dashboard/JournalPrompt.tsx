import React from 'react';
import { FileText } from 'lucide-react';

const PROMPTS = [
  "How are you feeling today?",
  "What's one small victory you had today?",
  "How is your energy level today?",
  "What's one thing you're grateful for today?",
  "What's one challenge you faced today?",
  "How did you practice self-care today?",
  "What symptoms are you experiencing today?",
  "How did you sleep last night?",
  "What's one positive thought you had today?",
  "How is your pain level today?"
];

export function JournalPrompt() {
  // Get a random prompt based on the day so it stays consistent throughout the day
  const getTodaysPrompt = () => {
    const day = new Date().getDate();
    return PROMPTS[day % PROMPTS.length];
  };

  return (
    <div className="flex flex-col items-center text-center">
      <FileText className="h-8 w-8 text-sophera-brand-primary mb-3" />
      <h3 className="text-lg font-medium mb-2 text-sophera-text-heading">{getTodaysPrompt()}</h3>
      <p className="text-sm text-sophera-text-body mb-4">
        Taking a moment to reflect can help track your healing journey.
      </p>
    </div>
  );
}
