import React, { useCallback, useState } from 'react';
import LiteGraphWrapper from '../components/canvas/LiteGraphWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Upload, RotateCcw, Save } from 'lucide-react';

import { CanvasTab, CanvasType } from '@shared/canvas-types';

export default function CanvasDemo() {
  const [tabs, setTabs] = useState<CanvasTab[]>([
    { 
      id: 'tab1', 
      title: 'My Journey', 
      type: CanvasType.JOURNEY,
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    { 
      id: 'tab2', 
      title: 'Treatment Timeline', 
      type: CanvasType.TIMELINE,
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  const [activeTab, setActiveTab] = useState<string>('tab1');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    console.log('Selected node:', nodeId);
    setSelectedNodeId(nodeId);
  }, []);

  // Add a new tab
  const addNewTab = () => {
    const newTabId = `tab${tabs.length + 1}`;
    const newTab: CanvasTab = {
      id: newTabId,
      title: `New Canvas ${tabs.length + 1}`,
      type: CanvasType.FREEFORM,
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTabs([...tabs, newTab]);
    setActiveTab(newTabId);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Canvas Demo</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="neo-brutalism-btn">
            <RotateCcw size={16} className="mr-2" />
            Reset
          </Button>
          <Button variant="outline" size="sm" className="neo-brutalism-btn">
            <Upload size={16} className="mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="neo-brutalism-btn">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button variant="default" size="sm" className="neo-brutalism-btn">
            <Save size={16} className="mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="flex-grow overflow-hidden">
        <Tabs 
          defaultValue="tab1" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full h-full flex flex-col"
        >
          <div className="px-4 pt-2 bg-muted/20 border-b">
            <div className="flex items-center justify-between">
              <TabsList className="neo-brutalism-tabs">
                {tabs.map(tab => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="neo-brutalism-tab"
                  >
                    {tab.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={addNewTab}
                className="neo-brutalism-btn"
              >
                <PlusCircle size={16} className="mr-1" />
                New Canvas
              </Button>
            </div>
          </div>
          
          {tabs.map(tab => (
            <TabsContent 
              key={tab.id} 
              value={tab.id}
              className="flex-grow mt-0 relative"
            >
              <div className="absolute inset-0">
                <LiteGraphWrapper 
                  onNodeSelected={handleNodeSelect}
                  className="w-full h-full"
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {selectedNodeId && (
        <div className="absolute right-4 top-20 w-80">
          <Card>
            <CardHeader>
              <CardTitle>Node Properties</CardTitle>
              <CardDescription>Edit the selected node</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Selected Node ID: {selectedNodeId}</p>
              {/* Node properties editor would go here */}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}