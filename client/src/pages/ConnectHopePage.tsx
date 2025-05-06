import React from 'react';
import { TabsLayout } from '@/components/ui/tabs-layout';
import HopeSnippetsPage from './HopeSnippetsPage';
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
      content: (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <MessageSquare className="h-16 w-16 text-primary/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Survivor Stories</h3>
          <p className="text-muted-foreground max-w-md">
            Read and share inspiring stories from others who have navigated similar journeys. This feature is coming soon.
          </p>
        </div>
      )
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
      content: (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <BookOpen className="h-16 w-16 text-primary/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Resource Hub</h3>
          <p className="text-muted-foreground max-w-md">
            Access financial assistance, advocacy groups, and supportive resources to help with your journey. This feature is coming soon.
          </p>
        </div>
      )
    },
    {
      id: 'caregivers',
      label: 'Caregiver Connect',
      icon: <Users className="h-4 w-4" />,
      content: (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Users className="h-16 w-16 text-primary/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Caregiver Connect</h3>
          <p className="text-muted-foreground max-w-md">
            Invite and manage caregivers to share your journey and help with your care. This feature is coming soon.
          </p>
        </div>
      )
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
