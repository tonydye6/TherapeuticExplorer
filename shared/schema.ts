import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid, pgEnum, vector, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User profile information
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Changed to varchar for Replit Auth user id
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  displayName: text("display_name"),
  diagnosis: text("diagnosis"),
  diagnosisStage: text("diagnosis_stage"),
  diagnosisDate: timestamp("diagnosis_date"),
  address: text("address"),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  bio: true,
  profileImageUrl: true,
  displayName: true,
  diagnosis: true,
  diagnosisStage: true,
  diagnosisDate: true,
  address: true,
  preferences: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  bio: true,
  profileImageUrl: true,
});

// Chat messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Changed to varchar to match user id
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sources: jsonb("sources"),
  modelUsed: text("model_used"),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  content: true,
  role: true,
  sources: true,
  modelUsed: true,
});

// Saved research items
export const researchItems = pgTable("research_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Changed to varchar to match user id
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceType: text("source_type").notNull(), // 'pubmed', 'book', 'clinical_trial', etc.
  sourceId: text("source_id"),
  sourceName: text("source_name"),
  dateAdded: timestamp("date_added").defaultNow().notNull(),
  tags: jsonb("tags"),
  evidenceLevel: text("evidence_level"), // 'high', 'medium', 'low'
  isFavorite: boolean("is_favorite").default(false).notNull(),
});

export const insertResearchItemSchema = createInsertSchema(researchItems).pick({
  userId: true,
  title: true,
  content: true,
  sourceType: true,
  sourceId: true,
  sourceName: true,
  tags: true,
  evidenceLevel: true,
  isFavorite: true,
});

// Treatments
export const treatments = pgTable("treatments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Changed to varchar to match user id
  name: text("name").notNull(),
  type: text("type").notNull(), // 'drug', 'radiation', 'surgical', etc.
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  sideEffects: jsonb("side_effects"),
  effectiveness: jsonb("effectiveness"),
  active: boolean("active").default(true).notNull(),
});

export const insertTreatmentSchema = createInsertSchema(treatments).pick({
  userId: true,
  name: true,
  type: true,
  startDate: true,
  endDate: true,
  notes: true,
  sideEffects: true,
  effectiveness: true,
  active: true,
});

// Clinical trials
export const savedTrials = pgTable("saved_trials", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Changed to varchar to match user id
  trialId: text("trial_id").notNull(), // NCT number
  title: text("title").notNull(),
  phase: text("phase"),
  status: text("status"),
  locations: jsonb("locations"),
  matchScore: integer("match_score"),
  dateAdded: timestamp("date_added").defaultNow().notNull(),
  notes: text("notes"),
});

export const insertSavedTrialSchema = createInsertSchema(savedTrials).pick({
  userId: true,
  trialId: true,
  title: true,
  phase: true,
  status: true,
  locations: true,
  matchScore: true,
  notes: true,
});

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Changed to varchar to match user id
  title: text("title").notNull(),
  type: text("type").notNull(), // 'lab_report', 'imaging', 'notes', 'book'
  content: text("content"),
  parsedContent: jsonb("parsed_content"),
  dateAdded: timestamp("date_added").defaultNow().notNull(),
  sourceDate: timestamp("source_date"),
  tags: jsonb("tags"),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  title: true,
  type: true,
  content: true,
  parsedContent: true,
  sourceDate: true,
  tags: true,
});

// Define table relations
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  researchItems: many(researchItems),
  treatments: many(treatments),
  savedTrials: many(savedTrials),
  documents: many(documents),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const researchItemsRelations = relations(researchItems, ({ one }) => ({
  user: one(users, {
    fields: [researchItems.userId],
    references: [users.id],
  }),
}));

export const treatmentsRelations = relations(treatments, ({ one }) => ({
  user: one(users, {
    fields: [treatments.userId],
    references: [users.id],
  }),
}));

export const savedTrialsRelations = relations(savedTrials, ({ one }) => ({
  user: one(users, {
    fields: [savedTrials.userId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
}));

// Define types for easy use in application
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type ResearchItem = typeof researchItems.$inferSelect;
export type InsertResearchItem = z.infer<typeof insertResearchItemSchema>;

export type Treatment = typeof treatments.$inferSelect;
export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;

export type SavedTrial = typeof savedTrials.$inferSelect;
export type InsertSavedTrial = z.infer<typeof insertSavedTrialSchema>;

// Vector embeddings for semantic search (using jsonb instead of vector type for compatibility)
export const vectorEmbeddings = pgTable("vector_embeddings", {
  id: serial("id").primaryKey(),
  researchItemId: integer("research_item_id").notNull(),
  documentId: integer("document_id"),
  embedding: jsonb("embedding").notNull(), // Store vector as a JSON array
  content: text("content").notNull(),
  dateAdded: timestamp("date_added").defaultNow().notNull(),
});

export const insertVectorEmbeddingSchema = createInsertSchema(vectorEmbeddings).pick({
  researchItemId: true,
  documentId: true,
  embedding: true,
  content: true,
});

export const vectorEmbeddingsRelations = relations(vectorEmbeddings, ({ one }) => ({
  researchItem: one(researchItems, {
    fields: [vectorEmbeddings.researchItemId],
    references: [researchItems.id],
  }),
  document: one(documents, {
    fields: [vectorEmbeddings.documentId],
    references: [documents.id],
  }),
}));

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type VectorEmbedding = typeof vectorEmbeddings.$inferSelect;
export type InsertVectorEmbedding = z.infer<typeof insertVectorEmbeddingSchema>;

// Non-traditional treatments
export const alternativeTreatments = pgTable("alternative_treatments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Changed to varchar to match user id
  name: text("name").notNull(),
  category: text("category").notNull(), // 'nutritional', 'supplement', 'mind-body', 'traditional-medicine', 'other'
  description: text("description").notNull(),
  background: text("background"),
  traditionalUsage: text("traditional_usage"),
  mechanismOfAction: text("mechanism_of_action"),
  scientificEvidence: jsonb("scientific_evidence"), // Store evidence levels and sources
  cancerSpecificEvidence: text("cancer_specific_evidence"),
  safetyProfile: text("safety_profile"),
  contraindications: text("contraindications"),
  interactions: jsonb("interactions"), // Store potential interactions with conventional treatments
  practitionerRequirements: text("practitioner_requirements"),
  recommendedBy: text("recommended_by"), // Cancer centers or institutions that endorse this approach
  patientExperiences: jsonb("patient_experiences"), // Anecdotal reports
  evidenceRating: text("evidence_rating"), // 'strong', 'moderate', 'limited', 'inconclusive', 'conflicting'
  safetyRating: text("safety_rating"), // 'high', 'moderate', 'low', 'caution'
  dateAdded: timestamp("date_added").defaultNow().notNull(),
  tags: jsonb("tags"),
  sources: jsonb("sources"), // References and sources of information
  isFavorite: boolean("is_favorite").default(false).notNull(),
});

export const insertAlternativeTreatmentSchema = createInsertSchema(alternativeTreatments).pick({
  userId: true,
  name: true,
  category: true,
  description: true,
  background: true,
  traditionalUsage: true,
  mechanismOfAction: true,
  scientificEvidence: true,
  cancerSpecificEvidence: true,
  safetyProfile: true,
  contraindications: true,
  interactions: true,
  practitionerRequirements: true,
  recommendedBy: true,
  patientExperiences: true,
  evidenceRating: true,
  safetyRating: true,
  tags: true,
  sources: true,
  isFavorite: true,
});

// Define relations for alternativeTreatments
export const alternativeTreatmentsRelations = relations(alternativeTreatments, ({ one }) => ({
  user: one(users, {
    fields: [alternativeTreatments.userId],
    references: [users.id],
  }),
}));

// Define types for alternativeTreatments
export type AlternativeTreatment = typeof alternativeTreatments.$inferSelect;
export type InsertAlternativeTreatment = z.infer<typeof insertAlternativeTreatmentSchema>;

// AI model types
export enum ModelType {
  CLAUDE = "claude",
  GPT = "gpt",
  GEMINI = "gemini",
  BIOBERT = "biobert",
}

// Query types for routing to appropriate models
export enum QueryType {
  TREATMENT = "treatment",
  CLINICAL_TRIAL = "clinical_trial",
  RESEARCH = "research",
  MEDICAL_TERM = "medical_term",
  GENERAL = "general",
}
