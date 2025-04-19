import React, { useState } from "react";
import { ChevronDown, ChevronUp, Bookmark, Share2, ExternalLink, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Define treatment types
export type TreatmentSideEffect = {
  text: string;
  severity: number; // 1-5
  warning?: boolean;
  info?: boolean;
};

export type TreatmentBenefit = {
  text: string;
};

export type TreatmentInfo = {
  id: string;
  name: string;
  type: string;
  description: string;
  efficacyScore: number; // 0-100
  evidenceLevel: "high" | "medium" | "low";
  sideEffects: TreatmentSideEffect[];
  benefits: TreatmentBenefit[];
  source: string;
  url?: string;
  approvalStatus?: string;
  isExperimental?: boolean;
};

type TreatmentComparisonCardProps = {
  treatment: TreatmentInfo;
  isComparing?: boolean;
  onCompare?: (treatmentId: string, comparing: boolean) => void;
  onSave?: (treatmentId: string) => void;
  onViewDetails?: (treatmentId: string) => void;
  isSaved?: boolean;
  className?: string;
};

export default function TreatmentComparisonCard({
  treatment,
  isComparing = false,
  onCompare,
  onSave,
  onViewDetails,
  isSaved = false,
  className
}: TreatmentComparisonCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format efficacy score
  const formatEfficacyScore = (score: number) => {
    if (score < 30) return "Limited";
    if (score < 60) return "Moderate";
    if (score < 85) return "Substantial";
    return "Very High";
  };
  
  // Get evidence level color
  const getEvidenceLevelColor = (level: "high" | "medium" | "low") => {
    switch(level) {
      case "high": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-red-600";
      default: return "text-gray-600";
    }
  };
  
  // Render stars for evidence quality
  const renderEvidenceStars = (level: "high" | "medium" | "low") => {
    const starCount = level === "high" ? 5 : level === "medium" ? 3 : 1;
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            width="16"
            height="16"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={i < starCount ? "fill-yellow-400" : "fill-gray-200"}
          >
            <path
              d="M7.5 1.5L9.54 5.42L14 6.12L10.75 9.21L11.58 13.5L7.5 11.48L3.42 13.5L4.25 9.21L1 6.12L5.46 5.42L7.5 1.5Z"
            />
          </svg>
        ))}
      </div>
    );
  };
  
  // Render severity dots for side effects
  const renderSeverityDots = (severity: number) => {
    return (
      <span className="flex ml-1">
        {[...Array(5)].map((_, i) => (
          <span 
            key={i} 
            className={cn(
              "inline-block rounded-full w-2 h-2 mx-0.5",
              i < severity ? "bg-orange-500" : "bg-gray-200"
            )}
          />
        ))}
      </span>
    );
  };
  
  return (
    <Card className={cn("treatment-card overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{treatment.name}</CardTitle>
            <Badge variant="secondary" className="mt-1">
              {treatment.type}
            </Badge>
            {treatment.isExperimental && (
              <Badge variant="outline" className="ml-2 mt-1 bg-amber-50 text-amber-800 border-amber-200">
                Experimental
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </Button>
        </div>
        <CardDescription className="mt-2">
          {treatment.description.length > 150 && !isExpanded
            ? treatment.description.substring(0, 150) + "..."
            : treatment.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className={cn("space-y-4", !isExpanded && "pb-3")}>
        {/* Efficacy Section */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1">EFFICACY</h4>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={cn(
                "h-2.5 rounded-full",
                treatment.efficacyScore >= 80 ? "bg-green-600" :
                treatment.efficacyScore >= 50 ? "bg-blue-600" :
                treatment.efficacyScore >= 30 ? "bg-yellow-600" : "bg-red-600"
              )}
              style={{ width: `${treatment.efficacyScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>Limited</span>
            <span className="font-medium">
              {formatEfficacyScore(treatment.efficacyScore)}
            </span>
            <span>Very Effective</span>
          </div>
        </div>
        
        {/* Evidence Quality Section */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-medium text-gray-500">EVIDENCE QUALITY</h4>
            <span className={cn("text-xs font-medium", getEvidenceLevelColor(treatment.evidenceLevel))}>
              {treatment.evidenceLevel.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center">
            {renderEvidenceStars(treatment.evidenceLevel)}
            <span className="text-xs text-gray-500 ml-2">
              {treatment.evidenceLevel === "high" 
                ? "Multiple high-quality studies" 
                : treatment.evidenceLevel === "medium"
                  ? "Limited but convincing studies"
                  : "Early research, limited data"}
            </span>
          </div>
        </div>
        
        {isExpanded && (
          <>
            {/* Side Effects Section */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2">SIDE EFFECTS</h4>
              <ul className="space-y-2">
                {treatment.sideEffects.map((effect, index) => (
                  <li 
                    key={index} 
                    className="flex items-center text-sm"
                  >
                    {effect.warning && (
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-1 flex-shrink-0" />
                    )}
                    {effect.info && (
                      <Info className="h-4 w-4 text-blue-500 mr-1 flex-shrink-0" />
                    )}
                    <span className="mr-auto">{effect.text}</span>
                    {renderSeverityDots(effect.severity)}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Benefits Section */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2">KEY BENEFITS</h4>
              <ul className="space-y-1">
                {treatment.benefits.map((benefit, index) => (
                  <li 
                    key={index} 
                    className="text-sm pl-4 relative before:content-[''] before:absolute before:w-2 before:h-2 before:rounded-full before:bg-green-500 before:left-0 before:top-[0.4rem]"
                  >
                    {benefit.text}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Source Section */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Source: {treatment.source}
                </div>
                {treatment.url && (
                  <a 
                    href={treatment.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-600 hover:underline flex items-center"
                  >
                    Learn more <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0 pb-3">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "text-xs",
              isComparing && "bg-blue-50 border-blue-200 text-blue-700"
            )}
            onClick={() => onCompare && onCompare(treatment.id, !isComparing)}
          >
            {isComparing ? "Remove from comparison" : "Compare"}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-gray-500 hover:text-gray-700",
              isSaved && "text-blue-600 hover:text-blue-700"
            )}
            onClick={() => onSave && onSave(treatment.id)}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
          </Button>
        </div>
        
        <Button
          variant="secondary"
          size="sm"
          className="text-xs"
          onClick={() => onViewDetails && onViewDetails(treatment.id)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}