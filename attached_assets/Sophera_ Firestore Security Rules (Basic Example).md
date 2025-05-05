## **Sophera: Firestore Security Rules (Basic Example)**

**Objective:** Provide a basic set of Firestore security rules to ensure users can only access their own data and authorized caregivers can access permitted data.

**Target Audience:** Replit Agent (for reference when setting up Firestore)

**File:** firestore.rules

rules\_version \= '2';

service cloud.firestore {  
  match /databases/{database}/documents {

    // Match any document in the 'users' collection  
    match /users/{userId} {  
      // Allow users to read and write their own user document  
      allow read, update, delete: if request.auth \!= null && request.auth.uid \== userId;  
      // Allow creation only if the user is authenticated (prevents anonymous creation)  
      allow create: if request.auth \!= null;

      // \--- Sub-collections \---

      // Plan Items: User can manage their own items  
      match /planItems/{planItemId} {  
        allow read, write, delete: if request.auth \!= null && request.auth.uid \== userId;  
        allow create: if request.auth \!= null && request.auth.uid \== userId;  
        // TODO: Add caregiver read/write access based on permissions  
      }

      // Journal Logs: User can manage their own items  
      match /journalLogs/{logId} {  
        allow read, write, delete: if request.auth \!= null && request.auth.uid \== userId;  
        allow create: if request.auth \!= null && request.auth.uid \== userId;  
        // TODO: Add caregiver read/write access based on permissions  
      }

      // Diet Logs: User can manage their own items  
      match /dietLogs/{dietLogId} {  
        allow read, write, delete: if request.auth \!= null && request.auth.uid \== userId;  
        allow create: if request.auth \!= null && request.auth.uid \== userId;  
        // TODO: Add caregiver read/write access based on permissions  
      }

      // Documents: User can manage their own items  
      match /documents/{documentId} {  
        allow read, write, delete: if request.auth \!= null && request.auth.uid \== userId;  
        allow create: if request.auth \!= null && request.auth.uid \== userId;  
        // TODO: Add caregiver read access based on permissions  
      }

       // Mindset Entries: User can manage their own items  
      match /mindsetEntries/{mindsetEntryId} {  
        allow read, write, delete: if request.auth \!= null && request.auth.uid \== userId;  
        allow create: if request.auth \!= null && request.auth.uid \== userId;  
        // TODO: Add caregiver read access based on permissions  
      }

      // Caregiver Permissions (Example \- stored directly on user doc)  
      // Assuming a field like 'caregivers' exists: caregivers: { caregiverUid1: { permission: 'read' }, caregiverUid2: { permission: 'edit'} }  
      // Allow caregivers to read the user doc if they have permission  
      // allow read: if request.auth \!= null && resource.data.caregivers\[request.auth.uid\] \!= null;  
      // Note: More complex rules needed to grant caregivers access to sub-collections based on permissions.  
      // Consider using a separate 'caregiverAccess' collection for managing permissions more easily.

    }

    // (Optional) Global 'curatedContent' collection \- Allow any authenticated user to read  
    match /curatedContent/{contentId} {  
       allow read: if request.auth \!= null;  
       // Write access likely restricted to admin roles (not shown here)  
       allow write: if false; // Example: No public write access  
    }  
  }  
}

**Important Notes:**

* **Authentication:** These rules assume you have Firebase Authentication or Google Identity Platform set up, and request.auth.uid contains the authenticated user's unique ID.  
* **Caregiver Logic:** The caregiver access rules are **placeholders (TODO)** and need significant refinement. Implementing secure, permission-based caregiver access requires careful design, potentially involving:  
  * Storing permissions explicitly (e.g., in the user document or a separate collection).  
  * Writing functions or more complex rules to check these permissions before allowing access to sub-collections. Consider using Firestore security rule functions for reusability.  
* **Validation:** Add data validation rules (request.resource.data) to ensure data integrity (e.g., required fields, data types).  
* **Testing:** Thoroughly test these rules using the Firestore emulator or simulator before deploying.  
* **Security:** This is a basic example. Consult Firestore security best practices for production applications handling sensitive data.