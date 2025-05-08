import { useEffect, useRef, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useCanvas } from '@/contexts/CanvasContext';
import * as LiteGraph from 'litegraph.js';

type LiteGraphWrapperProps = {
  className?: string;
};

const LiteGraphWrapper = ({ className = '' }: LiteGraphWrapperProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [graph, setGraph] = useState<LiteGraph.LGraph | null>(null);
  const [canvas, setCanvas] = useState<LiteGraph.LGraphCanvas | null>(null);
  const { width, height, ref: containerRef } = useResizeDetector();
  const {
    activeTabId,
    nodes,
    connections,
    scale,
    offset,
    setScale,
    setOffset,
  } = useCanvas();

  // Initialize LiteGraph
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Create the graph instance
    const newGraph = new LiteGraph.LGraph();
    
    // Create the canvas instance
    const newCanvas = new LiteGraph.LGraphCanvas(canvasRef.current, newGraph);
    
    // Configure the canvas
    newCanvas.background_image = null;
    newCanvas.allow_searchbox = true;
    newCanvas.allow_reconnect_links = true;
    newCanvas.allow_dragnodes = true;
    newCanvas.always_render_background = true;
    newCanvas.show_info = true;
    
    // Set canvas initial size to parent container
    const containerRect = containerRef.current.getBoundingClientRect();
    canvasRef.current.width = containerRect.width;
    canvasRef.current.height = containerRect.height;
    
    // Set scale and offset (zoom and pan)
    newCanvas.ds.scale = scale;
    newCanvas.ds.offset = offset;
    
    // Start the graph loop
    newGraph.start();
    
    // Store references
    setGraph(newGraph);
    setCanvas(newCanvas);
    
    // Cleanup
    return () => {
      newGraph.stop();
      if (newCanvas) newCanvas.clear();
    };
  }, [activeTabId]);

  // Handle resize
  useEffect(() => {
    if (!canvasRef.current || !canvas || !width || !height) return;
    
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    
    // Force a redraw
    canvas.draw(true, true);
  }, [width, height, canvas]);

  // Sync nodes from context to LiteGraph
  useEffect(() => {
    if (!graph || !canvas || !nodes.length) return;
    
    // Clear existing nodes
    graph.clear();
    
    // Add nodes to the graph
    nodes.forEach((node) => {
      try {
        // Create a Neo Brutalism styled node
        const nodeType = `sophera/${node.type}`;
        if (!LiteGraph.registered_node_types[nodeType]) {
          // Register custom node type if it doesn't exist
          registerCustomNodeType(node.type);
        }
        
        // Create the node instance
        const graphNode = LiteGraph.createNode(nodeType);
        if (!graphNode) return;
        
        // Set node position and properties
        graphNode.pos = node.position;
        graphNode.size = node.size;
        
        // Set custom properties
        graphNode.properties = {
          ...node.properties,
          id: node.id,
          title: node.title,
        };
        
        // Add the node to the graph
        graph.add(graphNode);
      } catch (err) {
        console.error(`Error adding node ${node.id} to graph:`, err);
      }
    });
    
    // Add connections
    connections.forEach((connection) => {
      try {
        // Find the nodes on both ends of the connection
        const originNode = graph.findNodeById(connection.originNode);
        const targetNode = graph.findNodeById(connection.targetNode);
        
        if (originNode && targetNode) {
          // Connect the nodes
          originNode.connect(
            connection.originOutput,
            targetNode,
            connection.targetInput
          );
        }
      } catch (err) {
        console.error(`Error adding connection ${connection.id} to graph:`, err);
      }
    });
    
    // Force a complete redraw
    canvas.draw(true, true);
  }, [graph, canvas, nodes, connections]);

  // Sync canvas scale and offset with context
  useEffect(() => {
    if (!canvas) return;
    
    // Set callback for when scale or offset changes
    canvas.onDrawBackground = function() {
      // Store current scale and offset in context
      if (this.ds.scale !== scale) {
        setScale(this.ds.scale);
      }
      if (this.ds.offset[0] !== offset[0] || this.ds.offset[1] !== offset[1]) {
        setOffset([this.ds.offset[0], this.ds.offset[1]]);
      }
    };
  }, [canvas, scale, offset, setScale, setOffset]);

  // Register custom node types
  const registerCustomNodeType = (type: string) => {
    const nodeType = `sophera/${type}`;
    
    // Skip if already registered
    if (LiteGraph.registered_node_types[nodeType]) return;
    
    // Create a custom node class
    function CustomNode() {
      // Default config
      this.addInput('In', '');
      this.addOutput('Out', '');
      this.size = [180, 120];
      this.properties = { title: type.charAt(0).toUpperCase() + type.slice(1) };
    }
    
    // Clone the default node class
    CustomNode.prototype = Object.create(LiteGraph.LGraphNode.prototype);
    CustomNode.prototype.constructor = CustomNode;
    
    // Override the draw method to apply neo-brutalism style
    CustomNode.prototype.onDrawForeground = function(ctx: CanvasRenderingContext2D) {
      if (!this.properties) return;
      
      const title = this.properties.title || 'Node';
      
      // Draw title
      ctx.font = 'bold 14px Inter';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'black';
      ctx.fillText(title, this.size[0] * 0.5, 24);
      
      // Draw content if available
      if (this.properties.content) {
        ctx.font = '12px Inter';
        ctx.fillStyle = '#4A5568';
        ctx.textAlign = 'left';
        ctx.fillText(
          this.properties.content.substring(0, 20) + '...',
          15,
          50
        );
      }
    };
    
    // Register the node type
    LiteGraph.registerNodeType(nodeType, CustomNode);
    
    // Set node appearance
    const nodeClass = LiteGraph.registered_node_types[nodeType];
    nodeClass.title = type.charAt(0).toUpperCase() + type.slice(1);
    nodeClass.title_color = "#FFF";
    
    // Set color based on node type
    switch (type) {
      case 'treatment':
        nodeClass.bgcolor = "#0D9488"; // Deep Teal
        break;
      case 'journal':
        nodeClass.bgcolor = "#4A88DB"; // Blue
        break;
      case 'document':
        nodeClass.bgcolor = "#F59E0B"; // Amber
        break;
      case 'symptom':
        nodeClass.bgcolor = "#EF4444"; // Red
        break;
      case 'milestone':
        nodeClass.bgcolor = "#8B5CF6"; // Purple
        break;
      case 'note':
        nodeClass.bgcolor = "#FBBF24"; // Yellow
        break;
      default:
        nodeClass.bgcolor = "#64748B"; // Slate
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      <canvas 
        ref={canvasRef}
        className="litegraph-canvas absolute inset-0 touch-none"
      />
      <div className="litegraph-grid absolute inset-0 pointer-events-none" />
    </div>
  );
};

export default LiteGraphWrapper;