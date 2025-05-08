import { useState } from 'react';
import CanvasContainer from '../components/canvas/CanvasContainer';
import { CanvasTab } from '@shared/canvas-types';
import { v4 as uuidv4 } from 'uuid';

// Sample data for demonstration
const sampleTabs: CanvasTab[] = [
  {
    id: uuidv4(),
    userId: '1',
    name: 'My Journey',
    type: 'freeform',
    config: {
      gridSize: 20,
      background: 'white',
    },
    created: new Date(),
    updated: new Date()
  },
  {
    id: uuidv4(),
    userId: '1',
    name: 'Treatment Calendar',
    type: 'calendar',
    config: {
      dateRange: { 
        start: new Date(), 
        end: new Date(new Date().setMonth(new Date().getMonth() + 3)) 
      },
    },
    created: new Date(),
    updated: new Date()
  }
];

export default function CanvasDemo() {
  const [tabs, setTabs] = useState<CanvasTab[]>(sampleTabs);

  // Handler for tab creation
  const handleTabCreate = (tab: Partial<CanvasTab>) => {
    const newTab: CanvasTab = {
      id: uuidv4(),
      userId: '1',
      name: tab.name || 'New Canvas',
      type: tab.type || 'freeform',
      config: tab.config || { gridSize: 20 },
      created: new Date(),
      updated: new Date()
    };

    setTabs([...tabs, newTab]);
  };

  // Handler for node selection
  const handleNodeSelect = (nodeId: string) => {
    console.log('Node selected:', nodeId);
  };

  return (
    <div className="p-4 h-screen">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Canvas System Demo</h1>
        <p className="text-gray-600">A demonstration of the Sophera canvas system foundation.</p>
      </div>

      <div className="bg-white border border-border rounded-sophera-card h-[calc(100vh-8rem)]">
        <CanvasContainer 
          initialTabs={tabs}
          onTabCreate={handleTabCreate}
          onNodeSelect={handleNodeSelect}
        />
      </div>
    </div>
  );
}