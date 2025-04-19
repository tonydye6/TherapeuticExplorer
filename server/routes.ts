import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiRouter } from "./services/aiRouter";
import { researchService } from "./services/researchService";
import { clinicalTrialService } from "./services/clinicalTrialService";
import { documentService } from "./services/documentService";
import { vectorService } from "./services/vectorService";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { 
  insertMessageSchema, 
  insertResearchItemSchema, 
  insertDocumentSchema,
  insertSavedTrialSchema,
  insertTreatmentSchema
} from "@shared/schema";

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Check if the file type is allowed
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, PNG, TIFF and GIF files are allowed.') as any, false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // Messages Routes
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(1); // Default user ID for now
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        userId: 1, // Default user ID for now
        role: "user"
      });
      
      // Save user message
      const userMessage = await storage.createMessage(messageData);
      
      // Process message with AI router
      const aiResponse = await aiRouter.processQuery(req.body.content);
      
      // Save AI response
      const assistantMessage = await storage.createMessage({
        userId: 1,
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
      const researchItems = await storage.getResearchItems(1); // Default user ID
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
        userId: 1 // Default user ID
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
      const { query, userId = 1 } = req.body;
      
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
      const treatments = await storage.getTreatments(1); // Default user ID
      res.json(treatments);
    } catch (error) {
      console.error("Error fetching treatments:", error);
      res.status(500).json({ message: "Failed to fetch treatments" });
    }
  });
  
  app.post("/api/treatments", async (req, res) => {
    try {
      const treatmentData = insertTreatmentSchema.parse({
        ...req.body,
        userId: 1 // Default user ID
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
      const savedTrials = await storage.getSavedTrials(1); // Default user ID
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
        userId: 1 // Default user ID
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
      const documents = await storage.getDocuments(1); // Default user ID
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  
  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse({
        ...req.body,
        userId: 1 // Default user ID
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
      
      if (!title) {
        return res.status(400).json({ message: "Document title is required" });
      }
      
      // Process the uploaded file with OCR
      const result = await documentService.processMedicalDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      // Save the document in the database
      const document = await storage.createDocument({
        userId: 1, // Default user ID for now
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
          userId: 1,
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
          extractedEntities: result.analysis.entities.length,
        }
      });
    } catch (error) {
      console.error("Error processing uploaded document:", error);
      res.status(500).json({ message: "Failed to process document upload" });
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
      const user = await storage.getUser(1); // Default user ID
      
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
      const { displayName, diagnosis, diagnosisStage, diagnosisDate } = req.body;
      
      const updatedUser = await storage.updateUserProfile(1, {
        displayName,
        diagnosis,
        diagnosisStage,
        diagnosisDate
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
      
      const updatedUser = await storage.updateUserPreferences(1, preferences);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
