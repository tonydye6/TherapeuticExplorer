import { 
  users, 
  messages, 
  researchItems, 
  treatments, 
  savedTrials, 
  documents,
  vectorEmbeddings,
  type User, 
  type InsertUser,
  type UpsertUser,
  type Message,
  type InsertMessage,
  type ResearchItem,
  type InsertResearchItem,
  type Treatment,
  type InsertTreatment,
  type SavedTrial,
  type InsertSavedTrial,
  type Document,
  type InsertDocument,
  type VectorEmbedding,
  type InsertVectorEmbedding
} from "@shared/schema";

// Define the complete storage interface for all entities
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, profileData: Partial<User>): Promise<User>;
  updateUserPreferences(id: string, preferences: any): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Message methods
  getMessages(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Research item methods
  getResearchItems(userId: string): Promise<ResearchItem[]>;
  getResearchItemById(id: number): Promise<ResearchItem | undefined>;
  createResearchItem(item: InsertResearchItem): Promise<ResearchItem>;
  toggleResearchItemFavorite(id: number): Promise<ResearchItem>;
  
  // Treatment methods
  getTreatments(userId: string): Promise<Treatment[]>;
  getTreatmentById(id: number): Promise<Treatment | undefined>;
  createTreatment(treatment: InsertTreatment): Promise<Treatment>;
  updateTreatment(id: number, treatment: Partial<Treatment>): Promise<Treatment>;
  
  // Saved trial methods
  getSavedTrials(userId: string): Promise<SavedTrial[]>;
  getSavedTrialById(id: number): Promise<SavedTrial | undefined>;
  createSavedTrial(trial: InsertSavedTrial): Promise<SavedTrial>;
  
  // Document methods
  getDocuments(userId: string): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocumentParsedContent(id: number, parsedContent: any): Promise<Document>;
  
  // Vector embedding methods
  getVectorEmbedding(id: number): Promise<VectorEmbedding | undefined>;
  createVectorEmbedding(embedding: InsertVectorEmbedding): Promise<VectorEmbedding>;
  getEmbeddingsForResearchItem(researchItemId: number): Promise<VectorEmbedding[]>;
  getEmbeddingsForDocument(documentId: number): Promise<VectorEmbedding[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private researchItems: Map<number, ResearchItem>;
  private treatments: Map<number, Treatment>;
  private savedTrials: Map<number, SavedTrial>;
  private documents: Map<number, Document>;
  
  private userIdCounter: number;
  private messageIdCounter: number;
  private researchItemIdCounter: number;
  private treatmentIdCounter: number;
  private savedTrialIdCounter: number;
  private documentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.researchItems = new Map();
    this.treatments = new Map();
    this.savedTrials = new Map();
    this.documents = new Map();
    
    this.userIdCounter = 1;
    this.messageIdCounter = 1;
    this.researchItemIdCounter = 1;
    this.treatmentIdCounter = 1;
    this.savedTrialIdCounter = 1;
    this.documentIdCounter = 1;
    
    // Initialize with a sample user
    this.createUser({
      username: "mattculligan",
      password: "password123", // In a real app, this would be hashed
      displayName: "Matt Culligan",
      diagnosis: "Esophageal Cancer",
      diagnosisStage: "Stage 4",
      diagnosisDate: new Date("2023-09-15"),
      preferences: {
        emailNotifications: true,
        researchUpdates: true,
        clinicalTrialAlerts: true,
        dataUsage: true
      }
    });
    
    // Add welcome message
    this.createMessage({
      userId: 1,
      content: "Hello Matt, I'm THRIVE - your Therapeutic Health Research Intelligent Virtual Explorer. I'm here to help with your esophageal cancer research journey. You can ask me about treatment options, clinical trials, research from medical literature, information from your cancer books, or help understanding medical terms and concepts. How can I assist you today?",
      role: "assistant",
      sources: null,
      modelUsed: "claude"
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => String(user.id) === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Use provided id if available, otherwise generate a new one
    const id = insertUser.id || String(this.userIdCounter++);
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserProfile(id: string, profileData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { ...user, ...profileData };
    this.users.set(id, updatedUser);
    
    return updatedUser;
  }
  
  async updateUserPreferences(id: string, preferences: any): Promise<User> {
    const user = await this.getUser(id);
    
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      preferences: {
        ...user.preferences,
        ...preferences
      }
    };
    
    this.users.set(id, updatedUser);
    
    return updatedUser;
  }
  
  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(userData.id);
    
    if (existingUser) {
      // Update existing user
      const updatedUser = { 
        ...existingUser,
        ...userData,
        updatedAt: new Date()
      };
      this.users.set(userData.id, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const newUser: User = {
        ...userData,
        displayName: userData.username,
        diagnosis: null,
        diagnosisStage: null,
        diagnosisDate: null,
        address: null,
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.users.set(userData.id, newUser);
      return newUser;
    }
  }
  
  // Message methods
  async getMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const timestamp = new Date();
    
    const message: Message = { 
      ...insertMessage, 
      id,
      timestamp 
    };
    
    this.messages.set(id, message);
    return message;
  }
  
  // Research item methods
  async getResearchItems(userId: number): Promise<ResearchItem[]> {
    return Array.from(this.researchItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });
  }
  
  async getResearchItemById(id: number): Promise<ResearchItem | undefined> {
    return this.researchItems.get(id);
  }
  
  async createResearchItem(insertItem: InsertResearchItem): Promise<ResearchItem> {
    const id = this.researchItemIdCounter++;
    const dateAdded = new Date();
    
    const item: ResearchItem = {
      ...insertItem,
      id,
      dateAdded
    };
    
    this.researchItems.set(id, item);
    return item;
  }
  
  async toggleResearchItemFavorite(id: number): Promise<ResearchItem> {
    const item = await this.getResearchItemById(id);
    
    if (!item) {
      throw new Error(`Research item with ID ${id} not found`);
    }
    
    const updatedItem = { 
      ...item, 
      isFavorite: item.isFavorite === undefined ? true : !item.isFavorite 
    };
    
    this.researchItems.set(id, updatedItem);
    return updatedItem;
  }
  
  // Treatment methods
  async getTreatments(userId: number): Promise<Treatment[]> {
    return Array.from(this.treatments.values())
      .filter(treatment => treatment.userId === userId)
      .sort((a, b) => {
        // Sort by start date (descending)
        if (a.startDate && b.startDate) {
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        }
        return 0;
      });
  }
  
  async getTreatmentById(id: number): Promise<Treatment | undefined> {
    return this.treatments.get(id);
  }
  
  async createTreatment(insertTreatment: InsertTreatment): Promise<Treatment> {
    const id = this.treatmentIdCounter++;
    
    const treatment: Treatment = {
      ...insertTreatment,
      id
    };
    
    this.treatments.set(id, treatment);
    return treatment;
  }
  
  async updateTreatment(id: number, treatmentData: Partial<Treatment>): Promise<Treatment> {
    const treatment = await this.getTreatmentById(id);
    
    if (!treatment) {
      throw new Error(`Treatment with ID ${id} not found`);
    }
    
    const updatedTreatment = { ...treatment, ...treatmentData };
    this.treatments.set(id, updatedTreatment);
    
    return updatedTreatment;
  }
  
  // Saved trial methods
  async getSavedTrials(userId: number): Promise<SavedTrial[]> {
    return Array.from(this.savedTrials.values())
      .filter(trial => trial.userId === userId)
      .sort((a, b) => {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });
  }
  
  async getSavedTrialById(id: number): Promise<SavedTrial | undefined> {
    return this.savedTrials.get(id);
  }
  
  async createSavedTrial(insertTrial: InsertSavedTrial): Promise<SavedTrial> {
    const id = this.savedTrialIdCounter++;
    const dateAdded = new Date();
    
    const trial: SavedTrial = {
      ...insertTrial,
      id,
      dateAdded
    };
    
    this.savedTrials.set(id, trial);
    return trial;
  }
  
  // Document methods
  async getDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.userId === userId)
      .sort((a, b) => {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      });
  }
  
  async getDocumentById(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const dateAdded = new Date();
    
    const document: Document = {
      ...insertDocument,
      id,
      dateAdded
    };
    
    this.documents.set(id, document);
    return document;
  }
  
  async updateDocumentParsedContent(id: number, parsedContent: any): Promise<Document> {
    const document = await this.getDocumentById(id);
    
    if (!document) {
      throw new Error(`Document with ID ${id} not found`);
    }
    
    const updatedDocument = { ...document, parsedContent };
    this.documents.set(id, updatedDocument);
    
    return updatedDocument;
  }

  // Vector embedding methods
  private vectorEmbeddings: Map<number, VectorEmbedding> = new Map();
  private vectorEmbeddingIdCounter: number = 1;

  async getVectorEmbedding(id: number): Promise<VectorEmbedding | undefined> {
    return this.vectorEmbeddings.get(id);
  }

  async createVectorEmbedding(insertEmbedding: InsertVectorEmbedding): Promise<VectorEmbedding> {
    const id = this.vectorEmbeddingIdCounter++;
    
    const embedding: VectorEmbedding = {
      id,
      researchItemId: insertEmbedding.researchItemId,
      documentId: insertEmbedding.documentId || null,
      content: insertEmbedding.content,
      embedding: insertEmbedding.embedding,
      dateAdded: new Date()
    };
    
    this.vectorEmbeddings.set(id, embedding);
    return embedding;
  }

  async getEmbeddingsForResearchItem(researchItemId: number): Promise<VectorEmbedding[]> {
    return Array.from(this.vectorEmbeddings.values())
      .filter(embedding => embedding.researchItemId === researchItemId);
  }

  async getEmbeddingsForDocument(documentId: number): Promise<VectorEmbedding[]> {
    return Array.from(this.vectorEmbeddings.values())
      .filter(embedding => embedding.documentId === documentId);
  }
}

// Import the DatabaseStorage
import { DatabaseStorage } from "./storageDB";

// Use DatabaseStorage for production and MemStorage for development if needed
const useDatabase = process.env.NODE_ENV !== "test";

export const storage = useDatabase ? new DatabaseStorage() : new MemStorage();
