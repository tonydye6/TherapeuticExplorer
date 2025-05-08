/**
 * Sophera Canvas - Type Definitions
 * 
 * This file contains type definitions for the canvas-based system,
 * including canvas tabs, nodes, and connections.
 */

/**
 * Canvas Tab Types
 * Different modes for organizing and visualizing data
 */
export type CanvasTabType = "freeform" | "calendar" | "spreadsheet" | "journey" | "template";

/**
 * Canvas Tab Definition
 * Represents a single canvas workspace tab
 */
export interface CanvasTab {
  id: string;
  userId: string;
  name: string;
  type: CanvasTabType;
  config: {
    gridSize?: number;
    background?: string;
    dateRange?: { start: Date; end: Date };
    template?: string;
    [key: string]: any; // Other type-specific configuration
  };
  created: Date;
  updated: Date;
}

/**
 * Canvas Node Input/Output Definition
 */
export interface NodePort {
  name: string;
  type: string;
  linkedTo?: { nodeId: string; output: number };
}

/**
 * Canvas Node Definition
 * Represents a single node on the canvas
 */
export interface CanvasNode {
  id: string;
  tabId: string;
  type: string;  // treatment, journal, document, etc.
  title: string;
  position: [number, number];
  size: [number, number];
  inputs: NodePort[];
  outputs: NodePort[];
  properties: Record<string, any>;
  dataRef?: {
    collection: string;
    docId: string;
  };
  visual?: {
    color?: string;
    icon?: string;
    shape?: string;
  };
  created: Date;
  updated: Date;
}

/**
 * Canvas Connection Definition
 * Represents a connection between two nodes
 */
export interface CanvasConnection {
  id: string;
  tabId: string;
  originNode: string;
  originOutput: number;
  targetNode: string;
  targetInput: number;
  type?: string;  // relationship type
  properties?: Record<string, any>;
}

/**
 * Canvas Node Template
 * Used for creating new nodes from templates
 */
export interface NodeTemplate {
  type: string;
  title: string;
  inputs: Array<{name: string, type: string}>;
  outputs: Array<{name: string, type: string}>;
  defaultSize: [number, number];
  defaultProperties: Record<string, any>;
  visual: {
    color: string;
    icon?: string;
    shape?: string;
  };
}

/**
 * Canvas Tab Template
 * Used for creating new tabs from templates
 */
export interface CanvasTabTemplate {
  id: string;
  name: string;
  description: string;
  type: CanvasTabType;
  defaultConfig: Record<string, any>;
  nodes: Array<{
    templateType: string;
    position: [number, number];
    properties?: Record<string, any>;
  }>;
  connections: Array<{
    originIndex: number;
    originOutput: number;
    targetIndex: number;
    targetInput: number;
  }>;
}

/**
 * Insert Canvas Tab
 * Used for creating new canvas tabs
 */
export type InsertCanvasTab = Omit<CanvasTab, "id" | "created" | "updated">;

/**
 * Insert Canvas Node
 * Used for creating new canvas nodes
 */
export type InsertCanvasNode = Omit<CanvasNode, "id" | "created" | "updated">;

/**
 * Insert Canvas Connection
 * Used for creating new canvas connections
 */
export type InsertCanvasConnection = Omit<CanvasConnection, "id">;