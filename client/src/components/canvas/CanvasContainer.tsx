import React, { useState, useCallback } from 'react';
import LiteGraphWrapper from './LiteGraphWrapper';
import NodePalette, { NodeTemplate } from './NodePalette';
import { Button } from '@/components/ui/button';
import { FileText, ZoomIn, ZoomOut, Save, Trash2 } from 'lucide-react';

interface CanvasContainerProps {
  title?: string;
  className?: string;
}

export default function CanvasContainer({ 
  title = 'Sophera Canvas', 
  className = ''
}: CanvasContainerProps) {
  const [nodeSelected, setNodeSelected] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  
  // Callbacks for LiteGraph events
  const handleNodeSelected = useCallback((nodeId: string) => {
    setNodeSelected(nodeId);
    console.log('Node selected:', nodeId);
  }, []);

  const handleNodeCreated = useCallback((node: any) => {
    console.log('Node created:', node);
  }, []);

  const handleNodeRemoved = useCallback((node: any) => {
    if (nodeSelected === node.id) {
      setNodeSelected(null);
    }
    console.log('Node removed:', node);
  }, [nodeSelected]);

  const handleConnectionChanged = useCallback((connection: any) => {
    console.log('Connection changed:', connection);
  }, []);

  // Handle node template selection from palette
  const handleNodeSelect = useCallback((template: NodeTemplate) => {
    // This will integrate with LiteGraph.js to add the node
    console.log('Selected node template:', template);
  }, []);
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Canvas Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className="neo-brutalism-btn"
          >
            <FileText className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="neo-brutalism-btn">
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="neo-brutalism-btn">
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="neo-brutalism-btn">
            <Save className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="neo-brutalism-btn">
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Canvas Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node Palette */}
        {isPaletteOpen && (
          <div className="w-64 border-r border-gray-200 overflow-y-auto p-2 bg-background">
            <NodePalette onNodeSelect={handleNodeSelect} />
          </div>
        )}
        
        {/* Canvas Area */}
        <div className="flex-1 relative">
          <LiteGraphWrapper
            onNodeSelected={handleNodeSelected}
            onNodeCreated={handleNodeCreated}
            onNodeRemoved={handleNodeRemoved}
            onConnectionChanged={handleConnectionChanged}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}