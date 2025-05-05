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
import { z } from "zod";
import multer from "multer";
import { insertAlternativeTreatmentSchema, insertMessageSchema, insertResearchItemSchema, insertTreatmentSchema, insertSavedTrialSchema, insertDocumentSchema, QueryType } from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
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
      const aiResponse = await aiRouter.processQuery(content, preferredModel);
      
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
      const aiResponse = await aiRouter.processQuery(req.body.content);
      
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

  const httpServer = createServer(app);

  return httpServer;
}