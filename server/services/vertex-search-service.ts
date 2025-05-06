/**
 * Vertex AI Search Service
 * 
 * This service handles interactions with Google's Vertex AI Search API for retrieving
 * grounded answers from documents based on user queries. It integrates with the RAG
 * (Retrieval Augmented Generation) approach to provide more accurate and source-backed
 * responses to user questions.
 */

// Import necessary Google Cloud libraries for Vertex AI Search
import { SearchServiceClient } from '@google-cloud/discoveryengine';
import { Source } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';

// Define response type for grounded search results
interface GroundedSearchResult {
  summary: string;
  sources: Source[];
  metadata: any;
}

/**
 * Service class for managing Vertex AI Search operations
 */
class VertexSearchService {
  private client: SearchServiceClient | null = null;
  private projectId: string;
  private locationId: string;
  private dataStoreId: string;
  private initialized: boolean = false;
  
  constructor() {
    // Get configuration from environment variables
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
    this.locationId = process.env.GOOGLE_CLOUD_LOCATION || 'global';
    this.dataStoreId = process.env.VERTEX_DATASTORE_ID || '';
    
    // Initialize the client if credentials are available
    this.initClient();
  }
  
  /**
   * Initialize the Discovery Engine client
   */
  private initClient(): void {
    try {
      // Only initialize if necessary credentials are available
      if (!this.projectId || !this.dataStoreId) {
        console.warn('Vertex AI Search not configured: Missing project ID or data store ID');
        return;
      }
      
      this.client = new SearchServiceClient();
      this.initialized = true;
      console.log('Vertex AI Search client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Vertex AI Search client:', error);
      this.client = null;
    }
  }
  
  /**
   * Search for documents and retrieve grounded answers
   * @param userId User ID to filter documents by
   * @param query User's query/question
   * @returns Grounded search result with summary and sources
   */
  async searchGroundedAnswer(userId: string, query: string): Promise<GroundedSearchResult> {
    // Check if the service is properly initialized
    if (!this.initialized || !this.client) {
      throw new Error('Vertex AI Search service not properly initialized');
    }
    
    try {
      // Construct the location path
      const locationPath = this.client.projectLocationPath(
        this.projectId, 
        this.locationId
      );
      
      // Construct the data store path
      const dataStorePath = `${locationPath}/dataStores/${this.dataStoreId}`;
      
      // Build the search request
      const request = {
        dataStore: dataStorePath,
        query: query,
        filter: `userId = "${userId}"`, // Filter by user ID to ensure privacy
        queryExpansionSpec: {
          condition: 'AUTO',
        },
        contentSearchSpec: {
          snippetSpec: {
            returnSnippet: true,
            maxSnippetCount: 5,
          },
          summarySpec: {
            summaryResultCount: 1,
            includeCitations: true,
          },
        },
      };
      
      // Execute the search
      const [response] = await this.client.search(request);
      
      // Process the results
      let summary = '';
      const sources: Source[] = [];
      const metadata: any = {};
      
      // Check if we have search results
      if (response && response.results && response.results.length > 0) {
        // If summary is available, use it
        if (response.summary && response.summary.summaryText) {
          summary = response.summary.summaryText;
          
          // Process citations if available
          if (response.summary.citationMetadata && response.summary.citationMetadata.citations) {
            response.summary.citationMetadata.citations.forEach((citation: any) => {
              if (citation.startIndex && citation.endIndex) {
                const citedText = summary.substring(citation.startIndex, citation.endIndex);
                
                sources.push({
                  id: `vertex-${uuidv4().substring(0, 8)}`,
                  title: citation.title || 'Document section',
                  type: 'document',
                  confidence: 0.9,
                  description: citedText,
                  url: citation.uri,
                });
              }
            });
          }
        } else {
          // If no summary, use snippets from results
          const snippets: string[] = [];
          
          response.results.forEach((result: any) => {
            if (result.document && result.document.derivedStructData) {
              try {
                const documentData = JSON.parse(result.document.derivedStructData.toString());
                
                // Add document as a source
                sources.push({
                  id: `vertex-${uuidv4().substring(0, 8)}`,
                  title: documentData.title || 'Document',
                  type: 'document',
                  confidence: 0.8,
                  description: documentData.description || 'Retrieved from your documents',
                  url: documentData.link,
                });
                
                // Add snippets from document matches
                if (result.document.structData) {
                  const structData = JSON.parse(result.document.structData.toString());
                  if (structData.content) {
                    snippets.push(structData.content);
                  }
                }
              } catch (error) {
                console.error('Error parsing document data:', error);
              }
            }
            
            // Add any snippets from the result
            if (result.snippets) {
              result.snippets.forEach((snippet: any) => {
                if (snippet.snippet) {
                  snippets.push(snippet.snippet);
                }
              });
            }
          });
          
          // Combine snippets into a summary if we have no proper summary
          if (snippets.length > 0 && !summary) {
            summary = snippets.join('\n\n');
          }
        }
        
        // Add metadata about the search
        metadata.totalResults = response.totalSize || 0;
        metadata.searchTime = response.searchHit?.process_time || 0;
      } else {
        // No results found
        summary = 'No relevant information found in your documents for this query.';
      }
      
      return {
        summary,
        sources,
        metadata
      };
    } catch (error) {
      console.error('Error searching Vertex AI Search:', error);
      throw new Error(`Vertex AI Search failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Upload a document to Vertex AI Search
   * @param userId User ID to associate with the document
   * @param documentContent The content of the document
   * @param metadata Additional metadata for the document
   * @returns Document ID if successful
   */
  async uploadDocument(userId: string, documentContent: string, metadata: any): Promise<string> {
    // Check if the service is properly initialized
    if (!this.initialized || !this.client) {
      throw new Error('Vertex AI Search service not properly initialized');
    }
    
    try {
      // Construct the location path
      const locationPath = this.client.projectLocationPath(
        this.projectId, 
        this.locationId
      );
      
      // Construct the data store path
      const dataStorePath = `${locationPath}/dataStores/${this.dataStoreId}`;
      
      // Generate a unique document ID
      const documentId = `doc-${userId}-${uuidv4()}`;
      
      // Create structured data for the document
      const structuredData = {
        id: documentId,
        userId: userId, // Important for filtering by user
        title: metadata.title || 'Untitled Document',
        content: documentContent,
        type: metadata.type || 'medical_document',
        dateAdded: metadata.dateAdded?.toISOString() || new Date().toISOString(),
        sourceDate: metadata.sourceDate?.toISOString() || null,
        sourceType: metadata.sourceType || 'upload',
        documentTypeInfo: metadata.documentTypeInfo || {},
        // Add any additional metadata that might be useful for search
        tags: metadata.tags || [],
        fileType: metadata.fileType || 'text',
      };
      
      // Create the Vertex AI document
      const document = {
        id: documentId,
        structData: JSON.stringify(structuredData),
        // For improved performance, we can also add schema-specific fields
        schema: 'sophera_medical_document',
      };
      
      // Build the import document request
      const request = {
        parent: dataStorePath,
        documentId: documentId,
        document: document,
      };
      
      // Create document in Vertex AI Search data store
      await this.client.createDocument(request);
      
      console.log(`Document successfully uploaded to Vertex AI Search with ID: ${documentId}`);
      return documentId;
    } catch (error) {
      console.error('Error uploading document to Vertex AI Search:', error);
      throw new Error(`Document upload failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get a document by ID from Vertex AI Search
   * @param documentId The Vertex AI document ID
   * @returns Document data or null if not found
   */
  async getDocumentById(documentId: string): Promise<any | null> {
    // Check if the service is properly initialized
    if (!this.initialized || !this.client) {
      throw new Error('Vertex AI Search service not properly initialized');
    }
    
    try {
      // Construct the location path
      const locationPath = this.client.projectLocationPath(
        this.projectId, 
        this.locationId
      );
      
      const dataStorePath = `${locationPath}/dataStores/${this.dataStoreId}`;
      const documentPath = `${dataStorePath}/documents/${documentId}`;
      
      // Build the get document request
      const getRequest = {
        name: documentPath
      };
      
      // Get the document from Vertex AI Search
      const [document] = await this.client.getDocument(getRequest);
      
      if (!document || !document.structData) {
        return null;
      }
      
      // Parse the structured data
      try {
        const structData = JSON.parse(document.structData);
        return {
          id: documentId,
          title: structData.title || "Unnamed Document",
          content: structData.content || "",
          type: structData.type || "unknown",
          metadata: {
            dateAdded: structData.dateAdded || null,
            sourceDate: structData.sourceDate || null,
            fileType: structData.fileType || "unknown",
            documentTypeInfo: structData.documentTypeInfo || {}
          },
          userId: structData.userId || ""
        };
      } catch (parseError) {
        console.error("Error parsing document structured data:", parseError);
        return null;
      }
    } catch (error) {
      console.error('Error getting document from Vertex AI Search:', error);
      throw new Error(`Failed to get document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export a singleton instance of the service
export const vertexSearchService = new VertexSearchService();
