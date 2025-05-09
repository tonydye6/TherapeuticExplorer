import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CanvasTab, CanvasNode, CanvasEdge, CanvasType, Position } from '@shared/canvas-types';

// Define the shape of our context
interface CanvasContextType {
  tabs: CanvasTab[];
  activeTabId: string | null;
  setActiveTabId: (id: string | null) => void;
  addTab: (type?: CanvasType) => void;
  updateTab: (tabId: string, updates: Partial<CanvasTab>) => void;
  deleteTab: (tabId: string) => void;
  addNode: (node: Partial<CanvasNode>) => string;
  updateNode: (nodeId: string, updates: Partial<CanvasNode>) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (edge: Partial<CanvasEdge>) => string;
  updateEdge: (edgeId: string, updates: Partial<CanvasEdge>) => void;
  deleteEdge: (edgeId: string) => void;
  moveNode: (nodeId: string, position: Position) => void;
}

// Create the context with a default value
const CanvasContext = createContext<CanvasContextType | null>(null);

// Provider component
export const CanvasProvider: React.FC<{ children: ReactNode, userId?: string }> = ({ 
  children,
  userId = '1' // Default user ID
}) => {
  const [tabs, setTabs] = useState<CanvasTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Add a new tab
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
    
    return newTab.id;
  }, [userId]);

  // Update a tab
  const updateTab = useCallback((tabId: string, updates: Partial<CanvasTab>) => {
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, ...updates, updatedAt: new Date() } 
          : tab
      )
    );
  }, []);

  // Delete a tab
  const deleteTab = useCallback((tabId: string) => {
    // If active tab is being deleted, clear the selection
    if (tabId === activeTabId) {
      setActiveTabId(null);
    }
    
    // Remove the tab
    setTabs(prevTabs => prevTabs.filter(tab => tab.id !== tabId));
  }, [activeTabId]);

  // Add a node to the active tab
  const addNode = useCallback((node: Partial<CanvasNode>): string => {
    if (!activeTabId) return '';
    
    const nodeId = node.id || uuidv4();
    
    const newNode: CanvasNode = {
      id: nodeId,
      title: node.title || 'New Node',
      type: node.type || 'default',
      position: node.position || { x: 0, y: 0 },
      size: node.size || { width: 200, height: 100 },
      properties: node.properties || {},
      createdAt: node.createdAt || new Date(),
    };
    
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              nodes: [...tab.nodes, newNode],
              updatedAt: new Date() 
            } 
          : tab
      )
    );
    
    return nodeId;
  }, [activeTabId]);

  // Update a node in the active tab
  const updateNode = useCallback((nodeId: string, updates: Partial<CanvasNode>) => {
    if (!activeTabId) return;
    
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              nodes: tab.nodes.map(node => 
                node.id === nodeId 
                  ? { ...node, ...updates } 
                  : node
              ),
              updatedAt: new Date() 
            } 
          : tab
      )
    );
  }, [activeTabId]);

  // Delete a node from the active tab
  const deleteNode = useCallback((nodeId: string) => {
    if (!activeTabId) return;
    
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              // Remove the node
              nodes: tab.nodes.filter(node => node.id !== nodeId),
              // Remove any edges connected to this node
              edges: tab.edges.filter(edge => 
                edge.sourceNodeId !== nodeId && edge.targetNodeId !== nodeId
              ),
              updatedAt: new Date() 
            } 
          : tab
      )
    );
  }, [activeTabId]);

  // Add an edge to the active tab
  const addEdge = useCallback((edge: Partial<CanvasEdge>): string => {
    if (!activeTabId) return '';
    
    const edgeId = edge.id || uuidv4();
    
    const newEdge: CanvasEdge = {
      id: edgeId,
      sourceNodeId: edge.sourceNodeId || '',
      targetNodeId: edge.targetNodeId || '',
      sourceOutputIndex: edge.sourceOutputIndex || 0,
      targetInputIndex: edge.targetInputIndex || 0,
      type: edge.type || 'default',
      properties: edge.properties || {},
    };
    
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              edges: [...tab.edges, newEdge],
              updatedAt: new Date() 
            } 
          : tab
      )
    );
    
    return edgeId;
  }, [activeTabId]);

  // Update an edge in the active tab
  const updateEdge = useCallback((edgeId: string, updates: Partial<CanvasEdge>) => {
    if (!activeTabId) return;
    
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              edges: tab.edges.map(edge => 
                edge.id === edgeId 
                  ? { ...edge, ...updates } 
                  : edge
              ),
              updatedAt: new Date() 
            } 
          : tab
      )
    );
  }, [activeTabId]);

  // Delete an edge from the active tab
  const deleteEdge = useCallback((edgeId: string) => {
    if (!activeTabId) return;
    
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              edges: tab.edges.filter(edge => edge.id !== edgeId),
              updatedAt: new Date() 
            } 
          : tab
      )
    );
  }, [activeTabId]);

  // Move a node to a new position
  const moveNode = useCallback((nodeId: string, position: Position) => {
    if (!activeTabId) return;
    
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              nodes: tab.nodes.map(node => 
                node.id === nodeId 
                  ? { ...node, position } 
                  : node
              ),
              updatedAt: new Date() 
            } 
          : tab
      )
    );
  }, [activeTabId]);

  // Create the context value object
  const contextValue: CanvasContextType = {
    tabs,
    activeTabId,
    setActiveTabId,
    addTab,
    updateTab,
    deleteTab,
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    updateEdge,
    deleteEdge,
    moveNode,
  };

  return (
    <CanvasContext.Provider value={contextValue}>
      {children}
    </CanvasContext.Provider>
  );
};

// Hook to use the canvas context
export function useCanvas() {
  const context = useContext(CanvasContext);
  
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  
  return context;
}