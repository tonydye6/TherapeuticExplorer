
// client/src/pages/DashboardPage.tsx

import React from 'react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { 
  Loader2,
  Home, 
  CalendarCheck, 
  FileText, 
  Heart,
  BrainCircuit,
  Map,
  Grid
} from 'lucide-react';
//
import { TodaysFocus } from '@/components/dashboard/TodaysFocus';
import { JournalPrompt } from '@/components/dashboard/JournalPrompt';
import { HopeSnippet } from '@/components/dashboard/HopeSnippet';
import { AnalyzeAndAct } from '@/components/dashboard/AnalyzeAndAct';
import { Link } from 'wouter';
import { NeoPageHeader } from '@/components/ui/neo-page-header';
import { 
  NeoCard, 
  NeoCardContent, 
  NeoCardHeader, 
  NeoCardTitle,
  NeoCardDescription,
  NeoCardFooter,
  NeoCardDecoration,
  NeoCardBadge
} from '@/components/ui/neo-card';
import { NeoButton } from '@/components/ui/neo-button';

export default function DashboardPage() {
  const {
    userData,
    upcomingPlanItems,
    isLoading,
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 w-full h-full bg-sophera-brand-primary border-4 border-black rounded-2xl animate-pulse"></div>
          <div className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] bg-white border-4 border-black rounded-xl flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-sophera-brand-primary" />
          </div>
          <div className="absolute bottom-[-0.5rem] right-[-0.5rem] w-6 h-6 bg-sophera-accent-secondary transform rotate-12 border-2 border-black"></div>
        </div>
        <div className="relative border-4 border-black rounded-xl p-6 bg-white shadow-[0.5rem_0.5rem_0_#000000] max-w-md">
          <h3 className="text-2xl font-bold text-sophera-text-heading mb-2">
            Loading your dashboard...
          </h3>
          <p className="text-sophera-text-body text-center">
            Gathering your latest information to personalize your Sophera experience.
          </p>
          <div className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 bg-sophera-accent-tertiary transform rotate-45 border-2 border-black"></div>
        </div>
      </div>
    );
  }

  // Cast userData to User type to access its properties
  const user = userData as { displayName?: string; username?: string } | null | undefined;
  const displayName = user?.displayName || user?.username || 'User';

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <NeoPageHeader 
        title={`Welcome, ${displayName}`} 
        description="Here's your personalized dashboard for today" 
        icon={<Home className="h-6 w-6 text-sophera-brand-primary" />}
        decorationColor="bg-sophera-accent-secondary"
      />

      {/* NEW: Canvas Feature Access */}
      <div className="mb-8 mt-4">
        <NeoCard>
          <NeoCardDecoration />
          <NeoCardHeader>
            <NeoCardTitle className="flex items-center">
              <Map className="h-5 w-5 mr-2 text-sophera-brand-primary" />
              Canvas - Your Visual Journey
            </NeoCardTitle>
            <NeoCardDescription>
              Explore and organize your cancer journey in a visual, interactive way
            </NeoCardDescription>
          </NeoCardHeader>
          <NeoCardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between py-3">
              <div className="flex-1 max-w-md">
                <p className="text-sm text-sophera-text-body mb-3">
                  Our new Canvas feature allows you to visually map your medical journey, create treatment timelines, 
                  track symptoms, and organize your care in an intuitive, visual workspace.
                </p>
                <div className="flex gap-4 mt-4">
                  <Link href="/canvas">
                    <NeoButton buttonText="Open Canvas" color="lime" className="font-bold" />
                  </Link>
                  <Link href="/canvas-demo">
                    <NeoButton buttonText="Try Demo" color="primary" className="font-bold" />
                  </Link>
                </div>
              </div>
              <div className="flex-shrink-0 border-3 border-black p-1 bg-white shadow-neo">
                <div className="w-[150px] h-[100px] bg-gray-100 flex items-center justify-center">
                  <Grid className="h-10 w-10 text-sophera-brand-primary opacity-70" />
                </div>
              </div>
            </div>
          </NeoCardContent>
        </NeoCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {/* Today's Focus Card */}
          <NeoCard>
            <NeoCardDecoration />
            <NeoCardHeader>
              <div className="flex justify-between items-center">
                <NeoCardTitle className="flex items-center">
                  <CalendarCheck className="h-5 w-5 mr-2 text-sophera-brand-primary" />
                  Today's Focus
                </NeoCardTitle>
                <NeoCardBadge>{upcomingPlanItems?.length || 0} items</NeoCardBadge>
              </div>
              <NeoCardDescription className="mb-4">
                Scheduled Activities & Plans
              </NeoCardDescription>
            </NeoCardHeader>
            <NeoCardContent>
              <TodaysFocus planItems={upcomingPlanItems} isLoading={isLoading} />
            </NeoCardContent>
          </NeoCard>

          {/* Journal Prompt Card */}
          <NeoCard>
            <NeoCardDecoration />
            <NeoCardHeader>
              <NeoCardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-sophera-brand-primary" />
                Journal Prompt
              </NeoCardTitle>
              <NeoCardDescription>
                Take a moment to reflect on your journey
              </NeoCardDescription>
            </NeoCardHeader>
            <NeoCardContent>
              <JournalPrompt />
            </NeoCardContent>
            <NeoCardFooter>
              <div className="w-full px-4 flex justify-between items-center">
                <div className="mx-auto">
                  <div className="flex gap-8 justify-center">
                    <Link href="/journal-entry">
                      <NeoButton buttonText="Add Entry" size="sm" color="lime" />
                    </Link>
                    <Link href="/my-journey/journal">
                      <NeoButton buttonText="View Journal" size="sm" color="primary" />
                    </Link>
                  </div>
                </div>
              </div>
            </NeoCardFooter>
          </NeoCard>
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {/* Hope Snippet Card */}
          <NeoCard>
            <NeoCardDecoration />
            <NeoCardHeader>
              <NeoCardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-sophera-accent-secondary" />
                Hope Snippet
              </NeoCardTitle>
              <NeoCardDescription>
                Inspiration for your healing journey
              </NeoCardDescription>
            </NeoCardHeader>
            <NeoCardContent>
              <HopeSnippet />
            </NeoCardContent>
            <NeoCardFooter>
              <div className="flex justify-end">
                <Link href="/connect/mindfulness">
                  <NeoButton buttonText="More Snippets" size="sm" color="cyan" />
                </Link>
              </div>
            </NeoCardFooter>
          </NeoCard>
          
          {/* Analyze & Act Card */}
          <NeoCard>
            <NeoCardDecoration />
            <NeoCardHeader>
              <NeoCardTitle className="flex items-center">
                <BrainCircuit className="h-5 w-5 mr-2 text-sophera-brand-primary" />
                Analyze & Act
              </NeoCardTitle>
              <NeoCardDescription>
                Personalized recommendations for your healing journey
              </NeoCardDescription>
            </NeoCardHeader>
            <NeoCardContent>
              <div className="h-[300px] overflow-hidden">
                <AnalyzeAndAct />
              </div>
            </NeoCardContent>
          </NeoCard>
        </div>
      </div>
    </div>
  );
}
