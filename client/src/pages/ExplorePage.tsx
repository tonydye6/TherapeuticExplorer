import React from 'react';
import { TabsLayout } from '@/components/ui/tabs-layout';
import ResearchAssistant from './ResearchAssistant';
import ClinicalTrials from './ClinicalTrials';
import MultimodalChatPage from './multimodal-chat-page';
import { 
  Search,
  FlaskConical,
  Lightbulb
} from 'lucide-react';

const ExplorePage = () => {
  const tabs = [
    {
      id: 'search',
      label: 'Guided Search',
      icon: <Search className="h-4 w-4" />,
      content: <ResearchAssistant inTabView />
    },
    {
      id: 'trials',
      label: 'Clinical Trial Finder',
      icon: <FlaskConical className="h-4 w-4" />,
      content: <ClinicalTrials inTabView />
    },
    {
      id: 'creative',
      label: 'Creative Exploration',
      icon: <Lightbulb className="h-4 w-4" />,
      content: <MultimodalChatPage inTabView />
    }
  ];

  return (
    <TabsLayout 
      title="Explore" 
      description="Research treatments, find clinical trials, and explore creative solutions"
      tabs={tabs}
    />
  );
};

export default ExplorePage;
