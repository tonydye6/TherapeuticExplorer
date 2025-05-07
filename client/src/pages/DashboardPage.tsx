
// client/src/pages/DashboardPage.tsx

import React from 'react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { 
  Loader2,
  Home, 
  CalendarCheck, 
  FileText, 
  Heart,
  MessageCircle
} from 'lucide-react';
import { ModelType } from '@shared/schema';
import ChatInterface from '@/components/ChatInterface';
import { Greeting } from '@/components/dashboard/Greeting';
import { TodaysFocus } from '@/components/dashboard/TodaysFocus';
import { JournalPrompt } from '@/components/dashboard/JournalPrompt';
import { HopeSnippet } from '@/components/dashboard/HopeSnippet';
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

  const displayName = userData?.displayName || userData?.username || 'User';

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <NeoPageHeader 
        title={`Welcome, ${displayName}`} 
        description="Here's your personalized dashboard for today" 
        icon={<Home className="h-6 w-6 text-sophera-brand-primary" />}
        decorationColor="bg-sophera-accent-secondary"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-6 md:space-y-8">
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
              <NeoCardDescription>
                Your scheduled activities and treatment plan for today
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
              <Link href="/my-journey/journal">
                <NeoButton variant="outline" size="sm">View Journal</NeoButton>
              </Link>
            </NeoCardFooter>
          </NeoCard>
        </div>

        <div className="space-y-6 md:space-y-8">
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
              <Link href="/connect/mindfulness">
                <NeoButton variant="outline" size="sm">More Snippets</NeoButton>
              </Link>
            </NeoCardFooter>
          </NeoCard>
          
          {/* AI Chat Assistant Card */}
          <NeoCard>
            <NeoCardDecoration />
            <NeoCardHeader>
              <NeoCardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-sophera-brand-primary" />
                AI Assistant
              </NeoCardTitle>
              <NeoCardDescription>
                Get quick answers and support for your journey
              </NeoCardDescription>
            </NeoCardHeader>
            <NeoCardContent>
              <div className="h-[300px]">
                <ChatInterface 
                  title=""
                  placeholder="Ask me anything about your care journey..."
                  preferredModel={ModelType.GEMINI}
                  className="h-full"
                />
              </div>
            </NeoCardContent>
          </NeoCard>
        </div>
      </div>
    </div>
  );
}
