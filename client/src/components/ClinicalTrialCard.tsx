import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, BookmarkPlus, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type ClinicalTrialProps = {
  trial: {
    title: string;
    phase: string;
    matchScore: number; // 0-100
    location: string;
    distance: number;
    id: string;
    status: string;
  };
};

export default function ClinicalTrialCard({ trial }: ClinicalTrialProps) {
  const getMatchClass = () => {
    if (trial.matchScore >= 90) return "match-score-high";
    if (trial.matchScore >= 70) return "match-score-medium";
    return "match-score-low";
  };
  
  const getMatchBadge = () => {
    if (trial.matchScore >= 90) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          {trial.matchScore}% Match
        </Badge>
      );
    }
    if (trial.matchScore >= 70) {
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
          {trial.matchScore}% Match
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
        {trial.matchScore}% Match
      </Badge>
    );
  };
  
  return (
    <div className={cn(
      "border rounded-lg overflow-hidden shadow-sm",
      getMatchClass()
    )}>
      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
        <div className="flex items-center">
          <span className="font-medium">Phase {trial.phase}</span>
          <span className="ml-2">{getMatchBadge()}</span>
        </div>
        <span className="text-xs font-medium text-green-600">{trial.status}</span>
      </div>
      <div className="p-4">
        <h5 className="text-sm font-semibold mb-2">
          {trial.title}
        </h5>
        <div className="mb-4">
          <div className="flex items-center text-sm mb-1">
            <MapPin className="h-4 w-4 text-gray-500 mr-1.5" />
            <span>{trial.location} ({trial.distance} miles)</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 text-gray-500 mr-1.5" />
            <span>{trial.id}</span>
          </div>
        </div>
        <div className="border-t pt-3 flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <ExternalLink className="h-4 w-4 mr-1" />
              View Details
            </Button>
            <Button size="sm" className="bg-primary-700 hover:bg-primary-800 flex items-center">
              <BookmarkPlus className="h-4 w-4 mr-1" />
              Save Trial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
