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
 * Type of node - determines node behavior and appearance
 */
export enum NodeType {
  DEFAULT = 'default',
  NOTE = 'note',
  DOCUMENT = 'document',
  TREATMENT = 'treatment',
  APPOINTMENT = 'appointment',
  SYMPTOM = 'symptom',
  MEDICATION = 'medication',
  RESEARCH = 'research',
  GOAL = 'goal',
  QUESTION = 'question',
  TASK = 'task',
  PERSON = 'person',
  IMAGE = 'image',
  EVENT = 'event',
  // Additional node types for calendar view
  DOCTOR_NOTE = 'doctor_note',
  MILESTONE = 'milestone',
  VICTORY = 'victory',
  JOURNAL_ENTRY = 'journal_entry',
  SYMPTOM_LOG = 'symptom_log',
  HOPE_SNIPPET = 'hope_snippet',
  CAREGIVER_NOTE = 'caregiver_note'
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
 * Tab configuration options - varies based on canvas type
 */
export interface TabConfig {
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  [key: string]: any;
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
  config?: TabConfig;
}