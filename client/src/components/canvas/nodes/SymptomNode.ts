import { LGraph, LGraphNode, LiteGraph } from 'litegraph.js';
import { NodeType } from '@shared/canvas-types';

class SymptomNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("Caused By", "node");
    this.addOutput("Treatments", "node");
    this.addOutput("Related", "node");
    
    // Default properties
    this.properties = {
      symptomId: null,
      name: "Symptom",
      severity: 3, // 1-5 scale
      frequency: "occasional", // rare, occasional, frequent, constant
      dateStarted: new Date(),
      dateEnded: null,
      active: true,
      notes: ""
    };
    
    // Size and appearance
    this.size = [220, 110];
    this.color = "#FEE2E2";
    this.bgcolor = "#EF4444";
  }
  
  // Display name
  static title = "Symptom";
  static type = NodeType.SYMPTOM;
  
  // Code to execute when showing the node
  onDrawForeground(ctx, graphCanvas) {
    if (this.flags.collapsed) return;
    
    ctx.font = "14px Inter";
    ctx.fillStyle = "#4A5568";
    ctx.fillText(this.properties.name, 10, 20);
    
    // Display severity as stars or dots
    ctx.fillStyle = "#EF4444";
    const severity = this.properties.severity;
    for (let i = 0; i < 5; i++) {
      if (i < severity) {
        ctx.fillRect(10 + i * 12, 30, 8, 8);
      } else {
        ctx.strokeRect(10 + i * 12, 30, 8, 8);
      }
    }
    
    ctx.font = "12px Inter";
    ctx.fillStyle = "#718096";
    ctx.fillText(`Frequency: ${this.properties.frequency}`, 10, 50);
    
    // Format date
    const startDate = new Date(this.properties.dateStarted);
    ctx.fillText(`Started: ${startDate.toLocaleDateString()}`, 10, 70);
    
    if (this.properties.dateEnded) {
      const endDate = new Date(this.properties.dateEnded);
      ctx.fillText(`Ended: ${endDate.toLocaleDateString()}`, 10, 90);
    } else if (this.properties.active) {
      ctx.fillText("Status: Active", 10, 90);
    } else {
      ctx.fillText("Status: Inactive", 10, 90);
    }
    
    // Status indicator
    ctx.fillStyle = this.properties.active ? "#EF4444" : "#9CA3AF";
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
    // Call the default onMouseDown first to ensure dragging works
    const superClassResult = LGraphNode.prototype.onMouseDown.call(this, e, pos, graphCanvas);
    
    // Open node details panel when clicked
    if (pos[0] > 0 && pos[0] < this.size[0] && 
        pos[1] > 0 && pos[1] < this.size[1]) {
      // Trigger node selection
      if (window.nodeSelectionCallback) {
        window.nodeSelectionCallback(this);
      }
      return true;
    }
    
    // Return the superclass result to maintain default behavior
    return superClassResult;
  }

  // Utility methods
  getNodeData() {
    return {
      type: NodeType.SYMPTOM,
      title: this.properties.name,
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
      this.properties.name = data.title;
    }
  }
}

// Register with LiteGraph
LiteGraph.registerNodeType("sophera/symptom", SymptomNode);

export default SymptomNode;