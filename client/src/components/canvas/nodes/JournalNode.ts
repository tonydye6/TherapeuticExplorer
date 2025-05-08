import { LGraph, LGraphNode, LiteGraph } from 'litegraph.js';
import { NodeType } from '@shared/canvas-types';

class JournalNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("Related", "node");
    this.addOutput("Emotions", "node");
    this.addOutput("Treatments", "node");
    this.addOutput("Symptoms", "node");
    
    // Default properties
    this.properties = {
      journalId: null,
      title: "Journal Entry",
      content: "",
      mood: "neutral",
      dateCreated: new Date(),
      tags: []
    };
    
    // Size and appearance
    this.size = [240, 120];
    this.color = "#FFF9DB";
    this.bgcolor = "#F59E0B";
  }
  
  // Display name
  static title = "Journal Entry";
  static type = NodeType.JOURNAL_ENTRY;
  
  // Code to execute when showing the node
  onDrawForeground(ctx, graphCanvas) {
    if (this.flags.collapsed) return;
    
    ctx.font = "14px Inter";
    ctx.fillStyle = "#4A5568";
    
    // Limit title length for display
    const title = this.properties.title.length > 25 
      ? this.properties.title.substring(0, 22) + "..." 
      : this.properties.title;
    
    ctx.fillText(title, 10, 20);
    
    ctx.font = "12px Inter";
    ctx.fillStyle = "#718096";
    
    // Format date
    const date = new Date(this.properties.dateCreated);
    ctx.fillText(date.toLocaleDateString(), 10, 40);
    
    // Show a snippet of content
    if (this.properties.content) {
      const contentPreview = this.properties.content.length > 50 
        ? this.properties.content.substring(0, 47) + "..." 
        : this.properties.content;
      
      ctx.fillText(contentPreview, 10, 60);
    }
    
    // Show mood indicator
    ctx.fillText(`Mood: ${this.properties.mood}`, 10, 80);
    
    // Mood icon/color
    const moodColors = {
      'excellent': '#10B981',
      'good': '#60A5FA', 
      'neutral': '#9CA3AF',
      'difficult': '#F97316',
      'terrible': '#EF4444'
    };
    
    const moodColor = moodColors[this.properties.mood] || moodColors.neutral;
    ctx.fillStyle = moodColor;
    ctx.beginPath();
    ctx.arc(this.size[0] - 15, 15, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  // Called when node is executed
  onExecute() {
    // Logic for when graph is executed (if needed)
  }
  
  // Handle mouse interaction
  onMouseDown(e, pos, graphCanvas) {
    // Open node details panel when clicked
    if (pos[0] > 0 && pos[0] < this.size[0] && 
        pos[1] > 0 && pos[1] < this.size[1]) {
      // Trigger node selection
      if (window.nodeSelectionCallback) {
        window.nodeSelectionCallback(this);
      }
      return true;
    }
    return false;
  }

  // Utility methods
  getNodeData() {
    return {
      type: NodeType.JOURNAL_ENTRY,
      title: this.properties.title,
      id: this.id,
      properties: { ...this.properties },
      position: [this.pos[0], this.pos[1]],
      size: [this.size[0], this.size[1]]
    };
  }

  // Update node data from external sources
  updateNodeData(data) {
    if (data.properties) {
      this.properties = { ...this.properties, ...data.properties };
    }
    
    if (data.position) {
      this.pos[0] = data.position[0];
      this.pos[1] = data.position[1];
    }
    
    if (data.size) {
      this.size[0] = data.size[0];
      this.size[1] = data.size[1];
    }
    
    if (data.title) {
      this.properties.title = data.title;
    }
  }
}

// Register with LiteGraph
LiteGraph.registerNodeType("sophera/journal-entry", JournalNode);

export default JournalNode;