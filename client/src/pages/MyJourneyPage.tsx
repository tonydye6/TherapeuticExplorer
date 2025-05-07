
import React, { useState } from 'react';
import { TabsLayout } from '@/components/ui/tabs-layout';
import MyPlanPage from './MyPlanPage';
import JournalLogsPage from './JournalLogsPage';
import DietLogsPage from './DietLogsPage';
import {
  Calendar,
  BookOpen,
  Utensils,
  HeartPulse,
  TrendingUp,
  Sparkles,
  Construction,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MyJourneyPage = () => {
  const [activeTabId, setActiveTabId] = useState('plan');

  const tabs = [
    {
      id: 'plan',
      label: 'My Plan',
      icon: <Calendar className="h-5 w-5 text-sophera-brand-primary" />,
      content: <MyPlanPage inTabView />,
      description: 'Organize your treatments, appointments, self-care, and activities.'
    },
    {
      id: 'journal',
      label: 'My Journal',
      icon: <BookOpen className="h-5 w-5 text-sophera-accent-secondary" />,
      content: <JournalLogsPage inTabView />,
      description: 'Reflect on your days, track symptoms, and note how you\'re feeling.'
    },
    {
      id: 'diet',
      label: 'Diet Log',
      icon: <Utensils className="h-5 w-5 text-sophera-accent-tertiary" />,
      content: <DietLogsPage inTabView />,
      description: 'Record your meals, hydration, and nutrition information.'
    },
    {
      id: 'metrics',
      label: 'My Metrics',
      icon: <HeartPulse className="h-5 w-5 text-green-500" />,
      content: (
        <div className="p-4 md:p-6">
          <Card className="bg-sophera-gradient-start/70 border-sophera-brand-primary/40 rounded-sophera-card shadow-lg mb-6">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="h-16 w-16 rounded-full bg-sophera-brand-primary text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-sophera-text-heading">Exciting Updates Coming Soon!</h3>
                  <p className="text-sophera-text-body text-base leading-relaxed">
                    We're developing powerful tools to help you track, visualize, and understand your key health metrics over time in a clear and meaningful way. Stay tuned!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col items-center justify-center p-12 text-center bg-sophera-bg-card rounded-sophera-card border border-sophera-border-primary shadow-md">
            <HeartPulse className="h-20 w-20 text-sophera-brand-primary/40 mb-6" />
            <h3 className="text-2xl font-semibold text-sophera-text-heading mb-2">My Metrics Dashboard</h3>
            <p className="text-sophera-text-body max-w-md text-base">
              Soon, you'll be able to visualize your vitals, symptom patterns, and other important health indicators all in one convenient place.
            </p>
          </div>
        </div>
      ),
      description: 'Visualize your key health data and track progress over time.'
    },
    {
      id: 'trends',
      label: 'Trends & Insights',
      icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
      content: (
        <div className="p-4 md:p-6">
           <Card className="bg-sophera-gradient-end/70 border-sophera-accent-secondary/40 rounded-sophera-card shadow-lg mb-6">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="h-16 w-16 rounded-full bg-sophera-accent-secondary text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <Construction className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-sophera-text-heading">Advanced Analytics Under Development</h3>
                  <p className="text-sophera-text-body text-base leading-relaxed">
                    We're crafting sophisticated tools to help you identify patterns in your journal entries, symptoms, and treatments, offering potential correlations and insights.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col items-center justify-center p-12 text-center bg-sophera-bg-card rounded-sophera-card border border-sophera-border-primary shadow-md">
            <TrendingUp className="h-20 w-20 text-sophera-accent-secondary/40 mb-6" />
            <h3 className="text-2xl font-semibold text-sophera-text-heading mb-2">Trends Analysis</h3>
            <p className="text-sophera-text-body max-w-md text-base">
              Discover patterns in your mood, energy levels, symptoms, and other tracked metrics. This insightful feature is coming soon!
            </p>
          </div>
        </div>
      ),
      description: 'Discover patterns and correlations in your health data to gain deeper insights.'
    },
  ];

  const currentTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-10 space-y-8 md:space-y-10">
      <div className="mb-6 md:mb-8 text-center md:text-left">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-sophera-text-heading mb-2">My Journey</h1>
        <p className="text-lg lg:text-xl text-sophera-text-body">
          {currentTab.description || "Track your health journey, treatments, and daily experiences."}
        </p>
      </div>

      <TabsLayout
        tabs={tabs}
        defaultTabId={activeTabId}
        onTabChange={setActiveTabId}
      />
    </div>
  );
};

export default MyJourneyPage;
