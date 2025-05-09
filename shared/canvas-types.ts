/**
 * Canvas Types - Common types used throughout the Canvas feature
 */

/**
 * Type of canvas - determines visualization and interaction style
 */
export enum CanvasType {
  FREEFORM = 'freeform',
  CALENDAR = 'calendar',
  JOURNEY = 'journey',
  MINDMAP = 'mindmap',
  SPREADSHEET = 'spreadsheet',
  GALLERY = 'gallery'
}

/**
 * Position in 2D space
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Size dimensions
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Node properties - can be extended with custom properties
 */
export interface NodeProperties {
  [key: string]: any;
}

/**
 * Canvas Node - represents a node in the canvas
 */
export interface CanvasNode {
  id: string;
  title: string;
  type: string;
  position: Position;
  size: Size;
  properties: NodeProperties;
  createdAt: Date;
}

/**
 * Edge properties - can be extended with custom properties
 */
export interface EdgeProperties {
  [key: string]: any;
}

/**
 * Canvas Edge - represents a connection between nodes
 */
export interface CanvasEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceOutputIndex?: number;
  targetInputIndex?: number;
  type: string;
  properties: EdgeProperties;
}

/**
 * Canvas Tab - represents a single canvas workspace
 */
export interface CanvasTab {
  id: string;
  title: string;
  type: CanvasType;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  createdAt: Date;
  updatedAt: Date;
  offset: Position;
  scale: number;
  userId: string;
}