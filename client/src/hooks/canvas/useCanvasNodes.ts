import { useState, useCallback } from 'react';
import { CanvasNode, CanvasTab } from '@shared/canvas-types';
import { v4 as uuidv4 } from 'uuid';

interface UseCanvasNodesProps {
  activeTabId: string;
  tabs: CanvasTab[];
  onTabsChange: (tabs: CanvasTab[]) => void;
}

/**
 * Hook to manage canvas nodes with operations to add, update, and remove nodes
 */
export const useCanvasNodes = ({ 
  activeTabId, 
  tabs, 
  onTabsChange 
}: UseCanvasNodesProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Get the active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  
  // Get the selected node from the active tab
  const selectedNode = activeTab?.nodes.find(node => node.id === selectedNodeId) || null;
  
  // Add a new node to the active tab
  const addNode = useCallback((node: CanvasNode) => {
    if (!activeTabId) return null;
    
    // Ensure node has an ID
    const newNode = {
      ...node,
      id: node.id || uuidv4(),
      createdAt: node.createdAt || new Date(),
      updatedAt: node.updatedAt || new Date()
    };
    
    // Update tabs state
    onTabsChange(
      tabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              nodes: [...tab.nodes, newNode],
              updatedAt: new Date() 
            } 
          : tab
      )
    );
    
    return newNode;
  }, [activeTabId, tabs, onTabsChange]);
  
  // Update an existing node
  const updateNode = useCallback((nodeId: string, updates: Partial<CanvasNode>) => {
    if (!activeTabId) return null;
    
    // Find the node to update
    const nodeToUpdate = activeTab?.nodes.find(node => node.id === nodeId);
    if (!nodeToUpdate) return null;
    
    // Create updated version of the node
    const updatedNode = {
      ...nodeToUpdate,
      ...updates,
      properties: {
        ...nodeToUpdate.properties,
        ...(updates.properties || {})
      },
      updatedAt: new Date()
    };
    
    // Update tabs state
    onTabsChange(
      tabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              nodes: tab.nodes.map(node => 
                node.id === nodeId ? updatedNode : node
              ),
              updatedAt: new Date() 
            } 
          : tab
      )
    );
    
    return updatedNode;
  }, [activeTabId, activeTab, tabs, onTabsChange]);
  
  // Remove a node
  const removeNode = useCallback((nodeId: string) => {
    if (!activeTabId) return;
    
    // Update tabs state
    onTabsChange(
      tabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              nodes: tab.nodes.filter(node => node.id !== nodeId),
              // Also remove any edges connected to this node
              edges: tab.edges.filter(edge => 
                edge.sourceNodeId !== nodeId && edge.targetNodeId !== nodeId
              ),
              updatedAt: new Date() 
            } 
          : tab
      )
    );
    
    // If the removed node was selected, clear selection
    if (nodeId === selectedNodeId) {
      setSelectedNodeId(null);
    }
  }, [activeTabId, tabs, onTabsChange, selectedNodeId]);
  
  // Update node properties (more targeted than updateNode)
  const updateNodeProperties = useCallback((nodeId: string, properties: Record<string, any>) => {
    if (!activeTabId) return null;
    
    // Find the node to update
    const nodeToUpdate = activeTab?.nodes.find(node => node.id === nodeId);
    if (!nodeToUpdate) return null;
    
    // Create updated version of the node with merged properties
    const updatedNode = {
      ...nodeToUpdate,
      properties: {
        ...nodeToUpdate.properties,
        ...properties
      },
      // Update title if title or name property is being updated
      title: properties.title || properties.name || nodeToUpdate.title,
      updatedAt: new Date()
    };
    
    // Update tabs state
    onTabsChange(
      tabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              nodes: tab.nodes.map(node => 
                node.id === nodeId ? updatedNode : node
              ),
              updatedAt: new Date() 
            } 
          : tab
      )
    );
    
    return updatedNode;
  }, [activeTabId, activeTab, tabs, onTabsChange]);
  
  // Select a node
  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);
  
  return {
    addNode,
    updateNode,
    removeNode,
    updateNodeProperties,
    selectNode,
    selectedNodeId,
    selectedNode
  };
};

export default useCanvasNodes;