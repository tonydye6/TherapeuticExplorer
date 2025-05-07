import { useState } from "react";
import { ResearchItem } from "@shared/schema";
import { SemanticSearchBar } from "@/components/SemanticSearchBar";
import { SearchResults } from "@/components/SearchResults";
import { NeoCard, NeoCardHeader, NeoCardContent, NeoCardTitle, NeoCardDescription, NeoCardDecoration } from "@/components/ui/neo-card";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, Brain, Search, Lightbulb, BookOpen } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";

interface SemanticSearchPageProps {
  inTabView?: boolean;
}

interface MedicalTerm {
  term: string;
  definition: string;
  category: string;
}

// Sample medical terms to demonstrate tap-to-define functionality
const commonMedicalTerms: MedicalTerm[] = [
  { 
    term: "Pathology", 
    definition: "The study of disease, especially of the structural and functional changes caused by disease.", 
    category: "general"
  },
  { 
    term: "Metastasis", 
    definition: "The spread of cancer cells from the original site to other parts of the body through the blood or lymphatic system.", 
    category: "oncology"
  },
  { 
    term: "Endoscopy", 
    definition: "A procedure that uses an instrument with a light and a lens (endoscope) to look inside the body, especially used to examine the esophagus, stomach, and part of the small intestine.", 
    category: "procedure"
  },
  { 
    term: "Dysplasia", 
    definition: "Abnormal development or growth of tissues, cells, or organs. In esophageal cancer, it refers to precancerous cellular changes that may progress to cancer.", 
    category: "pathology"
  },
];

export default function AIExplainerPage({ inTabView = false }: SemanticSearchPageProps) {
  const [searchResults, setSearchResults] = useState<ResearchItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<MedicalTerm | null>(null);

  const handleSearchResults = (results: ResearchItem[]) => {
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleTermClick = (term: MedicalTerm) => {
    setSelectedTerm(term);
  };

  return (
    <div className={`container mx-auto max-w-6xl ${inTabView ? 'py-0' : 'py-6 md:py-8'}`}>
      {!inTabView && (
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-sophera-text-heading flex items-center justify-center">
            <Brain className="h-8 w-8 lg:h-9 lg:w-9 mr-3 text-sophera-brand-primary" />
            AI Medical Explainer
          </h1>
          <p className="mt-3 text-base lg:text-lg text-muted-foreground">
            Translate complex medical terms and concepts into simple, easy-to-understand explanations
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-2 space-y-6 md:space-y-8">
          <NeoCard className="h-auto">
            <NeoCardDecoration />
            <NeoCardHeader>
              <NeoCardTitle>ASK ANYTHING MEDICAL</NeoCardTitle>
            </NeoCardHeader>
            <NeoCardContent>
              <NeoCardDescription>
                Type your medical question in everyday language and get a simple explanation
              </NeoCardDescription>
              <div className="mt-6">
                <SemanticSearchBar 
                  onResultsFound={handleSearchResults}
                  placeholder="Ask about a medical term, treatment, or concept..."
                />
                <div className="mt-6">
                  <p className="text-sm font-bold mb-3 text-sophera-text-heading">Suggested questions:</p>
                  <div className="flex flex-wrap gap-3">
                    <NeoButton 
                      buttonText="What is Barrett's esophagus?" 
                      size="sm" 
                      color="cyan"
                    />
                    <NeoButton 
                      buttonText="How does radiation therapy work?" 
                      size="sm" 
                      color="yellow"
                    />
                    <NeoButton 
                      buttonText="Explain staging in esophageal cancer" 
                      size="sm" 
                      color="pink"
                    />
                    <NeoButton 
                      buttonText="Immunotherapy side effects?" 
                      size="sm" 
                      color="violet"
                    />
                  </div>
                </div>
              </div>
            </NeoCardContent>
          </NeoCard>
          
          {hasSearched && (
            <div className="w-full">
              <SearchResults results={searchResults} />
            </div>
          )}

          {!hasSearched && (
            <NeoCard className="h-auto">
              <NeoCardHeader>
                <NeoCardTitle>MEDICAL TERMS EXPLORER</NeoCardTitle>
              </NeoCardHeader>
              <NeoCardContent>
                <NeoCardDescription>
                  Tap on any term to see its simple explanation
                </NeoCardDescription>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {commonMedicalTerms.map((term) => (
                    <button
                      key={term.term}
                      onClick={() => handleTermClick(term)}
                      className="text-left p-4 border-3 border-sophera-text-heading rounded-lg bg-card hover:shadow-[0.3rem_0.3rem_0_#05060f] hover:translate-y-[-2px] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/25"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-base text-sophera-text-heading">{term.term}</h3>
                        <Badge className="bg-white text-sophera-text-heading border-2 border-sophera-text-heading rounded-md shadow-[0.1rem_0.1rem_0_#05060f] font-bold">
                          {term.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {term.definition}
                      </p>
                    </button>
                  ))}
                </div>
              </NeoCardContent>
            </NeoCard>
          )}
        </div>

        <div className="md:col-span-1 space-y-6 md:space-y-8">
          <NeoCard className="sticky top-6 md:top-8 h-auto">
            <NeoCardHeader>
              <NeoCardTitle>AI EXPLAINER</NeoCardTitle>
            </NeoCardHeader>
            <NeoCardContent>
              <div className="text-sm space-y-4">
                <p className="text-sophera-text-heading">
                  The AI Medical Explainer helps you understand complex medical terms, treatments, and concepts in simple, everyday language.
                </p>
                <div>
                  <h4 className="font-bold mb-1.5 text-sophera-text-heading">How it works:</h4>
                  <ul className="space-y-1.5 list-disc pl-5 text-muted-foreground">
                    <li>Ask any medical question in your own words</li>
                    <li>Tap on highlighted medical terms to see definitions</li>
                    <li>Get simplified explanations with visual aids when available</li>
                    <li>All explanations reference trusted medical sources</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-1.5 text-sophera-text-heading">Privacy note:</h4>
                  <p className="text-muted-foreground">
                    Your questions are processed securely and not shared with third parties or used for advertising.
                  </p>
                </div>
              </div>
            </NeoCardContent>
          </NeoCard>
          
          {selectedTerm && (
            <NeoCard className="h-auto">
              <NeoCardDecoration />
              <NeoCardHeader>
                <NeoCardTitle>{selectedTerm.term.toUpperCase()}</NeoCardTitle>
              </NeoCardHeader>
              <NeoCardContent>
                <Badge className="mb-3 bg-white text-sophera-text-heading border-2 border-sophera-text-heading rounded-md shadow-[0.1rem_0.1rem_0_#05060f] font-bold">
                  {selectedTerm.category}
                </Badge>
                <p className="text-sophera-text-heading mt-2 text-sm">{selectedTerm.definition}</p>
                <div className="mt-6">
                  <NeoButton 
                    buttonText="Close" 
                    size="sm" 
                    color="cyan"
                    onClick={() => setSelectedTerm(null)}
                  />
                </div>
              </NeoCardContent>
            </NeoCard>
          )}
        </div>
      </div>
    </div>
  );
}