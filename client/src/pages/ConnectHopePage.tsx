import React from 'react';
import { TabsLayout } from '@/components/ui/tabs-layout';
import HopeSnippetsPage from './HopeSnippetsPage';
import SurvivorStoriesPage from './SurvivorStoriesPage';
import ResourceHubPage from './ResourceHubPage';
import CaregiverConnectPage from './CaregiverConnectPage';
import { 
  MessageSquare,
  Sparkles,
  BookOpen,
  Users
} from 'lucide-react';

const ConnectHopePage = () => {
  const tabs = [
    {
      id: 'stories',
      label: 'Survivor Stories',
      icon: <MessageSquare className="h-4 w-4" />,
      content: <SurvivorStoriesPage inTabView />
    },
    {
      id: 'mindfulness',
      label: 'Mindfulness Corner',
      icon: <Sparkles className="h-4 w-4" />,
      content: <HopeSnippetsPage inTabView />
    },
    {
      id: 'resources',
      label: 'Resource Hub',
      icon: <BookOpen className="h-4 w-4" />,
      content: <ResourceHubPage inTabView />
    },
    {
      id: 'caregivers',
      label: 'Caregiver Connect',
      icon: <Users className="h-4 w-4" />,
      content: <CaregiverConnectPage inTabView />
    },
  ];

  return (
    <TabsLayout 
      title="Connect & Hope" 
      description="Find support, inspiration, and resources to nurture hope"
      tabs={tabs}
    />
  );
};

export default ConnectHopePage;
