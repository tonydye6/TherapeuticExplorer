# Sophera Canvas Implementation

I need comprehensive help implementing a major update to Sophera, transforming it into a canvas-based healing companion application. This implementation involves creating a new canvas system using LiteGraph.js while enhancing the existing dashboard with emotional support features.

## Project Context

Sophera is a human-centric, AI-powered healing companion for cancer patients. The current implementation has these key components:

1. Dashboard for daily overview
2. Treatment tracking and journal features
3. AI-powered research and explanation tools
4. Document management capabilities
5. Hope and emotional support elements

The new direction involves implementing a multi-tab infinite canvas system where users can visually organize and connect their medical information, while maintaining the human-centered approach with enhanced emotional support features.

## Technical Requirements

### Core Components

1. **Enhanced Dashboard**
   - Add emotional support components (daily hope snippets, wellness check-in, support circle)
   - Create canvas tabs quick access panel

2. **Canvas Container System**
   - Implement multi-tab canvas management
   - Create tab switching and CRUD operations
   - Support different canvas types (freeform, calendar, spreadsheet)

3. **LiteGraph.js Integration**
   - Basic canvas setup with pan/zoom
   - Node creation, deletion, connection
   - Custom node rendering for Sophera data types
   - Node selection and interaction

4. **Node Types**
   - Map existing data models (treatments, documents, journal entries) to canvas nodes
   - Create visual representations for each node type
   - Implement node details panel

5. **AI Integration**
   - Context-aware AI queries based on selected nodes
   - Visual response display within canvas
   - Relationship suggestions between nodes

### Data Structure Extensions

Add to the existing data model:

```typescript
// Canvas Tab definition
interface CanvasTab {
  id: string;
  userId: string;
  name: string;
  type: "freeform" | "calendar" | "spreadsheet" | "template";
  config: any;
  created: Date;
  updated: Date;
}

// Node data
interface CanvasNode {
  id: string;
  tabId: string;
  type: string;
  title: string;
  position: [number, number];
  size: [number, number];
  inputs: any[];
  outputs: any[];
  properties: Record<string, any>;
  dataRef?: {
    collection: string;
    docId: string;
  };
}

// Connection between nodes
interface CanvasConnection {
  id: string;
  tabId: string;
  originNode: string;
  originOutput: number;
  targetNode: string;
  targetInput: number;
}
```

## Implementation Steps

Please help me implement this canvas-based system in phases:

### Phase 1: Foundation & Dashboard Enhancement

1. **Set up dependencies**
   - Install LiteGraph.js and related packages
   - Add necessary CSS

2. **Enhance Dashboard**
   - Create emotional support widgets
   - Add canvas quick access

3. **Implement Canvas Container**
   - Create main canvas components
   - Set up tab management
   - Basic LiteGraph integration

4. **Develop core node types**
   - Base node class
   - Treatment, Document, Journal node types
   - Node factory system

### Phase 2: Canvas Tab Types & AI Integration 

1. **Implement specialized canvas types**
   - Freeform canvas functionality
   - Calendar-based view
   - Spreadsheet format

2. **Create node details panel**
   - Adapt existing card components
   - Edit/view functionality

3. **Implement AI integration**
   - Context selection
   - Query interface
   - Visual response handling

### Phase 3: Mobile Support & Polish

1. **Mobile adaptations**
   - Transform canvas to card view on small screens
   - Touch interactions

2. **Complete the experience**
   - Templates and onboarding
   - Performance optimization

## Key Files to Create or Modify

```
client/src/
├── components/
│   ├── canvas/
│   │   ├── CanvasContainer.tsx
│   │   ├── CanvasTabBar.tsx
│   │   ├── GraphCanvas.tsx
│   │   ├── NodeDetailsPanel.tsx
│   │   └── AIQueryPanel.tsx
│   └── dashboard/
│       ├── DailyHopeWidget.tsx
│       ├── WellnessCheckinWidget.tsx
│       └── CanvasQuickAccess.tsx
├── hooks/
│   ├── useCanvasTabs.ts
│   └── useCanvasNodes.ts
├── pages/
│   ├── DashboardPage.tsx (enhance)
│   └── CanvasPage.tsx (new)
└── services/
    └── canvas-service.ts
```

## Implementation Instructions

Please help me implement this phased approach to transform Sophera. For each component or feature:

1. Generate the necessary TypeScript/React code
2. Use Tailwind CSS for styling
3. Ensure compatibility with the existing codebase
4. Provide clear comments explaining the implementation
5. Follow the design principles in the specification

I'm looking for a complete, production-ready implementation that maintains the human-centered approach while adding powerful canvas capabilities. Let's start with Phase 1 and work through each component in detail.

## Phase 1 Instructions

Let's begin with these specific components:

1. **Set up LiteGraph.js integration**
   - Install dependencies
   - Create basic wrapper component

2. **Enhance DashboardPage.tsx**
   - Add the emotional support widgets
   - Create canvas quick access section

3. **Implement Canvas Container and Tab Bar**
   - Basic tab management
   - Canvas initialization

4. **Create first node type (Treatment)**
   - Base node functionality
   - Visual rendering

Please provide detailed, production-ready code for each of these components. Use the existing design language from Sophera while implementing the new canvas-based approach.
