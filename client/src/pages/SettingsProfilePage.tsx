import React from 'react';
import { TabsLayout } from '@/components/ui/tabs-layout';
import Preferences from './Preferences';
import Help from './Help';
import { 
  Settings,
  Users,
  Bell,
  Shield,
  HelpCircle
} from 'lucide-react';

const SettingsProfilePage = () => {
  const tabs = [
    {
      id: 'profile',
      label: 'User Profile',
      icon: <Settings className="h-4 w-4" />,
      content: <Preferences inTabView />
    },
    {
      id: 'caregivers',
      label: 'Manage Caregivers',
      icon: <Users className="h-4 w-4" />,
      content: (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Users className="h-16 w-16 text-primary/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Manage Caregivers</h3>
          <p className="text-muted-foreground max-w-md">
            View, add, or remove caregivers and manage their permissions. This feature is coming soon.
          </p>
        </div>
      )
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-4 w-4" />,
      content: (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Bell className="h-16 w-16 text-primary/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Notification Settings</h3>
          <p className="text-muted-foreground max-w-md">
            Customize your notification preferences to stay informed about your care. This feature is coming soon.
          </p>
        </div>
      )
    },
    {
      id: 'privacy',
      label: 'Privacy & Data',
      icon: <Shield className="h-4 w-4" />,
      content: (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Shield className="h-16 w-16 text-primary/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Privacy & Data Management</h3>
          <p className="text-muted-foreground max-w-md">
            Manage your data privacy settings and export or delete your information. This feature is coming soon.
          </p>
        </div>
      )
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: <HelpCircle className="h-4 w-4" />,
      content: <Help inTabView />
    },
  ];

  return (
    <TabsLayout 
      title="Settings & Profile" 
      description="Manage your account, preferences, and privacy settings"
      tabs={tabs}
    />
  );
};

export default SettingsProfilePage;
