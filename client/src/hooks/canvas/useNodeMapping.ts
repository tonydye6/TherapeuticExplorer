import { useState, useEffect, useCallback } from 'react';
import { CanvasNode } from '@shared/canvas-types';
import { LGraphNode } from 'litegraph.js';

/**
 * This hook maintains a mapping between CanvasNode IDs and LiteGraph node IDs
 * to help synchronize state between our React state and the LiteGraph canvas
 */
export const useNodeMapping = () => {
  // Mapping from our Canvas node IDs to LiteGraph node IDs
  const [canvasToLiteMap, setCanvasToLiteMap] = useState<Map<string, string>>(new Map());
  
  // Mapping from LiteGraph node IDs to our Canvas node IDs
  const [liteToCanvasMap, setLiteToCanvasMap] = useState<Map<string, string>>(new Map());
  
  // Add a mapping between a Canvas node and a LiteGraph node
  const addMapping = useCallback((canvasNodeId: string, liteNodeId: string) => {
    setCanvasToLiteMap(prev => {
      const newMap = new Map(prev);
      newMap.set(canvasNodeId, liteNodeId);
      return newMap;
    });
    
    setLiteToCanvasMap(prev => {
      const newMap = new Map(prev);
      newMap.set(liteNodeId, canvasNodeId);
      return newMap;
    });
  }, []);
  
  // Remove a mapping
  const removeMapping = useCallback((canvasNodeId: string) => {
    const liteNodeId = canvasToLiteMap.get(canvasNodeId);
    
    setCanvasToLiteMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(canvasNodeId);
      return newMap;
    });
    
    if (liteNodeId) {
      setLiteToCanvasMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(liteNodeId);
        return newMap;
      });
    }
  }, [canvasToLiteMap]);
  
  // Get the LiteGraph node ID for a Canvas node ID
  const getLiteNodeId = useCallback((canvasNodeId: string) => {
    return canvasToLiteMap.get(canvasNodeId);
  }, [canvasToLiteMap]);
  
  // Get the Canvas node ID for a LiteGraph node ID
  const getCanvasNodeId = useCallback((liteNodeId: string) => {
    return liteToCanvasMap.get(liteNodeId);
  }, [liteToCanvasMap]);
  
  // Get a LiteGraph node from the graph based on canvas node ID
  const getLiteNodeFromCanvasId = useCallback((canvasNodeId: string): LGraphNode | null => {
    const liteNodeId = canvasToLiteMap.get(canvasNodeId);
    if (!liteNodeId) return null;
    
    // Get the LiteGraph node from the graph
    const graph = (window as any).sophGraph;
    if (!graph) return null;
    
    return graph.getNodeById(parseInt(liteNodeId));
  }, [canvasToLiteMap]);
  
  // Create node in LiteGraph and establish mapping
  const createNodeInLiteGraph = useCallback((
    canvasNode: CanvasNode, 
    graph: any, 
    nodeFn: (canvasNode: CanvasNode, graph: any) => LGraphNode | null
  ) => {
    // Create the LiteGraph node
    const liteNode = nodeFn(canvasNode, graph);
    
    // If successfully created, add mapping
    if (liteNode && liteNode.id) {
      addMapping(canvasNode.id, liteNode.id.toString());
      return liteNode;
    }
    
    return null;
  }, [addMapping]);
  
  // Helper function to find canvas node that matches a LiteGraph node
  const findCanvasNodeMatch = useCallback((
    liteNode: LGraphNode,
    canvasNodes: CanvasNode[]
  ): CanvasNode | null => {
    // First try by ID mapping
    const canvasNodeId = getCanvasNodeId(liteNode.id.toString());
    if (canvasNodeId) {
      const node = canvasNodes.find(n => n.id === canvasNodeId);
      if (node) return node;
    }
    
    // If no mapping exists, try to match by title/name and type
    return canvasNodes.find(node => 
      (node.title === liteNode.properties?.title || 
       node.title === liteNode.properties?.name) && 
      node.type.toString().toLowerCase().includes(liteNode.type.split('/')[1].toLowerCase())
    ) || null;
  }, [getCanvasNodeId]);
  
  // Clear all mappings
  const clearMappings = useCallback(() => {
    setCanvasToLiteMap(new Map());
    setLiteToCanvasMap(new Map());
  }, []);
  
  return {
    addMapping,
    removeMapping,
    getLiteNodeId,
    getCanvasNodeId,
    getLiteNodeFromCanvasId,
    createNodeInLiteGraph,
    findCanvasNodeMatch,
    clearMappings
  };
};

export default useNodeMapping;