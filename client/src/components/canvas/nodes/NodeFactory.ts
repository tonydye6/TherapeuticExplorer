import { NodeType, CanvasNode, CanvasPosition, CanvasSize } from '@shared/canvas-types';
import { v4 as uuidv4 } from 'uuid';
import { LiteGraph, LGraph, LGraphNode } from 'litegraph.js';

// Import node types
import TreatmentNode from './TreatmentNode';
import JournalNode from './JournalNode';
import SymptomNode from './SymptomNode';
import DocumentNode from './DocumentNode';
import NoteNode from './NoteNode';

// String-based node types for flexibility
export const NODE_TYPES = {
  TREATMENT: 'treatment',
  MEDICATION: 'medication',
  SYMPTOM: 'symptom',
  LAB_RESULT: 'lab_result',
  JOURNAL_ENTRY: 'journal_entry',
  MOOD_ENTRY: 'mood_entry',
  SYMPTOM_LOG: 'symptom_log',
  DIET_LOG: 'diet_log',
  EXERCISE_LOG: 'exercise_log',
  DOCUMENT: 'document',
  MILESTONE: 'milestone',
  HOPE_SNIPPET: 'hope_snippet',
  VICTORY: 'victory',
  NOTE: 'note'
};

/**
 * NodeFactory provides a central system for creating and registering node types.
 * It handles the creation of various node types with appropriate defaults.
 */
export class NodeFactory {
  private static DEFAULT_NODE_SIZE: CanvasSize = { width: 200, height: 120 };
  
  /**
   * Register all node types with LiteGraph
   */
  static initialize() {
    // All node types should be imported at the top, which will
    // automatically register them with LiteGraph
    console.log('Initializing node factory with types:', 
      Object.values(NodeType).join(', '));
  }
  
  /**
   * Create a LiteGraph node in the graph
   */
  static createLGraphNode(
    graph: LGraph,
    type: NodeType | string,
    properties: Record<string, any> = {},
    position: CanvasPosition
  ): LGraphNode | null {
    // Map our node types to LiteGraph node types
    const stringToLiteGraphMap: Record<string, string> = {
      // String type mapping
      [NODE_TYPES.TREATMENT]: 'sophera/treatment',
      [NODE_TYPES.MEDICATION]: 'sophera/treatment',
      [NODE_TYPES.SYMPTOM]: 'sophera/symptom',
      [NODE_TYPES.LAB_RESULT]: 'sophera/document',
      [NODE_TYPES.JOURNAL_ENTRY]: 'sophera/journal-entry',
      [NODE_TYPES.MOOD_ENTRY]: 'sophera/journal-entry',
      [NODE_TYPES.SYMPTOM_LOG]: 'sophera/journal-entry',
      [NODE_TYPES.DIET_LOG]: 'sophera/journal-entry',
      [NODE_TYPES.EXERCISE_LOG]: 'sophera/journal-entry',
      [NODE_TYPES.DOCUMENT]: 'sophera/document',
      [NODE_TYPES.MILESTONE]: 'sophera/note',
      [NODE_TYPES.HOPE_SNIPPET]: 'sophera/note',
      [NODE_TYPES.VICTORY]: 'sophera/note',
      [NODE_TYPES.NOTE]: 'sophera/note',
      
      // Enum type mapping (as fallback)
      [NodeType.TREATMENT]: 'sophera/treatment',
      [NodeType.MEDICATION]: 'sophera/treatment', 
      [NodeType.SYMPTOM]: 'sophera/symptom',
      [NodeType.LAB_RESULT]: 'sophera/document',
      [NodeType.JOURNAL_ENTRY]: 'sophera/journal-entry',
      [NodeType.MOOD_ENTRY]: 'sophera/journal-entry',
      [NodeType.SYMPTOM_LOG]: 'sophera/journal-entry', 
      [NodeType.DIET_LOG]: 'sophera/journal-entry',
      [NodeType.EXERCISE_LOG]: 'sophera/journal-entry',
      [NodeType.DOCUMENT]: 'sophera/document',
      [NodeType.MILESTONE]: 'sophera/note',
      [NodeType.HOPE_SNIPPET]: 'sophera/note',
      [NodeType.VICTORY]: 'sophera/note',
      [NodeType.NOTE]: 'sophera/note'
    };
    
    // Get the LiteGraph node type
    const liteGraphType = stringToLiteGraphMap[type as string];
    if (!liteGraphType) {
      console.error(`Unknown node type: ${type}`);
      return null;
    }
    
    // Create the node
    const node = LiteGraph.createNode(liteGraphType);
    if (!node) {
      console.error(`Failed to create node of type ${liteGraphType}`);
      return null;
    }
    
    // Set position
    node.pos = [position.x, position.y];
    
    // Extract title from properties
    const title = properties.title || properties.name || 'New Node';
    
    // Set title/name properties
    node.properties.name = title;
    node.properties.title = title;
    
    // Add other properties
    if (properties) {
      Object.keys(properties).forEach(key => {
        node.properties[key] = properties[key];
      });
    }
    
    // Add to graph
    graph.add(node);
    
    return node;
  }
  
  /**
   * Create a new node of the specified type
   */
  static createNode(
    type: NodeType | string, 
    position: CanvasPosition, 
    properties: Record<string, any> = {}
  ): CanvasNode {
    const now = new Date();
    const title = properties.title || properties.name || 'New Node';
    
    // Normalize the type to handle both enum and string types
    let normalizedType: NodeType;
    
    if (typeof type === 'string') {
      // Map string types to NodeType enum
      const stringToNodeTypeMap: Record<string, NodeType> = {
        [NODE_TYPES.TREATMENT]: NodeType.TREATMENT,
        [NODE_TYPES.MEDICATION]: NodeType.MEDICATION,
        [NODE_TYPES.SYMPTOM]: NodeType.SYMPTOM,
        [NODE_TYPES.LAB_RESULT]: NodeType.LAB_RESULT,
        [NODE_TYPES.JOURNAL_ENTRY]: NodeType.JOURNAL_ENTRY || NodeType.MOOD_ENTRY,
        [NODE_TYPES.MOOD_ENTRY]: NodeType.MOOD_ENTRY,
        [NODE_TYPES.SYMPTOM_LOG]: NodeType.SYMPTOM_LOG,
        [NODE_TYPES.DIET_LOG]: NodeType.DIET_LOG,
        [NODE_TYPES.EXERCISE_LOG]: NodeType.EXERCISE_LOG,
        [NODE_TYPES.DOCUMENT]: NodeType.DOCUMENT || NodeType.LAB_RESULT,
        [NODE_TYPES.MILESTONE]: NodeType.MILESTONE,
        [NODE_TYPES.HOPE_SNIPPET]: NodeType.HOPE_SNIPPET,
        [NODE_TYPES.VICTORY]: NodeType.VICTORY || NodeType.MILESTONE,
        [NODE_TYPES.NOTE]: NodeType.NOTE
      };
      normalizedType = stringToNodeTypeMap[type] || NodeType.NOTE;
    } else {
      normalizedType = type;
    }
    
    // Base node structure
    const baseNode: CanvasNode = {
      id: uuidv4(),
      type: normalizedType,
      title,
      position,
      size: this.DEFAULT_NODE_SIZE,
      properties,
      inputs: [],
      outputs: [],
      createdAt: now,
      updatedAt: now
    };
    
    // Customize based on node type
    switch (normalizedType) {
      case NodeType.TREATMENT:
        return this.createTreatmentNode(baseNode, properties);
      case NodeType.MEDICATION:
        return this.createMedicationNode(baseNode, properties);
      case NodeType.SYMPTOM:
        return this.createSymptomNode(baseNode, properties);
      case NodeType.MOOD_ENTRY:
      case NodeType.SYMPTOM_LOG:
      case NodeType.DIET_LOG:
      case NodeType.EXERCISE_LOG:
        return this.createJournalNode(baseNode, properties);
      case NodeType.MILESTONE:
        return this.createMilestoneNode(baseNode, properties);
      case NodeType.HOPE_SNIPPET:
        return this.createHopeSnippetNode(baseNode, properties);
      case NodeType.NOTE:
        return this.createNoteNode(baseNode, properties);
      default:
        return baseNode;
    }
  }
  
  /**
   * Create a treatment node with appropriate inputs/outputs
   */
  private static createTreatmentNode(
    baseNode: CanvasNode, 
    properties: Record<string, any>
  ): CanvasNode {
    // Default treatment properties
    const defaultProps = {
      treatmentType: properties.treatmentType || 'medication',
      startDate: properties.startDate || new Date(),
      endDate: properties.endDate,
      dosage: properties.dosage || '',
      frequency: properties.frequency || '',
      sideEffects: properties.sideEffects || [],
      effectiveness: properties.effectiveness || 0,
      active: properties.active !== undefined ? properties.active : true
    };
    
    return {
      ...baseNode,
      inputs: [
        { name: 'Related', type: 'node' }
      ],
      outputs: [
        { name: 'Side Effects', type: 'node' },
        { name: 'Effectiveness', type: 'node' },
        { name: 'Schedule', type: 'node' }
      ],
      properties: {
        ...baseNode.properties,
        ...defaultProps
      },
      visual: {
        color: '#E6FFFA', // Light teal background
        icon: 'stethoscope'
      }
    };
  }
  
  /**
   * Create a medication node
   */
  private static createMedicationNode(
    baseNode: CanvasNode, 
    properties: Record<string, any>
  ): CanvasNode {
    // Default medication properties
    const defaultProps = {
      name: properties.name || baseNode.title,
      dosage: properties.dosage || '',
      frequency: properties.frequency || '',
      startDate: properties.startDate || new Date(),
      endDate: properties.endDate,
      purpose: properties.purpose || '',
      sideEffects: properties.sideEffects || [],
      active: properties.active !== undefined ? properties.active : true
    };
    
    return {
      ...baseNode,
      inputs: [
        { name: 'Related', type: 'node' }
      ],
      outputs: [
        { name: 'Side Effects', type: 'node' },
        { name: 'Interactions', type: 'node' }
      ],
      properties: {
        ...baseNode.properties,
        ...defaultProps
      },
      visual: {
        color: '#EBF8FF', // Light blue background
        icon: 'pill'
      }
    };
  }
  
  /**
   * Create a symptom node
   */
  private static createSymptomNode(
    baseNode: CanvasNode, 
    properties: Record<string, any>
  ): CanvasNode {
    // Default symptom properties
    const defaultProps = {
      name: properties.name || baseNode.title,
      severity: properties.severity || 3,
      frequency: properties.frequency || 'occasional',
      firstObserved: properties.firstObserved || new Date(),
      lastObserved: properties.lastObserved,
      notes: properties.notes || '',
      relatedTo: properties.relatedTo || [],
      active: properties.active !== undefined ? properties.active : true
    };
    
    return {
      ...baseNode,
      inputs: [
        { name: 'Causes', type: 'node' }
      ],
      outputs: [
        { name: 'Treatments', type: 'node' },
        { name: 'Related Symptoms', type: 'node' }
      ],
      properties: {
        ...baseNode.properties,
        ...defaultProps
      },
      visual: {
        color: '#FFF5F5', // Light red background
        icon: 'activity'
      }
    };
  }
  
  /**
   * Create a journal node (mood, symptom log, diet log, etc.)
   */
  private static createJournalNode(
    baseNode: CanvasNode, 
    properties: Record<string, any>
  ): CanvasNode {
    // Default journal properties
    const defaultProps = {
      content: properties.content || '',
      date: properties.date || new Date(),
      mood: properties.mood,
      energyLevel: properties.energyLevel,
      painLevel: properties.painLevel,
      tags: properties.tags || []
    };
    
    // Customize visual based on journal type
    let visual = { color: '#FFFAF0', icon: 'book-open' }; // Default
    
    switch (baseNode.type) {
      case NodeType.MOOD_ENTRY:
        visual = { color: '#FFF0F5', icon: 'heart' };
        break;
      case NodeType.SYMPTOM_LOG:
        visual = { color: '#F0FFF4', icon: 'clipboard' };
        break;
      case NodeType.DIET_LOG:
        visual = { color: '#FFFBEA', icon: 'coffee' };
        break;
      case NodeType.EXERCISE_LOG:
        visual = { color: '#EBF8FF', icon: 'activity' };
        break;
    }
    
    return {
      ...baseNode,
      inputs: [
        { name: 'Related', type: 'node' }
      ],
      outputs: [
        { name: 'Connections', type: 'node' }
      ],
      properties: {
        ...baseNode.properties,
        ...defaultProps
      },
      visual
    };
  }
  
  /**
   * Create a milestone node
   */
  private static createMilestoneNode(
    baseNode: CanvasNode, 
    properties: Record<string, any>
  ): CanvasNode {
    // Default milestone properties
    const defaultProps = {
      title: properties.title || baseNode.title,
      date: properties.date || new Date(),
      description: properties.description || '',
      type: properties.type || 'treatment',
      importance: properties.importance || 3
    };
    
    return {
      ...baseNode,
      inputs: [
        { name: 'Before', type: 'node' }
      ],
      outputs: [
        { name: 'After', type: 'node' }
      ],
      properties: {
        ...baseNode.properties,
        ...defaultProps
      },
      visual: {
        color: '#EBF4FF', // Light indigo background
        icon: 'flag'
      }
    };
  }
  
  /**
   * Create a hope snippet node
   */
  private static createHopeSnippetNode(
    baseNode: CanvasNode, 
    properties: Record<string, any>
  ): CanvasNode {
    // Default hope snippet properties
    const defaultProps = {
      content: properties.content || '',
      author: properties.author,
      source: properties.source,
      date: properties.date || new Date(),
      tags: properties.tags || []
    };
    
    return {
      ...baseNode,
      inputs: [
        { name: 'Related', type: 'node' }
      ],
      outputs: [
        { name: 'Inspired', type: 'node' }
      ],
      properties: {
        ...baseNode.properties,
        ...defaultProps
      },
      visual: {
        color: '#FEFCBF', // Light yellow background
        icon: 'sun'
      }
    };
  }
  
  /**
   * Create a simple note node
   */
  private static createNoteNode(
    baseNode: CanvasNode, 
    properties: Record<string, any>
  ): CanvasNode {
    // Default note properties
    const defaultProps = {
      content: properties.content || '',
      color: properties.color || 'default'
    };
    
    return {
      ...baseNode,
      inputs: [
        { name: 'Related', type: 'node' }
      ],
      outputs: [
        { name: 'Connected', type: 'node' }
      ],
      properties: {
        ...baseNode.properties,
        ...defaultProps
      },
      visual: {
        color: '#FFFFF0', // Light ivory background
        icon: 'file-text'
      }
    };
  }
}

export default NodeFactory;