
import React from 'react';
import { TabsLayout } from '@/components/ui/tabs-layout';
import ResearchAssistant from './ResearchAssistant';
import ClinicalTrialsPage from './ClinicalTrials';
import MultimodalChatPage from './multimodal-chat-page';

import {
  Search,
  FlaskConical,
  Lightbulb,
} from 'lucide-react';

const ExplorePage = () => {
  const tabs = [
    {
      id: 'search',
      label: 'Guided Search',
      icon: <Search className="h-5 w-5 text-sophera-brand-primary" />,
      content: <ResearchAssistant inTabView />
    },
    {
      id: 'trials',
      label: 'Clinical Trials',
      icon: <FlaskConical className="h-5 w-5 text-sophera-accent-secondary" />,
      content: <ClinicalTrialsPage inTabView />
    },
    {
      id: 'creative',
      label: 'Creative Exploration',
      icon: <Lightbulb className="h-5 w-5 text-sophera-accent-tertiary" />,
      content: <MultimodalChatPage inTabView />
    }
  ];

  return (
    <TabsLayout
      title="Explore Options"
      description="Research standard treatments, find relevant clinical trials, and brainstorm innovative ideas."
      tabs={tabs}
    />
  );
};

export default ExplorePage;
