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
  Info,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const MyJourneyPage = () => {
  const [activeId, setActiveId] = useState('plan');

  const tabs = [
    {
      id: 'plan',
      label: 'My Plan',
      icon: <Calendar className="h-4 w-4" />,
      content: <MyPlanPage inTabView />,
      description: 'Schedule treatments, medications, appointments, and activities'
    },
    {
      id: 'journal',
      label: 'My Journal',
      icon: <BookOpen className="h-4 w-4" />,
      content: <JournalLogsPage inTabView />,
      description: 'Track symptoms, moods, and daily experiences'
    },
    {
      id: 'diet',
      label: 'Diet Log',
      icon: <Utensils className="h-4 w-4" />,
      content: <DietLogsPage inTabView />,
      description: 'Record your meals and nutrition information'
    },
    {
      id: 'metrics',
      label: 'My Metrics',
      icon: <HeartPulse className="h-4 w-4" />,
      content: (
        <div className="p-4">
          <Card className="bg-primary-50 border-primary-100 mb-6 overflow-hidden">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1 text-primary-900">Coming Soon</h3>
                  <p className="text-gray-600">
                    We're building new tools to help you track, visualize, and understand your health metrics over time in a clear, meaningful way.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center justify-center p-12 text-center">
            <HeartPulse className="h-16 w-16 text-primary/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">My Metrics</h3>
            <p className="text-gray-500 max-w-md">
              Soon you'll be able to visualize your vitals, symptoms, and other health metrics in one convenient place.
            </p>
          </div>
        </div>
      ),
      description: 'Visualize your health data over time'
    },
    {
      id: 'trends',
      label: 'Trends',
      icon: <TrendingUp className="h-4 w-4" />,
      content: (
        <div className="p-4">
          <Card className="bg-primary-50 border-primary-100 mb-6 overflow-hidden">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1 text-primary-900">Coming Soon</h3>
                  <p className="text-gray-600">
                    We're building advanced analytics to identify patterns in your journal entries, symptoms, and treatments to help you find correlations and insights.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center justify-center p-12 text-center">
            <TrendingUp className="h-16 w-16 text-primary/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Trends Analysis</h3>
            <p className="text-gray-500 max-w-md">
              Visualize patterns in your mood, energy levels, symptoms, and other tracked metrics over time. This feature is coming soon.
            </p>
          </div>
        </div>
      ),
      description: 'Discover patterns and correlations in your health data'
    },
  ];

  // Get current tab information
  const currentTab = tabs.find(tab => tab.id === activeId) || tabs[0];

  return (
    <div className="container max-w-6xl py-6 px-4 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">My Journey</h1>
        <p className="text-gray-500 mt-1">
          {currentTab.description || "Track your health journey, treatments, and daily experiences"}
        </p>
      </div>

      <TabsLayout 
        tabs={tabs}
        defaultTabId={activeId}
        onTabChange={setActiveId}
      />
    </div>
  );
};

export default MyJourneyPage;
