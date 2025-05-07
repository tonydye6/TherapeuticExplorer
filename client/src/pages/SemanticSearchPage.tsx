
import { useState } from "react";
import { ResearchItem } from "@shared/schema";
import { SemanticSearchBar } from "@/components/SemanticSearchBar";
import { SearchResults } from "@/components/SearchResults";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, BrainCircuitIcon, SearchIcon, History, LightbulbIcon, BookMarkedIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SemanticSearchPageProps {
  inTabView?: boolean;
}

interface MedicalTerm {
  term: string;
  definition: string;
  category: string;
}

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

export default function SemanticSearchPage({ inTabView = false }: SemanticSearchPageProps) {
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
    <div className="container py-8 md:py-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {!inTabView && (
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-sophera-text-heading flex items-center justify-center">
            <BrainCircuitIcon className="h-9 w-9 mr-3 text-sophera-brand-primary" />
            AI Medical Explainer
          </h1>
          <p className="mt-3 text-lg text-sophera-text-body max-w-2xl mx-auto">
            Translate complex medical terms and concepts into simple, easy-to-understand explanations
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-2">
          <Card className="bg-white border-sophera-border-primary rounded-sophera-card shadow-lg mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-sophera-text-heading flex items-center">
                <SearchIcon className="h-5 w-5 mr-3 text-sophera-brand-primary" />
                Ask Anything Medical
              </CardTitle>
              <CardDescription className="text-sophera-text-subtle pt-1">
                Type your medical question in everyday language and get a simple explanation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SemanticSearchBar 
                onResultsFound={handleSearchResults}
                placeholder="Ask about a medical term, treatment, or concept..."
              />
              <div className="mt-6 text-sm text-sophera-text-body">
                <p className="font-medium mb-3">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-sophera-brand-primary text-sophera-brand-primary hover:bg-sophera-brand-primary/10 rounded-sophera-button"
                  >
                    What is Barrett's esophagus?
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-sophera-brand-primary text-sophera-brand-primary hover:bg-sophera-brand-primary/10 rounded-sophera-button"
                  >
                    How does radiation therapy work?
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-sophera-brand-primary text-sophera-brand-primary hover:bg-sophera-brand-primary/10 rounded-sophera-button"
                  >
                    Explain staging in esophageal cancer
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-sophera-brand-primary text-sophera-brand-primary hover:bg-sophera-brand-primary/10 rounded-sophera-button"
                  >
                    What are the common side effects of immunotherapy?
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {hasSearched && (
            <div className="w-full mt-6">
              <SearchResults results={searchResults} />
            </div>
          )}

          {!hasSearched && (
            <Card className="bg-white border-sophera-border-primary rounded-sophera-card shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-sophera-text-heading flex items-center">
                  <LightbulbIcon className="h-5 w-5 mr-3 text-sophera-accent-tertiary" />
                  Medical Terms You Can Explore
                </CardTitle>
                <CardDescription className="text-sophera-text-subtle pt-1">
                  Tap on any term to see its simple explanation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {commonMedicalTerms.map((term) => (
                    <button
                      key={term.term}
                      onClick={() => handleTermClick(term)}
                      className="text-left p-4 bg-sophera-bg-card border border-sophera-border-subtle rounded-sophera-input hover:border-sophera-brand-primary hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sophera-brand-primary/20"
                    >
                      <div className="flex justify-between items-start">  
                        <h3 className="font-semibold text-base text-sophera-text-heading">{term.term}</h3>
                        <Badge className="bg-sophera-gradient-start text-sophera-text-heading border-sophera-border-subtle rounded-md px-2 py-0.5">{term.category}</Badge>
                      </div>
                      <p className="text-sm text-sophera-text-body mt-2 line-clamp-2">
                        {term.definition}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-1">
          <Card className="bg-white border-sophera-border-primary rounded-sophera-card shadow-lg sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-sophera-text-heading flex items-center">
                <InfoIcon className="h-5 w-5 mr-3 text-sophera-accent-secondary" />
                What is the AI Explainer?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-5">
              <p className="text-sophera-text-body">
                The AI Medical Explainer helps you understand complex medical terms, treatments, and concepts in simple, everyday language.
              </p>
              <div>
                <h4 className="font-semibold text-sophera-text-heading mb-2">How it works:</h4>
                <ul className="space-y-1.5 list-disc pl-5 text-sophera-text-body">
                  <li>Ask any medical question in your own words</li>
                  <li>Tap on highlighted medical terms to see definitions</li>
                  <li>Get simplified explanations with visual aids when available</li>
                  <li>All explanations reference trusted medical sources</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sophera-text-heading mb-2">Privacy note:</h4>
                <p className="text-sophera-text-subtle">
                  Your questions are processed securely and not shared with third parties or used for advertising.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {selectedTerm && (
            <Card className="bg-sophera-brand-primary-light border-sophera-brand-primary/30 rounded-sophera-card shadow-lg mt-6">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold text-sophera-text-heading">{selectedTerm.term}</CardTitle>
                  <Badge className="bg-sophera-accent-secondary text-white border-none rounded-md px-2.5 py-1">{selectedTerm.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sophera-text-body">{selectedTerm.definition}</p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sophera-brand-primary mt-4 hover:text-sophera-brand-primary/80 font-medium"
                  onClick={() => setSelectedTerm(null)}
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
