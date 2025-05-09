import { CanvasNode } from '@shared/canvas-types';

/**
 * NodeMapping - Handles mapping between LiteGraph nodes and our Canvas nodes
 */
export default class NodeMapping {
  private lGraphToCanvasMap: Map<string, string> = new Map();
  private canvasToLGraphMap: Map<string, string> = new Map();
  
  /**
   * Add a mapping between canvas node ID and LiteGraph node ID
   */
  addMapping(canvasNodeId: string, lGraphNodeId: string): void {
    this.lGraphToCanvasMap.set(lGraphNodeId, canvasNodeId);
    this.canvasToLGraphMap.set(canvasNodeId, lGraphNodeId);
  }
  
  /**
   * Get canvas node ID from LiteGraph node ID
   */
  getCanvasNodeId(lGraphNodeId: string): string | undefined {
    return this.lGraphToCanvasMap.get(lGraphNodeId);
  }
  
  /**
   * Get LiteGraph node ID from canvas node ID
   */
  getLGraphNodeId(canvasNodeId: string): string | undefined {
    return this.canvasToLGraphMap.get(canvasNodeId);
  }
  
  /**
   * Remove mapping for a canvas node
   */
  removeMapping(canvasNodeId: string): void {
    const lGraphNodeId = this.getLGraphNodeId(canvasNodeId);
    if (lGraphNodeId) {
      this.lGraphToCanvasMap.delete(lGraphNodeId);
    }
    this.canvasToLGraphMap.delete(canvasNodeId);
  }
  
  /**
   * Find a matching canvas node for a LiteGraph node
   */
  findCanvasNodeMatch(lGraphNode: any, canvasNodes: CanvasNode[]): CanvasNode | undefined {
    // Try to match by title if present
    if (lGraphNode.title) {
      return canvasNodes.find(n => n.title === lGraphNode.title);
    }
    
    // Otherwise try to match by properties
    if (lGraphNode.properties) {
      return canvasNodes.find(n => {
        // Match by created date if present
        if (lGraphNode.properties.createdAt && n.createdAt) {
          const lGraphDate = new Date(lGraphNode.properties.createdAt).getTime();
          const canvasDate = new Date(n.createdAt).getTime();
          return Math.abs(lGraphDate - canvasDate) < 1000; // Within 1 second
        }
        return false;
      });
    }
    
    return undefined;
  }
  
  /**
   * Clear all mappings
   */
  clear(): void {
    this.lGraphToCanvasMap.clear();
    this.canvasToLGraphMap.clear();
  }
}