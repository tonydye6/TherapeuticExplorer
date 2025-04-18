import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiRouter } from "./services/aiRouter";
import { researchService } from "./services/researchService";
import { clinicalTrialService } from "./services/clinicalTrialService";
import { documentService } from "./services/documentService";
import { z } from "zod";
import { 
  insertMessageSchema, 
  insertResearchItemSchema, 
  insertDocumentSchema,
  insertSavedTrialSchema,
  insertTreatmentSchema
} from "@shared/schema";

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
      
      const analysis = await documentService.analyzeDocument(content);
      
      // Update document with parsed content
      const document = await storage.updateDocumentParsedContent(documentId, analysis);
      
      res.json(document);
    } catch (error) {
      console.error("Error analyzing document:", error);
      res.status(500).json({ message: "Failed to analyze document" });
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
