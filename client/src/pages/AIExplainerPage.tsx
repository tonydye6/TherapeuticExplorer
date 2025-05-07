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
    <div className="container py-6 max-w-6xl mx-auto">
      {!inTabView && (
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center">
            <BrainCircuitIcon className="h-8 w-8 mr-2 text-primary" />
            AI Medical Explainer
          </h1>
          <p className="mt-2 text-muted-foreground">
            Translate complex medical terms and concepts into simple, easy-to-understand explanations
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="shadow-sm mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <SearchIcon className="h-5 w-5 mr-2 text-primary" />
                Ask Anything Medical
              </CardTitle>
              <CardDescription>
                Type your medical question in everyday language and get a simple explanation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SemanticSearchBar 
                onResultsFound={handleSearchResults}
                placeholder="Ask about a medical term, treatment, or concept..."
              />
              <div className="mt-4 text-sm text-muted-foreground">
                <p className="font-medium mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    What is Barrett's esophagus?
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    How does radiation therapy work?
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Explain staging in esophageal cancer
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
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
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <LightbulbIcon className="h-5 w-5 mr-2 text-primary" />
                  Medical Terms You Can Explore
                </CardTitle>
                <CardDescription>
                  Tap on any term to see its simple explanation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {commonMedicalTerms.map((term) => (
                    <button
                      key={term.term}
                      onClick={() => handleTermClick(term)}
                      className="text-left p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex justify-between items-start">  
                        <h3 className="font-medium text-base">{term.term}</h3>
                        <Badge variant="outline" className="text-xs">{term.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
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
          <Card className="shadow-sm sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <InfoIcon className="h-5 w-5 mr-2 text-primary" />
                What is the AI Explainer?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>
                The AI Medical Explainer helps you understand complex medical terms, treatments, and concepts in simple, everyday language.
              </p>
              <div>
                <h4 className="font-medium mb-1">How it works:</h4>
                <ul className="space-y-1 list-disc pl-5">
                  <li>Ask any medical question in your own words</li>
                  <li>Tap on highlighted medical terms to see definitions</li>
                  <li>Get simplified explanations with visual aids when available</li>
                  <li>All explanations reference trusted medical sources</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1">Privacy note:</h4>
                <p className="text-muted-foreground">
                  Your questions are processed securely and not shared with third parties or used for advertising.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {selectedTerm && (
            <Card className="shadow-sm mt-6 bg-slate-50 dark:bg-slate-900 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{selectedTerm.term}</CardTitle>
                  <Badge>{selectedTerm.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p>{selectedTerm.definition}</p>
                <Button 
                  variant="link" 
                  className="p-0 mt-4 text-primary"
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
import { useState } from "react";
import { ResearchItem } from "@shared/schema";
import { SemanticSearchBar } from "@/components/SemanticSearchBar";
import { SearchResults } from "@/components/SearchResults";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, Brain, Search, LightbulbIcon } from "lucide-react";
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
            <Brain className="h-8 w-8 lg:h-9 lg:w-9 mr-3 text-primary" />
            AI Medical Explainer
          </h1>
          <p className="mt-3 text-base lg:text-lg text-muted-foreground">
            Translate complex medical terms and concepts into simple, easy-to-understand explanations.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-2 space-y-6 md:space-y-8">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center">
                <Search className="h-5 w-5 mr-2 text-primary" />
                Ask Anything Medical
              </CardTitle>
              <CardDescription className="pt-1">
                Type your medical question in everyday language and get a simple explanation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SemanticSearchBar 
                onResultsFound={handleSearchResults}
                placeholder="Ask about a medical term, treatment, or concept..."
              />
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    What is Barrett's esophagus?
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    How does radiation therapy work?
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Explain staging in esophageal cancer
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    What are the common side effects of immunotherapy?
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {hasSearched && (
            <div className="w-full">
              <SearchResults results={searchResults} />
            </div>
          )}

          {!hasSearched && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <LightbulbIcon className="h-5 w-5 mr-2 text-warning" />
                  Medical Terms You Can Explore
                </CardTitle>
                <CardDescription className="pt-1">
                  Tap on any term to see its simple explanation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {commonMedicalTerms.map((term) => (
                    <button
                      key={term.term}
                      onClick={() => handleTermClick(term)}
                      className="text-left p-4 bg-card border rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/25"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-base">{term.term}</h3>
                        <Badge variant="outline" className="text-xs">
                          {term.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {term.definition}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-1 space-y-6 md:space-y-8">
          <Card className="sticky top-6 md:top-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center">
                <InfoIcon className="h-5 w-5 mr-2 text-primary" />
                What is the AI Explainer?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>
                The AI Medical Explainer helps you understand complex medical terms, treatments, and concepts in simple, everyday language.
              </p>
              <div>
                <h4 className="font-semibold mb-1.5">How it works:</h4>
                <ul className="space-y-1.5 list-disc pl-5 text-muted-foreground">
                  <li>Ask any medical question in your own words.</li>
                  <li>Tap on highlighted medical terms to see definitions.</li>
                  <li>Get simplified explanations with visual aids when available.</li>
                  <li>All explanations reference trusted medical sources.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1.5">Privacy note:</h4>
                <p className="text-muted-foreground">
                  Your questions are processed securely and not shared with third parties or used for advertising.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {selectedTerm && (
            <Card className="border-primary border-2">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold">{selectedTerm.term}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {selectedTerm.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{selectedTerm.definition}</p>
                <Button 
                  variant="link" 
                  className="p-0 mt-4 text-primary hover:text-primary/90 h-auto"
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
