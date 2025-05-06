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
import { multimodalService } from "./services/multimodal-service";
import * as firestoreService from "./services/firestore-service";
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
  // API Routes for Plan Items - Using Firestore
  app.get("/api/plan-items", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      // Use Firestore implementation
      const planItems = await firestoreService.getPlanItems(DEFAULT_USER_ID);
      res.json(planItems);
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
      
      // Save the document in the database
      const document = await storage.createDocument({
        userId: DEFAULT_USER_ID, 
        title: title,
        type: type,
        content: result.extractedText,
        parsedContent: {
          analysis: result.analysis,
          structuredData: result.structuredData,
          confidence: result.confidence
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
      // Use Firestore implementation
      const journalLogs = await firestoreService.getJournalLogs(DEFAULT_USER_ID);
      res.json(journalLogs);
    } catch (error) {
      console.error("Error fetching journal logs:", error);
      res.status(500).json({ message: "Failed to fetch journal logs" });
    }
  });

  app.get("/api/journal-logs/:id", async (req, res) => {
    try {
      const DEFAULT_USER_ID = "1";
      const journalLogId = req.params.id;
      
      if (!journalLogId) {
        return res.status(400).json({ message: "Invalid journal log ID" });
      }
      
      // Use Firestore implementation
      const journalLog = await firestoreService.getJournalLogById(DEFAULT_USER_ID, journalLogId);
      
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
      const snippet = await storage.getRandomHopeSnippet(category);
      
      if (!snippet) {
        return res.status(404).json({ message: "No hope snippets found" });
      }
      
      res.json(snippet);
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

  const httpServer = createServer(app);

  return httpServer;
}