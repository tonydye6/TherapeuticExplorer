import { useState } from "react";
import { ResearchItem } from "@shared/schema";
import { SemanticSearchBar } from "@/components/SemanticSearchBar";
import { SearchResults } from "@/components/SearchResults";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SemanticSearchPage() {
  const [searchResults, setSearchResults] = useState<ResearchItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchResults = (results: ResearchItem[]) => {
    setSearchResults(results);
    setHasSearched(true);
  };

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Semantic Search</h1>
        <p className="mt-2 text-muted-foreground">
          Search across your saved research items, documents, and medical data using natural language
        </p>
      </div>

      <Tabs defaultValue="semantic-search" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="semantic-search">Semantic Search</TabsTrigger>
          <TabsTrigger value="recent-searches">Recent Searches</TabsTrigger>
        </TabsList>

        <TabsContent value="semantic-search" className="w-full">
          <div className="flex flex-col items-center">
            <SemanticSearchBar onResultsFound={handleSearchResults} />
            
            {hasSearched && (
              <div className="w-full mt-6">
                <SearchResults results={searchResults} />
              </div>
            )}

            {!hasSearched && (
              <div className="text-center py-16 max-w-lg">
                <h3 className="text-xl font-semibold mb-3">How Semantic Search Works</h3>
                <p className="text-muted-foreground mb-4">
                  Unlike traditional keyword search, semantic search understands the meaning behind your query. Try these examples:
                </p>
                <ul className="text-left space-y-2 text-sm text-muted-foreground">
                  <li>• "What treatments have fewer side effects for esophageal cancer?"</li>
                  <li>• "Show me research about immunotherapy effectiveness"</li>
                  <li>• "Find information about managing radiation side effects"</li>
                  <li>• "What nutritional strategies help during chemo?"</li>
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent-searches">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Recent searches will be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}