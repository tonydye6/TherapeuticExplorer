import { LGraph, LGraphNode, LiteGraph } from 'litegraph.js';
import { NodeType } from '@shared/canvas-types';

class TreatmentNode extends LGraphNode {
  // Node setup
  constructor() {
    super();
    this.addInput("Related", "node");
    this.addOutput("Side Effects", "node");
    this.addOutput("Effectiveness", "node");
    this.addOutput("Schedule", "node");
    
    // Default properties
    this.properties = {
      treatmentId: null,
      name: "Treatment",
      type: "medication",
      startDate: new Date(),
      endDate: null,
      active: true
    };
    
    // Size and appearance
    this.size = [240, 120];
    this.color = "#E6FFFA";
    this.bgcolor = "#0D9488";
  }
  
  // Display name
  static title = "Treatment";
  static type = NodeType.TREATMENT;
  
  // Code to execute when showing the node
  onDrawForeground(ctx, graphCanvas) {
    if (this.flags.collapsed) return;
    
    ctx.font = "14px Inter";
    ctx.fillStyle = this.properties.active ? "#0D9488" : "#4A5568";
    ctx.fillText(this.properties.name, 10, 20);
    
    ctx.font = "12px Inter";
    ctx.fillStyle = "#4A5568";
    ctx.fillText(this.properties.type, 10, 40);
    
    const startDate = new Date(this.properties.startDate);
    ctx.fillText(`Started: ${startDate.toLocaleDateString()}`, 10, 60);
    
    if (this.properties.endDate) {
      const endDate = new Date(this.properties.endDate);
      ctx.fillText(`Ended: ${endDate.toLocaleDateString()}`, 10, 80);
    }
    
    // Active indicator
    if (this.properties.active) {
      ctx.fillStyle = "#10B981";
      ctx.beginPath();
      ctx.arc(this.size[0] - 15, 15, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
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
      type: NodeType.TREATMENT,
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
LiteGraph.registerNodeType("sophera/treatment", TreatmentNode);

export default TreatmentNode;