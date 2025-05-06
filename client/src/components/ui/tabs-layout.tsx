import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
}

interface TabsLayoutProps {
  tabs: Tab[];
  title?: string;
  description?: string;
  className?: string;
  defaultTabId?: string;
  onTabChange?: (tabId: string) => void;
}

export function TabsLayout({ 
  tabs, 
  title, 
  description, 
  className,
  defaultTabId,
  onTabChange
}: TabsLayoutProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTabId || tabs[0].id);

  // Handle tab change and notify parent component if onTabChange is provided
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (onTabChange) {
      onTabChange(value);
    }
  };

  // Update the active tab when defaultTabId changes
  useEffect(() => {
    if (defaultTabId && defaultTabId !== activeTab) {
      setActiveTab(defaultTabId);
    }
  }, [defaultTabId]);

  return (
    <div className={cn("space-y-6", className)}>
      {(title || description) && (
        <div>
          {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      )}

      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full" value={activeTab}>
        <TabsList className="mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center gap-2"
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
