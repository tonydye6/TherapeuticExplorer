import { LGraph, LGraphNode, LiteGraph } from 'litegraph.js';
import { NodeType } from '@shared/canvas-types';

class DocumentNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("Related", "node");
    this.addOutput("Research", "node");
    this.addOutput("Treatments", "node");
    this.addOutput("Insights", "node");
    
    // Default properties
    this.properties = {
      documentId: null,
      title: "Document",
      type: "report", // report, scan, lab_result, prescription, etc.
      date: new Date(),
      provider: "",
      summary: "",
      fileUrl: "",
      highlighted: false,
      keywords: []
    };
    
    // Size and appearance
    this.size = [240, 120];
    this.color = "#EFF6FF";
    this.bgcolor = "#3B82F6";
  }
  
  // Display name
  static title = "Document";
  static type = NodeType.DOCUMENT;
  
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
    
    // Show document type with icon placeholder
    ctx.fillText(`Type: ${this.properties.type}`, 10, 40);
    
    // Format date
    const date = new Date(this.properties.date);
    ctx.fillText(`Date: ${date.toLocaleDateString()}`, 10, 60);
    
    // Show provider if available
    if (this.properties.provider) {
      ctx.fillText(`Provider: ${this.properties.provider}`, 10, 80);
    }
    
    // Show summary snippet if available
    if (this.properties.summary) {
      const summaryPreview = this.properties.summary.length > 40 
        ? this.properties.summary.substring(0, 37) + "..." 
        : this.properties.summary;
      
      ctx.fillText(summaryPreview, 10, 100);
    }
    
    // Document icon (simple representation)
    ctx.strokeStyle = "#3B82F6";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(this.size[0] - 30, 10, 20, 25);
    ctx.stroke();
    
    // "Page lines" on document icon
    ctx.beginPath();
    ctx.moveTo(this.size[0] - 25, 18);
    ctx.lineTo(this.size[0] - 15, 18);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(this.size[0] - 25, 25);
    ctx.lineTo(this.size[0] - 15, 25);
    ctx.stroke();
    
    // Highlight indicator if document is highlighted
    if (this.properties.highlighted) {
      ctx.fillStyle = "#FBBF24";
      ctx.beginPath();
      ctx.arc(this.size[0] - 15, 45, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
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
      type: NodeType.DOCUMENT,
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
LiteGraph.registerNodeType("sophera/document", DocumentNode);

export default DocumentNode;