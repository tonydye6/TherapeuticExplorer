## **Sophera (formerly Thrive): Project Direction Update & Technical Plan**

**Objective:** Update the AI agent application, formerly known as "Thrive," to align with a new human-centric vision, rename it to "Sophera," and integrate specific Google Cloud services for enhanced capabilities.

**1\. Project Renaming:**

* The application formerly named "Thrive" is now **Sophera**.  
* Update all user-facing references, branding elements, and internal code comments/variables where appropriate to reflect the new name "Sophera".

**2\. Philosophical Shift:**

* Sophera's core mission is to be a **supportive, empowering, and hopeful companion** for cancer patients and their caregivers.  
* Prioritize **clarity, simplicity, empathy, and hope** in all UI/UX elements and AI interactions.  
* The primary goal is to **bridge the knowledge gap** by translating complex medical information into understandable terms and empowering users to collaborate effectively with their healthcare team.  
* Integrate support for **caregivers** as active participants.

**3\. Key Feature & Focus Changes (Refer to sophera\_new\_vision for full details):**

* **Enhanced Human Experience:** Redesign UI/UX for warmth, calm, and simplicity. Refine AI persona for empathy.  
* **New Sections:**  
  * **"Mindset & Hope Hub":** Add a section featuring curated survivor stories, mindfulness resources, etc.  
  * **"Diet & Nutrition Tracker/Analyzer":** Add functionality for logging diet and AI analysis relevant to the user's condition and plan.  
* **Enhanced Features:**  
  * **"Explore" Section:** Add a "Creative Exploration Sandbox" for brainstorming unconventional ideas with AI (using multi-modal input via Gemini), including a disclaimer and a "Doctor Discussion Brief" export.  
  * **Interaction Analyzer:** Ensure it clearly explains *why* interactions might occur (mechanism) and handles dietary elements.  
  * **Caregiver Access:** Implement secure, permission-based access for designated caregivers.  
* **Simplification:** Streamline complex features (like predictors) into more integrated, simpler outputs focused on understanding and discussion points. Radically simplify medical language in all outputs.

**4\. Core Technical Approach (Maintain & Integrate):**

* **Continue using the existing backend structure:** Maintain the multi-LLM router (aiRouter.ts) and specific LLM service files (gemini-service.ts, anthropic-service.ts, openai-service.ts) within the Replit environment.  
* **Prioritize Gemini:** Ensure Gemini (specifically gemini-1.5-pro or latest) is used for the "Creative Exploration Sandbox" due to its multi-modal input requirements.  
* **Integrate Firestore:** Implement persistent storage for all user-specific data (profiles, plans, journals, diet logs, document metadata, caregiver permissions) using Google Cloud Firestore. Create a dedicated service (firestore-service.ts) to handle all database interactions via API calls. Fetch relevant context from Firestore before making AI calls.  
* **Integrate Vertex AI Search:** Implement robust, grounded RAG for document analysis and reliable research queries using Google Cloud Vertex AI Search. Create a dedicated service (vertex-search-service.ts) to handle API calls to Vertex AI Search, ensuring filtering by userId for data privacy. Route relevant queries through this service instead of directly to an LLM for generation.

**5\. Assumptions:**

* Necessary Google Cloud credentials and API keys are securely available in the Replit environment secrets.  
* The Replit Agent environment has the necessary packages/capabilities to make external API calls to Google Cloud services (Firestore, Vertex AI).

**Next Steps:** Follow the detailed implementation plans provided separately for backend/core logic and UX/UI changes.