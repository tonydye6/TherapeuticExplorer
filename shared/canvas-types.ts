export interface CanvasTab {
  id: string;
  title: string;
  type: CanvasType;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  data?: any;
}

export type CanvasType = 'freeform' | 'timeline' | 'spreadsheet' | 'journey';

export interface CanvasNode {
  id: string;
  type: string;
  title: string;
  content?: string;
  position: CanvasPosition;
  size?: CanvasSize;
  inputs?: CanvasNodeInput[];
  outputs?: CanvasNodeOutput[];
  properties?: Record<string, any>;
}

export interface CanvasNodeInput {
  name: string;
  type: string;
  link?: string;
}

export interface CanvasNodeOutput {
  name: string;
  type: string;
  links?: string[];
}

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface CanvasConnection {
  id: string;
  originNode: string;
  originOutput: string;
  targetNode: string;
  targetInput: string;
  type?: string;
}

export interface CanvasData {
  id: string;
  title: string;
  nodes: CanvasNode[];
  connections: CanvasConnection[];
  type: CanvasType;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;
  properties?: Record<string, any>;
}

// Node Templates for the palette
export interface NodeTemplate {
  id: string;
  type: string;
  title: string;
  category: string;
  description: string;
  properties?: Record<string, any>;
}

// Node configuration map for different node types
export interface NodeConfig {
  type: string;
  label: string;
  description?: string;
  color?: string;
  icon?: string;
  inputs?: {
    name: string;
    type: string;
    label?: string;
  }[];
  outputs?: {
    name: string;
    type: string;
    label?: string;
  }[];
  fields?: {
    name: string;
    type: string;
    label?: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
    default?: any;
  }[];
}