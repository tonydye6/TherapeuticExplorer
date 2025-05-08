import { useState, useCallback, useEffect } from 'react';
import { CanvasTab, CanvasType, CanvasNode, CanvasEdge } from '@shared/canvas-types';
import { v4 as uuidv4 } from 'uuid';
import { useCanvasNodes } from './useCanvasNodes';
import { apiRequest } from '@/lib/queryClient';

interface UseCanvasStateProps {
  initialTabs?: CanvasTab[];
  userId?: string;
  autoSave?: boolean;
}

/**
 * Hook to manage the entire canvas state including tabs, nodes, and persistence
 */
export const useCanvasState = ({ 
  initialTabs, 
  userId = '1',
  autoSave = true
}: UseCanvasStateProps = {}) => {
  // Default tabs if none provided
  const defaultTabs: CanvasTab[] = [
    { 
      id: uuidv4(), 
      title: 'My Journey', 
      type: CanvasType.JOURNEY,
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  // State for tabs
  const [tabs, setTabs] = useState<CanvasTab[]>(initialTabs || defaultTabs);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Get the active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  
  // Initialize canvas nodes hook
  const { 
    addNode,
    updateNode,
    removeNode,
    updateNodeProperties,
    selectNode,
    selectedNodeId,
    selectedNode
  } = useCanvasNodes({ 
    activeTabId, 
    tabs, 
    onTabsChange: setTabs 
  });
  
  // Add a new tab
  const addTab = useCallback((type: CanvasType = CanvasType.FREEFORM, title?: string) => {
    const newTabId = uuidv4();
    const newTab: CanvasTab = {
      id: newTabId,
      title: title || `New Canvas ${tabs.length + 1}`,
      type,
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTabId);
    return newTab;
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
  
  // Add edge between nodes
  const addEdge = useCallback((edge: CanvasEdge) => {
    if (!activeTabId) return;
    
    // Ensure edge has an ID
    const newEdge = {
      ...edge,
      id: edge.id || uuidv4()
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
    
    return newEdge;
  }, [activeTabId]);
  
  // Remove an edge
  const removeEdge = useCallback((edgeId: string) => {
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
  
  // Update edge properties
  const updateEdgeProperties = useCallback((edgeId: string, properties: Record<string, any>) => {
    if (!activeTabId) return;
    
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.id === activeTabId 
          ? { 
              ...tab, 
              edges: tab.edges.map(edge => 
                edge.id === edgeId
                  ? { 
                      ...edge, 
                      properties: { ...edge.properties, ...properties } 
                    }
                  : edge
              ),
              updatedAt: new Date() 
            } 
          : tab
      )
    );
  }, [activeTabId]);
  
  // Save canvas state to the backend
  const saveCanvasState = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsSaving(true);
      
      // This would be replaced with an actual API call
      // For now we're just simulating the API call
      console.log('Saving canvas state:', tabs);
      
      // Example API call (uncomment when ready to implement)
      // await apiRequest('POST', '/api/canvas/save', { 
      //   userId, 
      //   tabs: tabs.map(tab => ({ 
      //     ...tab, 
      //     // Convert dates to strings for transmission
      //     createdAt: tab.createdAt.toISOString(),
      //     updatedAt: tab.updatedAt.toISOString(),
      //     // Convert nodes with dates to strings
      //     nodes: tab.nodes.map(node => ({
      //       ...node,
      //       createdAt: node.createdAt.toISOString(),
      //       updatedAt: node.updatedAt.toISOString()
      //     }))
      //   }))
      // });
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save canvas state:', error);
    } finally {
      setIsSaving(false);
    }
  }, [tabs, userId]);
  
  // Load canvas state from the backend
  const loadCanvasState = useCallback(async () => {
    if (!userId) return;
    
    try {
      // Example API call (uncomment when ready to implement)
      // const response = await apiRequest('GET', `/api/canvas/${userId}`);
      // const loadedTabs = response.tabs.map(tab => ({
      //   ...tab,
      //   // Convert date strings back to Date objects
      //   createdAt: new Date(tab.createdAt),
      //   updatedAt: new Date(tab.updatedAt),
      //   // Convert nodes with date strings back to Date objects
      //   nodes: tab.nodes.map(node => ({
      //     ...node,
      //     createdAt: new Date(node.createdAt),
      //     updatedAt: new Date(node.updatedAt)
      //   }))
      // }));
      // 
      // setTabs(loadedTabs);
      // setActiveTabId(loadedTabs[0]?.id || '');
      
      console.log('Would load canvas state for user:', userId);
    } catch (error) {
      console.error('Failed to load canvas state:', error);
    }
  }, [userId]);
  
  // Auto-save effect
  useEffect(() => {
    if (!autoSave) return;
    
    const timer = setTimeout(() => {
      saveCanvasState();
    }, 3000); // Auto-save after 3 seconds of inactivity
    
    return () => clearTimeout(timer);
  }, [tabs, autoSave, saveCanvasState]);
  
  // Initial load
  useEffect(() => {
    if (userId && !initialTabs) {
      // Only load if no initial tabs were provided
      // loadCanvasState();
    }
  }, [userId, initialTabs, loadCanvasState]);
  
  return {
    // Tabs
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    addTab,
    renameTab,
    deleteTab,
    
    // Nodes
    addNode,
    updateNode,
    removeNode,
    updateNodeProperties,
    selectNode,
    selectedNodeId,
    selectedNode,
    
    // Edges
    addEdge,
    removeEdge,
    updateEdgeProperties,
    
    // Persistence
    saveCanvasState,
    loadCanvasState,
    isSaving,
    lastSaved
  };
};

export default useCanvasState;