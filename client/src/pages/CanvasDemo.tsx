import React, { useState } from 'react';
import CanvasContainer from '@/components/canvas/CanvasContainer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Define canvas tab interface
interface CanvasTab {
  id: string;
  title: string;
  type: 'freeform' | 'timeline' | 'spreadsheet' | 'journey';
  isActive: boolean;
  createdAt: Date;
}

export default function CanvasDemo() {
  // State for canvas tabs
  const [canvasTabs, setCanvasTabs] = useState<CanvasTab[]>([
    {
      id: 'default-canvas',
      title: 'My Journey Canvas',
      type: 'freeform',
      isActive: true,
      createdAt: new Date()
    }
  ]);
  
  // Function to add a new canvas tab
  const addCanvasTab = () => {
    const newTab: CanvasTab = {
      id: uuidv4(),
      title: `New Canvas ${canvasTabs.length + 1}`,
      type: 'freeform',
      isActive: false,
      createdAt: new Date()
    };
    
    setCanvasTabs([...canvasTabs, newTab]);
  };
  
  // Function to activate a tab
  const setActiveTab = (tabId: string) => {
    setCanvasTabs(canvasTabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
  };
  
  // Get the active tab
  const activeTab = canvasTabs.find(tab => tab.isActive) || canvasTabs[0];
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="p-4 border-b border-black border-3">
        <h1 className="text-3xl font-bold uppercase tracking-wider">Sophera Canvas Demo</h1>
        <p className="text-muted-foreground">
          An interactive canvas system for visualizing your healthcare journey
        </p>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Canvas Tabs */}
        <Tabs defaultValue={activeTab.id} className="w-full">
          <div className="flex items-center border-b border-black border-3 px-4">
            <TabsList className="mr-2 h-12 rounded-none border-border-secondary flex bg-transparent">
              {canvasTabs.map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="neo-brutalism-tab px-4 py-2 uppercase"
                  data-state={tab.id === activeTab.id ? "active" : "inactive"}
                >
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button 
              onClick={addCanvasTab}
              variant="ghost" 
              size="icon" 
              className="ml-2 flex-shrink-0 neo-brutalism-btn"
            >
              <PlusCircle className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Canvas Content */}
          {canvasTabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="flex-1 overflow-hidden mt-0 border-0">
              <CanvasContainer title={tab.title} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}