/**
 * Canvas Types
 * This file defines all types related to the Canvas system.
 */

export enum CanvasType {
  FREEFORM = 'freeform',
  CALENDAR = 'calendar',
  SPREADSHEET = 'spreadsheet',
  JOURNEY = 'journey',
  TEMPLATE = 'template'
}

export enum NodeType {
  // Core medical data nodes
  TREATMENT = 'treatment',
  MEDICATION = 'medication',
  SYMPTOM = 'symptom',
  LAB_RESULT = 'labResult',
  
  // Document-related nodes
  RESEARCH = 'research',
  DOCTOR_NOTE = 'doctorNote',
  MEDICAL_IMAGE = 'medicalImage',
  
  // Journal-related nodes
  SYMPTOM_LOG = 'symptomLog',
  DIET_LOG = 'dietLog',
  EXERCISE_LOG = 'exerciseLog',
  MOOD_ENTRY = 'moodEntry',
  
  // Support and emotional nodes
  HOPE_SNIPPET = 'hopeSnippet',
  CAREGIVER_NOTE = 'caregiverNote',
  MILESTONE = 'milestone',
  VICTORY = 'victory',
  
  // Generic nodes
  NOTE = 'note',
  CUSTOM = 'custom'
}

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface CanvasNodeInput {
  name: string;
  type: string;
  linkedTo?: {
    nodeId: string;
    output: number;
  };
}

export interface CanvasNodeOutput {
  name: string;
  type: string;
}

export interface CanvasNodeVisual {
  color?: string;
  icon?: string;
  shape?: string;
}

export interface CanvasNode {
  id: string;
  type: NodeType | string;
  title: string;
  position: CanvasPosition;
  size: CanvasSize;
  inputs?: CanvasNodeInput[];
  outputs?: CanvasNodeOutput[];
  properties: Record<string, any>;
  dataRef?: {
    collection: string;
    docId: string;
  };
  visual?: CanvasNodeVisual;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanvasEdge {
  id: string;
  sourceNodeId: string;
  sourceOutputIndex: number;
  targetNodeId: string;
  targetInputIndex: number;
  type?: string;
  properties?: Record<string, any>;
}

export interface CanvasConfig {
  gridSize?: number;
  background?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  templateId?: string;
  [key: string]: any;
}

export interface CanvasTab {
  id: string;
  title: string;
  type: CanvasType;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  config?: CanvasConfig;
  createdAt: Date;
  updatedAt: Date;
}

// For database storage
export interface StoredCanvasTab {
  id: string;
  userId: string;
  title: string;
  type: string;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface StoredCanvasNode {
  id: string;
  tabId: string;
  type: string;
  title: string;
  position: [number, number];
  size: [number, number];
  inputs: CanvasNodeInput[];
  outputs: CanvasNodeOutput[];
  properties: Record<string, any>;
  dataRef?: {
    collection: string;
    docId: string;
  };
  visual?: CanvasNodeVisual;
  createdAt: string;
  updatedAt: string;
}

export interface StoredCanvasEdge {
  id: string;
  tabId: string;
  sourceNodeId: string;
  sourceOutputIndex: number;
  targetNodeId: string;
  targetInputIndex: number;
  type?: string;
  properties?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Node-specific interfaces
export interface TreatmentNode extends CanvasNode {
  type: NodeType.TREATMENT;
  properties: {
    treatmentId?: string;
    name: string;
    treatmentType: string;
    startDate: Date;
    endDate?: Date;
    dosage?: string;
    frequency?: string;
    sideEffects?: string[];
    effectiveness?: number;
    active: boolean;
  };
}

export interface MedicationNode extends CanvasNode {
  type: NodeType.MEDICATION;
  properties: {
    medicationId?: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate?: Date;
    purpose: string;
    sideEffects?: string[];
    active: boolean;
  };
}

export interface SymptomNode extends CanvasNode {
  type: NodeType.SYMPTOM;
  properties: {
    symptomId?: string;
    name: string;
    severity: number;
    frequency: string;
    firstObserved: Date;
    lastObserved?: Date;
    notes: string;
    relatedTo?: string[];
    active: boolean;
  };
}

export interface JournalNode extends CanvasNode {
  type: NodeType.MOOD_ENTRY | NodeType.SYMPTOM_LOG | NodeType.DIET_LOG | NodeType.EXERCISE_LOG;
  properties: {
    entryId?: string;
    content: string;
    date: Date;
    mood?: string;
    energyLevel?: number;
    painLevel?: number;
    tags?: string[];
  };
}

export interface MilestoneNode extends CanvasNode {
  type: NodeType.MILESTONE;
  properties: {
    title: string;
    date: Date;
    description: string;
    type: 'treatment' | 'personal' | 'medical' | 'other';
    importance: number;
  };
}

export interface HopeSnippetNode extends CanvasNode {
  type: NodeType.HOPE_SNIPPET;
  properties: {
    content: string;
    author?: string;
    source?: string;
    date: Date;
    tags?: string[];
  };
}

export interface CustomNode extends CanvasNode {
  type: NodeType.CUSTOM;
  properties: Record<string, any>;
}