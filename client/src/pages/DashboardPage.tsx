
// client/src/pages/DashboardPage.tsx

import React from 'react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { Loader2, Palette } from 'lucide-react';
import { Greeting } from '@/components/dashboard/Greeting';
import { TodaysFocus } from '@/components/dashboard/TodaysFocus';
import { JournalPrompt } from '@/components/dashboard/JournalPrompt';
import { HopeSnippet } from '@/components/dashboard/HopeSnippet';
import { Link } from 'wouter';

export default function DashboardPage() {
  const {
    userData,
    upcomingPlanItems,
    isLoading,
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4">
        <Loader2 className="h-16 w-16 animate-spin text-sophera-brand-primary mb-6" />
        <h3 className="text-xl font-semibold text-sophera-text-heading mb-2">
          Loading your dashboard...
        </h3>
        <p className="text-sophera-text-body text-center max-w-xs">
          Gathering your latest information to personalize your Sophera experience.
        </p>
      </div>
    );
  }

  const displayName = userData?.displayName || userData?.username || 'User';

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8 md:mb-10">
        <Greeting userName={displayName} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <TodaysFocus planItems={upcomingPlanItems} isLoading={isLoading} />
          <JournalPrompt />
        </div>

        <div className="lg:col-span-1 space-y-6 md:space-y-8">
          <HopeSnippet />
          
          {/* Neo Brutalism Demo Link */}
          <div className="bg-white rounded-xl border border-sophera-border-primary p-6 shadow-sm">
            <h3 className="text-lg font-bold text-sophera-text-heading mb-3 flex items-center">
              <Palette className="h-5 w-5 mr-2 text-sophera-brand-primary" />
              Design System
            </h3>
            <p className="text-sophera-text-body mb-4">
              Check out our new Neo Brutalism Design components with exaggerated shadows, playful elements, and bold styling.
            </p>
            <Link href="/design">
              <div className="inline-flex items-center px-4 py-2 bg-sophera-brand-primary text-white font-medium rounded-lg hover:bg-sophera-brand-primary-dark transition-colors cursor-pointer">
                View Design System
                <span className="ml-2">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
