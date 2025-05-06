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

  // Find the active tab
  const activeTabItem = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={cn("space-y-6", className)}>
      {(title || description) && (
        <div>
          {title && <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>}
          {description && (
            <p className="text-muted-foreground mt-2 text-gray-500">{description}</p>
          )}
        </div>
      )}

      <Tabs 
        defaultValue={activeTab} 
        onValueChange={handleTabChange} 
        className="w-full" 
        value={activeTab}
        aria-label={title || "Content tabs"}
      >
        <TabsList 
          className="mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 bg-white/80 backdrop-blur-sm"
          aria-label="Tab navigation"
        >
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center gap-2 transition-all duration-200"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
            >
              {tab.icon && (
                <span className="text-current" aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              <span className="hidden sm:inline truncate">{tab.label}</span>
              <span className="sm:hidden truncate">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent 
            key={tab.id} 
            value={tab.id} 
            className="space-y-4 outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-md p-1"
            id={`tabpanel-${tab.id}`}
            aria-labelledby={tab.id}
            role="tabpanel"
            tabIndex={0}
          >
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>

      {/* Screen reader only tab description when available */}
      {activeTabItem?.description && (
        <div className="sr-only" aria-live="polite">
          Current tab: {activeTabItem.label}. {activeTabItem.description}
        </div>
      )}
    </div>
  );
}
