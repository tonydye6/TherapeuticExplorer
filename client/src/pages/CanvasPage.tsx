import React, { useState } from 'react';
import CanvasContainer from '@/components/canvas/CanvasContainer';
import { NodeType, CanvasType } from '@shared/canvas-types';
import { NodeFactory } from '@/components/canvas/nodes/NodeFactory';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Grid, Calendar, Table, Map, LayoutTemplate } from 'lucide-react';

interface NodePaletteProps {
  onNodeSelect: (nodeType: NodeType) => void;
}

// Node Palette component allowing user to select node types
const NodePalette: React.FC<NodePaletteProps> = ({ onNodeSelect }) => {
  return (
    <div className="p-4 border-l-2 border-black bg-white shadow-md w-64 overflow-y-auto">
      <h3 className="font-semibold text-lg mb-4">Add Nodes</h3>
      
      <div className="space-y-6">
        {/* Medical Nodes */}
        <div>
          <h4 className="font-semibold mb-2 text-sm uppercase">Medical</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="neo-brutalism-btn justify-start"
              onClick={() => onNodeSelect(NodeType.TREATMENT)}
            >
              Treatment
            </Button>
            <Button 
              variant="outline" 
              className="neo-brutalism-btn justify-start"
              onClick={() => onNodeSelect(NodeType.MEDICATION)}
            >
              Medication
            </Button>
            <Button 
              variant="outline" 
              className="neo-brutalism-btn justify-start"
              onClick={() => onNodeSelect(NodeType.SYMPTOM)}
            >
              Symptom
            </Button>
            <Button 
              variant="outline" 
              className="neo-brutalism-btn justify-start"
              onClick={() => onNodeSelect(NodeType.LAB_RESULT)}
            >
              Lab Result
            </Button>
          </div>
        </div>
        
        {/* Journal Nodes */}
        <div>
          <h4 className="font-semibold mb-2 text-sm uppercase">Journal</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="neo-brutalism-btn justify-start"
              onClick={() => onNodeSelect(NodeType.MOOD_ENTRY)}
            >
              Mood
            </Button>
            <Button 
              variant="outline" 
              className="neo-brutalism-btn justify-start"
              onClick={() => onNodeSelect(NodeType.SYMPTOM_LOG)}
            >
              Symptom Log
            </Button>
            <Button 
              variant="outline" 
              className="neo-brutalism-btn justify-start"
              onClick={() => onNodeSelect(NodeType.DIET_LOG)}
            >
              Diet Log
            </Button>
            <Button 
              variant="outline" 
              className="neo-brutalism-btn justify-start"
              onClick={() => onNodeSelect(NodeType.EXERCISE_LOG)}
            >
              Exercise
            </Button>
          </div>
        </div>
        
        {/* Support Nodes */}
        <div>
          <h4 className="font-semibold mb-2 text-sm uppercase">Support</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="neo-brutalism-btn justify-start"
              onClick={() => onNodeSelect(NodeType.MILESTONE)}
            >
              Milestone
            </Button>
            <Button 
              variant="outline" 
              className="neo-brutalism-btn justify-start"
              onClick={() => onNodeSelect(NodeType.HOPE_SNIPPET)}
            >
              Hope Snippet
            </Button>
            <Button 
              variant="outline" 
              className="neo-brutalism-btn justify-start"
              onClick={() => onNodeSelect(NodeType.VICTORY)}
            >
              Victory
            </Button>
            <Button 
              variant="outline" 
              className="neo-brutalism-btn justify-start"
              onClick={() => onNodeSelect(NodeType.NOTE)}
            >
              Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CanvasPage: React.FC = () => {
  const [canvasType, setCanvasType] = useState<CanvasType>(CanvasType.FREEFORM);
  const [showNodePalette, setShowNodePalette] = useState(true);
  
  // Handle selecting a node type from the palette
  const handleNodeSelect = (nodeType: NodeType) => {
    console.log('Selected node type:', nodeType);
    
    // Create a node at the center of the canvas
    // In a real implementation, this would be at the mouse cursor position
    try {
      // Get the graph instance from the global we added in LiteGraphWrapper
      const graph = (window as any).sophGraph;
      if (graph) {
        const center = { x: 400, y: 300 }; // Default center position
        
        // Create the node using NodeFactory
        const node = NodeFactory.createLGraphNode(
          graph,
          nodeType,
          { title: `New ${nodeType.toString()}` },
          center
        );
        
        if (node) {
          console.log('Created node:', node);
          graph.setDirtyCanvas(true); // Force canvas redraw
        } else {
          console.error('Failed to create node');
        }
      } else {
        console.error('Graph not available');
      }
    } catch (error) {
      console.error('Error creating node:', error);
    }
  };
  
  return (
    <div className="h-screen flex flex-col">
      <div className="border-b-2 border-black bg-white shadow-sm">
        <div className="container flex items-center justify-between py-2">
          <h1 className="text-2xl font-bold">Canvas</h1>
          
          <div className="flex items-center space-x-4">
            <Tabs value={canvasType} onValueChange={(value) => setCanvasType(value as CanvasType)}>
              <TabsList className="grid grid-cols-5 w-auto">
                <TabsTrigger value={CanvasType.FREEFORM} className="flex items-center gap-1">
                  <Grid size={14} /> Freeform
                </TabsTrigger>
                <TabsTrigger value={CanvasType.CALENDAR} className="flex items-center gap-1">
                  <Calendar size={14} /> Calendar
                </TabsTrigger>
                <TabsTrigger value={CanvasType.SPREADSHEET} className="flex items-center gap-1">
                  <Table size={14} /> Spreadsheet
                </TabsTrigger>
                <TabsTrigger value={CanvasType.JOURNEY} className="flex items-center gap-1">
                  <Map size={14} /> Journey
                </TabsTrigger>
                <TabsTrigger value={CanvasType.TEMPLATE} className="flex items-center gap-1">
                  <LayoutTemplate size={14} /> Templates
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowNodePalette(!showNodePalette)}
              className="neo-brutalism-btn"
            >
              <Plus size={16} className="mr-1" />
              {showNodePalette ? 'Hide Palette' : 'Show Palette'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-grow flex">
        <div className="flex-grow h-full">
          <CanvasContainer className="h-full" />
        </div>
        
        {showNodePalette && (
          <NodePalette onNodeSelect={handleNodeSelect} />
        )}
      </div>
    </div>
  );
};

export default CanvasPage;