## **Sophera Backend Implementation Plan (Bit by Bit)**

**Objective:** Provide granular steps for implementing backend changes for Sophera, intended as a detailed guide if issues arise during chunk-based implementation.

**Target Audience:** Replit Agent

**Chunk 1: Firestore Setup & Basic User Profile Persistence**

* **Bit 1.1: Install Dependencies:** npm install @google-cloud/firestore (or equivalent package manager command).  
* **Bit 1.2: Create Service File:** Create server/services/firestore-service.ts.  
* **Bit 1.3: Secure Credentials:** Ensure the Google Cloud service account JSON key file is present and securely referenced via Replit Secrets (e.g., process.env.GOOGLE\_APPLICATION\_CREDENTIALS\_JSON).  
* **Bit 1.4: Initialize Client:** In firestore-service.ts, import Firestore from @google-cloud/firestore. Instantiate the client: const db \= new Firestore();. Handle potential authentication errors during initialization.  
* **Bit 1.5: Define User Collection Reference:** Define a constant for the users collection: const usersCollection \= db.collection('users');.  
* **Bit 1.6: Implement getUserProfile:** Create async function getUserProfile(userId: string) that uses usersCollection.doc(userId).get(), checks if the document exists (doc.exists), and returns doc.data() or null/error.  
* **Bit 1.7: Implement updateUserProfile:** Create async function updateUserProfile(userId: string, data: UserProfileData) that uses usersCollection.doc(userId).set(data, { merge: true }). Include adding/updating an updatedAt timestamp field.  
* **Bit 1.8: Create/Modify Backend Route:** In server/routes.ts (or equivalent), define a GET route like /api/users/:userId/profile that calls firestoreService.getUserProfile.  
* **Bit 1.9: Create/Modify Backend Route:** Define a PUT or POST route like /api/users/:userId/profile that takes profile data in the request body and calls firestoreService.updateUserProfile.  
* **Bit 1.10: Test Routes:** Use tools like curl or a simple frontend interaction to test fetching and updating a user profile via the new endpoints.

**Chunk 2: Firestore Integration for "My Plan"**

* **Bit 2.1: Define Sub-collection Reference:** In firestore-service.ts, create a helper function getPlanItemsCollection(userId: string) that returns usersCollection.doc(userId).collection('planItems').  
* **Bit 2.2: Implement addPlanItem:** Create async function addPlanItem(userId: string, itemData: PlanItemData) that calls getPlanItemsCollection(userId).add({ ...itemData, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }).  
* **Bit 2.3: Implement getPlanItems:** Create async function getPlanItems(userId: string) that calls getPlanItemsCollection(userId).get(), iterates through querySnapshot.docs, and returns an array of { id: doc.id, ...doc.data() }.  
* **Bit 2.4: Implement updatePlanItem:** Create async function updatePlanItem(userId: string, itemId: string, data: Partial\<PlanItemData\>) that calls getPlanItemsCollection(userId).doc(itemId).update({ ...data, updatedAt: FieldValue.serverTimestamp() }).  
* **Bit 2.5: Implement deletePlanItem:** Create async function deletePlanItem(userId: string, itemId: string) that calls getPlanItemsCollection(userId).doc(itemId).delete().  
* **Bit 2.6: Create/Modify Backend Routes:** Define POST, GET, PUT, DELETE routes (e.g., /api/users/:userId/plan-items, /api/users/:userId/plan-items/:itemId) that call the corresponding Firestore service functions. Ensure proper request body parsing and parameter handling.  
* **Bit 2.7: Test Routes:** Test creating, listing, modifying, and deleting plan items via the API endpoints.

**Chunk 3: Firestore Integration for "My Journal" & "Diet Logs"**

* **Bit 3.1: Define Sub-collection References:** Create helper functions getJournalLogsCollection(userId) and getDietLogsCollection(userId) in firestore-service.ts.  
* **Bit 3.2: Implement addJournalLog / addDietLog:** Similar to addPlanItem, using the respective collection references and data structures. Consider using YYYY-MM-DD as the document ID for journal logs if appropriate for your querying needs, or use auto-generated IDs.  
* **Bit 3.3: Implement getJournalLogs / getDietLogs:** Similar to getPlanItems, potentially adding parameters for date range filtering (e.g., getJournalLogs(userId, startDate, endDate) using .where('logDate', '\>=', startDate).where('logDate', '\<=', endDate)).  
* **Bit 3.4: Create/Modify Backend Routes:** Define POST and GET routes for journal and diet logs (e.g., /api/users/:userId/journal-logs, /api/users/:userId/diet-logs).  
* **Bit 3.5: Test Routes:** Test saving and retrieving journal and diet entries, including date filtering if implemented.

**Chunk 4: Context Fetching in AI Router**

* **Bit 4.1: Identify Context Needs:** Review the system prompts in aiRouter.ts and the different service files (gemini-service.ts, etc.). Determine precisely what user data (profile details, active plan items, recent symptoms from journal) is needed for each type of AI query.  
* **Bit 4.2: Modify processQuery:** Before the try...catch block where LLM services are called, add async calls to fetch the required context using firestore-service.ts functions. Example: const userProfile \= await firestoreService.getUserProfile(userId); const activePlanItems \= await firestoreService.getActivePlanItems(userId); (You might need to create helper functions like getActivePlanItems).  
* **Bit 4.3: Format Context for Prompt:** Create a helper function formatContextForPrompt(profile, planItems, logs) that takes the fetched data and creates a concise, structured string or object to prepend or include in the user query or system prompt sent to the LLM. Be mindful of token limits.  
* **Bit 4.4: Update LLM Calls:** Modify the calls to openaiService.processTextQuery, anthropicService.processTextQuery, geminiService.processTextQuery, etc., to include the formatted context string within the query or potentially as part of the systemPrompt.  
* **Bit 4.5: Test with Context:** Send test queries where context should matter (e.g., "Are there interactions with my current medications?", "Suggest breakfast ideas based on my recent diet logs") and verify the AI response seems contextually aware. Check logs to ensure context is being fetched.

**Chunk 5: Vertex AI Search Setup & Document Handling**

* **Bit 5.1: Create Data Store:** In Google Cloud Console \-\> Vertex AI Search & Conversation, create a new Search App/Data Store. Choose "Unstructured data". Note the Data Store ID. Configure it to allow metadata filtering (enable "Advanced settings" during creation or edit later). Define userId as a filterable metadata field.  
* **Bit 5.2: Define documents Metadata Structure:** Finalize the fields for the documents sub-collection in Firestore (filename, fileType, uploadDate, status, userId, vertexAiSearchUri).  
* **Bit 5.3: Install Cloud Storage Client:** npm install @google-cloud/storage (Vertex AI Search often uses GCS as an intermediary).  
* **Bit 5.4: Implement Upload Endpoint:** Create a backend endpoint (e.g., POST /api/users/:userId/documents) that accepts file uploads (e.g., using multer or similar middleware if using Express).  
* **Bit 5.5: Implement Upload to GCS (Optional but Recommended):** Create a GCS bucket. The endpoint should upload the file to this bucket first, generating a unique GCS URI (e.g., gs://your-bucket-name/userId/documentId/filename.pdf).  
* **Bit 5.6: Implement Vertex AI Search Ingestion:** Use the Vertex AI Search client library or REST API to ingest the document from its GCS URI into the data store created in Bit 5.1. **Crucially, include the userId as metadata during ingestion.**  
* **Bit 5.7: Implement Firestore Metadata Save:** After successful upload and ingestion, call a new function addDocumentMetadata(userId, metadata) in firestore-service.ts to save the file details (including the GCS URI or Vertex AI Search identifier and the userId) to the documents sub-collection.  
* **Bit 5.8: Test Upload:** Upload a test document and verify it appears in the Vertex AI Search data store (check Console) and its metadata is saved correctly in Firestore.

**Chunk 6: Vertex AI Search Integration for RAG**

* **Bit 6.1: Install Vertex AI Client:** Ensure necessary Vertex AI client libraries are installed (@google-ai/generativelanguage or others depending on the specific API used for Search/Rank).  
* **Bit 6.2: Create Service File:** Create server/services/vertex-search-service.ts.  
* **Bit 6.3: Initialize Client:** Initialize the appropriate Vertex AI client using credentials.  
* **Bit 6.4: Implement searchGroundedAnswer:** Create async function searchGroundedAnswer(userId: string, query: string).  
  * Construct the request payload for the Vertex AI Search API (engines.search or similar).  
  * Include the query.  
  * Include the filter parameter targeting the userId metadata (e.g., filter: 'userId=" \+ userId \+ "').  
  * Specify the Data Store ID.  
  * Make the API call.  
  * Process the response, extracting the grounded answer summary or relevant snippets. Handle errors.  
* **Bit 6.5: Modify aiRouter.ts:** Identify intents (e.g., queryType \=== QueryType.DOCUMENT\_QUESTION).  
* **Bit 6.6: Route to Vertex AI Search:** For these intents, modify processQuery to call vertexSearchService.searchGroundedAnswer(userId, query) instead of an LLM service.  
* **Bit 6.7: Format Response:** Take the result from searchGroundedAnswer and format it into the standard QueryResponse structure expected by the frontend.  
* **Bit 6.8: Test Grounded Queries:** Ask specific questions about the content of an uploaded document associated with a test user ID. Verify the answer comes from the document and that asking about another user's document yields no results (due to filtering).

*(Continue similar granular breakdown for Chunks 7, 8, and 9, detailing specific function implementations, API endpoint definitions, prompt refinements, and testing steps for Interaction Analysis, Creative Exploration Sandbox, Doctor Brief Export, and Caregiver Access features.)*