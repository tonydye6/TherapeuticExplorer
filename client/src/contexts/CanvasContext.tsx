import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CanvasTab, CanvasNode, CanvasConnection, CanvasTabType } from '@shared/canvas-types';

interface CanvasContextType {
  // Tabs
  tabs: CanvasTab[];
  activeTabId: string | null;
  createTab: (name: string, type: CanvasTabType) => Promise<string>;
  updateTab: (tabId: string, updates: Partial<Omit<CanvasTab, 'id' | 'created' | 'updated'>>) => Promise<void>;
  deleteTab: (tabId: string) => Promise<void>;
  setActiveTabId: (tabId: string | null) => void;
  
  // Nodes
  nodes: CanvasNode[];
  createNode: (node: Omit<CanvasNode, 'id' | 'created' | 'updated'>) => Promise<string>;
  updateNode: (nodeId: string, updates: Partial<Omit<CanvasNode, 'id' | 'created' | 'updated'>>) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  
  // Connections
  connections: CanvasConnection[];
  createConnection: (connection: Omit<CanvasConnection, 'id'>) => Promise<string>;
  deleteConnection: (connectionId: string) => Promise<void>;
  
  // Canvas state
  scale: number;
  offset: [number, number];
  setScale: (scale: number) => void;
  setOffset: (offset: [number, number]) => void;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

interface CanvasProviderProps {
  children: ReactNode;
  userId: string;
}

export const CanvasProvider = ({ children, userId }: CanvasProviderProps) => {
  const [tabs, setTabs] = useState<CanvasTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState<[number, number]>([0, 0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's tabs on init
  useEffect(() => {
    const loadUserTabs = async () => {
      setIsLoading(true);
      try {
        // In the future, this will fetch from the API
        // For now, we'll create a default tab if none exist
        const defaultTab: CanvasTab = {
          id: uuidv4(),
          userId,
          name: 'My Journey Canvas',
          type: 'freeform',
          config: {
            gridSize: 25,
            background: '#f0f4f8',
          },
          created: new Date(),
          updated: new Date(),
        };
        
        setTabs([defaultTab]);
        setActiveTabId(defaultTab.id);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load canvas tabs');
        setIsLoading(false);
      }
    };
    
    if (userId) {
      loadUserTabs();
    }
  }, [userId]);

  // Load nodes and connections when active tab changes
  useEffect(() => {
    const loadTabContent = async () => {
      if (!activeTabId) return;
      
      setIsLoading(true);
      try {
        // In the future, this will fetch from the API
        // For now, we'll use empty arrays
        setNodes([]);
        setConnections([]);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load canvas content');
        setIsLoading(false);
      }
    };
    
    loadTabContent();
  }, [activeTabId]);

  // Tab operations
  const createTab = async (name: string, type: CanvasTabType): Promise<string> => {
    const newTab: CanvasTab = {
      id: uuidv4(),
      userId,
      name,
      type,
      config: {
        gridSize: 25,
        background: '#f0f4f8',
      },
      created: new Date(),
      updated: new Date(),
    };
    
    setTabs((prevTabs) => [...prevTabs, newTab]);
    return newTab.id;
  };

  const updateTab = async (tabId: string, updates: Partial<Omit<CanvasTab, 'id' | 'created' | 'updated'>>) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId
          ? { ...tab, ...updates, updated: new Date() }
          : tab
      )
    );
  };

  const deleteTab = async (tabId: string) => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== tabId));
    
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter((tab) => tab.id !== tabId);
      setActiveTabId(remainingTabs.length > 0 ? remainingTabs[0].id : null);
    }
  };

  // Node operations
  const createNode = async (node: Omit<CanvasNode, 'id' | 'created' | 'updated'>): Promise<string> => {
    const newNode: CanvasNode = {
      ...node,
      id: uuidv4(),
      created: new Date(),
      updated: new Date(),
    };
    
    setNodes((prevNodes) => [...prevNodes, newNode]);
    return newNode.id;
  };

  const updateNode = async (nodeId: string, updates: Partial<Omit<CanvasNode, 'id' | 'created' | 'updated'>>) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? { ...node, ...updates, updated: new Date() }
          : node
      )
    );
  };

  const deleteNode = async (nodeId: string) => {
    // Delete node
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
    
    // Delete any connections to/from this node
    setConnections((prevConnections) =>
      prevConnections.filter(
        (conn) => conn.originNode !== nodeId && conn.targetNode !== nodeId
      )
    );
  };

  // Connection operations
  const createConnection = async (connection: Omit<CanvasConnection, 'id'>): Promise<string> => {
    const newConnection: CanvasConnection = {
      ...connection,
      id: uuidv4(),
    };
    
    setConnections((prevConnections) => [...prevConnections, newConnection]);
    return newConnection.id;
  };

  const deleteConnection = async (connectionId: string) => {
    setConnections((prevConnections) =>
      prevConnections.filter((conn) => conn.id !== connectionId)
    );
  };

  const contextValue: CanvasContextType = {
    tabs,
    activeTabId,
    createTab,
    updateTab,
    deleteTab,
    setActiveTabId,
    nodes,
    createNode,
    updateNode,
    deleteNode,
    connections,
    createConnection,
    deleteConnection,
    scale,
    offset,
    setScale,
    setOffset,
    isLoading,
    error,
  };

  return (
    <CanvasContext.Provider value={contextValue}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};