import { db } from "../db";
import { vectorEmbeddings, type InsertVectorEmbedding, researchItems } from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import OpenAI from "openai";
import { ResearchItem } from "@shared/schema";
import { storage } from "../storage";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class VectorService {
  /**
   * Calculate the cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error("Vectors must have the same dimensions");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Generate embedding for a text using OpenAI's API
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-large",
        input: text,
        dimensions: 1536,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  /**
   * Store an embedding for a research item
   */
  async storeEmbedding(
    researchItemId: number,
    content: string,
    documentId?: number
  ): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(content);

      const insertData: InsertVectorEmbedding = {
        researchItemId,
        content,
        embedding,
        documentId: documentId || null,
      };

      await storage.createVectorEmbedding(insertData);
    } catch (error) {
      console.error("Error storing embedding:", error);
      throw new Error("Failed to store embedding");
    }
  }

  /**
   * Search for research items similar to the query
   */
  async searchSimilarResearchItems(
    query: string,
    userId: number
  ): Promise<ResearchItem[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // Get all embeddings for the user's research items
      const allEmbeddings = await db
        .select({
          embedding: vectorEmbeddings.embedding,
          researchItemId: vectorEmbeddings.researchItemId,
        })
        .from(vectorEmbeddings)
        .innerJoin(
          researchItems,
          eq(vectorEmbeddings.researchItemId, researchItems.id)
        )
        .where(eq(researchItems.userId, userId));

      // Calculate similarity scores
      const scores = allEmbeddings.map((item) => ({
        researchItemId: item.researchItemId,
        similarity: this.cosineSimilarity(
          queryEmbedding,
          item.embedding as number[]
        ),
      }));

      // Sort by similarity and get top 5 research item IDs
      const topResearchItemIds = scores
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5)
        .map((item) => item.researchItemId);

      if (topResearchItemIds.length === 0) {
        return [];
      }

      // Get the actual research items
      const results = await db
        .select()
        .from(researchItems)
        .where(
          and(
            eq(researchItems.userId, userId),
            // Use in operator for proper SQL syntax
            inArray(researchItems.id, topResearchItemIds)
          )
        );

      return results;
    } catch (error) {
      console.error("Error searching similar research items:", error);
      throw new Error("Failed to search similar research items");
    }
  }

  /**
   * Extract and store embeddings from a research item
   */
  async processResearchItem(researchItem: ResearchItem): Promise<void> {
    try {
      // Store an embedding for the title
      await this.storeEmbedding(
        researchItem.id,
        `Title: ${researchItem.title}`
      );

      // Store an embedding for the content
      // Split content into chunks if it's too long (OpenAI has token limits)
      const contentChunks = this.splitTextIntoChunks(researchItem.content, 1000);

      for (const chunk of contentChunks) {
        await this.storeEmbedding(researchItem.id, chunk);
      }
    } catch (error) {
      console.error("Error processing research item:", error);
      throw new Error("Failed to process research item for embeddings");
    }
  }

  /**
   * Split text into smaller chunks for processing
   */
  private splitTextIntoChunks(text: string, chunkSize: number): string[] {
    const words = text.split(" ");
    const chunks = [];
    
    let currentChunk = "";
    for (const word of words) {
      if ((currentChunk + " " + word).length <= chunkSize) {
        currentChunk += (currentChunk ? " " : "") + word;
      } else {
        chunks.push(currentChunk);
        currentChunk = word;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }
}

export const vectorService = new VectorService();