# Sophera Canvas Implementation Guide

This guide provides a step-by-step approach to transform the current Sophera application into the new canvas-based vision. The implementation is organized into logical phases with clear milestones.

## Phase 1: Foundation & Dashboard Enhancement

### Step 1: Project Setup & Dependencies

1. **Install LiteGraph.js and dependencies**
   ```bash
   npm install litegraph.js react-resize-detector
   ```

2. **Add CSS dependencies**
   - Copy `litegraph.css` to `client/src/styles/`
   - Add import in `client/src/index.css`:
   ```css
   @import './styles/litegraph.css';
   ```

3. **Create core canvas type definitions**
   - Create `shared/canvas-types.ts` with the new interfaces for Canvas tabs, nodes, and connections

### Step 2: Dashboard Enhancement

1. **Create new emotional support components**
   - `DailyHopeWidget.tsx`: Rotates hope snippets, affirmations, or survivor stories
   - `WellnessCheckinWidget.tsx`: Quick emotional/physical state logging
   - `SupportCircleWidget.tsx`: Shows caregiver activity and connections

2. **Enhance Dashboard layout**
   - Update `DashboardPage.tsx` to include the new emotional components
   - Add quick access section for canvas tabs

3. **Create Canvas quickstart panel**
   - Implement `CanvasQuickAccess.tsx` component showing recent and template tabs
   - Add to Dashboard

### Step 3: Canvas Container Implementation

1. **Create base canvas components**
   - `CanvasContainer.tsx`: Main wrapper managing canvas state
   - `CanvasTabBar.tsx`: Tab management UI 
   - `GraphCanvas.tsx`: LiteGraph.js integration

2. **Implement canvas state management**
   - Create `useCanvasTabs.ts` hook for tab management
   - Implement tab CRUD operations with Firestore

3. **Create Canvas Page component**
   - `CanvasPage.tsx`: Top-level component for routing
   - Add to router in `App.tsx`

4. **Implement basic canvas functionality**
   - Pan/zoom behaviors
   - Node selection
   - Basic node CRUD operations

### Step 4: Node Types Development

1. **Create base node class**
   - Implement common node functionality
   - Register with LiteGraph

2. **Implement core node types**
   - Treatment node (`TreatmentNode.ts`)
   - Document node (`DocumentNode.ts`) 
   - Journal entry node (`JournalNode.ts`)
   - Symptom node (`SymptomNode.ts`)

3. **Create node factory system**
   - `NodeFactory.ts`: Central registration and creation of node types
   - Map existing data models to node properties

4. **Implement node serialization/deserialization**
   - Add methods to convert between nodes and Firestore data
   - Ensure proper type handling

### Step 5: Node Details Panel

1. **Create node details panel component**
   - `NodeDetailsPanel.tsx`: Side panel for viewing/editing node details
   - Content adapts based on selected node type

2. **Integrate existing card components**
   - Refactor `TreatmentCard.tsx`, `JournalLogCard.tsx`, etc. to work as node detail views
   - Ensure state is properly synced between node and detail panel

3. **Implement node editing functionality**
   - Create edit mode for node details
   - Update node and database when changes occur

## Phase 2: Canvas Tab Types & AI Integration

### Step 6: Implement Freeform Canvas

1. **Complete freeform canvas type**
   - Free node positioning
   - Connection creation/editing
   - Node grouping

2. **Add node customization options**
   - Color, size, shape
   - Visual indicators for states (active, important)

3. **Implement canvas serialization**
   - Save/load entire canvas state
   - Auto-save functionality

### Step 7: Implement Calendar Canvas

1. **Create calendar grid system**
   - Define time-based grid layout
   - Date-based node organization

2. **Add date-specific interactions**
   - Drag nodes to dates
   - Recurring events
   - Date-range selection

3. **Create calendar-specific node types**
   - Appointment nodes
   - Treatment cycle nodes
   - Milestone nodes

### Step 8: Implement Spreadsheet Canvas 

1. **Create grid-based layout**
   - Configurable columns/rows
   - Snapping behavior

2. **Add spreadsheet interactions**
   - Cell-based editing
   - Row/column operations

3. **Implement data import/export**
   - CSV/Excel import
   - Data transformation to nodes

### Step 9: AI Integration

1. **Create AI query panel**
   - `AIQueryPanel.tsx`: Interface for asking questions
   - Node selection for context

2. **Extend AI router for canvas**
   - Add canvas-specific prompts
   - Serialize selected nodes for context

3. **Implement visual AI responses**
   - Highlight related nodes
   - Suggest new connections
   - Create response nodes

### Step 10: Template System

1. **Create template framework**
   - Template definition structure
   - Serialization/deserialization

2. **Implement template library**
   - Treatment tracking templates
   - Research organization templates
   - Emotional journey templates

3. **Add guided template system**
   - Interactive tutorials for templates
   - Contextual help

## Phase 3: Mobile & Full Experience

### Step 11: Mobile Adaptation

1. **Create mobile-specific views**
   - Transform canvas to card list on small screens
   - Implement mobile navigation for canvas

2. **Add touch interactions**
   - Touch-friendly node selection
   - Gesture controls for common actions

3. **Optimize performance for mobile**
   - Limit visible nodes
   - Progressive loading

### Step 12: Caregiver Integration

1. **Implement sharing controls**
   - Per-tab sharing settings
   - Permission management

2. **Add collaboration features**
   - Caregiver annotations
   - Shared notes

3. **Create caregiver-specific views**
   - Support-focused interfaces
   - Task management

### Step 13: Advanced Features

1. **Add Journey tab type**
   - Timeline-based emotional journey tracking
   - Special emotional milestone nodes

2. **Implement node search/filtering**
   - Advanced search across canvas tabs
   - Filtering by node properties

3. **Add data visualization features**
   - Charts based on node data
   - Pattern visualization

### Step 14: Final Polish

1. **Refine UX across all components**
   - Consistent styling
   - Smooth transitions

2. **Optimize performance**
   - Lazy loading strategies
   - Virtualization for large canvases

3. **Comprehensive testing**
   - End-to-end user flows
   - Performance testing
   - Cross-device testing

## Implementation Details

### Key Files Structure

```
client/src/
├── components/
│   ├── canvas/
│   │   ├── CanvasContainer.tsx
│   │   ├── CanvasTabBar.tsx
│   │   ├── GraphCanvas.tsx
│   │   ├── NodeDetailsPanel.tsx
│   │   ├── AIQueryPanel.tsx
│   │   ├── nodes/
│   │   │   ├── BaseNode.ts
│   │   │   ├── TreatmentNode.ts
│   │   │   ├── DocumentNode.ts
│   │   │   ├── JournalNode.ts
│   │   │   └── ...
│   │   └── templates/
│   │       ├── TemplateManager.tsx
│   │       ├── TreatmentTrackingTemplate.ts
│   │       └── ...
│   ├── dashboard/
│   │   ├── DailyHopeWidget.tsx
│   │   ├── WellnessCheckinWidget.tsx
│   │   ├── SupportCircleWidget.tsx
│   │   └── CanvasQuickAccess.tsx
│   └── ...
├── hooks/
│   ├── useCanvasTabs.ts
│   ├── useCanvasNodes.ts
│   ├── useNodeSelection.ts
│   └── ...
├── pages/
│   ├── DashboardPage.tsx (enhanced)
│   ├── CanvasPage.tsx (new)
│   └── ...
└── lib/
    ├── canvas-helpers.ts
    ├── node-factory.ts
    └── ...
```

### Key Data Structures

**Canvas Tab**
```typescript
interface CanvasTab {
  id: string;
  userId: string;
  name: string;
  type: "freeform" | "calendar" | "spreadsheet" | "journey" | "template";
  config: {
    gridSize?: number;
    background?: string;
    dateRange?: { start: Date; end: Date };
    template?: string;
    // Other type-specific configuration
  };
  created: Date;
  updated: Date;
}
```

**Canvas Node**
```typescript
interface CanvasNode {
  id: string;
  tabId: string;
  type: string;  // treatment, journal, document, etc.
  title: string;
  position: [number, number];
  size: [number, number];
  inputs: {
    name: string;
    type: string;
    linkedTo?: { nodeId: string; output: number };
  }[];
  outputs: {
    name: string;
    type: string;
  }[];
  properties: Record<string, any>;
  dataRef?: {
    collection: string;
    docId: string;
  };
  visual?: {
    color?: string;
    icon?: string;
    shape?: string;
  };
  created: Date;
  updated: Date;
}
```

**Canvas Connection**
```typescript
interface CanvasConnection {
  id: string;
  tabId: string;
  originNode: string;
  originOutput: number;
  targetNode: string;
  targetInput: number;
  type?: string;  // relationship type
  properties?: Record<string, any>;
}
```

### Node Type Implementation Example

```typescript
// TreatmentNode.ts
import { LiteGraph } from 'litegraph.js';

class TreatmentNode {
  // Node setup
  constructor() {
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
}

// Register with LiteGraph
LiteGraph.registerNodeType("sophera/treatment", TreatmentNode);

export default TreatmentNode;
```

### Integration with Existing Code

1. **Adapting existing components:**
   - Use current card components as templates for node detail panels
   - Leverage existing hooks for data management
   - Reuse AI integration services with canvas-specific extensions

2. **Preserving data models:**
   - Keep current schemas and add canvas-specific extensions
   - References between nodes and data rather than duplication

3. **Maintaining routes:**
   - Add new routes for canvas but preserve existing route structure
   - Update navigation to include canvas access

## Key Implementation Considerations

1. **Performance optimization:**
   - Implement node culling for large canvases
   - Lazy load node contents
   - Virtual rendering for large datasets

2. **Mobile experience:**
   - Transform canvas to card list on small screens
   - Implement touch-specific interactions
   - Reduce feature complexity on mobile

3. **Accessibility:**
   - Ensure keyboard navigation
   - Implement screen reader support
   - Provide high contrast mode

4. **User onboarding:**
   - Create interactive tutorials
   - Provide templates for quick start
   - Implement progressive feature disclosure

By following this implementation guide, you can transform Sophera into a powerful canvas-based system while leveraging your existing codebase and preserving the human-centered approach that makes Sophera unique.
