import React from "react";
import { ResearchItem } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, Tag, Bookmark, ExternalLink } from "lucide-react";

interface ResearchDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  researchItem: ResearchItem | null;
}

export default function ResearchDetailsDialog({
  isOpen,
  onClose,
  researchItem
}: ResearchDetailsDialogProps) {
  if (!researchItem) return null;

  // Format date
  const formattedDate = new Date(researchItem.dateAdded).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get source type display label
  const getSourceTypeLabel = (sourceType: string) => {
    switch (sourceType) {
      case 'treatment':
        return 'Treatment Information';
      case 'clinical_trial':
        return 'Clinical Trial';
      case 'pubmed':
        return 'PubMed Article';
      case 'book':
        return 'Book Reference';
      case 'journal':
        return 'Journal Article';
      default:
        return 'Research Item';
    }
  };

  // Get evidence level badge color
  const getEvidenceBadgeColor = (level: string | null) => {
    if (!level) return "bg-gray-100 text-gray-800";
    
    switch (level.toLowerCase()) {
      case 'high':
        return "bg-green-100 text-green-800";
      case 'medium':
        return "bg-yellow-100 text-yellow-800";
      case 'low':
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{researchItem.title}</DialogTitle>
          <DialogDescription className="sr-only">Research item details</DialogDescription>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {getSourceTypeLabel(researchItem.sourceType)}
            </Badge>
            {researchItem.evidenceLevel && (
              <Badge variant="outline" className={getEvidenceBadgeColor(researchItem.evidenceLevel)}>
                {researchItem.evidenceLevel.charAt(0).toUpperCase() + researchItem.evidenceLevel.slice(1)} Evidence
              </Badge>
            )}
            {researchItem.isFavorite && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                Favorite
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {/* Main content */}
          <div className="prose prose-sm max-w-none">
            <p>{researchItem.content}</p>
          </div>

          {/* Source information */}
          {researchItem.sourceName && (
            <div className="flex items-start gap-2 text-sm text-gray-600 mt-4">
              <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Source</p>
                <p>{researchItem.sourceName}</p>
                {researchItem.sourceId && <p className="text-xs">ID: {researchItem.sourceId}</p>}
              </div>
            </div>
          )}

          {/* Tags */}
          {researchItem.tags && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Tag className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.isArray(researchItem.tags) ? 
                    researchItem.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {String(tag)}
                      </Badge>
                    )) : 
                    typeof researchItem.tags === 'object' && researchItem.tags !== null ?
                      Object.keys(researchItem.tags).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      )) : null
                  }
                </div>
              </div>
            </div>
          )}

          {/* Date added */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>Added on {formattedDate}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}