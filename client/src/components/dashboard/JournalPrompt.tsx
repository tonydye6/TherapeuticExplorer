import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenIcon } from 'lucide-react';
import { Link } from 'wouter';

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
    <Card className="mb-6 bg-primary-50 border-primary-100">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <BookOpenIcon className="h-8 w-8 text-primary mb-3" />
          <h3 className="text-lg font-medium mb-2 text-primary-900">{getTodaysPrompt()}</h3>
          <p className="text-sm text-gray-600 mb-4">
            Taking a moment to reflect can help track your healing journey.
          </p>
          <Link href="/journal-logs">
            <Button className="gap-2">
              <BookOpenIcon className="h-4 w-4" />
              Add Journal Entry
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
