## **Sophera Visual Sitemap & UI Structure**

This sitemap outlines the structure of Sophera, indicating the likely organization into pages, views, and key components.

Sophera Application  
│  
├── \*\*Authentication\*\* \[Separate Flow/Pages\]  
│   ├── Login Page (Patient / Caregiver) \[PAGE\]  
│   ├── Sign Up Page (Patient) \[PAGE\]  
│   └── Password Reset Flow \[PAGES/MODALS\]  
│  
└── \*\*Main Application (Post Login)\*\* \[Single Page Application Architecture, with routed views\]  
    │  
    ├── \*\*Core Navigation\*\* \[COMPONENT \- e.g., Bottom Tab Bar / Sidebar\]  
    │  
    ├── \*\*1. Today (Dashboard)\*\* \[PAGE/VIEW \- Default\]  
    │   ├── Personalized Greeting \[COMPONENT\]  
    │   ├── Today's Focus Summary \[COMPONENT\]  
    │   ├── Daily Journal Prompt \[COMPONENT \- Links to Journal Input\]  
    │   └── Hope Snippet \[COMPONENT\]  
    │  
    ├── \*\*2. My Journey\*\* \[PAGE/VIEW \- Likely uses Tabs/Segments\]  
    │   ├── \*\*My Plan View\*\* \[SUB-VIEW/TAB\]  
    │   │   ├── Calendar View \[COMPONENT\]  
    │   │   ├── List View \[COMPONENT\]  
    │   │   └── Add/Edit/View Plan Item \[MODAL or Separate PAGE\]  
    │   ├── \*\*My Journal View\*\* \[SUB-VIEW/TAB\]  
    │   │   ├── Journal Input Form \[COMPONENT/AREA\]  
    │   │   └── Journal History List/View \[COMPONENT\]  
    │   ├── \*\*Diet Log View\*\* \[SUB-VIEW/TAB\]  
    │   │   ├── Diet Log Input Form \[COMPONENT/AREA\]  
    │   │   └── Diet Log History View \[COMPONENT\]  
    │   ├── \*\*My Metrics View\*\* (Optional) \[SUB-VIEW/TAB\]  
    │   └── \*\*Trends View\*\* \[SUB-VIEW/TAB\]  
    │       └── Visualization Charts \[COMPONENT\]  
    │  
    ├── \*\*3. Understand (Knowledge Hub)\*\* \[PAGE/VIEW\]  
    │   ├── AI Explainer Interface \[COMPONENT \- Search/Input \+ Results Area\]  
    │   ├── Treatment Guides View \[COMPONENT \- List/Cards linking to details\]  
    │   │   └── Treatment Guide Detail \[MODAL or SUB-VIEW\]  
    │   ├── Interaction Checker Info \[Accessible via flags in My Plan, displays in MODAL/POPOVER or links here\]  
    │   └── Document Summarizer View \[COMPONENT\]  
    │       ├── Document Upload Interface \[COMPONENT/MODAL\]  
    │       └── Document Summary Display \[COMPONENT\]  
    │  
    ├── \*\*4. Explore (Research & Solutions)\*\* \[PAGE/VIEW\]  
    │   ├── Guided Search Interface \[COMPONENT\]  
    │   ├── Clinical Trial Finder Interface \[COMPONENT\]  
    │   └── Creative Exploration Sandbox \[SUB-VIEW or distinct area within Explore\]  
    │       ├── Disclaimer Screen \[MODAL \- One time\]  
    │       ├── AI Chat Interface \[COMPONENT\]  
    │       └── Export Doctor Brief Button/Function \[COMPONENT\]  
    │  
    ├── \*\*5. Connect & Hope (Support Hub)\*\* \[PAGE/VIEW\]  
    │   ├── Survivor Stories View \[COMPONENT \- Library/List \+ Detail View\]  
    │   ├── Mindfulness Corner View \[COMPONENT \- Links/Resources\]  
    │   ├── Resource Hub View \[COMPONENT \- Links/Resources\]  
    │   └── Caregiver Connect View \[COMPONENT\]  
    │       ├── Invite Caregiver Form \[COMPONENT/MODAL\]  
    │       └── Manage Caregivers List/Permissions \[COMPONENT\]  
    │  
    └── \*\*6. Settings & Profile\*\* \[PAGE/VIEW\]  
        ├── Edit User Profile Form \[COMPONENT\]  
        ├── Manage Caregivers (Links back to Connect & Hope) \[COMPONENT\]  
        └── Other Settings (Notifications, Privacy) \[COMPONENTS\]

└── \*\*Caregiver Mode (Conditional View \- Post Login)\*\* \[May reuse many components, but within a distinct layout/wrapper\]  
    │  
    ├── \*\*Caregiver Dashboard View\*\* \[PAGE/VIEW \- Default for Caregiver\]  
    │   ├── Patient Status Summary \[COMPONENT\]  
    │   └── Shared Notes Input/View \[COMPONENT\]  
    │  
    ├── \*\*View Patient's Journey\*\* \[PAGE/VIEW \- Accesses Patient Data Views with permissions\]  
    │  
    ├── \*\*Explore Access\*\* \[PAGE/VIEW \- Same as patient, potentially logs activity differently\]  
    │  
    └── \*\*Settings\*\* \[PAGE/VIEW \- Specific to Caregiver connection\]

**Key:**

* **\[PAGE\] / \[VIEW\]:** Represents a distinct screen or primary view the user navigates to, often corresponding to a route in a single-page application.  
* **\[SUB-VIEW / TAB\]:** Represents a distinct section within a larger page/view, often navigated via tabs or segmented controls (e.g., within "My Journey").  
* **\[COMPONENT\]:** Represents a reusable UI element or distinct functional area *within* a page/view (e.g., a form, a list, a chart, a specific card type).  
* **\[MODAL\]:** Represents content displayed temporarily over the current view, often for focused tasks like editing or viewing details.  
* **\[Separate Flow/Pages\]:** Indicates processes like authentication that might involve multiple distinct pages outside the main logged-in application structure.

This breakdown should give you a clearer sense of how the different features and information might be organized into distinct user interface screens and components within Sophera.