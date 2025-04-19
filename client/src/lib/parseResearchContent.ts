import { DeepResearchContent } from "@/components/ResearchTabs";

// Function to extract structured data from the research content
export function parseResearchContent(content: string): DeepResearchContent | null {
  try {
    // Try to find structured content in markdown format
    const sections: Record<string, any> = {
      synthesis: "",
      key_themes: [],
      comparisons: [],
      knowledge_gaps: [],
      sources: []
    };

    // Extract synthesis (usually at the beginning)
    if (!content.startsWith("## ")) {
      const synthesisEnd = content.indexOf("\n\n## ");
      if (synthesisEnd !== -1) {
        sections.synthesis = content.substring(0, synthesisEnd).trim();
      } else {
        // If there are no sections, the entire content is the synthesis
        sections.synthesis = content;
      }
    }

    // Extract key research themes section
    const themesMatch = content.match(/## Key Research Themes\n([\s\S]*?)(?=\n\n##|$)/);
    if (themesMatch && themesMatch[1]) {
      const themesContent = themesMatch[1].trim();
      // Parse numbered list items with structured information
      const themePattern = /(\d+)\.\s+\*\*(.*?)\*\*\n\s+Evidence:(.*?)\n\s+Research quality:(.*?)\n\s+Consensus level:(.*?)(?=\n\n\d+\.|$)/g;
      let themeMatch;
      while ((themeMatch = themePattern.exec(themesContent)) !== null) {
        sections.key_themes.push({
          theme: themeMatch[2].trim(),
          evidence_summary: themeMatch[3].trim(),
          research_quality: themeMatch[4].trim().toLowerCase() as "high" | "medium" | "low",
          consensus_level: themeMatch[5].trim()
        });
      }
    }

    // Extract comparative analysis section
    const comparisonMatch = content.match(/## Comparative Analysis\n([\s\S]*?)(?=\n\n##|$)/);
    if (comparisonMatch && comparisonMatch[1]) {
      const comparisonsContent = comparisonMatch[1].trim();
      // Parse numbered list items with structured comparison information
      const comparisonPattern = /(\d+)\.\s+\*\*(.*?)\*\*\n\s+Approach A:(.*?)\n\s+Approach B:(.*?)\n\s+Analysis:(.*?)(?=\n\n\d+\.|$)/g;
      let compMatch;
      while ((compMatch = comparisonPattern.exec(comparisonsContent)) !== null) {
        sections.comparisons.push({
          aspect: compMatch[2].trim(),
          approach_a: compMatch[3].trim(),
          approach_b: compMatch[4].trim(),
          comparative_analysis: compMatch[5].trim()
        });
      }
    }

    // Extract research gaps section
    const gapsMatch = content.match(/## Research Gaps\n([\s\S]*?)(?=\n\n##|$)/);
    if (gapsMatch && gapsMatch[1]) {
      // Split by list items and clean
      sections.knowledge_gaps = gapsMatch[1]
        .split(/\d+\.\s+/)
        .slice(1) // Remove the first empty element
        .map(gap => gap.trim());
    }

    return sections as DeepResearchContent;
  } catch (error) {
    console.error("Error parsing research content:", error);
    return null;
  }
}