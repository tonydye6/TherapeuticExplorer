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

      // Get all research items for this user
      const userResearchItems = await storage.getResearchItems(userId);
      
      // Create a map for quick lookup of research items by ID
      const researchItemsMap = new Map<number, ResearchItem>();
      userResearchItems.forEach(item => researchItemsMap.set(item.id, item));
      
      // Processing data for similarity calculation
      const embeddingsWithScores: {
        researchItemId: number;
        embedding: number[];
        similarity?: number;
      }[] = [];
      
      // For each research item, get its embeddings
      for (const item of userResearchItems) {
        const embeddings = await storage.getEmbeddingsForResearchItem(item.id);
        
        // Add each embedding to our processing array
        embeddings.forEach(embedding => {
          embeddingsWithScores.push({
            researchItemId: embedding.researchItemId,
            embedding: embedding.embedding as number[]
          });
        });
      }
      
      // Calculate similarity scores
      embeddingsWithScores.forEach(item => {
        item.similarity = this.cosineSimilarity(queryEmbedding, item.embedding);
      });

      // Sort by similarity and get top 5 research item IDs (removing duplicates)
      const sortedItems = embeddingsWithScores
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
      
      // Get unique research item IDs keeping the highest similarity scores
      const seen = new Set<number>();
      const topItems = [];
      
      for (const item of sortedItems) {
        if (!seen.has(item.researchItemId)) {
          seen.add(item.researchItemId);
          topItems.push(item);
          
          if (topItems.length >= 5) break;
        }
      }
      
      // Map IDs back to the full research items
      return topItems
        .map(item => researchItemsMap.get(item.researchItemId))
        .filter((item): item is ResearchItem => !!item);
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