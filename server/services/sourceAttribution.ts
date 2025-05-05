import { Source } from '@shared/schema';
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing source attribution in AI responses
 */
export class SourceAttributionService {
  /**
   * Extracts sources from AI-generated content
   * @param content The AI-generated content to analyze
   * @param userId The user ID for context
   * @returns Array of identified sources
   */
  async extractSourcesFromContent(content: string, userId: string): Promise<Source[]> {
    // For now, use a simple regex-based approach to find citations
    // In a more advanced implementation, this would use NLP or a specialized model
    const sources: Source[] = [];
    
    // Get existing research items for this user to check for matches
    const userResearchItems = await storage.getResearchItems(userId);
    
    // Simple pattern matching for citation markers
    const citationPatterns = [
      /\[([^\]]+)\]/g, // Matches [1], [Smith et al.], etc.
      /\(([^\)]+\d{4}[^\)]*)\)/g, // Matches (Smith et al., 2020), etc.
      /(According to|based on|research by|study by|Source:)\s+([^,.]+)/gi // Narrative citations
    ];
    
    let allMatches: string[] = [];
    
    // Collect all potential citations
    citationPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        allMatches = [...allMatches, ...matches];
      }
    });
    
    // Deduplicate matches
    const uniqueMatches = [...new Set(allMatches)];
    
    // For each potential citation, try to match with research items or create a placeholder
    for (const match of uniqueMatches) {
      // Check if this matches any research items
      const matchedItem = userResearchItems.find(item => {
        // Check for direct title match or if author names are included
        const titleMatch = item.title && match.includes(item.title);
        const authorMatch = item.sourceName && match.includes(item.sourceName);
        return titleMatch || authorMatch;
      });
      
      if (matchedItem) {
        // We found a matching research item in the user's collection
        sources.push({
          id: `research-${matchedItem.id}`,
          title: matchedItem.title,
          type: matchedItem.sourceType,
          url: matchedItem.sourceId && matchedItem.sourceType === 'pubmed' 
               ? `https://pubmed.ncbi.nlm.nih.gov/${matchedItem.sourceId}/` 
               : undefined,
          confidence: 0.95, // High confidence for matched items
          description: matchedItem.content.substring(0, 120) + '...',
          citationFormat: this.generateCitationFormats(matchedItem)
        });
      } else {
        // Create a placeholder source since we can't match to known items
        // In a real implementation, this would trigger a lookup to an external database
        sources.push({
          id: `citation-${uuidv4().substring(0, 8)}`,
          title: match.replace(/[\[\]\(\)]/g, '').trim(),
          type: 'reference',
          confidence: 0.6, // Lower confidence for unmatched citations
          description: 'Referenced in response'
        });
      }
    }
    
    // Return the identified sources
    return sources;
  }
  
  /**
   * Processes an AI response to extract and enhance source information
   * @param response The AI response text to process
   * @param userId The user ID for context
   * @returns The processed response text and extracted sources
   */
  async processResponseWithSources(response: string, userId: string): Promise<{
    processedText: string;
    sources: Source[];
  }> {
    // Extract sources from the response
    const extractedSources = await this.extractSourcesFromContent(response, userId);
    
    // Append a formatted sources section if sources were found
    let processedText = response;
    if (extractedSources.length > 0) {
      // Check if the response already has a sources section
      if (!response.includes('Sources:') && !response.includes('References:')) {
        // Add a formatted sources section
        processedText += '\n\nSources:\n';
        extractedSources.forEach((source, index) => {
          processedText += `${index + 1}. ${source.title}${source.url ? ` - ${source.url}` : ''}\n`;
        });
      }
    }
    
    return {
      processedText,
      sources: extractedSources
    };
  }
  
  /**
   * Generates formatted citations for a research item
   * @param item The research item to format citations for
   * @returns Object with formatted citations in different styles
   */
  private generateCitationFormats(item: any): { apa?: string; mla?: string; chicago?: string } {
    const citations: { apa?: string; mla?: string; chicago?: string } = {};
    
    // Only proceed if we have enough information
    if (!item.title) return citations;
    
    // Extract author information
    const authors = item.sourceName || 'Unknown';
    const year = this.extractYearFromDate(item.dateAdded) || 'n.d.';
    const title = item.title;
    
    // Generate APA style citation
    citations.apa = `${authors}. (${year}). ${title}.`;
    
    // Generate MLA style citation
    citations.mla = `${authors}. "${title}." ${year}.`;
    
    // Generate Chicago style citation
    citations.chicago = `${authors}. ${year}. "${title}."`;
    
    return citations;
  }
  
  /**
   * Extracts just the year from a date string
   * @param dateString The date string to extract year from
   * @returns The extracted year or undefined
   */
  private extractYearFromDate(dateString?: string | Date): string | undefined {
    if (!dateString) return undefined;
    
    try {
      const date = new Date(dateString);
      return date.getFullYear().toString();
    } catch (error) {
      console.error('Error extracting year from date:', error);
      return undefined;
    }
  }
}

// Singleton instance for use throughout the application
export const sourceAttributionService = new SourceAttributionService();