/**
 * Canvas system type definitions
 */

export type CanvasTabType = "freeform" | "calendar" | "spreadsheet" | "journey" | "template";

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
    // Other type-specific configuration
    [key: string]: any;
  };
  created: Date;
  updated: Date;
}

export interface CanvasNode {
  id: string;
  tabId: string;
  type: string;  // treatment, journal, document, etc.
  title: string;
  position: [number, number];
  size: [number, number];
  inputs: {
    name: string;
    type: string;
    linkedTo?: { nodeId: string; output: number };
  }[];
  outputs: {
    name: string;
    type: string;
  }[];
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