import { 
  users, documents, messages, researchItems, 
  savedTrials, treatments, vectorEmbeddings, alternativeTreatments,
  hopeSnippets, planItems, journalLogs, dietLogs,
  User, InsertUser, UpsertUser, Message, InsertMessage,
  ResearchItem, InsertResearchItem, Treatment, InsertTreatment,
  SavedTrial, InsertSavedTrial, Document, InsertDocument,
  VectorEmbedding, InsertVectorEmbedding, AlternativeTreatment, InsertAlternativeTreatment,
  HopeSnippet, InsertHopeSnippet, PlanItem, InsertPlanItem,
  JournalLog, InsertJournalLog, DietLog, InsertDietLog
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserProfile(id: string, profileData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(profileData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserPreferences(id: string, preferences: any): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ preferences })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date()
        }
      })
      .returning();
    return user;
  }

  // Message methods
  async getMessages(userId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(messages.timestamp);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Research item methods
  async getResearchItems(userId: string): Promise<ResearchItem[]> {
    return db
      .select()
      .from(researchItems)
      .where(eq(researchItems.userId, userId))
      .orderBy(researchItems.dateAdded);
  }

  async getResearchItemById(id: number): Promise<ResearchItem | undefined> {
    const [item] = await db
      .select()
      .from(researchItems)
      .where(eq(researchItems.id, id));
    return item;
  }

  async createResearchItem(insertItem: InsertResearchItem): Promise<ResearchItem> {
    const [item] = await db
      .insert(researchItems)
      .values(insertItem)
      .returning();
    return item;
  }
  
  async toggleResearchItemFavorite(id: number): Promise<ResearchItem> {
    // Get the current research item to check its favorite status
    const item = await this.getResearchItemById(id);
    
    if (!item) {
      throw new Error(`Research item with ID ${id} not found`);
    }
    
    // Toggle the favorite status
    const newFavoriteStatus = !item.isFavorite;
    
    // Update the research item in the database
    const [updatedItem] = await db
      .update(researchItems)
      .set({ isFavorite: newFavoriteStatus })
      .where(eq(researchItems.id, id))
      .returning();
      
    return updatedItem;
  }

  // Treatment methods
  async getTreatments(userId: string): Promise<Treatment[]> {
    return db
      .select()
      .from(treatments)
      .where(eq(treatments.userId, userId));
  }

  async getTreatmentById(id: number): Promise<Treatment | undefined> {
    const [treatment] = await db
      .select()
      .from(treatments)
      .where(eq(treatments.id, id));
    return treatment;
  }

  async createTreatment(insertTreatment: InsertTreatment): Promise<Treatment> {
    const [treatment] = await db
      .insert(treatments)
      .values(insertTreatment)
      .returning();
    return treatment;
  }

  async updateTreatment(id: number, treatmentData: Partial<Treatment>): Promise<Treatment> {
    const [updatedTreatment] = await db
      .update(treatments)
      .set(treatmentData)
      .where(eq(treatments.id, id))
      .returning();
    return updatedTreatment;
  }

  // Saved trial methods
  async getSavedTrials(userId: string): Promise<SavedTrial[]> {
    return db
      .select()
      .from(savedTrials)
      .where(eq(savedTrials.userId, userId))
      .orderBy(savedTrials.dateAdded);
  }

  async getSavedTrialById(id: number): Promise<SavedTrial | undefined> {
    const [trial] = await db
      .select()
      .from(savedTrials)
      .where(eq(savedTrials.id, id));
    return trial;
  }

  async createSavedTrial(insertTrial: InsertSavedTrial): Promise<SavedTrial> {
    const [trial] = await db
      .insert(savedTrials)
      .values(insertTrial)
      .returning();
    return trial;
  }

  // Document methods
  async getDocuments(userId: string): Promise<Document[]> {
    return db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(documents.dateAdded);
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return document;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async updateDocumentParsedContent(id: number, parsedContent: any): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ parsedContent })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  // Vector embedding methods
  async getVectorEmbedding(id: number): Promise<VectorEmbedding | undefined> {
    const [embedding] = await db
      .select()
      .from(vectorEmbeddings)
      .where(eq(vectorEmbeddings.id, id));
    return embedding;
  }

  async createVectorEmbedding(insertEmbedding: InsertVectorEmbedding): Promise<VectorEmbedding> {
    const [embedding] = await db
      .insert(vectorEmbeddings)
      .values(insertEmbedding)
      .returning();
    return embedding;
  }

  async getEmbeddingsForResearchItem(researchItemId: number): Promise<VectorEmbedding[]> {
    return db
      .select()
      .from(vectorEmbeddings)
      .where(eq(vectorEmbeddings.researchItemId, researchItemId));
  }

  async getEmbeddingsForDocument(documentId: number): Promise<VectorEmbedding[]> {
    return db
      .select()
      .from(vectorEmbeddings)
      .where(eq(vectorEmbeddings.documentId, documentId));
  }

  // Alternative treatment methods
  async getAlternativeTreatments(userId: string): Promise<AlternativeTreatment[]> {
    return db
      .select()
      .from(alternativeTreatments)
      .where(eq(alternativeTreatments.userId, userId))
      .orderBy(alternativeTreatments.dateAdded);
  }

  async getAlternativeTreatmentById(id: number): Promise<AlternativeTreatment | undefined> {
    const [treatment] = await db
      .select()
      .from(alternativeTreatments)
      .where(eq(alternativeTreatments.id, id));
    return treatment;
  }

  async createAlternativeTreatment(insertTreatment: InsertAlternativeTreatment): Promise<AlternativeTreatment> {
    const [treatment] = await db
      .insert(alternativeTreatments)
      .values(insertTreatment)
      .returning();
    return treatment;
  }

  async toggleAlternativeTreatmentFavorite(id: number): Promise<AlternativeTreatment> {
    // Get the current treatment to check its favorite status
    const treatment = await this.getAlternativeTreatmentById(id);
    
    if (!treatment) {
      throw new Error(`Alternative treatment with ID ${id} not found`);
    }
    
    // Toggle the favorite status
    const newFavoriteStatus = !treatment.isFavorite;
    
    // Update the treatment in the database
    const [updatedTreatment] = await db
      .update(alternativeTreatments)
      .set({ isFavorite: newFavoriteStatus })
      .where(eq(alternativeTreatments.id, id))
      .returning();
      
    return updatedTreatment;
  }

  // Hope snippet methods
  async getHopeSnippets(): Promise<HopeSnippet[]> {
    return db
      .select()
      .from(hopeSnippets)
      .where(eq(hopeSnippets.isActive, true))
      .orderBy(hopeSnippets.createdAt, { direction: 'desc' });
  }

  async getRandomHopeSnippet(category?: string): Promise<HopeSnippet | undefined> {
    const query = db
      .select()
      .from(hopeSnippets)
      .where(eq(hopeSnippets.isActive, true));
      
    if (category) {
      query.where(eq(hopeSnippets.category, category));
    }
      
    const snippets = await query;
    
    if (snippets.length === 0) {
      return undefined;
    }
    
    // Get a random snippet
    const randomIndex = Math.floor(Math.random() * snippets.length);
    return snippets[randomIndex];
  }
  
  async getHopeSnippetById(id: number): Promise<HopeSnippet | undefined> {
    const [snippet] = await db
      .select()
      .from(hopeSnippets)
      .where(eq(hopeSnippets.id, id));
    return snippet;
  }
  
  async createHopeSnippet(insertSnippet: InsertHopeSnippet): Promise<HopeSnippet> {
    const [snippet] = await db
      .insert(hopeSnippets)
      .values(insertSnippet)
      .returning();
    return snippet;
  }
  
  async updateHopeSnippet(id: number, snippetData: Partial<HopeSnippet>): Promise<HopeSnippet> {
    const [updatedSnippet] = await db
      .update(hopeSnippets)
      .set(snippetData)
      .where(eq(hopeSnippets.id, id))
      .returning();
    
    if (!updatedSnippet) {
      throw new Error(`Hope snippet with ID ${id} not found`);
    }
    
    return updatedSnippet;
  }
  
  async deleteHopeSnippet(id: number): Promise<void> {
    const result = await db
      .delete(hopeSnippets)
      .where(eq(hopeSnippets.id, id));
    
    if (!result) {
      throw new Error(`Hope snippet with ID ${id} not found`);
    }
  }

  // Journal log methods
  async getJournalLogs(userId: string): Promise<JournalLog[]> {
    return db
      .select()
      .from(journalLogs)
      .where(eq(journalLogs.userId, userId))
      .orderBy(journalLogs.entryDate, { direction: 'desc' });
  }

  async getJournalLogById(id: number): Promise<JournalLog | undefined> {
    const [log] = await db
      .select()
      .from(journalLogs)
      .where(eq(journalLogs.id, id));
    return log;
  }

  async createJournalLog(insertLog: InsertJournalLog): Promise<JournalLog> {
    const [log] = await db
      .insert(journalLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async updateJournalLog(id: number, logData: Partial<JournalLog>): Promise<JournalLog> {
    const [updatedLog] = await db
      .update(journalLogs)
      .set(logData)
      .where(eq(journalLogs.id, id))
      .returning();
    
    if (!updatedLog) {
      throw new Error(`Journal log with ID ${id} not found`);
    }
    
    return updatedLog;
  }

  async deleteJournalLog(id: number): Promise<void> {
    const result = await db
      .delete(journalLogs)
      .where(eq(journalLogs.id, id));
    
    if (!result) {
      throw new Error(`Journal log with ID ${id} not found`);
    }
  }

  // Diet log methods
  async getDietLogs(userId: string): Promise<DietLog[]> {
    return db
      .select()
      .from(dietLogs)
      .where(eq(dietLogs.userId, userId))
      .orderBy(dietLogs.mealDate, { direction: 'desc' });
  }

  async getDietLogById(id: number): Promise<DietLog | undefined> {
    const [log] = await db
      .select()
      .from(dietLogs)
      .where(eq(dietLogs.id, id));
    return log;
  }

  async createDietLog(insertLog: InsertDietLog): Promise<DietLog> {
    const [log] = await db
      .insert(dietLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async updateDietLog(id: number, logData: Partial<DietLog>): Promise<DietLog> {
    const [updatedLog] = await db
      .update(dietLogs)
      .set(logData)
      .where(eq(dietLogs.id, id))
      .returning();
    
    if (!updatedLog) {
      throw new Error(`Diet log with ID ${id} not found`);
    }
    
    return updatedLog;
  }

  async deleteDietLog(id: number): Promise<void> {
    const result = await db
      .delete(dietLogs)
      .where(eq(dietLogs.id, id));
    
    if (!result) {
      throw new Error(`Diet log with ID ${id} not found`);
    }
  }
}