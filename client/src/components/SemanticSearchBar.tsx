import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResearchItem } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

type SemanticSearchBarProps = {
  onResultsFound: (results: ResearchItem[]) => void;
  placeholder?: string;
  className?: string;
};

export function SemanticSearchBar({ 
  onResultsFound, 
  placeholder = "Search your saved research semantically...",
  className = "" 
}: SemanticSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Function to handle search submission
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Make API request for semantic search
      const response = await fetch("/api/research/semantic-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: searchQuery,
          userId: 1 // Default user ID for now
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const results = await response.json();
      onResultsFound(results);
    } catch (error) {
      console.error("Error performing semantic search:", error);
      toast({
        title: "Search failed",
        description: "There was an error performing your search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`flex w-full max-w-3xl gap-2 mb-6 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
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