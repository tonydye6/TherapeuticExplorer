# SOPHERA: Enhanced Canvas-Based Vision

## 1. Vision Overview

Sophera is a holistic, AI-powered healing companion for users managing complex health journeys. The platform combines a **human-centered Dashboard** with a flexible, multi-tab **Infinite Canvas** system, empowering users to track, explore, and reason about every aspect of their care journey while nurturing hope and emotional wellbeing.

Each canvas tab supports a unique visual paradigm (freeform, calendar, spreadsheet, etc.), while the Dashboard provides a centralized hub for daily guidance, emotional support, and quick access to essential features.

![Canvas-based approach with multiple tab types](https://via.placeholder.com/800x400?text=Sophera+Canvas+Concept)

## 2. Core Components

### 2.1. Dashboard (Emotional & Functional Hub)

**Purpose**
* Serves as a daily "home base" that combines practical management with emotional support
* Presents high-level summaries, emotional content, and access to all major features

**Key Features**
* **Today's Overview**: Personalized greeting, daily schedule, upcoming treatments
* **Emotional Wellbeing Center**:
  * Daily Hope Snippet: Rotating inspirational content, affirmations, or survivor stories
  * Wellness Check-in: Quick emotional/physical state logging
  * Support Circle: View of caregiver activity and quick connection options
* **Quick Logs**: Fast entry for symptoms, mood, diet, or notes
* **Recent Activity**: Timeline of logs, uploads, and AI insights
* **Trends & Visualizations**: Simple charts for symptom trends, medication adherence, mood
* **Reminders & Alerts**: Medication times, appointments, flagged interactions
* **Canvas Tabs Quickstart**: Direct links to most-used canvas tabs + templates
* **Caregiver View**: If enabled, access to shared notes and permissions

### 2.2. Multi-Tab Infinite Canvas

**Core Concept**
* Users create and switch between multiple canvas "tabs," each serving a distinct organizational purpose
* Each tab is an independent, infinite workspace with its own layout, nodes, and connections
* Canvas serves as a visual thinking and organization tool for managing complex health information

**Tab Types & Layout Modes**

| Tab Type | Description | Key Features |
|----------|-------------|--------------|
| **Freeform** | Standard node-based infinite canvas for exploratory mapping and research | Drag/drop nodes, connect freely, run AI queries on selections |
| **Calendar** | Nodes arranged by date in weekly/monthly grid | Drag nodes to dates, recurring events, zoom in/out, timeline view |
| **Spreadsheet** | Mimics a spreadsheet with rectangular nodes arranged in rows/columns | Grid snapping, import/export CSV, color coding, data entry |
| **Journey** | Timeline-based emotional journey tracking | Milestone nodes, victory markers, challenge spaces, hope connections |
| **Template** | Pre-built templates for specific scenarios | E.g., Chemo cycles, exercise plans, clinical trial tracking |

**Tab Management**
* Tab Bar UI: Displayed at the top of the canvas section; users can add, rename, duplicate, or delete tabs
* Persistence: Each tab's state (layout, nodes, connections, settings) saved independently in Firestore
* Simplicity: Initial tabs provided as templates with guided onboarding

**Node Types (All Tabs)**
* **Medical Data**: Treatment, Medication, Symptom, Lab Result
* **Documents**: Research Article, Doctor's Note, Medical Image
* **Journal**: Symptom Log, Diet Log, Exercise Log, Mood Entry
* **Support**: Hope Snippet, Caregiver Note, Victory Marker, Milestone
* **Custom Node**: User-defined nodes for flexibility

**Node Properties**
* Title, Type, Summary/Details, Source/Date, Tags, Linked Data, Attachments, Permissions, Visual Properties

**Canvas Interactions**
* Create/Edit/Delete nodes (manual or via data import/upload)
* Connect nodes (visualize relationships)
* Group/select nodes (for batch actions or AI queries)
* Pan/zoom canvas
* Import/export data (especially for spreadsheet tabs)
* Share/collaborate (invite caregivers, set permissions)

**Node Details Panel**
* Side panel opens on node click: full details, AI insights, related nodes, actions
* Adapts to node type to show relevant information and controls

### 2.3. AI Integration

**AI Querying**
* **Context-Aware**: User selects specific nodes to provide context for AI queries
* **Prompt Field**: User enters a question or instruction in a chat interface
* **Visual Response**: AI can highlight relationships, suggest connections, or create new nodes
* **Response Types**:
   * Personalized, context-aware answers
   * Suggested new connections or node groupings
   * Actionable insights, flags, or reminders
   * Visual overlays (e.g., highlight related nodes)

**AI Node Creation**
* Document/Image Uploads: Auto-summarized and node created with AI-generated summary and tags
* Journal/Log Entries: Can trigger auto-node creation and suggested connections

**Tab-Specific AI Modes**
* **Freeform Tab**: Exploratory, relationship-focused analysis
* **Calendar Tab**: Timeline analysis, event clustering, future planning suggestions
* **Spreadsheet Tab**: Pattern detection, summary, or anomaly detection
* **Journey Tab**: Emotional narrative construction, milestone recognition, encouragement

### 2.4. Accessibility & Mobile Experience

**Progressive Complexity**
* **Simplicity First**: Start users with pre-built templates and simplified interfaces
* **Progressive Disclosure**: Advanced features revealed as users become comfortable
* **Guided Onboarding**: Interactive tutorials for each canvas type

**Mobile Adaptation**
* **Card-Based View**: Transform canvas nodes into scrollable cards on small screens
* **Focused Interactions**: Simplified mobile interactions prioritizing consumption over creation
* **Touch Optimization**: Large touch targets and gesture controls
* **Synced Experience**: Changes sync between mobile and desktop

### 2.5. Caregiver Integration

**Caregiver-Specific Features**
* **Selective Sharing**: Share specific canvas tabs with different caregivers
* **Collaboration Tools**: Caregiver notes, task assignments, shared journaling
* **Access Controls**: Granular permissions for viewing vs. editing different content

## 3. Technical Architecture

### 3.1. Frontend (React + LiteGraph.js)
* **Canvas Implementation**: LiteGraph.js for node-based canvas rendering and interaction
* **UI Components**: Continued use of shadcn/ui components for consistent design
* **State Management**: React Query for server state, React context for canvas state
* **Routing**: Wouter for navigation between Dashboard and Canvas tabs

### 3.2. Backend (Node.js, Firestore)
* **Data Storage**: Firestore for user data, canvas states, node data, and connections
* **AI Processing**: Multi-LLM router system (existing) + canvas-specific reasoning modules
* **Authentication**: Firebase Auth with caregiver collaboration support
* **API Structure**: RESTful endpoints for data operations, WebSocket for real-time collaboration

### 3.3. Data Model Extensions

```
CanvasTabs:
  - id: string
  - userId: string
  - name: string
  - type: "freeform" | "calendar" | "spreadsheet" | "journey" | "template"
  - config: object
  - created: timestamp
  - updated: timestamp

CanvasNodes:
  - id: string
  - tabId: string
  - type: string
  - title: string
  - position: [x, y]
  - size: [width, height]
  - properties: object
  - dataRef: { collection: string, docId: string }
  - created: timestamp
  - updated: timestamp

CanvasConnections:
  - id: string
  - tabId: string
  - originNode: string
  - originOutput: number
  - targetNode: string
  - targetInput: number
```

## 4. Implementation Approach

### 4.1. Phased Rollout

**Phase 1: Foundation & Dashboard Enhancement**
* Implement the Dashboard emotional center
* Create the basic canvas infrastructure with tab management
* Develop core node types mapping to existing data

**Phase 2: Canvas Expansion & AI Integration**
* Implement specialized canvas tab types
* Add canvas-specific AI query functionality
* Create templates and onboarding experiences

**Phase 3: Mobile & Full-Featured Experience**
* Implement mobile adaptations
* Complete caregiver collaboration features
* Add advanced canvas features and node types

### 4.2. Technical Migration Strategy

**Leveraging Existing Codebase**
* Maintain current data models, extending with canvas-specific schemas
* Use existing UI components as node templates
* Adapt current AI system for canvas-specific reasoning

**Critical New Components**
* Canvas Container (tab management + LiteGraph integration)
* Node Details Panel (right sidebar for selected node)
* AI Query Panel (for context-aware questions)
* Template System (pre-built canvas arrangements)

## 5. User Experience Flows

### 5.1. First-Time User Experience
1. User signs up and completes basic profile
2. Guided onboarding introduces the Dashboard and key features
3. User is prompted to choose an initial canvas template based on their needs
4. Tutorial introduces basic canvas interactions and node types
5. User completes first emotional check-in and receives first hope snippet

### 5.2. Daily User Journey
1. User opens Sophera and lands on the Dashboard
2. Views today's focus, emotional content, and recent activity
3. Performs wellness check-in and logs any symptoms
4. Navigates to relevant canvas tab to explore or update information
5. Uses AI assistant to answer questions about their health data

### 5.3. Caregiver Journey
1. Caregiver receives invitation and sets up account
2. Sees shared canvas tabs and Dashboard components
3. Can add notes, suggest connections, or assign tasks
4. Receives notifications about significant changes
5. Collaborates on planning and research

## 6. Conclusion

The enhanced canvas-based Sophera creates a truly unique healing companion that balances organizational power with emotional support. By combining the infinite canvas paradigm with a human-centered design approach, Sophera enables patients to visualize, understand, and act upon complex health information while maintaining focus on hope, support, and emotional wellbeing throughout their journey.
