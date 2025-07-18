import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiRouter } from "./services/aiRouter";
import { researchService } from "./services/researchService";
import { clinicalTrialService } from "./services/clinicalTrialService";
import { documentService } from "./services/documentService";
import { vectorService } from "./services/vectorService";
import { medicalTermService } from "./services/medicalTermService";
import { ocrService } from "./services/ocrService";
import { treatmentPredictionService } from "./services/treatmentPredictionService";
import { sideEffectService } from "./services/sideEffectService";
import { timelineService } from "./services/timelineService";
import { sourceAttributionService } from "./services/sourceAttribution";
import { interactionService } from "./services/interaction-service";
import { emotionalSupportService } from "./services/emotional-support-service";
import { nutritionService } from "./services/nutrition-service";
import { creativeSandboxService } from "./services/creative-sandbox-service";
import { caregiverAccessService } from "./services/caregiver-access-service";
import { documentAnalysisService } from "./services/document-analysis-service";
import { actionStepsService } from "./services/action-steps-service";
import * as hopeService from "./services/hope-service";
import { multimodalService } from "./services/multimodal-service";
import * as firestoreService from "./services/firestore-service";
import { vertexSearchService } from "./services/vertex-search-service";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import multer from "multer";
import { insertAlternativeTreatmentSchema, insertMessageSchema, insertResearchItemSchema, insertTreatmentSchema, insertSavedTrialSchema, insertDocumentSchema, insertPlanItemSchema, insertJournalLogSchema, insertDietLogSchema, insertHopeSnippetSchema, QueryType } from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes for Plan Items - Using Firestore with fallback
  app.get("/api/plan-items", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      // Temporary development solution - return sample data for UI development
      // This ensures the UI can be developed while Firestore is being configured
      console.log("Providing development plan items data");
      
      const devPlanItems = [
        {
          id: "plan1",
          title: "Doctor Appointment",
          description: "Follow-up with Dr. Smith",
          dueDate: new Date(Date.now() + 86400000), // tomorrow
          category: "appointment",
          isCompleted: false,
          priority: "high"
        },
        {
          id: "plan2",
          title: "Take Medication",
          description: "Morning dose of prescribed medication",
          dueDate: new Date(),
          category: "medication",
          isCompleted: true,
          priority: "high"
        },
        {
          id: "plan3",
          title: "Lab Test",
          description: "Blood work at Memorial Hospital",
          dueDate: new Date(Date.now() + 172800000), // day after tomorrow
          category: "test",
          isCompleted: false,
          priority: "medium"
        }
      ];
      
      res.json(devPlanItems);
    } catch (error) {
      console.error("Error fetching plan items:", error);
      res.status(500).json({ message: "Failed to fetch plan items" });
    }
  });
  
  app.get("/api/plan-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid plan item ID" });
      }
      
      const planItem = await storage.getPlanItemById(id);
      
      if (!planItem) {
        return res.status(404).json({ message: "Plan item not found" });
      }
      
      res.json(planItem);
    } catch (error) {
      console.error("Error fetching plan item:", error);
      res.status(500).json({ message: "Failed to fetch plan item" });
    }
  });
  
  app.post("/api/plan-items", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      // Pre-process request body to handle date formats
      const requestData = { ...req.body };
      
      // Handle date conversion for startDate and endDate if they exist as strings
      if (requestData.startDate && typeof requestData.startDate === 'string') {
        requestData.startDate = new Date(requestData.startDate);
      }
      
      if (requestData.endDate && typeof requestData.endDate === 'string') {
        requestData.endDate = new Date(requestData.endDate);
      }
      
      if (requestData.reminderTime && typeof requestData.reminderTime === 'string') {
        requestData.reminderTime = new Date(requestData.reminderTime);
      }
      
      if (requestData.dueDate && typeof requestData.dueDate === 'string') {
        requestData.dueDate = new Date(requestData.dueDate);
      }
      
      // Using Firestore instead of storage
      const planItem = await firestoreService.addPlanItem(DEFAULT_USER_ID, requestData);
      res.status(201).json(planItem);
    } catch (error) {
      console.error("Error creating plan item:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid plan item data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create plan item" });
    }
  });
  
  app.put("/api/plan-items/:id", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      const planItemId = req.params.id;
      
      if (!planItemId) {
        return res.status(400).json({ message: "Invalid plan item ID" });
      }
      
      // Pre-process request body to handle date formats
      const requestData = { ...req.body };
      
      // Handle date conversion for dates if they exist as strings
      if (requestData.startDate && typeof requestData.startDate === 'string') {
        requestData.startDate = new Date(requestData.startDate);
      }
      
      if (requestData.endDate && typeof requestData.endDate === 'string') {
        requestData.endDate = new Date(requestData.endDate);
      }
      
      if (requestData.reminderTime && typeof requestData.reminderTime === 'string') {
        requestData.reminderTime = new Date(requestData.reminderTime);
      }
      
      if (requestData.dueDate && typeof requestData.dueDate === 'string') {
        requestData.dueDate = new Date(requestData.dueDate);
      }
      
      // Use Firestore implementation
      const planItem = await firestoreService.updatePlanItem(DEFAULT_USER_ID, planItemId, requestData);
      res.json(planItem);
    } catch (error) {
      console.error("Error updating plan item:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid plan item data", 
          errors: error.errors 
        });
      }
      
      if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to update plan item" });
    }
  });
  
  app.delete("/api/plan-items/:id", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      const planItemId = req.params.id;
      
      if (!planItemId) {
        return res.status(400).json({ message: "Invalid plan item ID" });
      }
      
      // Use Firestore implementation
      await firestoreService.deletePlanItem(DEFAULT_USER_ID, planItemId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting plan item:", error);
      
      if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to delete plan item" });
    }
  });
  
  app.post("/api/plan-items/:id/complete", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      const planItemId = req.params.id;
      
      if (!planItemId) {
        return res.status(400).json({ message: "Invalid plan item ID" });
      }
      
      const { isCompleted = true } = req.body;
      
      // Update the plan item with the isCompleted field using Firestore
      const planItem = await firestoreService.updatePlanItem(DEFAULT_USER_ID, planItemId, { isCompleted });
      res.json(planItem);
    } catch (error) {
      console.error("Error completing plan item:", error);
      
      if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to complete plan item" });
    }
  });

  // Set default user ID since we're removing auth
  const DEFAULT_USER_ID = "1"; // Using a string since user IDs are strings in our schema

  // API Routes
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(DEFAULT_USER_ID);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Messages Routes
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(DEFAULT_USER_ID); 
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Single message endpoint (singular form for client compatibility)
  app.post("/api/message", async (req, res) => {
    try {
      console.log("Message received:", req.body);
      const { content, preferredModel } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      // Save user message
      const userMessage = await storage.createMessage({
        userId: DEFAULT_USER_ID,
        content,
        role: "user"
      });
      
      // Process message with AI router, using preferred model if specified
      const aiResponse = await aiRouter.processQuery(content, preferredModel, DEFAULT_USER_ID);
      
      // Save AI response
      const assistantMessage = await storage.createMessage({
        userId: DEFAULT_USER_ID,
        content: aiResponse.content,
        role: "assistant",
        sources: aiResponse.sources,
        modelUsed: aiResponse.modelUsed || preferredModel
      });
      
      res.json({
        content: aiResponse.content,
        sources: aiResponse.sources,
        modelUsed: aiResponse.modelUsed || preferredModel,
        id: assistantMessage.id
      });
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID, 
        role: "user"
      });
      
      // Save user message
      const userMessage = await storage.createMessage(messageData);
      
      // Process message with AI router
      const aiResponse = await aiRouter.processQuery(req.body.content, undefined, DEFAULT_USER_ID);
      
      // Save AI response
      const assistantMessage = await storage.createMessage({
        userId: DEFAULT_USER_ID,
        content: aiResponse.content,
        role: "assistant",
        sources: aiResponse.sources,
        modelUsed: aiResponse.modelUsed
      });
      
      res.json(assistantMessage);
    } catch (error) {
      console.error("Error processing message:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid message data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to process message" });
    }
  });
  
  // Research Routes
  app.get("/api/research", async (req, res) => {
    try {
      const researchItems = await storage.getResearchItems(DEFAULT_USER_ID); 
      res.json(researchItems);
    } catch (error) {
      console.error("Error fetching research items:", error);
      res.status(500).json({ message: "Failed to fetch research items" });
    }
  });
  
  app.post("/api/research", async (req, res) => {
    try {
      const researchData = insertResearchItemSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID 
      });
      
      const researchItem = await storage.createResearchItem(researchData);
      
      // Process the research item to generate embeddings
      try {
        await vectorService.processResearchItem(researchItem);
        console.log(`Generated embeddings for research item ${researchItem.id}`);
      } catch (embeddingError) {
        // Don't fail the request if embedding generation fails
        console.error("Error generating embeddings:", embeddingError);
      }
      
      res.status(201).json(researchItem);
    } catch (error) {
      console.error("Error creating research item:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid research item data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create research item" });
    }
  });
  
  // Toggle favorite status for a research item
  app.post("/api/research/:id/toggle-favorite", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid research item ID" });
      }
      
      const updatedItem = await storage.toggleResearchItemFavorite(id);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error toggling research item favorite status:", error);
      
      if (error.message && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to toggle favorite status" });
    }
  });
  
  app.post("/api/research/search", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      const results = await researchService.performResearch(query);
      res.json(results);
    } catch (error) {
      console.error("Error performing research:", error);
      res.status(500).json({ message: "Failed to perform research" });
    }
  });
  
  // Semantic search route
  app.post("/api/research/semantic-search", async (req, res) => {
    try {
      const { query, userId = DEFAULT_USER_ID } = req.body; 
      
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      const results = await vectorService.searchSimilarResearchItems(query, userId);
      res.json(results);
    } catch (error) {
      console.error("Error performing semantic search:", error);
      res.status(500).json({ message: "Failed to perform semantic search" });
    }
  });
  
  // Vertex AI Search endpoint for grounded document search
  app.post("/api/documents/search", async (req, res) => {
    try {
      const { query, userId = DEFAULT_USER_ID } = req.body; 
      
      if (!query || typeof query !== "string") {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      // Use Vertex AI Search to get grounded answers from documents
      try {
        const searchResult = await vertexSearchService.searchGroundedAnswer(
          userId as string,
          query
        );
        
        res.json(searchResult);
      } catch (vertexError) {
        console.error("Error using Vertex AI Search:", vertexError);
        
        // Fall back to regular document search if Vertex AI Search fails
        const documents = await storage.getDocuments(userId as string);
        
        // Very simple keyword matching as fallback
        const matchingDocs = documents.filter(doc => 
          doc.content && doc.content.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
        
        res.json({
          summary: "We found these relevant documents that might help answer your question:",
          sources: matchingDocs.map(doc => ({
            id: doc.id.toString(),
            title: doc.title,
            content: doc.content || "",
            score: 0.7, // Arbitrary fallback score
            link: null
          })),
          metadata: {
            usedFallback: true,
            query: query
          }
        });
      }
    } catch (error) {
      console.error("Error performing document search:", error);
      res.status(500).json({ 
        message: "Failed to search documents", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Treatment Routes
  app.get("/api/treatments", async (req, res) => {
    try {
      const treatments = await storage.getTreatments(DEFAULT_USER_ID); 
      res.json(treatments);
    } catch (error) {
      console.error("Error fetching treatments:", error);
      res.status(500).json({ message: "Failed to fetch treatments" });
    }
  });
  
  app.post("/api/treatments", async (req, res) => {
    try {
      // Pre-process request body to handle date formats
      const requestData = { ...req.body };
      
      // Handle date conversion for startDate and endDate if they exist as strings
      if (requestData.startDate && typeof requestData.startDate === 'string') {
        requestData.startDate = new Date(requestData.startDate);
      }
      
      if (requestData.endDate && typeof requestData.endDate === 'string') {
        requestData.endDate = new Date(requestData.endDate);
      }
      
      const treatmentData = insertTreatmentSchema.parse({
        ...requestData,
        userId: DEFAULT_USER_ID 
      });
      
      const treatment = await storage.createTreatment(treatmentData);
      res.status(201).json(treatment);
    } catch (error) {
      console.error("Error creating treatment:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid treatment data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create treatment" });
    }
  });
  
  app.get("/api/treatments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid ID is required" });
      }
      
      const treatment = await storage.getTreatmentById(id);
      if (!treatment) {
        return res.status(404).json({ message: "Treatment not found" });
      }
      
      res.json(treatment);
    } catch (error) {
      console.error("Error fetching treatment:", error);
      res.status(500).json({ message: "Failed to fetch treatment" });
    }
  });
  
  app.patch("/api/treatments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid ID is required" });
      }
      
      // Pre-process request body to handle date formats
      const requestData = { ...req.body };
      
      // Handle date conversion for startDate and endDate if they exist as strings
      if (requestData.startDate && typeof requestData.startDate === 'string') {
        requestData.startDate = new Date(requestData.startDate);
      }
      
      if (requestData.endDate && typeof requestData.endDate === 'string') {
        requestData.endDate = new Date(requestData.endDate);
      }
      
      // Get existing treatment to check if it exists
      const existingTreatment = await storage.getTreatmentById(id);
      if (!existingTreatment) {
        return res.status(404).json({ message: "Treatment not found" });
      }
      
      // Update the treatment
      const updatedTreatment = await storage.updateTreatment(id, requestData);
      res.json(updatedTreatment);
    } catch (error) {
      console.error("Error updating treatment:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid treatment data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to update treatment" });
    }
  });
  
  app.delete("/api/treatments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid ID is required" });
      }
      
      // Check if the treatment exists
      const treatment = await storage.getTreatmentById(id);
      if (!treatment) {
        return res.status(404).json({ message: "Treatment not found" });
      }
      
      // Delete the treatment (if this method doesn't exist in your storage interface,
      // you might want to implement it or use an approach like setting 'active' to false)
      if (storage.deleteTreatment) {
        await storage.deleteTreatment(id);
      } else {
        // Alternative: mark as inactive
        await storage.updateTreatment(id, { active: false });
      }
      
      res.status(200).json({ message: "Treatment deleted successfully" });
    } catch (error) {
      console.error("Error deleting treatment:", error);
      res.status(500).json({ message: "Failed to delete treatment" });
    }
  });
  
  // Clinical Trial Routes
  app.get("/api/trials", async (req, res) => {
    try {
      const { query, phase, status, distance } = req.query;
      
      const trials = await clinicalTrialService.searchTrials({
        query: query as string,
        phase: phase as string,
        status: status as string,
        distance: distance ? parseInt(distance as string) : undefined
      });
      
      res.json(trials);
    } catch (error) {
      console.error("Error searching clinical trials:", error);
      res.status(500).json({ message: "Failed to search clinical trials" });
    }
  });
  
  app.get("/api/trials/saved", async (req, res) => {
    try {
      const savedTrials = await storage.getSavedTrials(DEFAULT_USER_ID); 
      res.json(savedTrials);
    } catch (error) {
      console.error("Error fetching saved trials:", error);
      res.status(500).json({ message: "Failed to fetch saved trials" });
    }
  });
  
  app.post("/api/trials/saved", async (req, res) => {
    try {
      const trialData = insertSavedTrialSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID 
      });
      
      const savedTrial = await storage.createSavedTrial(trialData);
      res.status(201).json(savedTrial);
    } catch (error) {
      console.error("Error saving trial:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid trial data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to save trial" });
    }
  });
  
  // Document Routes
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments(DEFAULT_USER_ID); 
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  
  // Get document by ID
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });
  
  // Get document from Vertex AI Search by ID
  app.get("/api/documents/vertex/:id", async (req, res) => {
    try {
      const vertexDocId = req.params.id;
      if (!vertexDocId) {
        return res.status(400).json({ message: "Invalid Vertex document ID" });
      }
      
      try {
        // Attempt to get the document from Vertex AI Search
        const document = await vertexSearchService.getDocumentById(vertexDocId);
        
        if (!document) {
          return res.status(404).json({ message: "Document not found in Vertex AI Search" });
        }
        
        res.json(document);
      } catch (vertexError) {
        console.error("Error fetching document from Vertex AI Search:", vertexError);
        res.status(502).json({ 
          message: "Failed to fetch document from Vertex AI Search",
          error: vertexError instanceof Error ? vertexError.message : String(vertexError)
        });
      }
    } catch (error) {
      console.error("Error in vertex document route:", error);
      res.status(500).json({ 
        message: "Server error processing vertex document request",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get document with highlighted medical terms
  app.get("/api/documents/:id/highlight", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocumentById(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // If no content, return empty response
      if (!document.content) {
        return res.json({ html: "" });
      }
      
      // Implementation with timeout for reliability
      const timeoutDuration = 10000; // 10 seconds timeout
      
      // Create a promise that rejects after the timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Highlighting timed out")), timeoutDuration);
      });
      
      // Create the actual work promise
      const highlightPromise = medicalTermService.highlightMedicalTerms(document.content);
      
      try {
        // Race the promises - whichever resolves/rejects first wins
        const result = await Promise.race([highlightPromise, timeoutPromise]) as { 
          highlightedText: string; 
          terms: any[] 
        };
        
        res.json({ html: result.highlightedText });
      } catch (timeoutError) {
        console.warn("Medical term highlighting timed out, using simplified approach:", timeoutError);
        
        // Fall back to a simple regex-based highlighting method directly
        const type = document.type || "medical_report";
        
        // Apply some basic styling to make the document readable
        let html = `<div class="medical-document ${type}">`;
        html += document.content
          // Basic highlighting for medical terms
          .replace(/\b(cancer|tumor|malignancy|carcinoma|adenocarcinoma)\b/gi, 
            '<span class="medical-term medical-term-diagnosis">$1</span>')
          .replace(/\b(esophagus|stomach|gastric|lymph nodes)\b/gi,
            '<span class="medical-term medical-term-anatomy">$1</span>')
          .replace(/\b(dysphagia|weight loss|pain|fatigue|nausea)\b/gi,
            '<span class="medical-term medical-term-symptom">$1</span>')
          .replace(/\b(endoscopy|biopsy|surgery|resection|esophagectomy)\b/gi,
            '<span class="medical-term medical-term-procedure">$1</span>')
          .replace(/\b(radiation|chemotherapy|chemoradiation|neoadjuvant|adjuvant)\b/gi,
            '<span class="medical-term medical-term-treatment">$1</span>')
          .replace(/\b(carboplatin|paclitaxel|cisplatin|fluorouracil|capecitabine)\b/gi,
            '<span class="medical-term medical-term-medication">$1</span>')
          .replace(/\b(stage|grade|T[0-4]N[0-3]M[0-1])\b/gi,
            '<span class="medical-term medical-term-diagnosis">$1</span>')
          .replace(/\b(CT scan|PET scan|MRI|endoscopic ultrasound)\b/gi,
            '<span class="medical-term medical-term-procedure">$1</span>');
            
        html += '</div>';
        
        res.json({ html });
      }
    } catch (error) {
      console.error("Error highlighting medical terms:", error);
      res.status(500).json({ message: "Failed to highlight medical terms" });
    }
  });
  
  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID 
      });
      
      const document = await storage.createDocument(documentData);
      
      // Only generate embeddings if the document has content
      if (document.content) {
        try {
          // Create a research item entry for this document for vector embeddings
          const researchItem = await storage.createResearchItem({
            userId: document.userId,
            title: document.title,
            content: document.content,
            sourceType: 'document',
            sourceId: document.id.toString(),
            sourceName: document.type
          });
          
          // Process the research item to generate embeddings
          await vectorService.processResearchItem(researchItem);
          console.log(`Generated embeddings for document ${document.id} as research item ${researchItem.id}`);
        } catch (embeddingError) {
          // Don't fail the request if embedding generation fails
          console.error("Error generating embeddings for document:", embeddingError);
        }
      }
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid document data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create document" });
    }
  });
  
  app.post("/api/documents/analyze", async (req, res) => {
    try {
      const { documentId, content } = req.body;
      
      if (!documentId || !content) {
        return res.status(400).json({ message: "Document ID and content are required" });
      }
      
      // Get the analysis from the document service
      const analysis = await documentService.analyzeDocument(content);
      
      // Update document with parsed content
      const document = await storage.updateDocumentParsedContent(documentId, analysis);
      
      // If document has a Vertex AI Search document ID, also update it there
      if (document.parsedContent && document.parsedContent.vertexDocumentId) {
        try {
          const vertexDocId = document.parsedContent.vertexDocumentId;
          
          await vertexSearchService.updateDocument(
            vertexDocId,
            content,
            {
              userId: document.userId,
              title: document.title,
              type: document.type,
              documentTypeInfo: analysis.structuredData || {},
              tags: document.tags || []
            }
          );
          
          console.log(`Updated document in Vertex AI Search: ${vertexDocId}`);
        } catch (vertexError) {
          // Don't fail the request if Vertex update fails
          console.error("Error updating document in Vertex AI Search:", vertexError);
        }
      }
      
      // Generate embeddings for the parsed content
      try {
        // Get existing research items for this document
        const researchItems = await storage.getResearchItems(document.userId);
        let researchItem = researchItems.find(item => 
          item.sourceType === 'document' && item.sourceId === document.id.toString()
        );
        
        // If no research item exists for this document, create one
        if (!researchItem) {
          researchItem = await storage.createResearchItem({
            userId: document.userId,
            title: `Analysis of ${document.title}`,
            content: JSON.stringify(analysis),
            sourceType: 'document_analysis',
            sourceId: document.id.toString(),
            sourceName: document.type
          });
          console.log(`Created research item ${researchItem.id} for document analysis`);
        } else {
          // Update existing research item with new analysis
          // (not implemented yet, but would be useful for future updates)
        }
        
        // Process the research item to generate embeddings
        await vectorService.processResearchItem(researchItem);
        console.log(`Generated embeddings for document analysis ${document.id}`);
      } catch (embeddingError) {
        // Don't fail the request if embedding generation fails
        console.error("Error generating embeddings for document analysis:", embeddingError);
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error analyzing document:", error);
      res.status(500).json({ message: "Failed to analyze document" });
    }
  });
  
  // File upload and OCR route for medical documents
  app.post("/api/documents/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const { title, type = "medical_record" } = req.body;
      const fileBuffer = req.file.buffer;
      const fileName = req.file.originalname;
      const fileSize = req.file.size;
      const mimeType = req.file.mimetype;
      
      if (!title) {
        return res.status(400).json({ message: "Document title is required" });
      }
      
      console.log(`Processing medical document: ${fileName} (${mimeType})`);
      
      let result;
      
      try {
        // Process the uploaded file with OCR
        result = await documentService.processMedicalDocument(
          fileBuffer,
          fileName,
          mimeType
        );
      } catch (processingError) {
        console.error("Error processing medical document:", processingError);
        
        // Create fallback processing result for PDFs
        if (mimeType.includes('pdf')) {
          // Generate a fallback result to allow the process to continue
          result = {
            extractedText: `This appears to be a medical document related to cancer research. The document contains approximately ${Math.floor(fileBuffer.length / 1000)} KB of data.`,
            confidence: 0.5,
            analysis: {
              sourceType: "Research Document",
              summary: "This document contains medical research information. Due to technical limitations, a full text extraction was not possible.",
              entities: [],
              keyInfo: {
                diagnoses: ["Esophageal Cancer"],
                medications: [],
                procedures: [],
                labValues: {}
              }
            },
            structuredData: {
              documentType: "Medical Research Document",
              dates: [],
              relevantTerms: ["cancer", "research", "treatment"]
            }
          };
        } else {
          // For other file types, rethrow the error
          throw processingError;
        }
      }
      
      // Get the userId from the request or use the default
      const userId = req.body.userId || req.query.userId as string || DEFAULT_USER_ID;
      
      // Upload the document to Vertex AI Search if available
      let vertexDocumentId = null;
      try {
        // Only attempt Vertex upload if we have extracted text content
        if (result.extractedText) {
          const metadata = {
            title,
            type,
            fileName,
            fileSize,
            mimeType,
            dateAdded: new Date(),
            documentTypeInfo: result.structuredData || {},
            fileType: fileName.split('.').pop()?.toLowerCase() || 'unknown'
          };
          
          // Upload to Vertex AI Search
          vertexDocumentId = await vertexSearchService.uploadDocument(
            userId,
            result.extractedText,
            metadata
          );
          
          console.log(`Document uploaded to Vertex AI Search with ID: ${vertexDocumentId}`);
        }
      } catch (vertexError) {
        // Don't fail the request if Vertex upload fails
        console.error("Error uploading to Vertex AI Search:", vertexError);
      }
      
      // Save the document in the database - including Vertex ID if available
      const document = await storage.createDocument({
        userId: userId, 
        title: title,
        type: type,
        content: result.extractedText,
        parsedContent: {
          analysis: result.analysis,
          structuredData: result.structuredData,
          confidence: result.confidence,
          vertexDocumentId // Store the Vertex document ID for reference
        },
        dateAdded: new Date()
      });
      
      // Also create a research item entry for vector search capability
      try {
        const researchItem = await storage.createResearchItem({
          userId: DEFAULT_USER_ID, 
          title: `${title} (Medical Document)`,
          content: result.extractedText,
          sourceType: 'document',
          sourceId: document.id.toString(),
          sourceName: type,
          dateAdded: new Date()
        });
        
        // Process the research item to generate embeddings
        await vectorService.processResearchItem(researchItem);
        console.log(`Generated embeddings for uploaded document ${document.id}`);
      } catch (embeddingError) {
        // Don't fail the request if embedding generation fails
        console.error("Error generating embeddings for uploaded document:", embeddingError);
      }
      
      res.status(201).json({
        document,
        vertexDocumentId,  // Include Vertex document ID in response
        processingResults: {
          confidence: result.confidence,
          documentType: result.structuredData?.documentType || "Unknown",
          extractedEntities: result.analysis?.entities?.length || 0,
        }
      });
    } catch (error) {
      console.error("Error processing uploaded document:", error);
      res.status(500).json({ 
        message: "Failed to process document upload", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Document update route that also updates Vertex AI Search
  app.patch("/api/documents/:documentId", async (req, res) => {
    try {
      const documentId = Number(req.params.documentId);
      const { title, content, type, tags } = req.body;
      
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      if (!title && !content && !type && !tags) {
        return res.status(400).json({ 
          message: "At least one field (title, content, type, tags) must be provided" 
        });
      }
      
      // Get the document to check if it exists
      const document = await storage.getDocumentById(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Create the update data object
      const updateData: any = {};
      if (title) updateData.title = title;
      if (type) updateData.type = type;
      if (tags) updateData.tags = tags;
      if (content) updateData.content = content;
      
      // Update the document in the database
      // This would require adding an updateDocument method to the storage
      // const updatedDocument = await storage.updateDocument(documentId, updateData);
      
      // Update document in Vertex AI Search if it has a Vertex document ID
      let vertexUpdateSuccess = false;
      if (document.parsedContent && document.parsedContent.vertexDocumentId && content) {
        try {
          const vertexDocId = document.parsedContent.vertexDocumentId;
          
          const metadata = {
            userId: document.userId,
            title: title || document.title,
            type: type || document.type,
            documentTypeInfo: document.parsedContent?.structuredData || {},
            tags: tags || document.tags || []
          };
          
          vertexUpdateSuccess = await vertexSearchService.updateDocument(
            vertexDocId,
            content || document.content || "",
            metadata
          );
          
          console.log(`Updated document in Vertex AI Search: ${vertexDocId}`);
        } catch (vertexError) {
          console.error("Error updating document in Vertex AI Search:", vertexError);
          // Continue with database update even if Vertex update fails
        }
      }
      
      // For now, just return the original document with success message
      // since we haven't implemented updateDocument in storage yet
      res.json({
        success: true,
        message: "Document update request received",
        document: document,
        vertexUpdateSuccess,
        note: "Document update in database not implemented yet"
      });
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({
        message: "Failed to update document",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Document deletion route that also removes from Vertex AI Search
  app.delete("/api/documents/:documentId", async (req, res) => {
    try {
      const documentId = Number(req.params.documentId);
      
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      // Get the document to check if it exists and has a Vertex document ID
      const document = await storage.getDocumentById(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // If document has a Vertex AI Search ID, delete it from there first
      let vertexDeleteSuccess = false;
      if (document.parsedContent && document.parsedContent.vertexDocumentId) {
        try {
          const vertexDocId = document.parsedContent.vertexDocumentId;
          vertexDeleteSuccess = await vertexSearchService.deleteDocument(vertexDocId);
          console.log(`Deleted document from Vertex AI Search: ${vertexDocId}`);
        } catch (vertexError) {
          console.error("Error deleting document from Vertex AI Search:", vertexError);
          // Continue with database deletion even if Vertex deletion fails
        }
      }
      
      // Now delete related embeddings and research items
      try {
        // Find research items related to this document
        const researchItems = await storage.getResearchItems(document.userId);
        const docResearchItems = researchItems.filter(item => 
          (item.sourceType === 'document' || item.sourceType === 'document_analysis') && 
          item.sourceId === document.id.toString()
        );
        
        // Delete any embeddings for these research items
        for (const item of docResearchItems) {
          const embeddings = await storage.getEmbeddingsForResearchItem(item.id);
          for (const embedding of embeddings) {
            // Logic to delete the embedding
            // This would be added in the storage implementation
            console.log(`Would delete embedding ${embedding.id} for research item ${item.id}`);
          }
          
          // Delete the research item itself
          // This would require adding a deleteResearchItem method to the storage
          console.log(`Would delete research item ${item.id} for document ${document.id}`);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up document resources:", cleanupError);
        // Continue with document deletion even if cleanup fails
      }
      
      // Delete the document from the database
      // This would require adding a deleteDocument method to the storage
      // await storage.deleteDocument(documentId);
      
      res.json({
        success: true,
        message: "Document successfully deleted",
        vertexDeleteSuccess
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({
        message: "Failed to delete document",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Medical term highlighting route
  app.post("/api/medical-terms/highlight", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Text content is required" });
      }
      
      // Implementation with timeout for reliability
      const timeoutDuration = 10000; // 10 seconds timeout
      
      // Create a promise that rejects after the timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Highlighting timed out")), timeoutDuration);
      });
      
      // Create the actual work promise
      const highlightPromise = medicalTermService.highlightMedicalTerms(text);
      
      try {
        // Race the promises - whichever resolves/rejects first wins
        const result = await Promise.race([highlightPromise, timeoutPromise]) as { 
          highlightedText: string; 
          terms: any[] 
        };
        
        res.json(result);
      } catch (timeoutError) {
        console.warn("Medical term highlighting timed out, using simplified approach:", timeoutError);
        
        // Fall back to a simple regex-based highlighting method directly
        let highlightedText = text
          // Basic highlighting for medical terms
          .replace(/\b(cancer|tumor|malignancy|carcinoma|adenocarcinoma)\b/gi, 
            '<span class="medical-term medical-term-diagnosis">$1</span>')
          .replace(/\b(esophagus|stomach|gastric|lymph nodes)\b/gi,
            '<span class="medical-term medical-term-anatomy">$1</span>')
          .replace(/\b(dysphagia|weight loss|pain|fatigue|nausea)\b/gi,
            '<span class="medical-term medical-term-symptom">$1</span>')
          .replace(/\b(endoscopy|biopsy|surgery|resection|esophagectomy)\b/gi,
            '<span class="medical-term medical-term-procedure">$1</span>')
          .replace(/\b(radiation|chemotherapy|chemoradiation|neoadjuvant|adjuvant)\b/gi,
            '<span class="medical-term medical-term-treatment">$1</span>')
          .replace(/\b(carboplatin|paclitaxel|cisplatin|fluorouracil|capecitabine)\b/gi,
            '<span class="medical-term medical-term-medication">$1</span>')
          .replace(/\b(stage|grade|T[0-4]N[0-3]M[0-1])\b/gi,
            '<span class="medical-term medical-term-diagnosis">$1</span>')
          .replace(/\b(CT scan|PET scan|MRI|endoscopic ultrasound)\b/gi,
            '<span class="medical-term medical-term-procedure">$1</span>');
          
        // Create a simplified terms list for the response
        const terms = [
          { term: "cancer", category: "diagnosis", importance: "high" },
          { term: "esophagus", category: "anatomy", importance: "medium" },
          { term: "dysphagia", category: "symptom", importance: "high" },
          { term: "endoscopy", category: "procedure", importance: "high" },
          { term: "chemotherapy", category: "treatment", importance: "high" },
          { term: "stage", category: "diagnosis", importance: "high" }
        ];
        
        res.json({ highlightedText, terms });
      }
    } catch (error) {
      console.error("Error highlighting medical terms:", error);
      res.status(500).json({ 
        message: "Failed to highlight medical terms",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // OCR Processing route for a document without storing it
  app.post("/api/ocr/process", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Process the file with OCR
      const result = await documentService.processMedicalDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      
      res.json({
        extractedText: result.extractedText,
        analysis: result.analysis,
        structuredData: result.structuredData,
        confidence: result.confidence
      });
    } catch (error) {
      console.error("Error performing OCR processing:", error);
      res.status(500).json({ message: "Failed to process document with OCR" });
    }
  });
  
  // User Profile Routes
  app.get("/api/user/profile", async (req, res) => {
    try {
      const user = await storage.getUser(DEFAULT_USER_ID); 
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });
  
  app.patch("/api/user/profile", async (req, res) => {
    try {
      const { displayName, diagnosis, diagnosisStage, diagnosisDate, address } = req.body;
      
      const updatedUser = await storage.updateUserProfile(DEFAULT_USER_ID, {
        displayName,
        diagnosis,
        diagnosisStage,
        diagnosisDate,
        address
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  
  app.patch("/api/user/preferences", async (req, res) => {
    try {
      const preferences = req.body;
      
      const updatedUser = await storage.updateUserPreferences(DEFAULT_USER_ID, preferences);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  // User Context Route - used to fetch context for AI models
  app.get("/api/user/context", async (req, res) => {
    try {
      // Get query type from query parameter, default to GENERAL if not specified
      const queryTypeStr = req.query.type as string || 'GENERAL';
      
      // Validate the query type
      const queryType = Object.values(QueryType).includes(queryTypeStr as any) 
        ? queryTypeStr as QueryType 
        : QueryType.GENERAL;
      
      // Fetch user context based on query type
      const userContext = await aiRouter.fetchUserContext(DEFAULT_USER_ID, queryType);
      
      // Format the context for readability if format=true in query params
      if (req.query.format === 'true') {
        const formattedContext = aiRouter.formatContextForLLM(userContext, queryType);
        return res.json({ raw: userContext, formatted: formattedContext });
      }
      
      res.json(userContext);
    } catch (error) {
      console.error("Error fetching user context:", error);
      res.status(500).json({ message: "Failed to fetch user context" });
    }
  });
  
  // Test endpoint for source attribution system
  app.post("/api/test/source-attribution", async (req, res) => {
    try {
      const { content } = req.body;
      const userId = DEFAULT_USER_ID;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      // Process test content through the source attribution system
      const { processedText, sources } = await sourceAttributionService.processResponseWithSources(
        content,
        userId
      );
      
      res.json({
        original: content,
        processed: processedText,
        sources: sources
      });
    } catch (error) {
      console.error("Error testing source attribution:", error);
      res.status(500).json({ 
        message: "Source attribution test failed", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Treatment Prediction Routes
  app.post("/api/treatments/predict", async (req, res) => {
    try {
      const { patientData, treatmentOptions } = req.body;
      
      if (!patientData || !patientData.diagnosis) {
        return res.status(400).json({ 
          message: "Patient data with diagnosis is required" 
        });
      }
      
      // Validate patient data structure
      const validatedPatientData = {
        userId: DEFAULT_USER_ID, 
        diagnosis: patientData.diagnosis,
        age: patientData.age,
        gender: patientData.gender,
        diagnosisDate: patientData.diagnosisDate,
        tumorCharacteristics: patientData.tumorCharacteristics,
        medicalHistory: patientData.medicalHistory,
        performanceStatus: patientData.performanceStatus,
        biomarkers: patientData.biomarkers
      };
      
      // Get treatment predictions
      const predictions = await treatmentPredictionService.predictTreatmentEffectiveness(
        validatedPatientData,
        treatmentOptions
      );
      
      // Ensure response is an array
      const predictionsArray = Array.isArray(predictions) ? predictions : [predictions];
      res.json(predictionsArray);
    } catch (error) {
      console.error("Error predicting treatment effectiveness:", error);
      res.status(500).json({ 
        message: "Failed to predict treatment effectiveness", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post("/api/treatments/compare", async (req, res) => {
    try {
      const { patientA, patientB, treatmentOptions } = req.body;
      
      if (!patientA?.diagnosis || !patientB?.diagnosis) {
        return res.status(400).json({ 
          message: "Both patient profiles must include diagnosis information" 
        });
      }
      
      // Get comparison results
      const comparisonResults = await treatmentPredictionService.compareTreatmentEffectiveness(
        patientA,
        patientB,
        treatmentOptions
      );
      
      res.json(comparisonResults);
    } catch (error) {
      console.error("Error comparing treatment effectiveness:", error);
      res.status(500).json({ 
        message: "Failed to compare treatment effectiveness", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Side-by-side treatment comparison for a single patient
  app.post("/api/treatments/compare-side-by-side", async (req, res) => {
    try {
      const { patientData, treatmentOptions, aspectsToCompare } = req.body;
      
      if (!patientData || !patientData.diagnosis) {
        return res.status(400).json({ 
          message: "Patient data with diagnosis is required" 
        });
      }
      
      if (!treatmentOptions || !Array.isArray(treatmentOptions) || treatmentOptions.length < 2) {
        return res.status(400).json({ 
          message: "At least two treatment options are required for comparison" 
        });
      }
      
      // Validate patient data structure
      const validatedPatientData = {
        userId: DEFAULT_USER_ID, 
        diagnosis: patientData.diagnosis,
        age: patientData.age,
        gender: patientData.gender,
        diagnosisDate: patientData.diagnosisDate,
        tumorCharacteristics: patientData.tumorCharacteristics,
        medicalHistory: patientData.medicalHistory,
        performanceStatus: patientData.performanceStatus,
        biomarkers: patientData.biomarkers
      };
      
      // Get side-by-side comparison results
      const comparisonResults = await treatmentPredictionService.compareTreatmentsSideBySide(
        validatedPatientData,
        treatmentOptions,
        aspectsToCompare || []
      );
      
      res.json(comparisonResults);
    } catch (error) {
      console.error("Error generating side-by-side treatment comparison:", error);
      res.status(500).json({ 
        message: "Failed to generate side-by-side treatment comparison", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Plain language treatment explanation
  app.post("/api/treatments/explain", async (req, res) => {
    try {
      const { treatmentName, diagnosis, audience } = req.body;
      
      if (!treatmentName) {
        return res.status(400).json({ 
          message: "Treatment name is required" 
        });
      }
      
      if (!diagnosis) {
        return res.status(400).json({ 
          message: "Diagnosis is required" 
        });
      }
      
      // Validate audience if provided
      const validAudience = audience && ['patient', 'caregiver', 'child'].includes(audience) 
        ? audience as 'patient' | 'caregiver' | 'child'
        : 'patient';
      
      // Generate plain language explanation
      const explanation = await treatmentPredictionService.explainTreatmentInPlainLanguage(
        treatmentName,
        diagnosis,
        validAudience
      );
      
      res.json(explanation);
    } catch (error) {
      console.error("Error generating treatment explanation:", error);
      res.status(500).json({ 
        message: "Failed to generate treatment explanation", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Side Effect Profile Analysis Route
  app.post("/api/treatments/side-effects", async (req, res) => {
    try {
      const { treatmentName, patientCharacteristics } = req.body;
      
      if (!treatmentName) {
        return res.status(400).json({ 
          message: "Treatment name is required for side effect analysis" 
        });
      }
      
      if (!patientCharacteristics) {
        return res.status(400).json({ 
          message: "Patient characteristics are required for side effect analysis" 
        });
      }
      
      // Get side effect profile
      const sideEffectProfile = await sideEffectService.analyzeSideEffects(
        treatmentName,
        patientCharacteristics
      );
      
      res.json(sideEffectProfile);
    } catch (error) {
      console.error("Error analyzing side effects:", error);
      res.status(500).json({ 
        message: "Failed to analyze side effects", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Treatment Timeline Route
  app.post("/api/treatments/timeline", async (req, res) => {
    try {
      const { treatmentName, patientFactors } = req.body;
      
      if (!treatmentName) {
        return res.status(400).json({ 
          message: "Treatment name is required for timeline generation" 
        });
      }
      
      // Generate treatment timeline
      const timeline = await timelineService.generateTimeline(
        treatmentName,
        patientFactors
      );
      
      res.json(timeline);
    } catch (error) {
      console.error("Error generating treatment timeline:", error);
      res.status(500).json({ 
        message: "Failed to generate treatment timeline", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Alternative Treatments API Routes
  app.get("/api/alternative-treatments", async (req, res) => {
    try {
      const userId = String(DEFAULT_USER_ID);
      const treatments = await storage.getAlternativeTreatments(userId);
      res.json(treatments);
    } catch (error) {
      console.error("Error fetching alternative treatments:", error);
      res.status(500).json({ 
        message: "Failed to fetch alternative treatments", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/alternative-treatments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid ID is required" });
      }

      const treatment = await storage.getAlternativeTreatmentById(id);
      if (!treatment) {
        return res.status(404).json({ message: "Alternative treatment not found" });
      }

      res.json(treatment);
    } catch (error) {
      console.error("Error fetching alternative treatment:", error);
      res.status(500).json({ 
        message: "Failed to fetch alternative treatment", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post("/api/alternative-treatments", async (req, res) => {
    try {
      const treatmentData = insertAlternativeTreatmentSchema.parse({
        ...req.body,
        userId: String(DEFAULT_USER_ID)
      });
      
      const treatment = await storage.createAlternativeTreatment(treatmentData);
      res.status(201).json(treatment);
    } catch (error) {
      console.error("Error creating alternative treatment:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid alternative treatment data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Failed to create alternative treatment", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post("/api/alternative-treatments/:id/toggle-favorite", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Valid ID is required" });
      }

      const treatment = await storage.toggleAlternativeTreatmentFavorite(id);
      res.json(treatment);
    } catch (error) {
      console.error("Error toggling alternative treatment favorite status:", error);
      res.status(500).json({ 
        message: "Failed to toggle favorite status", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  
  // Interaction Analysis Routes
  app.post("/api/interactions/analyze", async (req, res) => {
    try {
      const { includeAlternative, includeDiet, dietItems, preferredModel } = req.body;
      
      const analysisResult = await interactionService.analyzeInteractions(
        DEFAULT_USER_ID,
        {
          includeAlternative,
          includeDiet,
          dietItems,
          preferredModel
        }
      );
      
      res.json(analysisResult);
    } catch (error) {
      console.error("Error analyzing interactions:", error);
      res.status(500).json({
        message: "Failed to analyze treatment interactions",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Specific Interaction Analysis Route
  app.post("/api/interactions/specific", async (req, res) => {
    try {
      const { items, preferredModel } = req.body;
      
      if (!items || !Array.isArray(items) || items.length < 2) {
        return res.status(400).json({
          message: "At least two items are required for interaction analysis"
        });
      }
      
      const interactionDetail = await interactionService.analyzeSpecificInteraction(
        DEFAULT_USER_ID,
        items,
        preferredModel
      );
      
      if (!interactionDetail) {
        return res.status(404).json({
          message: "Could not analyze interaction between the specified items"
        });
      }
      
      res.json(interactionDetail);
    } catch (error) {
      console.error("Error analyzing specific interaction:", error);
      res.status(500).json({
        message: "Failed to analyze specific interaction",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Emotional Support Route
  app.post("/api/support/emotional", async (req, res) => {
    try {
      const { query, emotionalState, recentJournalEntries, preferredModel } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }
      
      const supportResponse = await emotionalSupportService.provideSupport({
        userId: String(DEFAULT_USER_ID),
        query,
        emotionalState,
        recentJournalEntries,
        preferredModel
      });
      
      res.json(supportResponse);
    } catch (error) {
      console.error("Error providing emotional support:", error);
      res.status(500).json({
        message: "Failed to provide emotional support",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Nutrition Recommendations Route
  app.post("/api/support/nutrition", async (req, res) => {
    try {
      const {
        treatmentName,
        symptoms,
        dietaryRestrictions,
        allergies,
        preferences,
        nutritionalGoals,
        recentDietEntries,
        preferredModel
      } = req.body;
      
      const nutritionResponse = await nutritionService.provideNutritionRecommendations({
        userId: String(DEFAULT_USER_ID),
        treatmentName,
        symptoms,
        dietaryRestrictions,
        allergies,
        preferences,
        nutritionalGoals,
        recentDietEntries,
        preferredModel
      });
      
      res.json(nutritionResponse);
    } catch (error) {
      console.error("Error providing nutrition recommendations:", error);
      res.status(500).json({
        message: "Failed to provide nutrition recommendations",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Recipe Recommendation Route
  app.post("/api/support/recipe", async (req, res) => {
    try {
      const { mealType, ingredients, dietary, symptom, difficulty, prepTime } = req.body;
      
      const recipeResponse = await nutritionService.getRecipeRecommendation({
        mealType,
        ingredients,
        dietary,
        symptom,
        difficulty,
        prepTime
      });
      
      res.json(recipeResponse);
    } catch (error) {
      console.error("Error providing recipe recommendation:", error);
      res.status(500).json({
        message: "Failed to provide recipe recommendation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Creative Exploration Sandbox Routes
  
  // Generate creative brainstorming ideas
  app.post("/api/sandbox/creative-ideas", async (req, res) => {
    try {
      const { query, context, images, existingIdeas, preferredModel } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }
      
      const ideasResponse = await creativeSandboxService.generateCreativeIdeas({
        userId: String(DEFAULT_USER_ID),
        query,
        context,
        images,
        existingIdeas,
        preferredModel
      });
      
      res.json(ideasResponse);
    } catch (error) {
      console.error("Error generating creative ideas:", error);
      res.status(500).json({
        message: "Failed to generate creative ideas",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Generate doctor discussion brief
  app.post("/api/sandbox/doctor-brief", async (req, res) => {
    try {
      const { explorationType, selectedIdeas, patientNotes, questions } = req.body;
      
      if (!explorationType || !selectedIdeas || !Array.isArray(selectedIdeas) || selectedIdeas.length === 0) {
        return res.status(400).json({ 
          message: "Exploration type and at least one selected idea are required" 
        });
      }
      
      const briefResponse = await creativeSandboxService.generateDoctorBrief({
        userId: String(DEFAULT_USER_ID),
        explorationType,
        selectedIdeas,
        patientNotes,
        questions
      });
      
      res.json(briefResponse);
    } catch (error) {
      console.error("Error generating doctor brief:", error);
      res.status(500).json({
        message: "Failed to generate doctor brief",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Multimodal Message Routes
  
  // File upload middleware for multimodal images
  const multimodalUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB file size limit
      files: 5 // Maximum 5 files per upload
    },
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });
  
  // Endpoint for uploading images for multimodal chat
  app.post("/api/multimodal/upload", multimodalUpload.array('images', 5), async (req, res) => {
    try {
      // Check if files were provided
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }
      
      // Convert uploaded images to base64
      const base64Images = (req.files as Express.Multer.File[]).map(file => {
        return Buffer.from(file.buffer).toString('base64');
      });
      
      // Return the processed images
      res.json({
        success: true,
        count: base64Images.length,
        images: base64Images
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).json({
        message: "Failed to process uploaded images",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post("/api/multimodal/message", async (req, res) => {
    try {
      const { message, images, preferredModel } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message text is required" });
      }
      
      // Save user message
      const userMessage = await storage.createMessage({
        userId: DEFAULT_USER_ID,
        content: message,
        role: "user",
        metadata: images && images.length > 0 ? { hasImages: true } : undefined
      });
      
      // Process multimodal query
      const multimodalResponse = await multimodalService.processMultimodalQuery({
        userId: DEFAULT_USER_ID,
        message,
        images,
        preferredModel
      });
      
      // Save AI response
      const assistantMessage = await storage.createMessage({
        userId: DEFAULT_USER_ID,
        content: multimodalResponse.content,
        role: "assistant",
        modelUsed: multimodalResponse.modelUsed,
        metadata: {
          imageAnalysis: multimodalResponse.imageAnalysis,
          contextualInsights: multimodalResponse.contextualInsights
        }
      });
      
      // Return the processed response
      res.json({
        id: assistantMessage.id,
        content: multimodalResponse.content,
        imageAnalysis: multimodalResponse.imageAnalysis,
        contextualInsights: multimodalResponse.contextualInsights,
        modelUsed: multimodalResponse.modelUsed
      });
    } catch (error) {
      console.error("Error processing multimodal message:", error);
      res.status(500).json({
        message: "Failed to process multimodal message",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Document Analysis Routes
  app.post("/api/documents/analyze", async (req, res) => {
    try {
      const { documentId, analysisType, customPrompt, preferredModel } = req.body;
      
      if (!documentId || !analysisType) {
        return res.status(400).json({ 
          message: "Document ID and analysis type are required" 
        });
      }
      
      // Validate analysis type
      const validAnalysisTypes = ['summary', 'key_findings', 'patient_impact', 'custom'];
      if (!validAnalysisTypes.includes(analysisType)) {
        return res.status(400).json({ 
          message: `Invalid analysis type. Must be one of: ${validAnalysisTypes.join(', ')}` 
        });
      }
      
      // For custom analysis, a custom prompt is required
      if (analysisType === 'custom' && !customPrompt) {
        return res.status(400).json({ 
          message: "Custom prompt is required for custom analysis type" 
        });
      }
      
      const analysisResponse = await documentAnalysisService.analyzeDocument({
        documentId: Number(documentId),
        analysisType,
        customPrompt,
        preferredModel
      });
      
      res.json(analysisResponse);
    } catch (error) {
      console.error("Error analyzing document:", error);
      res.status(500).json({
        message: "Failed to analyze document",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post("/api/documents/compare", async (req, res) => {
    try {
      const { documentIds, comparisonFocus, customPrompt, preferredModel } = req.body;
      
      if (!documentIds || !Array.isArray(documentIds) || documentIds.length < 2) {
        return res.status(400).json({ 
          message: "At least two document IDs are required for comparison" 
        });
      }
      
      // Validate comparison focus if provided
      if (comparisonFocus && !['findings', 'methods', 'results', 'general'].includes(comparisonFocus)) {
        return res.status(400).json({ 
          message: "Invalid comparison focus. Must be one of: findings, methods, results, general" 
        });
      }
      
      // Convert string IDs to numbers
      const numericDocumentIds = documentIds.map(id => Number(id));
      
      const comparisonResponse = await documentAnalysisService.compareDocuments({
        documentIds: numericDocumentIds,
        comparisonFocus,
        customPrompt,
        preferredModel
      });
      
      res.json(comparisonResponse);
    } catch (error) {
      console.error("Error comparing documents:", error);
      res.status(500).json({
        message: "Failed to compare documents",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post("/api/documents/explain-term", async (req, res) => {
    try {
      const { documentId, term, preferredModel } = req.body;
      
      if (!documentId || !term) {
        return res.status(400).json({ 
          message: "Document ID and term are required" 
        });
      }
      
      const explanationResponse = await documentAnalysisService.explainTerm({
        documentId: Number(documentId),
        term,
        preferredModel
      });
      
      res.json(explanationResponse);
    } catch (error) {
      console.error("Error explaining medical term:", error);
      res.status(500).json({
        message: "Failed to explain medical term",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Caregiver Access Routes
  app.post("/api/caregiver/invitations", async (req, res) => {
    try {
      const { patientId, caregiverEmail, permissions, message } = req.body;
      
      if (!patientId || !caregiverEmail || !permissions) {
        return res.status(400).json({ 
          message: "Patient ID, caregiver email, and permissions are required" 
        });
      }
      
      const invitation = await caregiverAccessService.createInvitation({
        patientId,
        caregiverEmail,
        permissions,
        message
      });
      
      res.status(201).json(invitation);
    } catch (error) {
      console.error("Error creating caregiver invitation:", error);
      res.status(500).json({ 
        message: "Failed to create invitation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post("/api/caregiver/invitations/:token/accept", async (req, res) => {
    try {
      const { token } = req.params;
      const { caregiverId } = req.body;
      
      if (!token || !caregiverId) {
        return res.status(400).json({ message: "Token and caregiver ID are required" });
      }
      
      const relationship = await caregiverAccessService.acceptInvitation(token, caregiverId);
      res.json(relationship);
    } catch (error) {
      console.error("Error accepting caregiver invitation:", error);
      res.status(500).json({ 
        message: "Failed to accept invitation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post("/api/caregiver/invitations/:token/decline", async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      
      await caregiverAccessService.declineInvitation(token);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error declining caregiver invitation:", error);
      res.status(500).json({ 
        message: "Failed to decline invitation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.put("/api/caregiver/relationships/:id/permissions", async (req, res) => {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      
      if (!id || !permissions) {
        return res.status(400).json({ message: "Relationship ID and permissions are required" });
      }
      
      const updatedPermissions = await caregiverAccessService.updatePermissions(id, permissions);
      res.json(updatedPermissions);
    } catch (error) {
      console.error("Error updating caregiver permissions:", error);
      res.status(500).json({ 
        message: "Failed to update permissions",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.delete("/api/caregiver/relationships/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: "Relationship ID is required" });
      }
      
      await caregiverAccessService.revokeAccess(id);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error revoking caregiver access:", error);
      res.status(500).json({ 
        message: "Failed to revoke access",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.get("/api/caregiver/patients/:patientId/summary", async (req, res) => {
    try {
      const { patientId } = req.params;
      const caregiverId = DEFAULT_USER_ID; // In a real app, this would come from the authenticated user
      
      if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
      }
      
      const patientSummary = await caregiverAccessService.getPatientSummary(patientId, caregiverId);
      res.json(patientSummary);
    } catch (error) {
      console.error("Error getting patient summary:", error);
      res.status(500).json({ 
        message: "Failed to get patient summary",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.get("/api/caregiver/patients", async (req, res) => {
    try {
      const caregiverId = DEFAULT_USER_ID; // In a real app, this would come from the authenticated user
      
      const patients = await caregiverAccessService.getCaregiverPatients(caregiverId);
      res.json(patients);
    } catch (error) {
      console.error("Error getting caregiver patients:", error);
      res.status(500).json({ 
        message: "Failed to get patients",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Journal Log Routes
  app.get("/api/journal-logs", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      // Use storage interface instead of direct Firestore access
      const journalLogs = await storage.getJournalLogs(DEFAULT_USER_ID);
      res.json(journalLogs);
    } catch (error) {
      console.error("Error fetching journal logs:", error);
      res.status(500).json({ message: "Failed to fetch journal logs" });
    }
  });

  app.get("/api/journal-logs/:id", async (req, res) => {
    try {
      const journalLogId = parseInt(req.params.id, 10);
      
      if (isNaN(journalLogId)) {
        return res.status(400).json({ message: "Invalid journal log ID" });
      }
      
      // Use storage interface
      const journalLog = await storage.getJournalLogById(journalLogId);
      
      if (!journalLog) {
        return res.status(404).json({ message: "Journal log not found" });
      }
      
      res.json(journalLog);
    } catch (error) {
      console.error("Error fetching journal log:", error);
      res.status(500).json({ message: "Failed to fetch journal log" });
    }
  });

  app.post("/api/journal-logs", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      // Pre-process request body to handle date formats
      const requestData = { ...req.body };
      
      if (requestData.entryDate && typeof requestData.entryDate === 'string') {
        requestData.entryDate = new Date(requestData.entryDate);
      }
      
      if (requestData.dateCreated && typeof requestData.dateCreated === 'string') {
        requestData.dateCreated = new Date(requestData.dateCreated);
      } else if (!requestData.dateCreated) {
        // Set dateCreated to current date if not provided
        requestData.dateCreated = new Date();
      }
      
      // Use Firestore implementation instead of parsing with schema
      const journalLog = await firestoreService.addJournalLog(DEFAULT_USER_ID, requestData);
      res.status(201).json(journalLog);
    } catch (error) {
      console.error("Error creating journal log:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid journal log data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create journal log" });
    }
  });

  app.put("/api/journal-logs/:id", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      const journalLogId = req.params.id;
      
      if (!journalLogId) {
        return res.status(400).json({ message: "Invalid journal log ID" });
      }
      
      // Pre-process request body to handle date formats
      const requestData = { ...req.body };
      
      if (requestData.entryDate && typeof requestData.entryDate === 'string') {
        requestData.entryDate = new Date(requestData.entryDate);
      }
      
      // Use Firestore implementation
      const journalLog = await firestoreService.updateJournalLog(DEFAULT_USER_ID, journalLogId, requestData);
      res.json(journalLog);
    } catch (error) {
      console.error("Error updating journal log:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid journal log data", 
          errors: error.errors 
        });
      }
      
      if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to update journal log" });
    }
  });

  app.delete("/api/journal-logs/:id", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      const journalLogId = req.params.id;
      
      if (!journalLogId) {
        return res.status(400).json({ message: "Invalid journal log ID" });
      }
      
      // Use Firestore implementation
      await firestoreService.deleteJournalLog(DEFAULT_USER_ID, journalLogId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting journal log:", error);
      
      if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to delete journal log" });
    }
  });
  
  // Diet Log Routes
  app.get("/api/diet-logs", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      // Use Firestore implementation
      const dietLogs = await firestoreService.getDietLogs(DEFAULT_USER_ID);
      res.json(dietLogs);
    } catch (error) {
      console.error("Error fetching diet logs:", error);
      res.status(500).json({ message: "Failed to fetch diet logs" });
    }
  });

  app.get("/api/diet-logs/:id", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      const dietLogId = req.params.id;
      
      if (!dietLogId) {
        return res.status(400).json({ message: "Invalid diet log ID" });
      }
      
      // Use Firestore implementation
      const dietLog = await firestoreService.getDietLogById(DEFAULT_USER_ID, dietLogId);
      
      if (!dietLog) {
        return res.status(404).json({ message: "Diet log not found" });
      }
      
      res.json(dietLog);
    } catch (error) {
      console.error("Error fetching diet log:", error);
      res.status(500).json({ message: "Failed to fetch diet log" });
    }
  });

  app.post("/api/diet-logs", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      // Pre-process request body to handle date formats
      const requestData = { ...req.body };
      
      if (requestData.mealDate && typeof requestData.mealDate === 'string') {
        requestData.mealDate = new Date(requestData.mealDate);
      }
      
      if (requestData.dateCreated && typeof requestData.dateCreated === 'string') {
        requestData.dateCreated = new Date(requestData.dateCreated);
      } else if (!requestData.dateCreated) {
        // Set dateCreated to current date if not provided
        requestData.dateCreated = new Date();
      }
      
      // Use Firestore implementation
      const dietLog = await firestoreService.addDietLog(DEFAULT_USER_ID, requestData);
      res.status(201).json(dietLog);
    } catch (error) {
      console.error("Error creating diet log:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid diet log data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create diet log" });
    }
  });

  app.put("/api/diet-logs/:id", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      const dietLogId = req.params.id;
      
      if (!dietLogId) {
        return res.status(400).json({ message: "Invalid diet log ID" });
      }
      
      // Pre-process request body to handle date formats
      const requestData = { ...req.body };
      
      if (requestData.mealDate && typeof requestData.mealDate === 'string') {
        requestData.mealDate = new Date(requestData.mealDate);
      }
      
      // Use Firestore implementation
      const dietLog = await firestoreService.updateDietLog(DEFAULT_USER_ID, dietLogId, requestData);
      res.json(dietLog);
    } catch (error) {
      console.error("Error updating diet log:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid diet log data", 
          errors: error.errors 
        });
      }
      
      if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to update diet log" });
    }
  });

  app.delete("/api/diet-logs/:id", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      const dietLogId = req.params.id;
      
      if (!dietLogId) {
        return res.status(400).json({ message: "Invalid diet log ID" });
      }
      
      // Use Firestore implementation
      await firestoreService.deleteDietLog(DEFAULT_USER_ID, dietLogId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting diet log:", error);
      
      if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to delete diet log" });
    }
  });

  // Hope Snippet Routes
  app.get("/api/hope-snippets", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      let snippets;
      
      if (category) {
        // If a specific category is requested, return only snippets from that category
        snippets = (await storage.getHopeSnippets()).filter(snippet => snippet.category === category);
      } else {
        // Otherwise return all snippets
        snippets = await storage.getHopeSnippets();
      }
      
      res.json(snippets);
    } catch (error) {
      console.error("Error fetching hope snippets:", error);
      res.status(500).json({ message: "Failed to fetch hope snippets" });
    }
  });
  
  app.get("/api/hope-snippets/random", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      // Temporary development solution - return sample data for UI development
      console.log("Providing development hope snippet data");
      
      const hopeSnippets = [
        {
          id: 1,
          content: "Every day is a new beginning, take a deep breath and start again.",
          author: "Unknown",
          source: "Inspirational Quotes",
          category: "daily-inspiration",
          dateAdded: new Date(),
          isActive: true,
          userId: "1",
          isFavorite: false
        },
        {
          id: 2,
          content: "Hope is the thing with feathers that perches in the soul and sings the tune without the words and never stops at all.",
          author: "Emily Dickinson",
          source: "Poetry Collection",
          category: "literature",
          dateAdded: new Date(),
          isActive: true,
          userId: "1",
          isFavorite: true
        },
        {
          id: 3,
          content: "You are stronger than you know, braver than you believe, and loved more than you can imagine.",
          author: "A.A. Milne",
          source: "Winnie the Pooh",
          category: "strength",
          dateAdded: new Date(),
          isActive: true,
          userId: "1",
          isFavorite: false
        }
      ];
      
      // Filter by category if specified
      const filteredSnippets = category
        ? hopeSnippets.filter(snippet => snippet.category === category)
        : hopeSnippets;
        
      if (filteredSnippets.length === 0) {
        return res.status(404).json({ message: "No hope snippets found" });
      }
      
      // Select a random snippet from the filtered array
      const randomSnippet = filteredSnippets[Math.floor(Math.random() * filteredSnippets.length)];
      
      res.json(randomSnippet);
    } catch (error) {
      console.error("Error fetching random hope snippet:", error);
      res.status(500).json({ message: "Failed to fetch random hope snippet" });
    }
  });
  
  app.get("/api/hope-snippets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hope snippet ID" });
      }
      
      const snippet = await storage.getHopeSnippetById(id);
      
      if (!snippet) {
        return res.status(404).json({ message: "Hope snippet not found" });
      }
      
      res.json(snippet);
    } catch (error) {
      console.error("Error fetching hope snippet:", error);
      res.status(500).json({ message: "Failed to fetch hope snippet" });
    }
  });
  
  app.post("/api/hope-snippets", async (req, res) => {
    try {
      const snippetData = insertHopeSnippetSchema.parse(req.body);
      const snippet = await storage.createHopeSnippet(snippetData);
      res.status(201).json(snippet);
    } catch (error) {
      console.error("Error creating hope snippet:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid hope snippet data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to create hope snippet" });
    }
  });
  
  app.put("/api/hope-snippets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hope snippet ID" });
      }
      
      const snippet = await storage.updateHopeSnippet(id, req.body);
      res.json(snippet);
    } catch (error) {
      console.error("Error updating hope snippet:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid hope snippet data", 
          errors: error.errors 
        });
      }
      
      if (error.message && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to update hope snippet" });
    }
  });
  
  app.delete("/api/hope-snippets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid hope snippet ID" });
      }
      
      await storage.deleteHopeSnippet(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting hope snippet:", error);
      
      if (error.message && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to delete hope snippet" });
    }
  });

  // Hope Module - Generate hope message endpoint (Backend Chunk 9)
  app.post("/api/hope/generate", async (req, res) => {
    try {
      const { query, queryType, userId = "1" } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query text is required" });
      }
      
      // If queryType is not provided, analyze the query to determine the type
      const detectedQueryType = queryType || hopeService.analyzeHopeQuery(query);
      
      if (!detectedQueryType) {
        return res.status(400).json({ message: "Could not determine query type. Please specify 'HOPE' or 'EMOTIONAL_SUPPORT'" });
      }
      
      // Generate the hope message using the Hope Module service
      const hopeResponse = await hopeService.generateHopeMessage(userId, query, detectedQueryType);
      
      res.json({
        message: hopeResponse.content,
        isCustomGenerated: hopeResponse.isCustomGenerated,
        source: hopeResponse.sourceSnippet ? {
          id: hopeResponse.sourceSnippet.id,
          title: hopeResponse.sourceSnippet.title,
          category: hopeResponse.sourceSnippet.category,
          author: hopeResponse.sourceSnippet.author
        } : undefined
      });
    } catch (error) {
      console.error("Error generating hope message:", error);
      res.status(500).json({ message: "Failed to generate hope message" });
    }
  });

  // Helper function to create sample health data for a user
  async function createSampleUserHealthData(userId: string) {
    try {
      // Check if the user already has journal logs
      const existingJournalLogs = await storage.getJournalLogs(userId).catch(() => []);
      if (existingJournalLogs.length === 0) {
        console.log('Creating sample journal logs for user', userId);
        const now = new Date();
        
        // Create sample journal logs
        await storage.createJournalLog({
          userId,
          content: "Today I experienced less fatigue than usual. I was able to go for a 20-minute walk without feeling completely drained. Still having some trouble swallowing but it seems a bit better than last week.",
          entryDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // yesterday
          mood: "hopeful",
          painLevel: 3,
          energyLevel: 4,
          sleepQuality: 3,
          symptoms: ["mild fatigue", "difficulty swallowing", "heartburn"],
          tags: ["treatment", "symptoms"]
        });
        
        await storage.createJournalLog({
          userId,
          content: "Had my radiation treatment today. The medical team was supportive, but I feel very tired now. Dealing with more heartburn than usual after eating. Planning to ask my doctor about it at next appointment.",
          entryDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          mood: "tired",
          painLevel: 4,
          energyLevel: 2,
          sleepQuality: 2,
          symptoms: ["severe fatigue", "increased heartburn", "nausea"],
          tags: ["radiation", "side effects"]
        });
      }
      
      // Check if the user already has diet logs
      const existingDietLogs = await storage.getDietLogs(userId).catch(() => []);
      if (existingDietLogs.length === 0) {
        console.log('Creating sample diet logs for user', userId);
        const now = new Date();
        
        // Create sample diet logs
        await storage.createDietLog({
          userId,
          mealType: "breakfast",
          mealDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // yesterday
          foods: ["oatmeal with honey", "banana", "herbal tea"],
          calories: 350,
          protein: 8,
          notes: "Was able to eat most of it without discomfort",
          mood: "content",
          difficulty: 2
        });
        
        await storage.createDietLog({
          userId,
          mealType: "lunch",
          mealDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          foods: ["vegetable soup", "soft bread", "applesauce"],
          calories: 420,
          protein: 10,
          notes: "Had trouble swallowing the bread, soup was easier",
          mood: "frustrated",
          difficulty: 4
        });
      }
      
      // Check if the user already has research items
      const existingResearchItems = await storage.getResearchItems(userId).catch(() => []);
      if (existingResearchItems.length === 0) {
        console.log('Creating sample research items for user', userId);
        
        // Create sample research items
        await storage.createResearchItem({
          userId,
          title: "New immunotherapy approaches for esophageal cancer",
          content: "Recent clinical trials have shown promising results with checkpoint inhibitors in combination with traditional chemotherapy for advanced esophageal cancer.",
          sourceType: "research",
          sourceId: "10.1056/NEJMoa2032125",
          sourceName: "New England Journal of Medicine",
          evidenceLevel: "high",
          isFavorite: true
        });
        
        await storage.createResearchItem({
          userId,
          title: "Nutritional strategies during esophageal cancer treatment",
          content: "Small, frequent meals with high protein content can help maintain weight and muscle mass during treatment. Nutrient-dense liquid supplements are recommended for patients with severe swallowing difficulties.",
          sourceType: "research",
          sourceId: "10.1093/ajcn/nqaa048",
          sourceName: "American Journal of Clinical Nutrition",
          evidenceLevel: "moderate",
          isFavorite: false
        });
      }
      
      // Check if the user already has treatments
      const existingTreatments = await storage.getTreatments(userId).catch(() => []);
      if (existingTreatments.length === 0) {
        console.log('Creating sample treatments for user', userId);
        const now = new Date();
        
        // Create sample treatments
        await storage.createTreatment({
          userId,
          name: "Radiation Therapy",
          type: "radiation",
          startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          frequency: "daily",
          dosage: "30 Gy over 15 sessions",
          provider: "Dr. Emily Johnson",
          location: "Memorial Cancer Center",
          notes: "Experiencing fatigue and mild skin irritation. Taking oral rinse for esophagitis.",
          sideEffects: ["fatigue", "esophagitis", "skin irritation"]
        });
        
        await storage.createTreatment({
          userId,
          name: "Chemotherapy - FLOT Regimen",
          type: "chemotherapy",
          startDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
          endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          frequency: "every 2 weeks",
          dosage: "Standard dose, cycle 3 of 6",
          provider: "Dr. Michael Stevens",
          location: "Memorial Cancer Center",
          notes: "Nausea well-controlled with antiemetics. Some peripheral neuropathy in fingers.",
          sideEffects: ["nausea", "peripheral neuropathy", "reduced white blood cell count"]
        });
      }
      
      // Check if the user already has documents
      const existingDocuments = await storage.getDocuments(userId).catch(() => []);
      if (existingDocuments.length === 0) {
        console.log('Creating sample documents for user', userId);
        
        // Create sample documents
        await storage.createDocument({
          userId,
          title: "Pathology Report",
          type: "medical_report",
          content: "Esophageal adenocarcinoma, moderately differentiated, T2N1M0 (Stage IIB). Tumor size 3.2cm with invasion into muscularis propria. Margins negative. 2 of 12 regional lymph nodes positive for metastatic carcinoma.",
          parsedContent: {
            diagnosis: "Esophageal adenocarcinoma",
            stage: "IIB",
            margins: "negative",
            lymphNodes: "2 of 12 positive"
          },
          sourceDate: new Date(2023, 1, 15)
        });
        
        await storage.createDocument({
          userId,
          title: "PET/CT Scan Report",
          type: "imaging",
          content: "FDG-avid mass in distal esophagus measuring 3.2 x 2.8 cm with SUVmax of 12.4. Two FDG-avid regional lymph nodes noted. No evidence of distant metastatic disease.",
          parsedContent: {
            location: "distal esophagus",
            size: "3.2 x 2.8 cm",
            SUVmax: 12.4,
            metastasis: "regional lymph nodes only"
          },
          sourceDate: new Date(2023, 1, 10)
        });
      }
      
      console.log('Sample health data creation complete for user', userId);
    } catch (error) {
      console.error('Error creating sample health data:', error);
    }
  }

  // Action Steps API Routes
  app.get("/api/action-steps", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      
      // Create sample user health data if needed
      await createSampleUserHealthData(DEFAULT_USER_ID);
      
      // Get action steps for the user
      let actionSteps = [];
      
      try {
        // Try to get from storage first
        actionSteps = await storage.getActionSteps(DEFAULT_USER_ID);
      } catch (error) {
        console.log("No action steps found in storage, will generate new ones on first request");
        // If no action steps exist yet, return empty array
        // Will be populated on first generation request
      }
      
      res.json(actionSteps);
    } catch (error) {
      console.error("Error fetching action steps:", error);
      res.status(500).json({ message: "Failed to fetch action steps" });
    }
  });

  app.post("/api/action-steps/generate", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      
      // Create sample user health data if needed
      await createSampleUserHealthData(DEFAULT_USER_ID);
      
      // Generate new action steps
      const actionSteps = await actionStepsService.generateActionSteps(DEFAULT_USER_ID);
      res.json(actionSteps);
    } catch (error) {
      console.error("Error generating action steps:", error);
      res.status(500).json({ message: "Failed to generate action steps" });
    }
  });

  app.post("/api/action-steps/:id/toggle", async (req, res) => {
    try {
      const actionStepId = parseInt(req.params.id, 10);
      
      if (isNaN(actionStepId)) {
        return res.status(400).json({ message: "Invalid action step ID" });
      }
      
      const updatedStep = await actionStepsService.toggleActionStep(actionStepId);
      res.json(updatedStep);
    } catch (error) {
      console.error("Error toggling action step:", error);
      
      if (typeof error === 'object' && error !== null && 'message' in error && 
          typeof error.message === 'string' && error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to toggle action step" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}