import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CanvasTab, CanvasType, CanvasNode, CanvasEdge } from '@shared/canvas-types';
import LiteGraphWrapper from './LiteGraphWrapper';
import CanvasTabBar from './CanvasTabBar';
import NodeDetailsPanel from './NodeDetailsPanel';
import { PlusCircle, Stethoscope, Activity, FileText, Book, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { LGraphNode, LGraph } from 'litegraph.js';
import { NodeFactory } from './nodes/NodeFactory';

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
  // State for tabs and active tab
  const [tabs, setTabs] = useState<CanvasTab[]>(initialTabs || [
    { 
      id: 'tab1', 
      title: 'My Journey', 
      type: CanvasType.JOURNEY,
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || '');
  const [selectedNode, setSelectedNode] = useState<LGraphNode | null>(null);
  const graphRef = useRef<LGraph | null>(null);
  
  // Get the currently active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  
  // Handle node selection from LiteGraph
  const handleNodeSelect = useCallback((nodeId: string, node: LGraphNode) => {
    console.log('Selected node:', nodeId, node);
    setSelectedNode(node);
  }, []);
  
  // Close node details panel
  const handleCloseNodeDetails = useCallback(() => {
    setSelectedNode(null);
  }, []);
  
  // Add a new tab
  const addNewTab = useCallback(() => {
    const newTabId = uuidv4();
    const newTab: CanvasTab = {
      id: newTabId,
      title: `New Canvas ${tabs.length + 1}`,
      type: CanvasType.FREEFORM,
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTabId);
  }, [tabs.length]);
  
  // Rename a tab
  const renameTab = useCallback((tabId: string, newTitle: string) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, title: newTitle, updatedAt: new Date() } 
          : tab
      )
    );
  }, []);
  
  // Delete a tab
  const deleteTab = useCallback((tabId: string) => {
    setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));
    
    // If the active tab is being deleted, switch to another tab
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[0].id);
      }
    }
  }, [activeTabId, tabs]);
  
  // Handle tab switch
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    setSelectedNode(null); // Clear selected node when changing tabs
  }, []);
  
  // Graph reference
  const graphWrapperRef = useRef<any>(null);
  
  // Create a new node
  const addNode = useCallback((node: CanvasNode) => {
    if (!activeTabId) return;
    
    // Add to state
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              nodes: [...tab.nodes, node],
              updatedAt: new Date() 
            } 
          : tab
      )
    );
    
    // Add to canvas using the global reference as a workaround
    // This will be improved later with a more robust approach
    const graph = (window as any).sophGraph;
    if (graph) {
      try {
        // Use the updated NodeFactory API with string-based node types
        NodeFactory.createLGraphNode(
          graph, 
          node.type, 
          { 
            ...node.properties,
            title: node.title
          }, 
          node.position
        );
        console.log('Node added to canvas:', node);
      } catch (err) {
        console.error('Error adding node to canvas:', err);
      }
    } else {
      console.warn('Graph not available yet, node only added to state');
    }
  }, [activeTabId]);
  
  // Create a new edge
  const addEdge = useCallback((edge: CanvasEdge) => {
    if (!activeTabId) return;
    
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              edges: [...tab.edges, edge],
              updatedAt: new Date() 
            } 
          : tab
      )
    );
  }, [activeTabId]);
  
  // Save canvas state to backend (would connect to actual API)
  const saveCanvas = useCallback(async () => {
    console.log('Saving canvas state:', tabs);
    // TODO: Implement actual API call to save canvas state
    // Example: await apiClient.post('/api/canvas/save', { userId, tabs });
  }, [tabs]);
  
  // Load canvas state from backend (would connect to actual API)
  useEffect(() => {
    // This would be replaced with an actual API call
    const loadCanvasState = async () => {
      try {
        // Example: const response = await apiClient.get(`/api/canvas/${userId}`);
        // setTabs(response.data.tabs);
        console.log('Would load canvas state for user:', userId);
      } catch (error) {
        console.error('Error loading canvas state:', error);
      }
    };
    
    if (userId && !initialTabs) {
      // Only load if no initial tabs were provided
      // loadCanvasState();
    }
  }, [userId, initialTabs]);
  
  // Autosave on tab changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveCanvas();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [tabs, saveCanvas]);
  
  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Tab bar */}
      <div className="px-4 pt-2 bg-muted/20 border-b border-border">
        <div className="flex items-center justify-between">
          <CanvasTabBar 
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={handleTabChange}
            onRenameTab={renameTab}
            onDeleteTab={deleteTab}
          />
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
      
      {/* Node palette */}
      {activeTab && (
        <div className="px-4 py-2 bg-muted/10 border-b border-border flex items-center gap-2">
          <div className="text-sm font-medium mr-2">Add Node:</div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const position = { x: 100, y: 100 };
              const node = NodeFactory.createNode(
                NodeFactory.NODE_TYPES.TREATMENT, 
                position,
                { title: 'New Treatment', description: 'Treatment details' }
              );
              addNode(node);
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
              const position = { x: 100, y: 200 };
              const node = NodeFactory.createNode(
                NodeFactory.NODE_TYPES.SYMPTOM, 
                position,
                { title: 'New Symptom', severity: 3 }
              );
              addNode(node);
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
              const position = { x: 200, y: 100 };
              const node = NodeFactory.createNode(
                NodeFactory.NODE_TYPES.JOURNAL_ENTRY, 
                position,
                { title: 'Journal Entry', content: 'My thoughts for today...' }
              );
              addNode(node);
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
              const position = { x: 300, y: 100 };
              const node = NodeFactory.createNode(
                NodeFactory.NODE_TYPES.DOCUMENT, 
                position,
                { title: 'Medical Document', documentType: 'Lab Results' }
              );
              addNode(node);
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
              const position = { x: 300, y: 200 };
              const node = NodeFactory.createNode(
                NodeFactory.NODE_TYPES.NOTE, 
                position,
                { title: 'Quick Note', content: 'Write your note here...' }
              );
              addNode(node);
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
              <Button onClick={addNewTab} className="neo-brutalism-btn">
                <PlusCircle size={16} className="mr-2" />
                Create New Canvas
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Node details panel (conditionally rendered) */}
      {selectedNode && activeTab && (
        <NodeDetailsPanel 
          selectedNode={selectedNode}
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
              
              // Find the node in our state
              if (activeTabId) {
                setTabs(prevTabs => 
                  prevTabs.map(tab => {
                    if (tab.id !== activeTabId) return tab;
                    
                    const updatedNodes = tab.nodes.map(canvasNode => {
                      // Match node based on properties or ID
                      if (node.id && canvasNode.id === node.id) {
                        return {
                          ...canvasNode,
                          properties: { ...canvasNode.properties, ...props },
                          title: props.title || props.name || canvasNode.title,
                          updatedAt: new Date()
                        };
                      }
                      return canvasNode;
                    });
                    
                    return {
                      ...tab,
                      nodes: updatedNodes,
                      updatedAt: new Date()
                    };
                  })
                );
              }
            }
          }}
          onClose={handleCloseNodeDetails}
        />
      )}
    </div>
  );
}