import { useEffect, useRef, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';

// Will be populated after dynamic import
let LiteGraph: any = null;

interface LiteGraphWrapperProps {
  onNodeSelected?: (nodeId: string, node: any) => void;
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
  className,
}: LiteGraphWrapperProps) {
  const [isReady, setIsReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const canvasInstanceRef = useRef<any>(null);
  
  // Setup resize detection
  const { width, height } = useResizeDetector({
    targetRef: containerRef,
    refreshMode: 'debounce',
    refreshRate: 100,
  });

  // Load LiteGraph.js
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadLiteGraph = async () => {
      try {
        // Use import() as a function to dynamically load the module
        const module = await import('litegraph.js');
        
        // Assign the imported module to our variable
        LiteGraph = module.default || module;
        
        console.log("LiteGraph.js loaded successfully");
        
        // Once loaded, we need to trigger a re-render
        setIsReady(false); // Force a re-render cycle
        setTimeout(() => setIsReady(true), 100);
      } catch (err) {
        console.error("Failed to load LiteGraph.js:", err);
      }
    };
    
    loadLiteGraph();
  }, []);

  // Initialize LiteGraph canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Wait for LiteGraph to be loaded
    if (!LiteGraph) return;
    
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
          onNodeSelected(node.id, node);
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

      // Add graph to window for external access (quick fix for now)
      (window as any).sophGraph = graph;

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