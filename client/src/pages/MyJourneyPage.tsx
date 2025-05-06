import React from 'react';
import { TabsLayout } from '@/components/ui/tabs-layout';
import MyPlanPage from './MyPlanPage';
import JournalLogsPage from './JournalLogsPage';
import DietLogsPage from './DietLogsPage';
import { 
  Calendar,
  BookOpen,
  Utensils,
  HeartPulse,
  TrendingUp 
} from 'lucide-react';

const MyJourneyPage = () => {
  const tabs = [
    {
      id: 'plan',
      label: 'My Plan',
      icon: <Calendar className="h-4 w-4" />,
      content: <MyPlanPage inTabView />
    },
    {
      id: 'journal',
      label: 'My Journal',
      icon: <BookOpen className="h-4 w-4" />,
      content: <JournalLogsPage inTabView />
    },
    {
      id: 'diet',
      label: 'Diet Log',
      icon: <Utensils className="h-4 w-4" />,
      content: <DietLogsPage inTabView />
    },
    {
      id: 'metrics',
      label: 'My Metrics',
      icon: <HeartPulse className="h-4 w-4" />,
      content: (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <HeartPulse className="h-16 w-16 text-primary/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">My Metrics</h3>
          <p className="text-muted-foreground max-w-md">
            Track and visualize your health metrics over time. This feature is coming soon.
          </p>
        </div>
      )
    },
    {
      id: 'trends',
      label: 'Trends',
      icon: <TrendingUp className="h-4 w-4" />,
      content: (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <TrendingUp className="h-16 w-16 text-primary/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Trends Analysis</h3>
          <p className="text-muted-foreground max-w-md">
            Visualize patterns in your mood, energy levels, symptoms, and other tracked metrics over time. This feature is coming soon.
          </p>
        </div>
      )
    },
  ];

  return (
    <TabsLayout 
      title="My Journey" 
      description="Track your health journey, treatments, and daily experiences"
      tabs={tabs}
    />
  );
};

export default MyJourneyPage;
