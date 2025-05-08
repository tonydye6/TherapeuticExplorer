import React, { useCallback, useRef, useState, useEffect } from 'react';
import { CanvasTab, CanvasType, CanvasNode, CanvasEdge } from '@shared/canvas-types';
import LiteGraphWrapper from './LiteGraphWrapper';
import CanvasTabBar from './CanvasTabBar';
import NodeDetailsPanel from './NodeDetailsPanel';
import EdgeDetailsPanel from './EdgeDetailsPanel';
import { PlusCircle, Stethoscope, Activity, FileText, Book, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LGraphNode, LGraph } from 'litegraph.js';
import { NodeFactory } from './nodes/NodeFactory';
import { useCanvasState } from '@/hooks/canvas/useCanvasState';
import { useNodeMapping } from '@/hooks/canvas/useNodeMapping';
import { v4 as uuidv4 } from 'uuid';

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
    updateNodeProperties,
    addEdge,
    removeEdge,
    updateEdgeProperties
  } = useCanvasState({
    initialTabs,
    userId,
    autoSave: true
  });
  
  // Use our node mapping hook to maintain the relationship between canvas and LiteGraph nodes
  const nodeMapping = useNodeMapping();
  
  // Track the selected LiteGraph node separately from our canvas state
  const [selectedLGraphNode, setSelectedLGraphNode] = React.useState<LGraphNode | null>(null);
  
  // Track when the graph is ready
  const [graphReady, setGraphReady] = useState(false);
  
  // Track selected edge
  const [selectedEdge, setSelectedEdge] = useState<CanvasEdge | null>(null);
  
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
  
  // Helper function to create connections for an edge
  const createConnection = useCallback((edge: CanvasEdge) => {
    const graph = (window as any).sophGraph;
    if (!graph) return;
    
    // Get the LiteGraph nodes
    const sourceLiteNodeId = nodeMapping.getLiteNodeId(edge.sourceNodeId);
    const targetLiteNodeId = nodeMapping.getLiteNodeId(edge.targetNodeId);
    
    if (!sourceLiteNodeId || !targetLiteNodeId) {
      console.warn(`Cannot create connection: missing LiteGraph node IDs for edge ${edge.id}`);
      return;
    }
    
    // Get the actual nodes from the graph
    const sourceLiteNode = graph.getNodeById(parseInt(sourceLiteNodeId));
    const targetLiteNode = graph.getNodeById(parseInt(targetLiteNodeId));
    
    if (!sourceLiteNode || !targetLiteNode) {
      console.warn(`Cannot create connection: LiteGraph nodes not found for edge ${edge.id}`);
      return;
    }
    
    // Create the connection
    try {
      const connected = graph.connect(
        sourceLiteNode.id, 
        edge.sourceOutputIndex || 0, 
        targetLiteNode.id, 
        edge.targetInputIndex || 0
      );
      
      if (connected) {
        console.log(`Created connection for edge ${edge.id}: ${sourceLiteNode.id} -> ${targetLiteNode.id}`);
      } else {
        console.warn(`Failed to create connection for edge ${edge.id}`);
      }
    } catch (err) {
      console.error(`Error creating connection for edge ${edge.id}:`, err);
    }
  }, [nodeMapping]);
  
  // Effect to initialize connections when graph and node mappings are ready
  useEffect(() => {
    if (graphReady && activeTab && activeTab.edges.length > 0) {
      console.log('Initializing edges from canvas state:', activeTab.edges);
      
      // Create connections for all edges in the active tab
      activeTab.edges.forEach(edge => {
        createConnection(edge);
      });
    }
  }, [graphReady, activeTab, createConnection]);
  
  // Effect to initialize nodes from active tab
  useEffect(() => {
    if (graphReady && activeTab && activeTab.nodes.length > 0) {
      console.log('Initializing nodes from canvas state:', activeTab.nodes);
      
      const graph = (window as any).sophGraph;
      if (graph) {
        // First clear any existing nodes
        graph.clear();
        
        // Reset node mappings since we're rebuilding everything
        nodeMapping.clearMappings();
        
        // Then add all nodes from our canvas state
        activeTab.nodes.forEach(canvasNode => {
          try {
            // Create LiteGraph node
            const liteNode = NodeFactory.createLGraphNode(
              graph,
              canvasNode.type,
              {
                ...canvasNode.properties,
                title: canvasNode.title
              },
              canvasNode.position
            );
            
            if (liteNode) {
              // Establish the mapping
              nodeMapping.addMapping(canvasNode.id, liteNode.id.toString());
              console.log(`Created node mapping: ${canvasNode.id} → ${liteNode.id}`);
            }
          } catch (err) {
            console.error(`Error creating node for ${canvasNode.id}:`, err);
          }
        });
        
        // Force a redraw
        graph.setDirtyCanvas(true);
      }
    }
  }, [graphReady, activeTab, nodeMapping]);
  
  // Effect to set graph ready flag when the graph is accessible
  useEffect(() => {
    const checkGraph = () => {
      const graph = (window as any).sophGraph;
      if (graph) {
        console.log('LiteGraph instance is ready');
        setGraphReady(true);
      } else {
        // Try again in a moment
        setTimeout(checkGraph, 100);
      }
    };
    
    checkGraph();
    
    return () => {
      setGraphReady(false);
    };
  }, [activeTabId]); // Re-check when the active tab changes
  
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
    <div className={`flex flex-col h-full canvas-container ${className || ''}`}>
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
              onLinkSelected={(linkId, link) => {
                if (!activeTab) return;
                
                console.log('Link selected:', linkId, link);
                
                // Get the canvas node IDs from our mapping
                const sourceCanvasNodeId = nodeMapping.getCanvasNodeId(link.origin_node.id.toString());
                const targetCanvasNodeId = nodeMapping.getCanvasNodeId(link.target_node.id.toString());
                
                if (sourceCanvasNodeId && targetCanvasNodeId) {
                  // Find the corresponding edge in our data model
                  const edge = activeTab.edges.find(e => 
                    e.sourceNodeId === sourceCanvasNodeId && 
                    e.targetNodeId === targetCanvasNodeId
                  );
                  
                  if (edge) {
                    // Clear any selected node
                    if (selectedLGraphNode) {
                      handleCloseNodeDetails();
                    }
                    
                    // Add visual indicator for clicked link
                    const container = document.querySelector('.canvas-container');
                    if (container) {
                      const notification = document.createElement('div');
                      notification.classList.add('connection-notification');
                      notification.textContent = 'Connection selected! Edit details in the panel ➡️';
                      notification.style.cssText = 'position: fixed; top: 60px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999; animation: fadeOut 3s forwards 2s; border-left: 4px solid #FF7F50;';
                      container.appendChild(notification);
                      setTimeout(() => notification.remove(), 5000);
                    }
                    
                    // Set the selected edge with logging
                    console.log('Setting selectedEdge from link click:', edge);
                    setSelectedEdge(null); // Clear first
                    setTimeout(() => {
                      setSelectedEdge(edge);
                      console.log('Edge has been set from link click');
                    }, 50);
                  }
                }
              }}
              onConnectionChanged={(connectionInfo) => {
                // Handle connection changes
                const { 
                  connected, 
                  sourceNodeId, 
                  sourceOutputIndex, 
                  targetNodeId, 
                  targetInputIndex 
                } = connectionInfo;
                
                if (connected && sourceNodeId && targetNodeId) {
                  // Connection was created - add an edge to our data model
                  console.log('Connection created:', sourceNodeId, '->', targetNodeId);
                  
                  // Get the canvas node IDs from our mapping
                  const canvasSourceNodeId = nodeMapping.getCanvasNodeId(sourceNodeId.toString());
                  const canvasTargetNodeId = nodeMapping.getCanvasNodeId(targetNodeId.toString());
                  
                  if (canvasSourceNodeId && canvasTargetNodeId) {
                    // Create a new edge
                    const newEdge: CanvasEdge = {
                      id: uuidv4(),
                      sourceNodeId: canvasSourceNodeId,
                      sourceOutputIndex: sourceOutputIndex || 0,
                      targetNodeId: canvasTargetNodeId,
                      targetInputIndex: targetInputIndex || 0,
                      type: 'default',
                      properties: { 
                        createdAt: new Date(),
                        relationship: 'related'
                      }
                    };
                    
                    // Add the edge to our data model
                    const createdEdge = addEdge(newEdge);
                    
                    // Select the newly created edge for editing
                    console.log('Setting selectedEdge for editing:', createdEdge || newEdge);
                    
                    // Clear any selected node first to avoid UI conflicts
                    if (selectedLGraphNode) {
                      handleCloseNodeDetails();
                    }
                    
                    // Add visual notification
                    const container = document.querySelector('.canvas-container');
                    if (container) {
                      const notification = document.createElement('div');
                      notification.classList.add('connection-notification');
                      notification.textContent = 'Connection created! Edit details in the panel ➡️';
                      notification.style.cssText = 'position: fixed; top: 60px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999; animation: fadeOut 3s forwards 2s; border-left: 4px solid #0D9488;';
                      container.appendChild(notification);
                      setTimeout(() => notification.remove(), 5000);
                    }
                    
                    // Force an update to render edge panel first by temporarily clearing then setting
                    // Use a slightly longer timeout to ensure components have time to update
                    setSelectedEdge(null);
                    
                    // Log before setting
                    console.log('About to set selectedEdge after delay...');
                    
                    // Use a 3-stage approach for higher reliability
                    setTimeout(() => {
                      console.log('First timeout completed, setting edge...');
                      const edgeToSet = createdEdge || newEdge;
                      setSelectedEdge(edgeToSet);
                      console.log('Edge set to:', edgeToSet);
                      
                      // Double-check after another delay that the edge is still selected
                      setTimeout(() => {
                        console.log('Verifying edge is still selected...');
                        if (!selectedEdge) {
                          console.log('Edge was not selected, retrying...');
                          setSelectedEdge(edgeToSet);
                        }
                      }, 100);
                    }, 150);
                  }
                } else if (!connected && sourceNodeId && targetNodeId) {
                  // Connection was removed - find and remove the edge from our data model
                  console.log('Connection removed:', sourceNodeId, '->', targetNodeId);
                  
                  // Find the corresponding edge in the active tab
                  if (activeTab) {
                    const canvasSourceNodeId = nodeMapping.getCanvasNodeId(sourceNodeId.toString());
                    const canvasTargetNodeId = nodeMapping.getCanvasNodeId(targetNodeId.toString());
                    
                    if (canvasSourceNodeId && canvasTargetNodeId) {
                      const edge = activeTab.edges.find(e => 
                        e.sourceNodeId === canvasSourceNodeId &&
                        e.targetNodeId === canvasTargetNodeId
                      );
                      
                      if (edge) {
                        // Remove the edge from our data model
                        removeEdge(edge.id);
                      }
                    }
                  }
                }
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
      {selectedLGraphNode && activeTab && !selectedEdge && (
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
      
      {/* Edge details panel (conditionally rendered) */}
      {selectedEdge && activeTab && selectedEdge.sourceNodeId && selectedEdge.targetNodeId && (
        <div className="fixed right-8 top-20 z-50" id="edge-details-panel-container">
          <div className="relative">
            {/* Arrow indicator pointing to panel */}
            <div className="absolute -left-8 top-10 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-black border-b-8 border-b-transparent"></div>
            
            {/* Highlight element to draw attention to panel */}
            <div className="absolute -inset-2 bg-yellow-200 rounded-xl opacity-20 animate-pulse -z-10"></div>
            
            {/* EdgeDetailsPanel being rendered */}
            <EdgeDetailsPanel
              edge={selectedEdge}
              sourceTitle={activeTab.nodes.find(n => n.id === selectedEdge.sourceNodeId)?.title ?? 'Source Node'}
              targetTitle={activeTab.nodes.find(n => n.id === selectedEdge.targetNodeId)?.title ?? 'Target Node'}
              onClose={() => {
                console.log('Closing edge panel');
                setSelectedEdge(null);
              }}
              onUpdate={(edge, properties) => {
                console.log('Updating edge properties:', edge.id, properties);
                updateEdgeProperties(edge.id, properties);
                
                // Show success notification
                const container = document.querySelector('.canvas-container');
                if (container) {
                  const notification = document.createElement('div');
                  notification.classList.add('connection-notification');
                  notification.textContent = 'Connection updated successfully! ✓';
                  notification.style.cssText = 'position: fixed; top: 60px; right: 20px; background: rgba(13, 148, 136, 0.9); color: white; padding: 12px 20px; border-radius: 8px; font-weight: 500; z-index: 9999; animation: fadeOut 3s forwards 1s; border-left: 4px solid #0D9488;';
                  container.appendChild(notification);
                  setTimeout(() => notification.remove(), 4000);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}