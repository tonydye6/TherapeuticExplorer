import React from 'react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { Loader2 } from 'lucide-react';
import { Greeting } from '@/components/dashboard/Greeting';
import { TodaysFocus } from '@/components/dashboard/TodaysFocus';
import { JournalPrompt } from '@/components/dashboard/JournalPrompt';
import { HopeSnippet } from '@/components/dashboard/HopeSnippet';

export default function DashboardPage() {
  const {
    userData,
    upcomingPlanItems,
    isLoading,
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-medium">Loading your dashboard...</h3>
        <p className="text-gray-500">We're gathering your latest information</p>
      </div>
    );
  }

  const displayName = userData && (userData.displayName || userData.username) || 'User';

  return (
    <div className="container max-w-4xl py-8 px-4 md:px-8">
      {/* Greeting */}
      <Greeting userName={displayName} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          {/* Today's Focus Section */}
          <TodaysFocus planItems={upcomingPlanItems} isLoading={isLoading} />
          
          {/* Journal Prompt Section */}
          <JournalPrompt />
        </div>
        
        {/* Right Column */}
        <div>
          {/* Hope Snippet Section */}
          <HopeSnippet />
          
          {/* Designed to be extendable with more components like quick actions, etc. */}
        </div>
      </div>
    </div>
  );
}
