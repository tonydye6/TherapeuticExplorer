import { useCallback, useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CanvasToolbar from './CanvasToolbar';
import NodeDetailsPanel from './NodeDetailsPanel';
import EdgeDetailsPanel from './EdgeDetailsPanel';
import LiteGraphWrapper from './LiteGraphWrapper';
import CalendarCanvasRenderer from './calendar/CalendarCanvasRenderer';
import { CanvasTab, CanvasNode, CanvasEdge, CanvasType } from '@shared/canvas-types';
import NodeMapping from '../../lib/canvas/NodeMapping';

interface CanvasContainerProps {
  initialTabs?: CanvasTab[];
  className?: string;
  userId?: string;
}

export default function CanvasContainer({ 
  initialTabs = [], 
  className,
  userId = '1'
}: CanvasContainerProps) {
  const [tabs, setTabs] = useState<CanvasTab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [selectedLGraphNode, setSelectedLGraphNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<CanvasEdge | null>(null);
  const [nodeMapping] = useState(new NodeMapping());

  // Get active tab from tabs array
  const activeTab = useMemo(() => {
    return tabs.find(tab => tab.id === activeTabId) || null;
  }, [tabs, activeTabId]);

  // Function to add a new tab
  const addTab = useCallback((type: CanvasType = CanvasType.FREEFORM) => {
    const today = new Date();
    
    const newTab: CanvasTab = {
      id: uuidv4(),
      title: type === CanvasType.CALENDAR ? 'New Calendar' : 'New Canvas',
      type,
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      scale: 1,
      offset: { x: 0, y: 0 },
      userId,
      // Add default config for calendar type
      config: type === CanvasType.CALENDAR 
        ? {
            dateRange: {
              startDate: new Date(today.getFullYear(), today.getMonth(), 1),
              endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0)
            }
          } 
        : undefined
    };
    
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);
  }, [userId]);

  // Simplified render
  return (
    <div className={`flex flex-col h-full canvas-container ${className || ''}`}>
      
      {/* Toolbar */}
      <div className="px-4 pt-2 bg-muted/20 border-b border-border">
        <CanvasToolbar />
      </div>
      
      {/* Canvas area */}
      <div className="flex-grow relative">
        {activeTab && (
          <div className="absolute inset-0">
            {/* Render different canvas types based on tab type */}
            {activeTab.type === CanvasType.CALENDAR ? (
              <div className="w-full h-full">
                <CalendarCanvasRenderer
                  activeTab={activeTab}
                  onNodeClick={() => {}}
                  onNodeCreate={async () => ""}
                  onNodeUpdate={async () => {}}
                  onNodeDelete={async () => {}}
                  onEdgeCreate={async () => ""}
                  onEdgeUpdate={async () => {}}
                  onEdgeDelete={async () => {}}
                />
              </div>
            ) : (
              <LiteGraphWrapper 
                onNodeSelected={() => {}}
                onNodeCreated={() => {}}
                onLinkSelected={() => {}}
                onConnectionChanged={() => {}}
                className="w-full h-full"
              />
            )}
          </div>
        )}
        
        {!activeTab && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <h3 className="text-xl font-semibold mb-4">No Canvas Selected</h3>
              <p className="mb-4">Create a new canvas to get started.</p>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => addTab(CanvasType.FREEFORM)} 
                  className="neo-brutalism-btn"
                >
                  <PlusCircle size={16} className="mr-2" />
                  New Freeform Canvas
                </Button>
                <Button 
                  onClick={() => addTab(CanvasType.CALENDAR)} 
                  className="neo-brutalism-btn"
                >
                  <PlusCircle size={16} className="mr-2" />
                  New Calendar Canvas
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}