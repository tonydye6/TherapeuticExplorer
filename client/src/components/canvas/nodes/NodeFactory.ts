import { NodeType, CanvasNode, CanvasPosition, CanvasSize } from '@shared/canvas-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * NodeFactory provides a central system for creating and registering node types.
 * It handles the creation of various node types with appropriate defaults.
 */
export class NodeFactory {
  private static DEFAULT_NODE_SIZE: CanvasSize = { width: 200, height: 120 };
  
  /**
   * Create a new node of the specified type
   */
  static createNode(
    type: NodeType, 
    title: string, 
    position: CanvasPosition, 
    properties: Record<string, any> = {}
  ): CanvasNode {
    const now = new Date();
    
    // Base node structure
    const baseNode: CanvasNode = {
      id: uuidv4(),
      type,
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
    switch (type) {
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