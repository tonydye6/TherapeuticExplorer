import { useEffect, useRef, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { useCanvas } from '@/contexts/CanvasContext';

// We're using any type for LiteGraph since its TypeScript definitions are incomplete
// This is a common approach for libraries that don't have proper TypeScript support
type LiteGraphType = any;
type LGraphType = any;
type LGraphCanvasType = any;
type LGraphNodeType = any;

const LiteGraphWrapper = ({ className = '' }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useResizeDetector().ref;
  const { width, height } = useResizeDetector({ targetRef: containerRef });
  const [LiteGraph, setLiteGraph] = useState<LiteGraphType | null>(null);
  const [graph, setGraph] = useState<LGraphType | null>(null);
  const [canvas, setCanvas] = useState<LGraphCanvasType | null>(null);
  
  const {
    activeTabId,
    nodes,
    connections,
    scale,
    offset,
    setScale,
    setOffset,
  } = useCanvas();

  // Load LiteGraph.js script
  useEffect(() => {
    // If LiteGraph is already available on window, use it
    if ((window as any).LiteGraph) {
      setLiteGraph((window as any).LiteGraph);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/litegraph.js@0.7.14/build/litegraph.min.js';
    script.async = true;
    
    script.onload = () => {
      setLiteGraph((window as any).LiteGraph);
      console.log('LiteGraph.js loaded');
    };
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize graph when LiteGraph is loaded and activeTabId changes
  useEffect(() => {
    if (!LiteGraph || !canvasRef.current || !activeTabId) return;
    
    try {
      // Create the graph instance
      const newGraph = new LiteGraph.LGraph();
      
      // Create the canvas instance
      const newCanvas = new LiteGraph.LGraphCanvas(canvasRef.current, newGraph);
      
      // Configure the canvas
      newCanvas.background_image = ''; // Empty string instead of null
      newCanvas.allow_searchbox = true;
      newCanvas.allow_reconnect_links = true;
      newCanvas.allow_dragnodes = true;
      newCanvas.always_render_background = true;
      newCanvas.show_info = true;
      
      // Start the graph loop
      newGraph.start();
      
      // Store references
      setGraph(newGraph);
      setCanvas(newCanvas);
      
      // Clean up on unmount
      return () => {
        newGraph.stop();
        setGraph(null);
        setCanvas(null);
      };
    } catch (err) {
      console.error("Error initializing LiteGraph:", err);
    }
  }, [LiteGraph, activeTabId]);

  // Update canvas size when container size changes
  useEffect(() => {
    if (!canvasRef.current || !canvas || !width || !height) return;
    
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    
    // Force a redraw
    try {
      canvas.draw(true, true);
    } catch (err) {
      console.error("Error resizing canvas:", err);
    }
  }, [width, height, canvas]);

  // Initialize zoom and pan
  useEffect(() => {
    if (!canvas) return;
    
    try {
      // Set scale and offset (zoom and pan)
      canvas.ds.scale = scale;
      canvas.ds.offset = offset;
      
      // Set callback for when scale or offset changes
      canvas.onDrawBackground = function() {
        try {
          // Store current scale and offset in context
          if (this.ds.scale !== scale) {
            setScale(this.ds.scale);
          }
          if (this.ds.offset[0] !== offset[0] || this.ds.offset[1] !== offset[1]) {
            setOffset([this.ds.offset[0], this.ds.offset[1]]);
          }
        } catch (err) {
          console.error("Error in onDrawBackground:", err);
        }
      };
    } catch (err) {
      console.error("Error setting canvas scale/offset:", err);
    }
  }, [canvas, scale, offset, setScale, setOffset]);

  // Simplified version - we'll add actual node rendering in a later iteration
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
      
      {/* Placeholder message */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-500">
        <div className="bg-white/80 p-4 rounded-md shadow-sm">
          <p className="text-center">
            {LiteGraph 
              ? "Canvas initialized. Node functionality coming soon." 
              : "Loading LiteGraph.js..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiteGraphWrapper;