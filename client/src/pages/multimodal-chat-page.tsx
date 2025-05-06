import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MultimodalChat } from '@/components/MultimodalChat';
import { ModelType } from '@shared/schema';
import { MessageCircle, Image as ImageIcon, Info, Lightbulb, AlertCircle, FileDown, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ModelBadge from '@/components/ModelBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface MultimodalResponse {
  id: number;
  content: string;
  imageAnalysis?: {
    description: string;
    detectedObjects?: string[];
    detectedText?: string;
    visualFindings?: string[];
  }[];
  contextualInsights?: string[];
  modelUsed: string;
}

interface MultimodalChatPageProps {
  inTabView?: boolean;
}

export default function MultimodalChatPage({ inTabView = false }: MultimodalChatPageProps) {
  const [responses, setResponses] = useState<MultimodalResponse[]>([]);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the disclaimer has been accepted before
    const hasAcceptedDisclaimer = localStorage.getItem('sophera_creative_disclaimer_accepted');
    if (!hasAcceptedDisclaimer) {
      setIsDisclaimerOpen(true);
    } else {
      setIsDisclaimerAccepted(true);
    }
  }, []);

  const handleDisclaimerAccept = () => {
    localStorage.setItem('sophera_creative_disclaimer_accepted', 'true');
    setIsDisclaimerAccepted(true);
    setIsDisclaimerOpen(false);
    toast({
      title: "Welcome to Creative Exploration",
      description: "You can now explore creative solutions and treatments beyond traditional approaches.",
      duration: 5000
    });
  };

  const handleExportDoctorBrief = async () => {
    if (responses.length === 0) {
      toast({
        title: "No content to export",
        description: "Please have a conversation first before exporting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Call the backend API to generate a doctor discussion brief
      const response = await fetch('/api/multimodal/export-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversations: responses }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export doctor brief');
      }
      
      // Get the export data as a blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'Doctor_Discussion_Brief.pdf';
      
      // Append to the document and trigger download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: "Your Doctor Discussion Brief has been downloaded.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export doctor brief. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleResponseReceived = (response: MultimodalResponse) => {
    setResponses(prev => [response, ...prev]);
  };

  return (
    <div className="container py-6 max-w-6xl">
      {/* Disclaimer Dialog */}
      <Dialog open={isDisclaimerOpen} onOpenChange={setIsDisclaimerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Creative Exploration Disclaimer</DialogTitle>
            <DialogDescription>
              Before using the Creative Exploration Sandbox, please read and acknowledge the following:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">What is Creative Exploration?</h4>
              <p className="text-muted-foreground">
                The Creative Exploration Sandbox allows you to explore unconventional or experimental approaches to cancer care that may not be part of standard medical practice.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Important Disclaimer</h4>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Ideas and suggestions provided in this section are <strong>not medical advice</strong>.</li>
                <li>Always consult with your healthcare team before trying any new treatments or approaches.</li>
                <li>Information here may include approaches not supported by traditional clinical evidence.</li>
                <li>We encourage creative thinking but prioritize your safety above all.</li>
              </ul>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="disclaimer-checkbox" onCheckedChange={(checked) => {
                if (checked) {
                  handleDisclaimerAccept();
                }
              }} />
              <Label htmlFor="disclaimer-checkbox" className="text-sm">
                I understand this is for exploratory purposes only and not medical advice
              </Label>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button variant="ghost" onClick={() => setIsDisclaimerOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="flex flex-col space-y-4">
        <div className="pb-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Creative Exploration</h1>
            <p className="text-muted-foreground mt-1">
              Explore innovative approaches and ideas for your cancer journey in a safe space.
            </p>
          </div>
          {responses.length > 0 && (
            <Button 
              onClick={handleExportDoctorBrief}
              disabled={isExporting || !isDisclaimerAccepted}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing Document...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  Export Doctor Discussion Brief
                </>
              )}
            </Button>
          )}
        </div>
        
        <Card className="w-full bg-blue-50 border-blue-200 mb-2">
          <CardContent className="pt-4 pb-2">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 text-sm">Important Privacy Information</h3>
                <p className="text-blue-700 text-xs mt-1">
                  Before uploading any medical images, please ensure they contain no personal identifying information. 
                  This tool is for informational purposes only and should not replace professional medical advice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-secondary/30 rounded-lg p-3 flex items-start gap-2">
            <div className="bg-primary/10 rounded-full p-1.5">
              <ImageIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Upload Images</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Add up to 5 medical images for analysis</p>
            </div>
          </div>
          
          <div className="bg-secondary/30 rounded-lg p-3 flex items-start gap-2">
            <div className="bg-primary/10 rounded-full p-1.5">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Add Context</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Describe what you'd like to learn about</p>
            </div>
          </div>
          
          <div className="bg-secondary/30 rounded-lg p-3 flex items-start gap-2">
            <div className="bg-primary/10 rounded-full p-1.5">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Receive Insights</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Get AI analysis of your medical images</p>
            </div>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Upload & Analyze</CardTitle>
            <CardDescription>
              Share medical images with AI for professional analysis and explanations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MultimodalChat onSend={handleResponseReceived} />
          </CardContent>
        </Card>

        {responses.length > 0 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Recent AI analyses of your uploads and messages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {responses.map((response, index) => (
                    <div key={response.id || index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ModelBadge model={response.modelUsed as ModelType} showText />
                          <span className="text-sm font-medium">Response #{responses.length - index}</span>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="flex items-center gap-1 h-7 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 cursor-help">
                                <Info className="h-3.5 w-3.5" />
                                <span className="text-xs">Multimodal Analysis</span>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>This analysis was generated from both text and image inputs using advanced AI vision capabilities.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      <div className="bg-secondary/40 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <MessageCircle className="h-5 w-5 mt-1 text-primary" />
                          <div className="flex-1">
                            <div className="font-medium mb-1">Analysis</div>
                            <div className="text-sm whitespace-pre-wrap">{response.content}</div>
                          </div>
                        </div>
                      </div>
                      
                      {response.imageAnalysis && response.imageAnalysis.length > 0 && (
                        <div className="bg-secondary/40 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <ImageIcon className="h-5 w-5 mt-1 text-primary" />
                            <div className="flex-1">
                              <div className="font-medium mb-1">Image Analysis</div>
                              <div className="space-y-2">
                                {response.imageAnalysis.map((analysis, i) => (
                                  <div key={i} className="text-sm">
                                    <div className="font-medium text-xs text-muted-foreground mb-1">Image {i + 1}</div>
                                    <div className="whitespace-pre-wrap">{analysis.description}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {response.contextualInsights && response.contextualInsights.length > 0 && (
                        <div className="bg-secondary/40 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-5 w-5 mt-1 text-amber-500" />
                            <div className="flex-1">
                              <div className="font-medium mb-1">Contextual Insights</div>
                              <div className="space-y-2">
                                {response.contextualInsights.map((insight, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <span className="text-sm text-muted-foreground mt-0.5">•</span>
                                    <p className="text-sm flex-1">{insight}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {index < responses.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Analysis results are not stored permanently and will be lost on page refresh.
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
