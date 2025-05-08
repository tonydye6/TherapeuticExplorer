import React, { useCallback, useRef } from 'react';
import { CanvasTab, CanvasType, CanvasNode } from '@shared/canvas-types';
import LiteGraphWrapper from './LiteGraphWrapper';
import CanvasTabBar from './CanvasTabBar';
import NodeDetailsPanel from './NodeDetailsPanel';
import { PlusCircle, Stethoscope, Activity, FileText, Book, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LGraphNode, LGraph } from 'litegraph.js';
import { NodeFactory } from './nodes/NodeFactory';
import { useCanvasState } from '@/hooks/canvas/useCanvasState';
import { useNodeMapping } from '@/hooks/canvas/useNodeMapping';

interface CanvasContainerProps {
  initialTabs?: CanvasTab[];
  className?: string;
  userId?: string;
}

export default function CanvasContainer({ 
  initialTabs, 
  className,
  userId = '1' // Default user ID, should be replaced with actual user ID from auth
}: CanvasContainerProps) {
  const graphRef = useRef<LGraph | null>(null);
  const graphWrapperRef = useRef<any>(null);
  
  // Use our canvas state hook to manage all canvas state
  const {
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    addTab,
    renameTab,
    deleteTab,
    addNode,
    selectNode,
    selectedNodeId,
    selectedNode: canvasSelectedNode,
    updateNodeProperties
  } = useCanvasState({
    initialTabs,
    userId,
    autoSave: true
  });
  
  // Use our node mapping hook to maintain the relationship between canvas and LiteGraph nodes
  const nodeMapping = useNodeMapping();
  
  // Track the selected LiteGraph node separately from our canvas state
  const [selectedLGraphNode, setSelectedLGraphNode] = React.useState<LGraphNode | null>(null);
  
  // Handle node selection from LiteGraph
  const handleNodeSelect = useCallback((nodeId: string, node: LGraphNode) => {
    console.log('Selected node:', nodeId, node);
    setSelectedLGraphNode(node);
    
    // Find the corresponding canvas node ID
    const canvasNodeId = nodeMapping.getCanvasNodeId(nodeId);
    
    if (canvasNodeId) {
      // If we have a mapping, use it to select the node in our state
      selectNode(canvasNodeId);
    } else if (activeTab) {
      // If no mapping exists, try to find a matching node by properties
      const matchingNode = nodeMapping.findCanvasNodeMatch(node, activeTab.nodes);
      
      if (matchingNode) {
        // If found, establish the mapping for future use
        nodeMapping.addMapping(matchingNode.id, nodeId);
        selectNode(matchingNode.id);
      }
    }
  }, [nodeMapping, selectNode, activeTab]);
  
  // Close node details panel
  const handleCloseNodeDetails = useCallback(() => {
    setSelectedLGraphNode(null);
    selectNode(null);
  }, [selectNode]);
  
  // Add a node to the graph
  const addNodeToGraph = useCallback((nodeType: string, position: {x: number, y: number}, properties: any) => {
    // Create the node using our factory
    const node = NodeFactory.createNode(
      nodeType,
      position,
      properties
    );
    
    // Add to our canvas state
    addNode(node);
    
    // Add to LiteGraph canvas with node mapping
    const graph = (window as any).sophGraph;
    if (graph) {
      try {
        // Create LiteGraph node and establish mapping
        const liteNode = nodeMapping.createNodeInLiteGraph(
          node,
          graph,
          (canvasNode, liteGraph) => NodeFactory.createLGraphNode(
            liteGraph, 
            canvasNode.type, 
            { 
              ...canvasNode.properties,
              title: canvasNode.title
            }, 
            canvasNode.position
          )
        );
        
        if (liteNode) {
          console.log('Node added to canvas with mapping:', node.id, '→', liteNode.id);
        }
      } catch (err) {
        console.error('Error adding node to canvas:', err);
      }
    } else {
      console.warn('Graph not available yet, node only added to state');
    }
  }, [addNode, nodeMapping]);
  
  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Tab bar */}
      <div className="px-4 pt-2 bg-muted/20 border-b border-border">
        <div className="flex items-center justify-between">
          <CanvasTabBar 
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={setActiveTabId}
            onRenameTab={renameTab}
            onDeleteTab={deleteTab}
          />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => addTab(CanvasType.FREEFORM)}
            className="neo-brutalism-btn"
          >
            <PlusCircle size={16} className="mr-1" />
            New Canvas
          </Button>
        </div>
      </div>
      
      {/* Node palette */}
      {activeTab && (
        <div className="px-4 py-2 bg-muted/10 border-b border-border flex items-center gap-2">
          <div className="text-sm font-medium mr-2">Add Node:</div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              addNodeToGraph(
                NodeFactory.NODE_TYPES.TREATMENT,
                { x: 100, y: 100 },
                { title: 'New Treatment', description: 'Treatment details' }
              );
            }}
            className="neo-brutalism-btn"
          >
            <Stethoscope size={14} className="mr-1" />
            Treatment
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              addNodeToGraph(
                NodeFactory.NODE_TYPES.SYMPTOM,
                { x: 100, y: 200 },
                { title: 'New Symptom', severity: 3 }
              );
            }}
            className="neo-brutalism-btn"
          >
            <Activity size={14} className="mr-1" />
            Symptom
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              addNodeToGraph(
                NodeFactory.NODE_TYPES.JOURNAL_ENTRY,
                { x: 200, y: 100 },
                { title: 'Journal Entry', content: 'My thoughts for today...' }
              );
            }}
            className="neo-brutalism-btn"
          >
            <Book size={14} className="mr-1" />
            Journal
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              addNodeToGraph(
                NodeFactory.NODE_TYPES.DOCUMENT,
                { x: 300, y: 100 },
                { title: 'Medical Document', documentType: 'Lab Results' }
              );
            }}
            className="neo-brutalism-btn"
          >
            <FileText size={14} className="mr-1" />
            Document
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              addNodeToGraph(
                NodeFactory.NODE_TYPES.NOTE,
                { x: 300, y: 200 },
                { title: 'Quick Note', content: 'Write your note here...' }
              );
            }}
            className="neo-brutalism-btn"
          >
            <Bookmark size={14} className="mr-1" />
            Note
          </Button>
        </div>
      )}
      
      {/* Canvas area */}
      <div className="flex-grow relative">
        {activeTab && (
          <div className="absolute inset-0">
            <LiteGraphWrapper 
              onNodeSelected={handleNodeSelect}
              onNodeCreated={(node) => {
                console.log('Node created:', node);
              }}
              className="w-full h-full"
            />
          </div>
        )}
        
        {!activeTab && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <h3 className="text-xl font-semibold mb-4">No Canvas Selected</h3>
              <p className="mb-4">Create a new canvas to get started.</p>
              <Button 
                onClick={() => addTab(CanvasType.FREEFORM)} 
                className="neo-brutalism-btn"
              >
                <PlusCircle size={16} className="mr-2" />
                Create New Canvas
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Node details panel (conditionally rendered) */}
      {selectedLGraphNode && activeTab && (
        <NodeDetailsPanel 
          selectedNode={selectedLGraphNode}
          onNodeUpdate={(node, props) => {
            console.log('Updating node:', node.id, props);
            
            // Update node properties in the graph
            if (node && node.properties) {
              // Update the properties in the LiteGraph node
              Object.assign(node.properties, props);
              
              // Force a redraw of the graph
              const graph = (window as any).sophGraph;
              if (graph) {
                graph.setDirtyCanvas(true);
              }
              
              // Get the canvas node ID from our mapping
              const canvasNodeId = nodeMapping.getCanvasNodeId(node.id.toString());
              
              if (canvasNodeId) {
                // If we have a mapping, use it to update the node in our state
                updateNodeProperties(canvasNodeId, props);
              } else if (activeTab) {
                // If no mapping exists, try to find a matching node by properties
                const matchingNode = nodeMapping.findCanvasNodeMatch(node, activeTab.nodes);
                
                if (matchingNode) {
                  // If found, establish the mapping for future use
                  nodeMapping.addMapping(matchingNode.id, node.id.toString());
                  updateNodeProperties(matchingNode.id, props);
                } else {
                  console.warn('Could not find matching canvas node for', node.id);
                }
              }
            }
          }}
          onClose={handleCloseNodeDetails}
        />
      )}
    </div>
  );
}