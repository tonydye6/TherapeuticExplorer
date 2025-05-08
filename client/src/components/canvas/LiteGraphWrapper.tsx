import { useEffect, useRef, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { NodeFactory } from './nodes/NodeFactory';
import TreatmentNode from './nodes/TreatmentNode';
import SymptomNode from './nodes/SymptomNode';
import JournalNode from './nodes/JournalNode';
import DocumentNode from './nodes/DocumentNode';
import NoteNode from './nodes/NoteNode';

// Will be populated after dynamic import
let LiteGraph: any = null;

interface LiteGraphWrapperProps {
  onNodeSelected?: (nodeId: string, node: any) => void;
  onNodeCreated?: (node: any) => void;
  onNodeRemoved?: (node: any) => void;
  onConnectionChanged?: (connection: any) => void;
  onLinkSelected?: (linkId: number, link: any) => void;
  className?: string;
}

export default function LiteGraphWrapper({
  onNodeSelected,
  onNodeCreated,
  onNodeRemoved,
  onConnectionChanged,
  onLinkSelected,
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

      // Initialize our custom node types first
      if (LiteGraph.LiteGraph) {
        // Make LiteGraph available globally for node registration
        (window as any).LiteGraph = LiteGraph.LiteGraph;
      }
      
      // Initialize and register all node types
      NodeFactory.initialize();
      
      // Create a new graph
      const graph = new LiteGraph.LGraph();
      graphRef.current = graph;

      // Create the canvas instance
      const canvasInstance = new LiteGraph.LGraphCanvas(canvasRef.current, graph);
      canvasInstanceRef.current = canvasInstance;
      
      // Customize link appearance for better visibility
      if (LiteGraph.LGraphCanvas.link_type_colors) {
        // Set default link color to match our primary color
        LiteGraph.LGraphCanvas.link_type_colors["default"] = "#0D9488";
        
        // Add different colors for different relationship types
        LiteGraph.LGraphCanvas.link_type_colors["causes"] = "#EF4444"; // red
        LiteGraph.LGraphCanvas.link_type_colors["treats"] = "#0D9488"; // teal
        LiteGraph.LGraphCanvas.link_type_colors["improves"] = "#10B981"; // green
        LiteGraph.LGraphCanvas.link_type_colors["worsens"] = "#F59E0B"; // amber
      }
      
      // Increase link width for better visibility
      if (canvasInstance) {
        canvasInstance.default_link_width = 3; // Make links thicker
        canvasInstance.highquality_render = true; // Enable high quality rendering
      }

      // Start the graph
      graph.start();
      
      // Set default camera position and zoom with a consistent starting point
      if (canvasInstance) {
        try {
          // Disable all debug info that shows FPS, etc.
          canvasInstance.render_canvas_border = false;
          canvasInstance.render_connection_arrows = true;
          canvasInstance.render_curved_connections = true;
          canvasInstance.render_execution_order = false; // Don't show execution order
          canvasInstance.render_info = false; // This disables the debug text (T, I, N, etc.)
          canvasInstance.renderMenuOptions = { 
            default: null,
            animation: { fps: false }
          };
          
          // Set initial camera position 
          // Use 0,0 as center point with a slightly zoomed out view
          canvasInstance.ds.offset = [0, 0];
          canvasInstance.ds.scale = 0.8;
          
          console.log('Camera position initialized with clean view');
        } catch (err) {
          console.error('Error setting up initial camera view:', err);
        }
      }
      
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
          // Enhanced connection change handling with more information
          // This allows us to create or remove edges in our data model
          const connectionInfo = {
            node,
            nodeId: node.id,
            inputIndex,
            outputIndex,
            linkInfo,
            connected,
            sourceNode: linkInfo?.origin_node,
            sourceNodeId: linkInfo?.origin_node?.id,
            sourceOutputIndex: linkInfo?.origin_slot,
            targetNode: node,
            targetNodeId: node.id,
            targetInputIndex: inputIndex
          };
          
          // If a connection was created
          if (connected && linkInfo) {
            // Get the newly created link from the graph
            const links = graph.links;
            const recentLink = Object.values(links || {}).pop() as any;
            
            if (recentLink) {
              // Add a temporary visual effect to highlight the new connection
              const originalWidth = recentLink.width || canvasInstance.default_link_width;
              const originalColor = recentLink.color;
              
              // Animate the link to draw attention
              recentLink.width = originalWidth * 3;
              recentLink.color = "#FF7F50"; // Secondary color
              
              // Create a simple animation to return to normal
              let animationStep = 0;
              const animateLink = () => {
                if (animationStep < 10) {
                  recentLink.width = originalWidth * (3 - 0.2 * animationStep);
                  canvasInstance.setDirtyCanvas(true, true);
                  animationStep++;
                  setTimeout(animateLink, 50);
                } else {
                  recentLink.width = originalWidth;
                  recentLink.color = originalColor;
                  canvasInstance.setDirtyCanvas(true, true);
                }
              };
              
              setTimeout(animateLink, 50);
            }
          }
          
          onConnectionChanged(connectionInfo);
        };
      }

      // Add link selection handling if the callback is provided
      if (onLinkSelected && canvasInstance) {
        // Override the processLinkSelection method to handle link clicks
        const originalProcessLinkSelection = canvasInstance.processLinkSelection;
        canvasInstance.processLinkSelection = function(e: any) {
          // Call original method first
          const result = originalProcessLinkSelection.call(this, e);
          
          // If a link was selected
          if (this.selected_link) {
            const link = this.selected_link;
            
            // Apply visual changes to the selected link to make it more noticeable
            // Save original properties to restore when deselected
            if (!link._originalWidth) {
              link._originalWidth = link.width || canvasInstance.default_link_width;
              link._originalColor = link.color;
              
              // Make the selected link stand out
              link.width = (link.width || canvasInstance.default_link_width) * 2;
              link.color = "#FF7F50"; // secondary color (coral)
              
              // Request redraw
              this.setDirtyCanvas(true, true);
              
              // Create a pulsing effect (optional)
              const pulseLink = () => {
                if (this.selected_link === link) {
                  link.width = link.width * 0.9 + link._originalWidth * 0.1;
                  this.setDirtyCanvas(true, true);
                  
                  // Schedule next pulse
                  setTimeout(pulseLink, 100);
                }
              };
              setTimeout(pulseLink, 100);
            }
            
            // Extract the link ID (this is custom logic since LiteGraph doesn't have link IDs)
            // The link object contains the origin_node, origin_slot, target_node, and target_slot
            const linkId = Math.floor(Math.random() * 100000);
            
            console.log('Link selected in LiteGraphWrapper:', linkId, link);
            console.log('Link properties:', {
              sourceId: link.origin_node.id,
              targetId: link.target_node.id
            });
            onLinkSelected(linkId, link);
          } else {
            // Restore all links to their original state
            if (graph && graph.links) {
              for (const linkId in graph.links) {
                const link = graph.links[linkId];
                if (link._originalWidth) {
                  link.width = link._originalWidth;
                  link.color = link._originalColor;
                  delete link._originalWidth;
                  delete link._originalColor;
                }
              }
              this.setDirtyCanvas(true, true);
            }
          }
          
          return result;
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
  }, [onNodeSelected, onNodeCreated, onNodeRemoved, onConnectionChanged, onLinkSelected]);

  // Handle resize events
  useEffect(() => {
    if (!canvasInstanceRef.current || !width || !height) return;
    
    // Resize the canvas when the container size changes
    canvasInstanceRef.current.resize(width, height);
    
    // Recenter the view
    resetCamera();
  }, [width, height]);
  
  // Function to reset camera position and zoom
  const resetCamera = () => {
    if (!canvasInstanceRef.current || !canvasRef.current) return;
    
    try {
      // Set camera to center position with zoomed out view
      const canvas = canvasRef.current;
      
      // Zero out the position so it's at origin
      canvasInstanceRef.current.ds.offset = [0, 0];
      
      // Use a zoomed out scale to show more of the canvas
      canvasInstanceRef.current.ds.scale = 0.8; 
      
      // Turn off debug info
      canvasInstanceRef.current.render_info = false;
      
      // Use the graph's setDirtyCanvas method to trigger redraw
      const graph = (window as any).sophGraph;
      if (graph) {
        graph.setDirtyCanvas(true);
      }
    } catch (err) {
      console.error("Error resetting camera:", err);
    }
  };

  // Expose resetCamera to parent components
  useEffect(() => {
    if (canvasInstanceRef.current) {
      // Make resetCamera available globally for external components to call
      (window as any).sophResetCamera = resetCamera;
    }
  }, []);
  
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