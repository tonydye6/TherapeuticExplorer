import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ResearchItem } from "@shared/schema";

type SemanticSearchBarProps = {
  onResultsFound: (results: ResearchItem[]) => void;
};

export function SemanticSearchBar({ onResultsFound }: SemanticSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Function to handle search submission
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const response = await apiRequest<ResearchItem[]>("/api/research/semantic-search", {
        method: "POST",
        body: JSON.stringify({
          query: searchQuery,
          userId: 1 // Default user ID for now
        })
      });
      
      onResultsFound(response);
    } catch (error) {
      console.error("Error performing semantic search:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex w-full max-w-3xl gap-2 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search your saved research semantically..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="pl-10"
          disabled={isSearching}
        />
      </div>
      <Button 
        onClick={handleSearch} 
        disabled={isSearching || !searchQuery.trim()}
      >
        {isSearching ? "Searching..." : "Search"}
      </Button>
    </div>
  );
}