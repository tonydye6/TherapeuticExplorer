import React, { useState, useCallback, useEffect } from 'react';
import { CanvasTab, CanvasType, CanvasNode, CanvasEdge } from '@shared/canvas-types';
import LiteGraphWrapper from './LiteGraphWrapper';
import CanvasTabBar from './CanvasTabBar';
import NodeDetailsPanel from './NodeDetailsPanel';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Get the currently active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  
  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    console.log('Selected node:', nodeId);
    setSelectedNodeId(nodeId);
  }, []);
  
  // Close node details panel
  const handleCloseNodeDetails = useCallback(() => {
    setSelectedNodeId(null);
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
    setSelectedNodeId(null); // Clear selected node when changing tabs
  }, []);
  
  // Create a new node
  const addNode = useCallback((node: CanvasNode) => {
    if (!activeTabId) return;
    
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
      
      {/* Canvas area */}
      <div className="flex-grow relative">
        {activeTab && (
          <div className="absolute inset-0">
            <LiteGraphWrapper 
              onNodeSelected={handleNodeSelect}
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
      {selectedNodeId && activeTab && (
        <NodeDetailsPanel 
          nodeId={selectedNodeId}
          tabId={activeTabId}
          onClose={handleCloseNodeDetails}
        />
      )}
    </div>
  );
}