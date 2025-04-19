import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, Download, ArrowUpRight } from "lucide-react";
import ModelBadge from "@/components/ModelBadge";
import TreatmentComparisonCard, { TreatmentInfo } from "@/components/TreatmentComparisonCard";
import { ModelType } from "@shared/schema";

export type ResearchTabsProps = {
  content: string;
  treatments?: TreatmentInfo[];
  clinicalTrials?: {
    title: string;
    phase: string;
    matchScore: number;
    location: string;
    distance: number;
    id: string;
    status: string;
  }[];
  sources?: {
    title: string;
    url?: string;
    type: string;
    date?: string;
  }[];
  modelUsed: ModelType | string;
  onSaveTreatment?: (treatmentId: string) => void;
  onSaveSource?: (source: any) => void;
  onCompareTreatments?: (treatmentIds: string[]) => void;
  onViewTreatmentDetails?: (treatmentId: string) => void;
  onViewTrialDetails?: (trialId: string) => void;
};

export default function ResearchTabs({
  content,
  treatments = [],
  clinicalTrials = [],
  sources = [],
  modelUsed,
  onSaveTreatment,
  onSaveSource,
  onCompareTreatments,
  onViewTreatmentDetails,
  onViewTrialDetails
}: ResearchTabsProps) {
  const [comparingTreatments, setComparingTreatments] = React.useState<string[]>([]);
  
  // Handle toggling treatment comparison
  const handleToggleCompare = (treatmentId: string, comparing: boolean) => {
    if (comparing) {
      setComparingTreatments(prev => [...prev, treatmentId]);
    } else {
      setComparingTreatments(prev => prev.filter(id => id !== treatmentId));
    }
  };
  
  // Handle comparing selected treatments
  const handleCompareSelected = () => {
    if (onCompareTreatments && comparingTreatments.length > 0) {
      onCompareTreatments(comparingTreatments);
    }
  };
  
  // Format match score for clinical trials
  const formatMatchScore = (score: number) => {
    if (score >= 90) return "Very High";
    if (score >= 75) return "High";
    if (score >= 60) return "Moderate";
    if (score >= 40) return "Low";
    return "Very Low";
  };
  
  // Get match score color
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-green-500";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };
  
  // Format trial phase for display
  const formatTrialPhase = (phase: string) => {
    return phase.replace("Phase ", "Phase ");
  };
  
  // Format distance for display
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 10) / 10} miles`;
    }
    return `${Math.round(distance)} miles`;
  };
  
  // Check if we have any additional tabs to show
  const hasAdditionalTabs = treatments.length > 0 || clinicalTrials.length > 0 || sources.length > 0;
  
  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between items-center">
        <ModelBadge model={modelUsed} />
        
        {comparingTreatments.length > 0 && (
          <Button size="sm" variant="secondary" onClick={handleCompareSelected}>
            Compare {comparingTreatments.length} {comparingTreatments.length === 1 ? 'Treatment' : 'Treatments'}
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {treatments.length > 0 && (
            <TabsTrigger value="treatments">
              Treatments
              {treatments.length > 0 && <Badge variant="secondary" className="ml-1">{treatments.length}</Badge>}
            </TabsTrigger>
          )}
          {clinicalTrials.length > 0 && (
            <TabsTrigger value="trials">
              Clinical Trials
              {clinicalTrials.length > 0 && <Badge variant="secondary" className="ml-1">{clinicalTrials.length}</Badge>}
            </TabsTrigger>
          )}
          {sources.length > 0 && (
            <TabsTrigger value="sources">
              Sources
              {sources.length > 0 && <Badge variant="secondary" className="ml-1">{sources.length}</Badge>}
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview" className="mt-2">
          <div className="whitespace-pre-line">
            {content}
          </div>
          
          {/* Show summaries of additional content if available */}
          {hasAdditionalTabs && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {treatments.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Treatments Found</CardTitle>
                    <CardDescription>
                      {treatments.length} treatment options available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {treatments.slice(0, 3).map((treatment) => (
                        <li key={treatment.id} className="flex items-center justify-between text-sm">
                          <span>{treatment.name}</span>
                          <Badge variant="outline" className="ml-2">{treatment.type}</Badge>
                        </li>
                      ))}
                      {treatments.length > 3 && (
                        <li className="text-sm text-gray-500 pt-1">+ {treatments.length - 3} more</li>
                      )}
                    </ul>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => {
                        const element = document.querySelector('[data-value="treatments"]');
                        if (element instanceof HTMLElement) {
                          element.click();
                        }
                      }}
                    >
                      View All Treatments
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {clinicalTrials.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Clinical Trials</CardTitle>
                    <CardDescription>
                      {clinicalTrials.length} relevant trials found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {clinicalTrials.slice(0, 3).map((trial) => (
                        <li key={trial.id} className="flex items-center justify-between text-sm">
                          <span className="line-clamp-1 flex-grow">{trial.title}</span>
                          <Badge variant="outline" className="ml-2 flex-shrink-0">
                            {formatTrialPhase(trial.phase)}
                          </Badge>
                        </li>
                      ))}
                      {clinicalTrials.length > 3 && (
                        <li className="text-sm text-gray-500 pt-1">+ {clinicalTrials.length - 3} more</li>
                      )}
                    </ul>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => {
                        const element = document.querySelector('[data-value="trials"]');
                        if (element instanceof HTMLElement) {
                          element.click();
                        }
                      }}
                    >
                      View All Trials
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {sources.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Research Sources</CardTitle>
                    <CardDescription>
                      {sources.length} sources referenced
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {sources.slice(0, 3).map((source, index) => (
                        <li key={index} className="flex items-center justify-between text-sm">
                          <span className="line-clamp-1 flex-grow">{source.title}</span>
                          <Badge variant="outline" className="ml-2 flex-shrink-0">
                            {source.type}
                          </Badge>
                        </li>
                      ))}
                      {sources.length > 3 && (
                        <li className="text-sm text-gray-500 pt-1">+ {sources.length - 3} more</li>
                      )}
                    </ul>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => {
                        const element = document.querySelector('[data-value="sources"]');
                        if (element instanceof HTMLElement) {
                          element.click();
                        }
                      }}
                    >
                      View All Sources
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="treatments" className="mt-2">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium">Treatment Options</h3>
            {comparingTreatments.length > 0 && (
              <Button size="sm" onClick={handleCompareSelected}>
                Compare Selected
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {treatments.map((treatment) => (
              <TreatmentComparisonCard
                key={treatment.id}
                treatment={treatment}
                isComparing={comparingTreatments.includes(treatment.id)}
                onCompare={handleToggleCompare}
                onSave={onSaveTreatment}
                onViewDetails={onViewTreatmentDetails}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="trials" className="mt-2">
          <h3 className="text-lg font-medium mb-4">Clinical Trials</h3>
          
          <div className="space-y-4">
            {clinicalTrials.map((trial) => (
              <Card key={trial.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex-grow pr-4">
                      <CardTitle className="text-base">{trial.title}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Badge variant="secondary" className={`mr-2 ${trial.status === 'Recruiting' ? 'bg-green-100 text-green-800' : ''}`}>
                          {trial.status}
                        </Badge>
                        <Badge variant="outline">{formatTrialPhase(trial.phase)}</Badge>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${getMatchScoreColor(trial.matchScore)}`}>
                        {formatMatchScore(trial.matchScore)} Match
                      </div>
                      <div className="text-sm text-gray-500">
                        {trial.matchScore}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Location</div>
                      <div className="font-medium">{trial.location}</div>
                      <div className="text-sm">{formatDistance(trial.distance)}</div>
                    </div>
                    
                    <div className="text-right">
                      <Button 
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                        onClick={() => onViewTrialDetails && onViewTrialDetails(trial.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="sources" className="mt-2">
          <h3 className="text-lg font-medium mb-4">Research Sources</h3>
          
          <div className="space-y-3">
            {sources.map((source, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{source.title}</h4>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline">{source.type}</Badge>
                        {source.date && (
                          <span className="text-sm text-gray-500 ml-2">{source.date}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {source.url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(source.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onSaveSource && onSaveSource(source)}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}