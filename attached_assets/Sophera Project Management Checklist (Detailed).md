## **Sophera Project Management Checklist**

**Phase 1: Setup & Foundational Backend**

* **\[ \] 1.1 Project Setup & Rebranding:**  
  * \[ \] Rename project references from "Thrive" to "Sophera" in code, UI text, and assets.  
  * \[ \] Create Google Cloud Project (if new).  
  * \[ \] Enable required APIs (Firestore, Vertex AI).  
  * \[ \] Set up billing for Google Cloud Project.  
  * \[ \] Create Google Cloud Service Account and secure credentials in Replit Secrets.  
  * \[ \] Grant necessary IAM roles to the service account (Firestore User, Vertex AI User, Vertex AI Search Service Agent, Storage Object Admin if using GCS).  
  * \[ \] Install required Node.js packages (@google-cloud/firestore, @google-cloud/storage, Vertex AI clients).  
* **\[ \] 1.2 Firestore Integration \- Core:** *(Ref: Backend Chunk 1\)*  
  * \[ \] Create server/services/firestore-service.ts.  
  * \[ \] Implement Firestore client initialization (using credentials).  
  * \[ \] Define and implement basic Firestore security rules (user access only).  
  * \[ \] Implement getUserProfile function.  
  * \[ \] Implement updateUserProfile function.  
  * \[ \] Implement backend routes for user profile GET/PUT.  
  * \[ \] **TEST:** Basic user profile saving and loading.  
* **\[ \] 1.3 Firestore Integration \- My Plan:** *(Ref: Backend Chunk 2\)*  
  * \[ \] Define planItems sub-collection structure.  
  * \[ \] Implement addPlanItem function.  
  * \[ \] Implement getPlanItems function.  
  * \[ \] Implement updatePlanItem function.  
  * \[ \] Implement deletePlanItem function.  
  * \[ \] Implement backend routes for plan item CRUD.  
  * \[ \] **TEST:** Plan item management via API.  
* **\[ \] 1.4 Firestore Integration \- My Journal & Diet Logs:** *(Ref: Backend Chunk 3\)*  
  * \[ \] Define journalLogs sub-collection structure.  
  * \[ \] Define dietLogs sub-collection structure.  
  * \[ \] Implement addJournalLog function.  
  * \[ \] Implement getJournalLogs function (consider date filtering).  
  * \[ \] Implement addDietLog function.  
  * \[ \] Implement getDietLogs function.  
  * \[ \] Implement backend routes for journal and diet log POST/GET.  
  * \[ \] **TEST:** Journal and Diet log saving and retrieval.

**Phase 2: Core AI & Grounding Integration**

* **\[ \] 2.1 AI Router Context Fetching:** *(Ref: Backend Chunk 4\)*  
  * \[ \] Identify context needs for different AI query types in aiRouter.ts.  
  * \[ \] Implement logic in aiRouter.ts to call firestore-service.ts functions to fetch relevant context (profile, plan, logs) based on userId.  
  * \[ \] Implement helper function to format fetched context for LLM prompts.  
  * \[ \] Update LLM service calls to include formatted context.  
  * \[ \] **TEST:** Verify context is fetched and influences AI responses appropriately.  
* **\[ \] 2.2 Vertex AI Search Setup & Document Handling:** *(Ref: Backend Chunk 5\)*  
  * \[ \] Create Vertex AI Search Data Store(s) in GCP Console (configure for userId metadata filtering).  
  * \[ \] Define documents sub-collection structure in Firestore.  
  * \[ \] Implement backend document upload endpoint.  
  * \[ \] Implement logic to upload document content to Vertex AI Search (via GCS or directly), tagging with userId metadata.  
  * \[ \] Implement logic to save document metadata to Firestore via firestore-service.ts.  
  * \[ \] **TEST:** Document upload pipeline (Vertex AI Search \+ Firestore metadata).  
* **\[ \] 2.3 Vertex AI Search RAG Integration:** *(Ref: Backend Chunk 6\)*  
  * \[ \] Create server/services/vertex-search-service.ts.  
  * \[ \] Implement Vertex AI client initialization.  
  * \[ \] Implement searchGroundedAnswer(userId, query) function (calls Vertex AI Search API with userId filter).  
  * \[ \] Modify aiRouter.ts to route specific queries (e.g., document questions) to vertex-search-service.ts.  
  * \[ \] Implement response formatting from Vertex AI Search result.  
  * \[ \] **TEST:** Grounded responses based on user-specific uploaded documents.

**Phase 3: Advanced Backend Features**

* **\[ \] 3.1 Interaction Analyzer:** *(Ref: Backend Chunk 7\)*  
  * \[ \] Create server/services/interactionService.ts (or similar).  
  * \[ \] Implement logic to fetch relevant plan items (including diet) from Firestore.  
  * \[ \] Implement logic to call appropriate LLM service with a prompt for interaction analysis (pairwise, multi, comprehensive).  
  * \[ \] Implement parsing of the structured interaction response from the LLM.  
  * \[ \] Implement backend API endpoint for interaction checks.  
  * \[ \] **TEST:** Interaction analysis functionality.  
* **\[ \] 3.2 Creative Exploration Sandbox Backend:** *(Ref: Backend Chunk 8\)*  
  * \[ \] Update aiRouter.ts to route Sandbox queries to gemini-service.ts (multi-modal model).  
  * \[ \] Ensure comprehensive context fetching for Sandbox prompts.  
  * \[ \] Refine Gemini system prompts for Sandbox persona.  
  * \[ \] Implement handling for multi-modal inputs (if applicable in Phase 1).  
  * \[ \] Implement "Doctor Discussion Brief" export function (fetch context, format output).  
  * \[ \] Implement backend endpoint for brief generation.  
  * \[ \] **TEST:** Sandbox interaction and brief export.  
* **\[ \] 3.3 Caregiver Access Backend:** *(Ref: Backend Chunk 9\)*  
  * \[ \] Define Firestore structure for caregiver invitations/permissions.  
  * \[ \] Implement Firestore functions to manage invitations and permissions.  
  * \[ \] Update backend authentication/authorization logic to check caregiver permissions.  
  * \[ \] Implement specific endpoints for fetching summarized data for the Caregiver View.  
  * \[ \] **TEST:** Caregiver permission logic and data access controls.

**Phase 4: Frontend Redesign & Core UI**

* **\[ \] 4.1 Rebranding & Core Layout/Theme:** *(Ref: UI Chunk 1\)*  
  * \[ \] Replace "Thrive" with "Sophera" in UI text/assets.  
  * \[ \] Implement new color palette, typography, and global styles.  
  * \[ \] Implement primary navigation (Bottom Tab / Sidebar).  
  * \[ \] **TEST:** Verify rebranding, theme, and responsive navigation.  
* **\[ \] 4.2 "Today" Dashboard UI:** *(Ref: UI Chunk 2\)*  
  * \[ \] Implement TodayDashboard.tsx layout.  
  * \[ \] Implement Greeting component.  
  * \[ \] Implement "Today's Focus" component (fetches data from backend).  
  * \[ \] Implement Journal Prompt component (links to journal).  
  * \[ \] Implement "Hope Snippet" component.  
  * \[ \] **TEST:** Dashboard layout, components, and basic data fetching.  
* **\[ \] 4.3 "My Journey" \- Plan UI:** *(Ref: UI Chunk 3\)*  
  * \[ \] Implement MyPlanView.tsx.  
  * \[ \] Implement data fetching from backend.  
  * \[ \] Implement List View component.  
  * \[ \] Implement Calendar View component.  
  * \[ \] Implement Add/Edit Plan Item form/modal and API integration.  
  * \[ \] Implement Delete functionality and API integration.  
  * \[ \] Implement Check-off functionality and API integration.  
  * \[ \] **TEST:** Full CRUD operations for plan items via UI.  
* **\[ \] 4.4 "My Journey" \- Journal & Diet Log UI:** *(Ref: UI Chunk 3\)*  
  * \[ \] Implement JournalInputForm.tsx with sliders, symptom selectors, text areas.  
  * \[ \] Implement saving journal entries via API.  
  * \[ \] Implement DietInputForm.tsx (or integrate into journal form).  
  * \[ \] Implement saving diet logs via API.  
  * \[ \] Implement JournalHistoryView.tsx to display past logs (fetched via API).  
  * \[ \] Implement TrendCharts.tsx using charting library (fetched via API).  
  * \[ \] **TEST:** Saving and viewing journal/diet logs; chart display.

**Phase 5: Frontend Feature Implementation**

* **\[ \] 5.1 "Understand" Section UI:** *(Ref: UI Chunk 4\)*  
  * \[ \] Implement UnderstandPage.tsx structure.  
  * \[ \] Implement "AI Explainer" search UI and results display (connect to backend).  
  * \[ \] Implement "Treatment Guides" UI (fetch data based on "My Plan").  
  * \[ \] Implement "Interaction Checker" UI flags within "My Plan" list (connect to backend).  
  * \[ \] Implement "Document Summarizer" UI (file upload, results display \- connect to backend).  
  * \[ \] **TEST:** UI components and basic API connections for "Understand" features.  
* **\[ \] 5.2 "Explore" Section UI:** *(Ref: UI Chunk 5\)*  
  * \[ \] Implement ExplorePage.tsx structure.  
  * \[ \] Implement UI for "Guided Search" & "Clinical Trial Finder" (inputs, filters, results display \- connect to backend).  
  * \[ \] Implement "Creative Exploration Sandbox" UI (disclaimer, chat interface, multi-modal input placeholders, export button \- connect to backend).  
  * \[ \] **TEST:** UI components and basic API connections for "Explore" features.  
* **\[ \] 5.3 "Connect & Hope" Section UI:** *(Ref: UI Chunk 6\)*  
  * \[ \] Implement ConnectHopePage.tsx structure.  
  * \[ \] Implement UI for "Survivor Stories" (display curated content).  
  * \[ \] Implement UI for "Mindfulness Corner" & "Resource Hub" (display links).  
  * \[ \] Implement "Caregiver Connect" UI (invitation form, permissions management \- connect to backend).  
  * \[ \] **TEST:** UI components and caregiver invitation flow.  
* **\[ \] 5.4 Caregiver View UI:** *(Ref: UI Chunk 7\)*  
  * \[ \] Implement conditional rendering logic based on user role.  
  * \[ \] Implement "Caregiver View" dashboard components (Status Summary, Shared Notes).  
  * \[ \] Adapt existing components (Plan, Explore) to respect caregiver permissions fetched from backend.  
  * \[ \] **TEST:** Caregiver login flow, view rendering, and permission enforcement in UI.

**Phase 6: Polish, Testing & Refinement**

* **\[ \] 6.1 UI Polish & Accessibility:** *(Ref: UI Chunk 8\)*  
  * \[ \] Review UI consistency across all sections.  
  * \[ \] Implement loading states and subtle animations.  
  * \[ \] Improve error message display.  
  * \[ \] Conduct accessibility review (contrast, keyboard nav, screen readers, touch targets).  
  * \[ \] Refine responsiveness across devices.  
* **\[ \] 6.2 End-to-End Testing:**  
  * \[ \] Test core user flows (onboarding, plan entry, journaling, exploring, doctor prep).  
  * \[ \] Test caregiver flows (invitation, login, permitted actions).  
  * \[ \] Test AI interactions (context awareness, grounding, interaction analysis, sandbox).  
  * \[ \] Test error handling and edge cases.  
* **\[ \] 6.3 User Feedback & Iteration (with Matt):**  
  * \[ \] Deploy functional builds for Matt to test.  
  * \[ \] Gather feedback on usability, clarity, tone, and features.  
  * \[ \] Iterate based on feedback.

This checklist provides a structured way to approach the development. Remember to test thoroughly after each significant chunk or feature implementation. Good luck\!