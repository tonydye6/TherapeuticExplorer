import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid, pgEnum, vector } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User profile information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  diagnosis: text("diagnosis"),
  diagnosisStage: text("diagnosis_stage"),
  diagnosisDate: timestamp("diagnosis_date"),
  preferences: jsonb("preferences"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  diagnosis: true,
  diagnosisStage: true,
  diagnosisDate: true,
  preferences: true,
});

// Chat messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
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
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sourceType: text("source_type").notNull(), // 'pubmed', 'book', 'clinical_trial', etc.
  sourceId: text("source_id"),
  sourceName: text("source_name"),
  dateAdded: timestamp("date_added").defaultNow().notNull(),
  tags: jsonb("tags"),
  evidenceLevel: text("evidence_level"), // 'high', 'medium', 'low'
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
});

// Treatments
export const treatments = pgTable("treatments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
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
  userId: integer("user_id").notNull(),
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
  userId: integer("user_id").notNull(),
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
