import { LGraph, LGraphNode, LiteGraph } from 'litegraph.js';
import { NodeType } from '@shared/canvas-types';

class NoteNode extends LGraphNode {
  constructor() {
    super();
    this.addInput("Related", "node");
    this.addOutput("Related", "node");
    
    // Default properties
    this.properties = {
      noteId: null,
      title: "Note",
      content: "",
      color: "yellow", // yellow, blue, green, pink, purple
      dateCreated: new Date(),
      pinned: false
    };
    
    // Size and appearance
    this.size = [200, 100];
    this.color = "#FEF3C7";
    this.bgcolor = "#F59E0B";
  }
  
  // Display name
  static title = "Note";
  static type = NodeType.NOTE;
  
  // Code to execute when showing the node
  onDrawForeground(ctx, graphCanvas) {
    if (this.flags.collapsed) return;
    
    // Get color based on property
    const colors = {
      yellow: { bg: "#FEF3C7", accent: "#F59E0B" },
      blue: { bg: "#DBEAFE", accent: "#3B82F6" },
      green: { bg: "#DCFCE7", accent: "#10B981" },
      pink: { bg: "#FCE7F3", accent: "#EC4899" },
      purple: { bg: "#EDE9FE", accent: "#8B5CF6" }
    };
    
    const colorScheme = colors[this.properties.color] || colors.yellow;
    
    // Fill background with color
    ctx.fillStyle = colorScheme.bg;
    ctx.fillRect(0, 0, this.size[0], this.size[1]);
    
    // Draw border
    ctx.strokeStyle = colorScheme.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.size[0], this.size[1]);
    
    // Draw title
    ctx.font = "14px Inter";
    ctx.fillStyle = "#4A5568";
    
    // Limit title length for display
    const title = this.properties.title.length > 22
      ? this.properties.title.substring(0, 19) + "..."
      : this.properties.title;
    
    ctx.fillText(title, 10, 20);
    
    // Draw content
    if (this.properties.content) {
      ctx.font = "12px Inter";
      
      // Split content by newline and limit to 3 lines
      const lines = this.properties.content.split("\n");
      const maxLines = 3;
      const displayLines = lines.slice(0, maxLines);
      
      for (let i = 0; i < displayLines.length; i++) {
        // Limit line length
        const line = displayLines[i].length > 24
          ? displayLines[i].substring(0, 21) + "..."
          : displayLines[i];
          
        ctx.fillText(line, 10, 40 + (i * 20));
      }
      
      // Indicate there are more lines
      if (lines.length > maxLines) {
        ctx.fillText("...", 10, 40 + (maxLines * 20));
      }
    }
    
    // Pin indicator
    if (this.properties.pinned) {
      ctx.fillStyle = colorScheme.accent;
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
      type: NodeType.NOTE,
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
    
    // Update node color when the color property changes
    if (data.properties && data.properties.color) {
      const colors = {
        yellow: { bg: "#FEF3C7", accent: "#F59E0B" },
        blue: { bg: "#DBEAFE", accent: "#3B82F6" },
        green: { bg: "#DCFCE7", accent: "#10B981" },
        pink: { bg: "#FCE7F3", accent: "#EC4899" },
        purple: { bg: "#EDE9FE", accent: "#8B5CF6" }
      };
      
      const colorScheme = colors[data.properties.color] || colors.yellow;
      this.color = colorScheme.bg;
      this.bgcolor = colorScheme.accent;
    }
  }
}

// Register with LiteGraph
LiteGraph.registerNodeType("sophera/note", NoteNode);

export default NoteNode;