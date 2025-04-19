import { useState } from "react";
import { ResearchItem } from "@shared/schema";
import { SearchResultCard } from "./SearchResultCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface SearchResultsProps {
  results: ResearchItem[];
}

export function SearchResults({ results }: SearchResultsProps) {
  const [selectedItem, setSelectedItem] = useState<ResearchItem | null>(null);

  const handleViewItem = (item: ResearchItem) => {
    setSelectedItem(item);
  };

  const handleCloseDialog = () => {
    setSelectedItem(null);
  };

  return (
    <div className="w-full">
      {results.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No results found. Try a different search query.</p>
        </div>
      ) : (
        <div>
          <h3 className="mb-4 font-semibold text-lg">Found {results.length} results</h3>
          {results.map((result) => (
            <SearchResultCard
              key={result.id}
              result={result}
              onView={handleViewItem}
            />
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.title}</DialogTitle>
                <DialogDescription className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="capitalize">
                    {selectedItem.sourceType.replace('_', ' ')}
                  </Badge>
                  {selectedItem.sourceName && (
                    <Badge variant="outline">
                      Source: {selectedItem.sourceName}
                    </Badge>
                  )}
                  {selectedItem.evidenceLevel && (
                    <Badge variant="outline">
                      {selectedItem.evidenceLevel} evidence
                    </Badge>
                  )}
                  <Badge variant="outline">
                    Added: {format(new Date(selectedItem.dateAdded), 'PPP')}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-gray-50 rounded-md">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {selectedItem.content}
                  </pre>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}