/**
 * Type definitions for the Canvas system
 */

// Canvas Type - base type indicating the type of canvas
export enum CanvasType {
  FREEFORM = 'freeform',
  TIMELINE = 'timeline',
  JOURNEY = 'journey', 
  MINDMAP = 'mindmap',
  SPREADSHEET = 'spreadsheet',
  GALLERY = 'gallery'
}

// Tab definition for a canvas
export interface CanvasTab {
  id: string;
  title: string; 
  type: CanvasType;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Edge definition for connecting nodes
export interface CanvasEdge {
  id: string;
  source: string;  // ID of the source node
  sourceHandle?: string; // Optional specific connection point on source
  target: string;  // ID of the target node
  targetHandle?: string; // Optional specific connection point on target
  type?: string; // Type of connection 
  label?: string; // Optional label text
  style?: CanvasEdgeStyle;
}

// Style options for edges
export interface CanvasEdgeStyle {
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  isAnimated?: boolean;
  animationSpeed?: number;
}

// Base node structure
export interface CanvasNode {
  id: string;
  type: CanvasNodeType;
  position: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  data: Record<string, any>; // Flexible data structure for each node type
  style?: CanvasNodeStyle;
}

// Style options for nodes
export interface CanvasNodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  shadow?: boolean;
}

// Node types available in the system
export enum CanvasNodeType {
  // General node types
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  NOTE = 'note',
  LINK = 'link',
  CONTAINER = 'container',
  
  // Domain-specific node types for medical journey
  TREATMENT = 'treatment',
  MEDICATION = 'medication',
  SYMPTOM = 'symptom',
  APPOINTMENT = 'appointment',
  TEST_RESULT = 'test_result',
  JOURNAL_ENTRY = 'journal_entry',
  DIET_ENTRY = 'diet_entry',
  MEDICAL_DOCUMENT = 'medical_document',
  RESEARCH_ITEM = 'research_item',
  QUESTION = 'question',
  
  // Timeline-specific node types
  TIMELINE_EVENT = 'timeline_event',
  TIMELINE_MILESTONE = 'timeline_milestone',
  
  // Journey-specific node types
  JOURNEY_STAGE = 'journey_stage',
  JOURNEY_DECISION = 'journey_decision',
  
  // MindMap-specific node types
  MINDMAP_CONCEPT = 'mindmap_concept',
  MINDMAP_RELATION = 'mindmap_relation',
  
  // Spreadsheet-specific node types
  SPREADSHEET_CELL = 'spreadsheet_cell',
  SPREADSHEET_FORMULA = 'spreadsheet_formula'
}

// Canvas operation for undo/redo
export interface CanvasOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  target: 'node' | 'edge' | 'tab';
  targetId: string;
  before: any; // State before change
  after: any;  // State after change
  timestamp: Date;
}

// Canvas view settings
export interface CanvasViewSettings {
  zoom: number;
  pan: { x: number; y: number };
  grid: boolean;
  snapToGrid: boolean;
  minimap: boolean;
  readOnly: boolean;
  showControls: boolean;
}

// Canvas save/export format
export interface CanvasExport {
  version: string;
  tabs: CanvasTab[];
  settings: CanvasViewSettings;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  metadata?: Record<string, any>;
}