
// client/src/pages/ConnectHopePage.tsx

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
      icon: <MessageSquare className="h-5 w-5 text-sophera-brand-primary" />,
      content: <SurvivorStoriesPage inTabView />
    },
    {
      id: 'mindfulness',
      label: 'Mindfulness Corner',
      icon: <Sparkles className="h-5 w-5 text-sophera-accent-tertiary" />,
      content: <HopeSnippetsPage inTabView />
    },
    {
      id: 'resources',
      label: 'Resource Hub',
      icon: <BookOpen className="h-5 w-5 text-sophera-accent-secondary" />,
      content: <ResourceHubPage inTabView />
    },
    {
      id: 'caregivers',
      label: 'Caregiver Connect',
      icon: <Users className="h-5 w-5 text-sophera-brand-primary" />,
      content: <CaregiverConnectPage inTabView />
    },
  ];

  return (
    <TabsLayout
      title="Connect & Hope"
      description="Find support, inspiration, and resources to nurture hope and well-being on your journey."
      tabs={tabs}
    />
  );
};

export default ConnectHopePage;
