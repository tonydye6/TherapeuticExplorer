import { DeepResearchContent } from "@/components/ResearchTabs";

// Function to extract structured data from the research content
export function parseResearchContent(content: string): DeepResearchContent | null {
  try {
    // Create initial structure
    const structured: DeepResearchContent = {
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
        structured.synthesis = content.substring(0, synthesisEnd).trim();
      } else {
        // If there are no sections, the entire content is the synthesis
        structured.synthesis = content;
      }
    }

    // Define section patterns
    const headerPattern = /## ([^\n]+)/g;
    let match;
    let currentSection = "";
    let sectionContent = "";
    let lastIndex = 0;

    // Find all section headers and extract their content
    while ((match = headerPattern.exec(content)) !== null) {
      const sectionTitle = match[1].trim();
      const sectionStart = match.index;
      
      // If we have a previous section, save its content
      if (currentSection) {
        sectionContent = content.substring(lastIndex, sectionStart).trim();
        processSection(currentSection, sectionContent, structured);
      }
      
      currentSection = sectionTitle;
      lastIndex = sectionStart + match[0].length;
    }
    
    // Process the last section
    if (currentSection) {
      sectionContent = content.substring(lastIndex).trim();
      processSection(currentSection, sectionContent, structured);
    }

    return structured;
  } catch (error) {
    console.error("Error parsing research content:", error);
    return null;
  }
}

// Helper function to process a section's content based on its title
function processSection(title: string, content: string, structured: DeepResearchContent) {
  switch (title) {
    case "Key Research Themes":
      processThemeSection(content, structured);
      break;
    case "Comparative Analysis":
      processComparisonSection(content, structured);
      break;
    case "Research Gaps":
      processGapsSection(content, structured);
      break;
    case "Sources":
      processSourcesSection(content, structured);
      break;
  }
}

// Process the Key Research Themes section
function processThemeSection(content: string, structured: DeepResearchContent) {
  // Split by numbered items (1., 2., etc.)
  const themeItems = content.split(/\d+\.\s+/).filter(item => item.trim().length > 0);
  
  // Ensure key_themes array exists
  if (!structured.key_themes) {
    structured.key_themes = [];
  }
  
  for (const item of themeItems) {
    const themeLines = item.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (themeLines.length >= 3) {
      // Extract theme name (may be wrapped in ** for markdown bold)
      let themeName = themeLines[0].replace(/\*\*/g, '').trim();
      
      // Extract other properties from subsequent lines
      let evidenceSummary = "";
      let researchQuality: "high" | "medium" | "low" = "medium";
      let consensusLevel = "";
      
      for (const line of themeLines.slice(1)) {
        if (line.toLowerCase().startsWith("evidence:")) {
          evidenceSummary = line.substring(9).trim();
        } else if (line.toLowerCase().startsWith("research quality:")) {
          const quality = line.substring(17).trim().toLowerCase();
          if (quality === "high" || quality === "medium" || quality === "low") {
            researchQuality = quality as "high" | "medium" | "low";
          }
        } else if (line.toLowerCase().startsWith("consensus level:")) {
          consensusLevel = line.substring(16).trim();
        }
      }
      
      structured.key_themes.push({
        theme: themeName,
        evidence_summary: evidenceSummary,
        research_quality: researchQuality,
        consensus_level: consensusLevel
      });
    }
  }
}

// Process the Comparative Analysis section
function processComparisonSection(content: string, structured: DeepResearchContent) {
  // Split by numbered items (1., 2., etc.)
  const comparisonItems = content.split(/\d+\.\s+/).filter(item => item.trim().length > 0);
  
  // Ensure comparisons array exists
  if (!structured.comparisons) {
    structured.comparisons = [];
  }
  
  for (const item of comparisonItems) {
    const comparisonLines = item.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (comparisonLines.length >= 3) {
      // Extract aspect name (may be wrapped in ** for markdown bold)
      let aspect = comparisonLines[0].replace(/\*\*/g, '').trim();
      
      // Extract other properties from subsequent lines
      let approachA = "";
      let approachB = "";
      let analysis = "";
      
      for (const line of comparisonLines.slice(1)) {
        if (line.toLowerCase().startsWith("approach a:")) {
          approachA = line.substring(11).trim();
        } else if (line.toLowerCase().startsWith("approach b:")) {
          approachB = line.substring(11).trim();
        } else if (line.toLowerCase().startsWith("analysis:")) {
          analysis = line.substring(9).trim();
        }
      }
      
      structured.comparisons.push({
        aspect,
        approach_a: approachA,
        approach_b: approachB,
        comparative_analysis: analysis
      });
    }
  }
}

// Process the Research Gaps section
function processGapsSection(content: string, structured: DeepResearchContent) {
  // Split by numbered items (1., 2., etc.)
  const gapItems = content.split(/\d+\.\s+/).filter(item => item.trim().length > 0);
  
  // Ensure knowledge_gaps array exists
  if (!structured.knowledge_gaps) {
    structured.knowledge_gaps = [];
  }
  
  structured.knowledge_gaps = gapItems.map(item => item.trim());
}

// Process the Sources section
function processSourcesSection(content: string, structured: DeepResearchContent) {
  // Split by newlines and look for pairs/groups of lines that form a source
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Ensure sources array exists
  if (!structured.sources) {
    structured.sources = [];
  }
  
  for (let i = 0; i < lines.length; i++) {
    // Basic source with just a title
    const source: any = {
      title: lines[i]
    };
    
    // Look for additional information in subsequent lines
    if (i + 1 < lines.length && lines[i + 1].includes(':')) {
      i++;
      const parts = lines[i].split(':');
      if (parts.length >= 2) {
        const key = parts[0].toLowerCase().trim();
        const value = parts.slice(1).join(':').trim();
        
        if (key === "authors" || key === "author") {
          source.authors = value;
        } else if (key === "journal") {
          source.journal = value;
        } else if (key === "year") {
          source.year = value;
        } else if (key === "key contribution") {
          source.key_contribution = value;
        }
      }
    }
    
    structured.sources.push(source);
  }
}