import { AlternativeTreatment } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  InfoIcon, AlertTriangle, FileText, BarChart, ThumbsUp, BookOpen, 
  Activity, Shield, Beaker, Users, Utensils, LineChart, Heart, Award
} from "lucide-react";
import CompatibilityChecker from "./CompatibilityChecker";
import TreatmentVisualization from "./TreatmentVisualization";
import NutritionalApproaches from "./NutritionalApproaches";
import PatientExperiences from "./PatientExperiences";
import SafetyWarningBanner, { 
  HealthcareDiscussionReminder, 
  InstitutionalSupportBadge, 
  SafetyGuidance 
} from "./SafetyWarningBanner";

interface AlternativeTreatmentDetailsProps {
  treatment: AlternativeTreatment;
}

export default function AlternativeTreatmentDetails({ treatment }: AlternativeTreatmentDetailsProps) {
  // Helper function to render a section if content exists
  const renderSection = (title: string, content?: string | null, icon?: React.ReactNode) => {
    if (!content) return null;
    
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{content}</p>
      </div>
    );
  };
  
  // Helper function to render JSON content
  const renderJsonContent = (data: any, renderer?: (item: any, index: number) => React.ReactNode) => {
    if (!data) return null;
    
    try {
      let parsedData;
      if (typeof data === 'string') {
        parsedData = JSON.parse(data);
      } else {
        parsedData = data;
      }
      
      if (!Array.isArray(parsedData)) {
        return <p className="text-sm text-muted-foreground whitespace-pre-line">{JSON.stringify(parsedData, null, 2)}</p>;
      }
      
      if (renderer) {
        return <div className="space-y-4">{parsedData.map(renderer)}</div>;
      }
      
      return (
        <div className="space-y-2">
          {parsedData.map((item, index) => (
            <div key={index} className="border rounded-md p-3">
              {Object.entries(item).map(([key, value]) => (
                <p key={key} className="text-sm">
                  <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}: </span>
                  {String(value)}
                </p>
              ))}
            </div>
          ))}
        </div>
      );
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return <p className="text-sm text-muted-foreground italic">Error displaying content</p>;
    }
  };
  
  // Helper function to render scientific evidence
  const renderScientificEvidence = (data: any) => {
    return renderJsonContent(data, (study, index) => (
      <div key={index} className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-blue-500" />
          <h4 className="font-medium">{study.study}</h4>
          {study.year && <Badge variant="outline">{study.year}</Badge>}
        </div>
        <p className="text-sm">{study.finding}</p>
      </div>
    ));
  };
  
  // Helper function to render patient experiences
  const renderPatientExperiences = (data: any) => {
    return renderJsonContent(data, (experience, index) => (
      <div key={index} className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">{experience.patient}</h4>
          {experience.verified && (
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100">
              Verified
            </Badge>
          )}
        </div>
        <p className="text-sm">{experience.experience}</p>
      </div>
    ));
  };
  
  // Helper function to render interactions
  const renderInteractions = (data: any) => {
    return renderJsonContent(data, (interaction, index) => {
      const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
          case 'high':
            return "destructive";
          case 'moderate':
            return "default";
          case 'low':
            return "secondary";
          default:
            return "outline";
        }
      };
      
      return (
        <div key={index} className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{interaction.treatment}</h4>
            <Badge variant={getSeverityColor(interaction.severity)}>
              {interaction.severity} Risk
            </Badge>
          </div>
          <p className="text-sm">{interaction.effect}</p>
        </div>
      );
    });
  };
  
  // Helper function to render sources
  const renderSources = () => {
    if (!treatment.sources || (Array.isArray(treatment.sources) && treatment.sources.length === 0)) {
      return <p className="text-sm text-muted-foreground italic">No sources provided</p>;
    }
    
    let sources;
    try {
      if (typeof treatment.sources === 'string') {
        sources = JSON.parse(treatment.sources);
      } else {
        sources = treatment.sources;
      }
    } catch (error) {
      console.error("Error parsing sources:", error);
      return <p className="text-sm text-muted-foreground italic">Error displaying sources</p>;
    }
    
    if (!Array.isArray(sources)) {
      return <p className="text-sm text-muted-foreground">{JSON.stringify(sources)}</p>;
    }
    
    return (
      <div className="space-y-4">
        {sources.map((source: any, index: number) => (
          <div key={index} className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
            <h4 className="font-medium text-lg">{source.title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {source.author && <p className="text-sm"><span className="font-medium">Author:</span> {source.author}</p>}
              {source.year && <p className="text-sm"><span className="font-medium">Year:</span> {source.year}</p>}
              {source.publisher && <p className="text-sm"><span className="font-medium">Publisher:</span> {source.publisher}</p>}
            </div>
            {source.url && (
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <BookOpen className="h-4 w-4" /> View Publication
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Get interactions data
  const getInteractions = (): {treatment: string, severity: string, effect: string}[] => {
    if (!treatment.interactions) return [];
    
    try {
      let interactionsData;
      if (typeof treatment.interactions === 'string') {
        interactionsData = JSON.parse(treatment.interactions);
      } else {
        interactionsData = treatment.interactions;
      }
      
      if (!Array.isArray(interactionsData)) return [];
      
      return interactionsData.map((item: any) => ({
        treatment: item.treatment || "Standard treatment",
        severity: item.severity || "moderate",
        effect: item.effect || "Unknown effect"
      }));
    } catch (error) {
      console.error("Error parsing interactions:", error);
      return [];
    }
  };
  
  // Determine safety warning variant based on safety rating
  const getSafetyWarningVariant = (): "warning" | "info" | "caution" => {
    if (!treatment.safetyRating) return "info";
    
    switch (treatment.safetyRating) {
      case "Potentially Harmful":
      case "Use with Caution":
        return "warning";
      case "Safe with Precautions":
        return "caution";
      default:
        return "info";
    }
  };
  
  // Generate safety alert based on safety rating
  const renderSafetyAlert = () => {
    if (!treatment.safetyRating) return null;
    
    // For potentially harmful or cautionary treatments, use our enhanced warning banner
    if (treatment.safetyRating === "Potentially Harmful" || 
        treatment.safetyRating === "Use with Caution" ||
        treatment.safetyRating === "Safe with Precautions") {
      
      // Only display interactions banner for higher risk treatments
      return (
        <SafetyWarningBanner 
          variant={getSafetyWarningVariant()}
          title={`Safety Notice: ${treatment.safetyRating}`}
          interactions={getInteractions()}
        />
      );
    }
    
    // For safe treatments, no alert needed
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{treatment.name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant="outline" className="font-normal">
              {treatment.category}
            </Badge>
            {treatment.evidenceRating && (
              <Badge variant={
                treatment.evidenceRating === 'Strong' ? 'default' :
                treatment.evidenceRating === 'Moderate' ? 'secondary' :
                'outline'
              }>
                <BarChart className="mr-1 h-3 w-3" /> Evidence: {treatment.evidenceRating}
              </Badge>
            )}
            {treatment.safetyRating && (
              <Badge variant={
                treatment.safetyRating === 'Very Safe' ? 'default' :
                treatment.safetyRating === 'Generally Safe' ? 'secondary' :
                treatment.safetyRating === 'Safe with Precautions' ? 'outline' :
                'destructive'
              }>
                <Shield className="mr-1 h-3 w-3" /> Safety: {treatment.safetyRating}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {renderSafetyAlert()}
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="overview">
            <InfoIcon className="mr-2 h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="scientific">
            <Beaker className="mr-2 h-4 w-4" /> Scientific Evidence
          </TabsTrigger>
          <TabsTrigger value="safety">
            <Shield className="mr-2 h-4 w-4" /> Safety Profile
          </TabsTrigger>
          <TabsTrigger value="compatibility">
            <Activity className="mr-2 h-4 w-4" /> Compatibility
          </TabsTrigger>
          <TabsTrigger value="visualization">
            <LineChart className="mr-2 h-4 w-4" /> Visualization
          </TabsTrigger>
          <TabsTrigger value="nutritional">
            <Utensils className="mr-2 h-4 w-4" /> Nutritional
          </TabsTrigger>
          <TabsTrigger value="experiences">
            <Users className="mr-2 h-4 w-4" /> Patient Experiences
          </TabsTrigger>
          <TabsTrigger value="sources">
            <BookOpen className="mr-2 h-4 w-4" /> Sources
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="h-5 w-5 text-primary" />
                Treatment Overview
              </CardTitle>
              <CardDescription>Basic information about this alternative treatment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="whitespace-pre-line">{treatment.description}</p>
                </div>
                
                {treatment.background && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Background & History</h3>
                    <p className="whitespace-pre-line">{treatment.background}</p>
                  </div>
                )}
                
                {treatment.traditionalUsage && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Traditional Usage</h3>
                    <p className="whitespace-pre-line">{treatment.traditionalUsage}</p>
                  </div>
                )}
                
                {treatment.practitionerRequirements && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Practitioner Requirements</h3>
                    <p className="whitespace-pre-line">{treatment.practitionerRequirements}</p>
                  </div>
                )}
                
                {treatment.recommendedBy && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Recommended By</h3>
                    <p className="whitespace-pre-line">{treatment.recommendedBy}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scientific" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5 text-primary" />
                Scientific Evidence
              </CardTitle>
              <CardDescription>Research data and scientific evidence for this treatment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {treatment.mechanismOfAction && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Mechanism of Action</h3>
                    <p className="whitespace-pre-line">{treatment.mechanismOfAction}</p>
                  </div>
                )}
                
                {treatment.scientificEvidence && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Scientific Evidence</h3>
                    {renderScientificEvidence(treatment.scientificEvidence)}
                  </div>
                )}
                
                {treatment.cancerSpecificEvidence && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cancer-Specific Evidence</h3>
                    <p className="whitespace-pre-line">{treatment.cancerSpecificEvidence}</p>
                  </div>
                )}
                
                {treatment.patientExperiences && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Patient Experiences</h3>
                    {renderPatientExperiences(treatment.patientExperiences)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="safety" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Safety Profile
              </CardTitle>
              <CardDescription>Safety information and risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Institutional support badge - show if supported by cancer centers */}
                <InstitutionalSupportBadge treatment={treatment} />
                
                {/* Safety Guidance component */}
                <SafetyGuidance safetyRating={treatment.safetyRating || undefined} />
              
                {treatment.safetyProfile && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Detailed Safety Information</h3>
                    <p className="whitespace-pre-line">{treatment.safetyProfile}</p>
                  </div>
                )}
                
                {/* Known interactions */}
                {getInteractions().length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Known Interactions with Conventional Treatments</h3>
                    <div className="space-y-2">
                      {getInteractions().map((interaction, index) => (
                        <div key={index} className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{interaction.treatment}</h4>
                            <Badge variant={
                              interaction.severity.toLowerCase() === 'high' ? 'destructive' :
                              interaction.severity.toLowerCase() === 'moderate' ? 'default' :
                              'secondary'
                            }>
                              {interaction.severity} Risk
                            </Badge>
                          </div>
                          <p className="text-sm">{interaction.effect}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {treatment.contraindications && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Contraindications</h3>
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Who Should Avoid This Treatment</AlertTitle>
                      <AlertDescription className="whitespace-pre-line">
                        {treatment.contraindications}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                
                {/* Healthcare discussion reminder */}
                <HealthcareDiscussionReminder />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compatibility" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Compatibility with Conventional Treatments
              </CardTitle>
              <CardDescription>Potential interactions with conventional cancer treatments</CardDescription>
            </CardHeader>
            <CardContent>
              {treatment.interactions ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Known Interactions</h3>
                    {renderInteractions(treatment.interactions)}
                  </div>
                  <Separator />
                  <CompatibilityChecker treatment={treatment} />
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">No specific interaction data available for this treatment.</p>
                  <CompatibilityChecker treatment={treatment} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Visualization tab */}
        <TabsContent value="visualization" className="mt-0">
          <TreatmentVisualization treatment={treatment} />
        </TabsContent>
        
        {/* Nutritional approaches tab */}
        <TabsContent value="nutritional" className="mt-0">
          <NutritionalApproaches treatment={treatment} />
        </TabsContent>
        
        {/* Patient experiences tab */}
        <TabsContent value="experiences" className="mt-0">
          <PatientExperiences treatment={treatment} />
        </TabsContent>
        
        <TabsContent value="sources" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Sources & References
              </CardTitle>
              <CardDescription>Research papers, studies, and other references</CardDescription>
            </CardHeader>
            <CardContent>
              {renderSources()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}