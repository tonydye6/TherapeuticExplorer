import { useEffect, useRef, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import type { LGraph, LiteGraph as LiteGraphType, LGraphCanvas } from 'litegraph.js';

// Dynamically import LiteGraph.js to avoid SSR issues
let LiteGraph: typeof LiteGraphType | null = null;
if (typeof window !== 'undefined') {
  // This dynamic import is necessary for browser-only libraries
  import('litegraph.js').then((module) => {
    LiteGraph = module.default;
  });
}

interface LiteGraphWrapperProps {
  onNodeSelected?: (nodeId: string) => void;
  onNodeCreated?: (node: any) => void;
  onNodeRemoved?: (node: any) => void;
  onConnectionChanged?: (connection: any) => void;
  className?: string;
}

export default function LiteGraphWrapper({
  onNodeSelected,
  onNodeCreated,
  onNodeRemoved,
  onConnectionChanged,
  className
}: LiteGraphWrapperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<LGraph | null>(null);
  const canvasInstanceRef = useRef<LGraphCanvas | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Use resize detector to handle canvas resizing
  const { width, height, ref: containerRef } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 100,
  });

  // Initialize LiteGraph canvas
  useEffect(() => {
    if (!LiteGraph || !canvasRef.current) return;

    // Only initialize once
    if (graphRef.current) return;

    try {
      // Customize LiteGraph appearance to match Sophera design
      LiteGraph.NODE_TITLE_COLOR = "#2D3748"; // sophera-text-heading
      LiteGraph.NODE_DEFAULT_COLOR = "#FFFFFF"; // white
      LiteGraph.NODE_DEFAULT_BGCOLOR = "#FFFFFF"; // white
      LiteGraph.NODE_DEFAULT_BOXCOLOR = "#0D9488"; // sophera-brand-primary
      LiteGraph.NODE_DEFAULT_SHAPE = "box";
      LiteGraph.DEFAULT_SHADOW_COLOR = "rgba(0,0,0,0.1)";
      LiteGraph.CONNECTING_LINK_COLOR = "#0D9488"; // sophera-brand-primary
      LiteGraph.DEFAULT_CONNECTION_COLOR = {
        input_off: "#CBD5E0", // sophera-border-primary
        input_on: "#0D9488",  // sophera-brand-primary
        output_off: "#CBD5E0", // sophera-border-primary
        output_on: "#FF7F50",  // sophera-accent-secondary
      };

      // Create a new graph
      const graph = new LiteGraph.LGraph();
      graphRef.current = graph;

      // Create the canvas instance
      const canvasInstance = new LiteGraph.LGraphCanvas(canvasRef.current, graph);
      canvasInstanceRef.current = canvasInstance;

      // Start the graph
      graph.start();
      setIsReady(true);
      
      // Register event handlers
      if (onNodeSelected) {
        graph.onNodeSelected = (node: any) => {
          onNodeSelected(node.id);
        };
      }

      if (onNodeCreated) {
        graph.onNodeAdded = (node: any) => {
          onNodeCreated(node);
        };
      }

      if (onNodeRemoved) {
        graph.onNodeRemoved = (node: any) => {
          onNodeRemoved(node);
        };
      }

      if (onConnectionChanged) {
        graph.onConnectionChange = (node: any, inputIndex: number, outputIndex: number, linkInfo: any, connected: boolean) => {
          onConnectionChanged({
            node,
            inputIndex,
            outputIndex,
            linkInfo,
            connected
          });
        };
      }

    } catch (error) {
      console.error("Error initializing LiteGraph:", error);
    }

    // Cleanup function
    return () => {
      if (graphRef.current) {
        graphRef.current.stop();
      }
    };
  }, [onNodeSelected, onNodeCreated, onNodeRemoved, onConnectionChanged]);

  // Handle resize events
  useEffect(() => {
    if (!canvasInstanceRef.current || !width || !height) return;
    
    // Resize the canvas when the container size changes
    canvasInstanceRef.current.resize(width, height);
  }, [width, height]);

  return (
    <div ref={containerRef} className={`w-full h-full ${className || ''}`}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="loading-wave-container">
            <div className="loading-wave"></div>
            <div className="loading-wave"></div>
            <div className="loading-wave"></div>
          </div>
        </div>
      )}
    </div>
  );
}