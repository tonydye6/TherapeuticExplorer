## **Sophera Backend Implementation Plan (Chunk by Chunk)**

**Objective:** Implement backend changes for Sophera, focusing on integrating Firestore for persistence and Vertex AI Search for grounding, while adapting existing services. Implement these changes sequentially, checking in after each chunk.

**Target Audience:** Replit Agent

**Prerequisites:** Google Cloud project set up, APIs enabled, service account credentials secured in Replit secrets.

**Chunk 1: Firestore Setup & Basic User Profile Persistence**

* **Goal:** Establish connection to Firestore and implement saving/loading of basic user profile data.  
* **Steps:**  
  1. Install necessary Google Cloud client libraries (@google-cloud/firestore).  
  2. Create server/services/firestore-service.ts.  
  3. Implement Firestore client initialization within firestore-service.ts (using service account credentials).  
  4. Define the Firestore data structure for the users collection (as per sophera\_data\_model\_overview\_v2).  
  5. Implement functions in firestore-service.ts: getUserProfile(userId) and updateUserProfile(userId, data).  
  6. Modify relevant backend routes/controllers to call these functions for fetching/saving user profile information upon login or profile updates.  
  7. Test basic profile loading and saving.  
* **CHECK-IN POINT:** Verify Firestore connection and user profile CRUD operations.

**Chunk 2: Firestore Integration for "My Plan"**

* **Goal:** Enable users to save, load, update, and delete items in their treatment plan using Firestore.  
* **Steps:**  
  1. Define the Firestore structure for the planItems sub-collection within users.  
  2. Implement CRUD functions in firestore-service.ts: addPlanItem, getPlanItems, updatePlanItem, deletePlanItem.  
  3. Create/modify backend API endpoints to handle requests from the frontend for plan management.  
  4. Connect these endpoints to the corresponding functions in firestore-service.ts.  
  5. Test adding, viewing, editing, and deleting plan items.  
* **CHECK-IN POINT:** Verify "My Plan" data persistence and management via Firestore.

**Chunk 3: Firestore Integration for "My Journal" & "Diet Logs"**

* **Goal:** Enable saving and retrieving daily journal entries and diet logs.  
* **Steps:**  
  1. Define Firestore structures for journalLogs and dietLogs sub-collections.  
  2. Implement functions in firestore-service.ts: addJournalLog, getJournalLogs, addDietLog, getDietLogs.  
  3. Create/modify backend API endpoints for journal and diet logging.  
  4. Connect endpoints to firestore-service.ts functions.  
  5. Test saving and retrieving journal and diet entries.  
* **CHECK-IN POINT:** Verify "My Journal" and "Diet Log" data persistence.

**Chunk 4: Context Fetching in AI Router**

* **Goal:** Modify the AI router to fetch relevant user context from Firestore before calling LLMs.  
* **Steps:**  
  1. Identify points in aiRouter.ts (likely within processQuery or before calling specific service functions) where context is needed.  
  2. Call relevant firestore-service.ts functions (e.g., getUserProfile, getPlanItems, getJournalLogs) to retrieve necessary data based on the userId.  
  3. Format the fetched context appropriately to be included in the prompts sent to the LLM services.  
  4. Test that context is being fetched and potentially influencing AI responses (initial verification).  
* **CHECK-IN POINT:** Verify context fetching logic within the AI router.

**Chunk 5: Vertex AI Search Setup & Document Handling**

* **Goal:** Set up Vertex AI Search and implement backend logic for handling document uploads and associating them with users.  
* **Steps:**  
  1. Set up Vertex AI Search data store(s) in Google Cloud Console, configuring for userId metadata.  
  2. Define Firestore structure for the documents sub-collection to store metadata.  
  3. Implement backend logic (potentially a new endpoint and function in documentService.ts or a dedicated upload service) to:  
     * Receive document uploads from the frontend.  
     * Upload the document content to Vertex AI Search, tagging it with the userId.  
     * Save document metadata (filename, upload date, userId, Vertex AI Search URI) to the documents sub-collection in Firestore via firestore-service.ts.  
  4. Test document upload and metadata storage.  
* **CHECK-IN POINT:** Verify document upload pipeline to Vertex AI Search and Firestore.

**Chunk 6: Vertex AI Search Integration for RAG**

* **Goal:** Implement grounded responses using Vertex AI Search for specific query types.  
* **Steps:**  
  1. Install necessary Google Cloud client libraries for Vertex AI.  
  2. Create server/services/vertex-search-service.ts.  
  3. Implement Vertex AI client initialization.  
  4. Implement function searchGroundedAnswer(userId, query) in vertex-search-service.ts that calls the Vertex AI Search API, passing the query and filtering by userId.  
  5. Modify aiRouter.ts: Identify query types/intents requiring grounding (e.g., questions about uploaded documents).  
  6. For those intents, call vertexSearchService.searchGroundedAnswer *instead of* or *before* calling an LLM service.  
  7. Format the response from Vertex AI Search for the frontend.  
  8. Test grounded queries (e.g., asking questions about an uploaded document).  
* **CHECK-IN POINT:** Verify RAG functionality using Vertex AI Search.

**Chunk 7: Implement Interaction Analyzer Logic**

* **Goal:** Develop the backend logic for analyzing interactions based on items in "My Plan".  
* **Steps:**  
  1. Create server/services/interactionService.ts (or similar).  
  2. Implement the core interaction analysis logic:  
     * Fetch relevant plan items (meds, supplements, therapies, key diet elements) for the user from Firestore.  
     * Use an appropriate LLM (e.g., Claude or GPT-4 via their respective services) with a carefully crafted prompt instructing it to analyze potential pairwise, multi-item, and comprehensive interactions, explain the mechanism simply, and cite evidence/basis. *Alternatively, integrate with a dedicated drug interaction API if available and suitable.*  
     * Parse the structured response from the LLM/API.  
  3. Create backend API endpoint(s) for triggering interaction checks.  
  4. Test interaction analysis functionality.  
* **CHECK-IN POINT:** Verify interaction analysis logic and output.

**Chunk 8: Implement "Creative Exploration Sandbox" Backend**

* **Goal:** Enable the multi-modal, contextual brainstorming feature using Gemini.  
* **Steps:**  
  1. Modify aiRouter.ts to identify requests intended for the Sandbox.  
  2. Ensure these requests are routed specifically to gemini-service.ts, using the latest multi-modal model (gemini-1.5-pro or newer).  
  3. Enhance context fetching (Chunk 4\) to include all necessary context (profile, plan, logs, potentially document summaries) for Sandbox prompts.  
  4. Refine system prompts in gemini-service.ts for the Sandbox persona (creative, brainstorming partner).  
  5. Implement logic to handle multi-modal inputs if passed from the frontend (e.g., references to images, video summaries).  
  6. Implement the "Doctor Discussion Brief" export function:  
     * Create a function (perhaps in reportService.ts) that fetches required context (profile, plan, exploration summary, AI-generated questions).  
     * Formats this data into the specified structured document format.  
     * Provides an endpoint to trigger generation and return the brief.  
  7. Test Sandbox interaction and brief generation.  
* **CHECK-IN POINT:** Verify Creative Exploration Sandbox backend logic and Doctor Brief export.

**Chunk 9: Implement Caregiver Access Backend**

* **Goal:** Set up backend logic for secure caregiver access and permissions.  
* **Steps:**  
  1. Define Firestore structure for storing caregiver invitations, relationships, and permissions within the users collection or a separate caregiverAccess collection.  
  2. Implement functions in firestore-service.ts to manage invitations (send, accept, decline) and permissions (set, get).  
  3. Modify authentication/authorization logic: Ensure backend endpoints correctly check if a request is from the patient or a permitted caregiver, enforcing permissions based on Firestore data.  
  4. Implement endpoints specifically for the Caregiver View to fetch relevant summarized data.  
  5. Test caregiver invitation, permission setting, and data access controls.  
* **CHECK-IN POINT:** Verify caregiver access control and data fetching logic.