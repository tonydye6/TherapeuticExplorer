import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LiteGraphWrapper from '@/components/canvas/LiteGraphWrapper';
import { v4 as uuidv4 } from 'uuid';
import { CanvasTab, CanvasType } from '@shared/canvas-types';

export default function CanvasDemo() {
  const [tabs, setTabs] = useState<CanvasTab[]>([
    {
      id: 'tab1',
      title: 'My Journey',
      type: 'freeform' as CanvasType,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'tab2',
      title: 'Treatment Plan',
      type: 'timeline' as CanvasType,
      isActive: false,
      createdAt: new Date(),
    }
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab1');

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    setTabs(tabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
  };

  const addNewTab = () => {
    const newTabId = uuidv4();
    const newTab: CanvasTab = {
      id: newTabId,
      title: `New Canvas ${tabs.length + 1}`,
      type: 'freeform',
      isActive: false,
      createdAt: new Date(),
    };
    
    setTabs([...tabs, newTab]);
    // Automatically select the new tab
    handleTabChange(newTabId);
  };

  const handleNodeSelected = (nodeId: string) => {
    console.log('Node selected:', nodeId);
  };

  const handleNodeCreated = (node: any) => {
    console.log('Node created:', node);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-sophera-gradient-start to-sophera-gradient-end">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-charcoal-900">Canvas System Demo</h1>
        <p className="text-charcoal-600 mt-2">
          Explore the infinite canvas capabilities with Neo-Brutalism design principles.
        </p>
      </div>

      <div className="flex-1 flex flex-col p-6 pt-0">
        <div className="bg-white border-4 border-black rounded-xl flex-1 flex flex-col overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.2)]">
          <div className="p-4 border-b-4 border-black bg-gray-50">
            <Tabs value={activeTabId} onValueChange={handleTabChange} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="border-2 border-black bg-gray-100">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={`
                        data-[state=active]:bg-sophera-brand-primary 
                        data-[state=active]:text-white 
                        border-r-2 border-black last:border-r-0
                        px-4 py-2
                      `}
                    >
                      {tab.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <button 
                  onClick={addNewTab}
                  className="flex items-center justify-center px-3 py-2 bg-neo-cyan-300 border-2 border-black text-sm font-medium hover:bg-neo-cyan-500 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  + New Canvas
                </button>
              </div>

              {tabs.map((tab) => (
                <TabsContent 
                  key={tab.id} 
                  value={tab.id}
                  className="flex-1 mt-0 border-t-0 h-[calc(100vh-220px)]"
                >
                  <div className="w-full h-full border border-gray-200 rounded">
                    <LiteGraphWrapper 
                      onNodeSelected={handleNodeSelected}
                      onNodeCreated={handleNodeCreated}
                      className="w-full h-full"
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}