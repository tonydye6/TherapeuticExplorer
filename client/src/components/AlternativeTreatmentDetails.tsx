import { AlternativeTreatment } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoIcon, AlertTriangle, FileText, BarChart, ThumbsUp, BookOpen } from "lucide-react";

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
  
  // Helper function to render sources
  const renderSources = () => {
    if (!treatment.sources || (Array.isArray(treatment.sources) && treatment.sources.length === 0)) {
      return <p className="text-sm text-muted-foreground italic">No sources provided</p>;
    }
    
    const sources = Array.isArray(treatment.sources) ? treatment.sources : [];
    
    return (
      <div className="space-y-3">
        {sources.map((source: any, index: number) => (
          <div key={index} className="border-b pb-2 last:border-0">
            <p className="font-medium">{source.title}</p>
            {source.author && <p className="text-sm">Author: {source.author}</p>}
            {source.year && <p className="text-sm">Year: {source.year}</p>}
            {source.publisher && <p className="text-sm">Publisher: {source.publisher}</p>}
            {source.url && (
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-blue-600 hover:underline mt-1 block"
              >
                View Source
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Generate safety alert based on safety rating
  const renderSafetyAlert = () => {
    if (!treatment.safetyRating) return null;
    
    let variant = "default";
    let message = "";
    
    switch (treatment.safetyRating) {
      case "Very Safe":
      case "Generally Safe":
        return null; // No alert needed
      case "Safe with Precautions":
        variant = "default";
        message = "Safe when used properly, but precautions should be observed. Review contraindications and interactions.";
        break;
      case "Use with Caution":
        variant = "default";
        message = "This treatment should be used with caution. Consult a healthcare provider before use.";
        break;
      case "Potentially Harmful":
        variant = "destructive";
        message = "This treatment has potential risks and should only be considered under proper medical supervision.";
        break;
    }
    
    return (
      <Alert variant={variant as "default" | "destructive"} className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Safety Notice: {treatment.safetyRating}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{treatment.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="font-normal">
              {treatment.category}
            </Badge>
            {treatment.evidenceRating && (
              <Badge variant={
                treatment.evidenceRating === 'Strong' ? 'default' :
                treatment.evidenceRating === 'Moderate' ? 'secondary' :
                'outline'
              }>
                Evidence: {treatment.evidenceRating}
              </Badge>
            )}
            {treatment.safetyRating && (
              <Badge variant={
                treatment.safetyRating === 'Very Safe' ? 'default' :
                treatment.safetyRating === 'Generally Safe' ? 'secondary' :
                treatment.safetyRating === 'Safe with Precautions' ? 'outline' :
                'destructive'
              }>
                Safety: {treatment.safetyRating}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {renderSafetyAlert()}
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">
            <InfoIcon className="mr-2 h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="scientific">
            <BarChart className="mr-2 h-4 w-4" /> Scientific Information
          </TabsTrigger>
          <TabsTrigger value="practical">
            <ThumbsUp className="mr-2 h-4 w-4" /> Practical Information
          </TabsTrigger>
          <TabsTrigger value="sources">
            <BookOpen className="mr-2 h-4 w-4" /> Sources
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{treatment.description}</p>
              
              <div className="mt-6 space-y-6">
                {renderSection("Background", treatment.background)}
                {renderSection("Traditional Usage", treatment.traditionalUsage)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scientific" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Scientific Information</CardTitle>
              <CardDescription>Research data and scientific evidence for this treatment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {renderSection("Mechanism of Action", treatment.mechanismOfAction)}
                {renderSection("Scientific Evidence", treatment.scientificEvidence)}
                {renderSection("Cancer-Specific Evidence", treatment.cancerSpecificEvidence)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="practical" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Safety & Practical Information</CardTitle>
              <CardDescription>Safety information and practical guidance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {renderSection("Safety Profile", treatment.safetyProfile)}
                {renderSection("Contraindications", treatment.contraindications)}
                {renderSection("Interactions", treatment.interactions)}
                <Separator />
                {renderSection("Practitioner Requirements", treatment.practitionerRequirements)}
                {renderSection("Recommended By", treatment.recommendedBy)}
                {renderSection("Patient Experiences", treatment.patientExperiences)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Sources & References</CardTitle>
              <CardDescription>Research, studies, and other references</CardDescription>
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