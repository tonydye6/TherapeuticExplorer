import { useState } from 'react';
import LiteGraphWrapper from './LiteGraphWrapper';
import { CanvasTab, CanvasNode, CanvasConnection } from '@shared/canvas-types';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { Plus, Grid, Calendar, Table, Map, FileText } from 'lucide-react';

interface CanvasContainerProps {
  initialTabs?: CanvasTab[];
  onTabCreate?: (tab: Partial<CanvasTab>) => void;
  onTabChange?: (tabId: string) => void;
  onNodeSelect?: (nodeId: string) => void;
  onNodeCreate?: (node: Partial<CanvasNode>) => void;
  onConnectionChange?: (connection: Partial<CanvasConnection>) => void;
  className?: string;
}

export default function CanvasContainer({
  initialTabs = [],
  onTabCreate,
  onTabChange,
  onNodeSelect,
  onNodeCreate,
  onConnectionChange,
  className
}: CanvasContainerProps) {
  const [activeTabId, setActiveTabId] = useState<string>(
    initialTabs.length > 0 ? initialTabs[0].id : ''
  );
  const [tabs, setTabs] = useState<CanvasTab[]>(initialTabs);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  // Get icon for tab type
  const getTabTypeIcon = (type: string) => {
    switch (type) {
      case 'freeform':
        return <Grid className="h-4 w-4" />;
      case 'calendar':
        return <Calendar className="h-4 w-4" />;
      case 'spreadsheet':
        return <Table className="h-4 w-4" />;
      case 'journey':
        return <Map className="h-4 w-4" />;
      case 'template':
        return <FileText className="h-4 w-4" />;
      default:
        return <Grid className="h-4 w-4" />;
    }
  };

  return (
    <div className={`canvas-container ${className || ''}`}>
      {/* Canvas toolbar */}
      <div className="canvas-toolbar">
        <h3>Canvas</h3>

        {/* Tab navigation */}
        <Tabs 
          value={activeTabId} 
          onValueChange={handleTabChange}
          className="w-auto"
        >
          <TabsList className="canvas-tabs">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2"
              >
                {getTabTypeIcon(tab.type)}
                <span>{tab.name}</span>
              </TabsTrigger>
            ))}
            
            {/* New Tab Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-1 rounded-full hover:bg-gray-100"
                    onClick={() => {
                      // This would show a modal or drawer with tab creation options
                      console.log("Open new tab creation UI");
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create new canvas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TabsList>

          {/* Tab Content */}
          {tabs.map((tab) => (
            <TabsContent 
              key={tab.id} 
              value={tab.id}
              className="w-full h-full m-0 p-0"
            >
              <LiteGraphWrapper 
                onNodeSelected={onNodeSelect}
                onNodeCreated={onNodeCreate}
                onConnectionChanged={onConnectionChange}
                className="w-full h-full"
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* If no tabs exist, show empty state */}
      {tabs.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="empty-state max-w-md">
            <div className="empty-state-icon">
              <Map className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="empty-state-title">Create Your First Canvas</h3>
            <p className="empty-state-message">
              Create a visual representation of your medical journey. Map out treatments, 
              track appointments, and organize your research.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                // This would show a modal or drawer with tab creation options
                console.log("Open new tab creation UI");
              }}
            >
              Create Canvas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}