import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, AlertCircle, Info, Bookmark, BookmarkCheck, ChevronRight } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export interface TreatmentInfo {
  id: string;
  name: string;
  type: string;
  effectivenessScore: number;
  evidenceLevel: "high" | "medium" | "low";
  benefits: { text: string }[];
  sideEffects: { text: string; warning?: boolean; info?: boolean }[];
  description?: string;
  source?: string;
  isSaved?: boolean;
}

interface TreatmentComparisonCardProps {
  treatment: TreatmentInfo;
  isComparing?: boolean;
  onCompare?: (id: string, comparing: boolean) => void;
  onSave?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  showCompare?: boolean;
}

export default function TreatmentComparisonCard({
  treatment,
  isComparing = false,
  onCompare,
  onSave,
  onViewDetails,
  showCompare = true
}: TreatmentComparisonCardProps) {
  // Format effectiveness score as a percentage
  const formatEffectivenessScore = (score: number) => {
    return Math.round(score * 100) + "%";
  };
  
  // Get effectiveness color based on score
  const getEffectivenessColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-green-500";
    if (score >= 0.4) return "text-yellow-600";
    if (score >= 0.2) return "text-orange-500";
    return "text-red-500";
  };
  
  // Get evidence level badge color
  const getEvidenceLevelBadge = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{treatment.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Badge variant="outline" className="mr-2">{treatment.type}</Badge>
              <Badge variant="outline" className={getEvidenceLevelBadge(treatment.evidenceLevel)}>
                {treatment.evidenceLevel === "high" && "Strong Evidence"}
                {treatment.evidenceLevel === "medium" && "Moderate Evidence"}
                {treatment.evidenceLevel === "low" && "Limited Evidence"}
              </Badge>
            </CardDescription>
          </div>
          
          {showCompare && onCompare && (
            <Checkbox 
              checked={isComparing}
              onCheckedChange={(checked) => onCompare(treatment.id, checked === true)}
              className="h-5 w-5"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {/* Description if available */}
        {treatment.description && (
          <p className="text-sm text-gray-600 mb-3">{treatment.description}</p>
        )}
        
        {/* Effectiveness score */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Effectiveness</span>
            <span className={`text-sm font-bold ${getEffectivenessColor(treatment.effectivenessScore)}`}>
              {formatEffectivenessScore(treatment.effectivenessScore)}
            </span>
          </div>
          <Progress 
            value={treatment.effectivenessScore * 100} 
            className="h-2" 
          />
        </div>
        
        {/* Benefits */}
        {treatment.benefits.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Benefits</h4>
            <ul className="space-y-1">
              {treatment.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Side Effects */}
        {treatment.sideEffects.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">Side Effects</h4>
            <ul className="space-y-1">
              {treatment.sideEffects.map((effect, index) => (
                <li key={index} className="flex items-start text-sm">
                  {effect.warning ? (
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                  ) : effect.info ? (
                    <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={effect.warning ? "text-amber-700" : ""}>{effect.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Source */}
        {treatment.source && (
          <div className="mt-3 text-xs text-gray-500">
            Source: {treatment.source}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSave && onSave(treatment.id)}
                disabled={!onSave}
              >
                {treatment.isSaved ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{treatment.isSaved ? "Saved to your treatments" : "Save treatment"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => onViewDetails && onViewDetails(treatment.id)}
          disabled={!onViewDetails}
        >
          Details
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}