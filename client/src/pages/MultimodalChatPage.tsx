
// client/src/pages/MultimodalChatPage.tsx

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MultimodalChat } from '@/components/MultimodalChat';
import { ModelType } from '@shared/schema';
import { MessageCircle, Image as ImageIcon, Info, Lightbulb, AlertCircle, FileDown, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ModelBadge from '@/components/ModelBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface MultimodalResponse {
  id: string;
  content: string;
  imageAnalysis?: {
    description: string;
    detectedObjects?: string[];
    detectedText?: string;
    visualFindings?: string[];
  }[];
  contextualInsights?: string[];
  modelUsed: string;
  timestamp: string;
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
      title: "Welcome to Creative Exploration!",
      description: "You can now explore creative solutions and treatments beyond traditional approaches.",
      className: "bg-sophera-brand-primary text-white rounded-sophera-button shadow-lg",
      duration: 5000
    });
  };

  const handleExportDoctorBrief = async () => {
    if (responses.length === 0) {
      toast({
        title: "No Content to Export",
        description: "Please have a conversation first before exporting your brief.",
        variant: "destructive",
        className: "rounded-sophera-button shadow-lg",
      });
      return;
    }
    setIsExporting(true);
    try {
      const briefContent = responses.map(r => `Model: ${r.modelUsed}\nResponse: ${r.content}\n---\n`).join('\n\n');
      const blob = new Blob([`Sophera - Creative Exploration Brief\n\nDate: ${new Date().toLocaleDateString()}\n\n${briefContent}`], { type: 'text/plain' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Sophera_Doctor_Discussion_Brief_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Export Successful!",
        description: "Your Doctor Discussion Brief has been downloaded.",
        className: "bg-sophera-brand-primary text-white rounded-sophera-button shadow-lg",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Could not export your brief. Please try again.",
        variant: "destructive",
        className: "rounded-sophera-button shadow-lg",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleResponseReceived = (newContent: string, modelUsed: ModelType, imageAnalysis?: any[], contextualInsights?: string[]) => {
    const newResponse: MultimodalResponse = {
      id: Date.now().toString(),
      content: newContent,
      modelUsed: modelUsed,
      imageAnalysis,
      contextualInsights,
      timestamp: new Date().toISOString(),
    };
    setResponses(prev => [newResponse, ...prev]);
  };

  const sortedResponses = useMemo(() => {
    return [...responses].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [responses]);

  const pageContainerClasses = inTabView 
    ? "py-6" 
    : "container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-10";

  return (
    <div className={pageContainerClasses}>
      <Dialog open={isDisclaimerOpen && !isDisclaimerAccepted} onOpenChange={(isOpen) => {
        if (!isOpen && !isDisclaimerAccepted) {
          setIsDisclaimerOpen(false);
        } else {
          setIsDisclaimerOpen(isOpen);
        }
      }}>
        <DialogContent className="sm:max-w-lg p-0 rounded-sophera-modal-outer bg-sophera-bg-card shadow-xl">
          <DialogHeader className="px-6 py-5 border-b border-sophera-border-primary">
            <DialogTitle className="text-2xl font-bold text-sophera-text-heading flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-sophera-accent-tertiary"/> Creative Exploration Disclaimer
            </DialogTitle>
            <DialogDescription className="text-sophera-text-body pt-2 text-base">
              Before using this Sandbox, please read and acknowledge the following:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 px-6 py-5 text-sm">
            <div className="space-y-1">
              <h4 className="font-semibold text-sophera-text-heading text-base">What is Creative Exploration?</h4>
              <p className="text-sophera-text-body leading-relaxed">
                The Creative Exploration Sandbox allows you to explore unconventional or experimental approaches to cancer care that may not be part of standard medical practice.
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sophera-text-heading text-base">Important Disclaimer</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-sophera-text-body leading-relaxed">
                <li>Ideas and suggestions provided in this section are <strong className="text-sophera-destructive">not medical advice</strong>.</li>
                <li>Always consult with your healthcare team before trying any new treatments or approaches.</li>
                <li>Information here may include approaches not supported by traditional clinical evidence.</li>
                <li>We encourage creative thinking but prioritize your safety above all.</li>
              </ul>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <Checkbox id="disclaimer-checkbox" onCheckedChange={(checked) => { if (checked) { handleDisclaimerAccept(); }}} />
              <Label htmlFor="disclaimer-checkbox" className="text-sm font-medium text-sophera-text-body cursor-pointer">
                I understand this is for exploratory purposes only and not medical advice.
              </Label>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-sophera-border-primary sm:justify-start">
            <Button variant="outline" onClick={() => setIsDisclaimerOpen(false)} className="rounded-sophera-button text-base h-11">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className={`flex flex-col space-y-6 md:space-y-8 ${!isDisclaimerAccepted ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-sophera-text-heading mb-1 flex items-center gap-3 justify-center md:justify-start">
                <Lightbulb className="h-8 w-8 lg:h-9 lg:w-9 text-sophera-accent-tertiary"/> Creative Exploration
            </h1>
            <p className="text-lg lg:text-xl text-sophera-text-body">
              Brainstorm innovative ideas for your healing journey in a safe, AI-assisted space.
            </p>
          </div>
          {sortedResponses.length > 0 && isDisclaimerAccepted && (
            <Button
              onClick={handleExportDoctorBrief}
              disabled={isExporting}
              className="w-full md:w-auto bg-sophera-brand-primary text-white rounded-sophera-button py-3 px-5 text-base font-semibold tracking-wide hover:bg-sophera-brand-primary-hover transform hover:scale-103 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <FileDown className="h-5 w-5" />
              )}
              {isExporting ? "Preparing Brief..." : "Export Doctor Brief"}
            </Button>
          )}
        </div>

        <Card className="w-full bg-sophera-brand-primary-light border-sophera-brand-primary/50 rounded-sophera-card shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-sophera-brand-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sophera-brand-primary text-base">Important Privacy & Use Information</h3>
                <p className="text-sophera-text-body text-sm mt-1 leading-relaxed">
                  Before uploading medical images, please ensure they contain no personal identifying information (e.g., name, DOB, MRN). This tool is for informational and exploratory purposes only and does not provide medical advice. Always consult your healthcare team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <ImageIcon className="h-6 w-6 text-sophera-accent-secondary"/>, title: "Upload Visuals", text: "Share medical images or diagrams for AI analysis." },
            { icon: <MessageCircle className="h-6 w-6 text-sophera-brand-primary"/>, title: "Add Your Thoughts", text: "Describe your questions, ideas, or what you want to explore." },
            { icon: <Sparkles className="h-6 w-6 text-sophera-accent-tertiary"/>, title: "Discover Insights", text: "Receive AI-generated analysis and connections." },
          ].map(item => (
            <Card key={item.title} className="bg-sophera-bg-card border-sophera-border-primary rounded-sophera-card shadow-lg p-5 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-sophera-gradient-start rounded-full shadow-inner">
                  {item.icon}
                </div>
              </div>
              <h3 className="text-md font-semibold text-sophera-text-heading mb-1">{item.title}</h3>
              <p className="text-xs text-sophera-text-subtle">{item.text}</p>
            </Card>
          ))}
        </div>
        
        <Card className="w-full bg-sophera-bg-card border-sophera-border-primary rounded-sophera-card shadow-xl">
          <CardHeader className="p-6 border-b border-sophera-border-primary">
            <CardTitle className="text-xl lg:text-2xl font-semibold text-sophera-text-heading">Sandbox Chat</CardTitle>
            <CardDescription className="text-sophera-text-body pt-1 text-base">
              Use text and upload images to explore ideas with the AI. (Gemini Pro Vision model recommended for image analysis).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <MultimodalChat onSend={handleResponseReceived} disabled={!isDisclaimerAccepted} />
          </CardContent>
        </Card>

        {sortedResponses.length > 0 && (
          <Card className="w-full bg-sophera-bg-card border-sophera-border-primary rounded-sophera-card shadow-xl">
            <CardHeader className="p-6 border-b border-sophera-border-primary">
              <CardTitle className="text-xl lg:text-2xl font-semibold text-sophera-text-heading">Exploration Log</CardTitle>
              <CardDescription className="text-sophera-text-body pt-1 text-base">
                Review of your recent AI interactions in this sandbox.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px] lg:h-[700px]">
                <div className="space-y-8 p-6">
                  {sortedResponses.map((response, index) => (
                    <div key={response.id} className="space-y-4 pb-6 border-b border-sophera-border-primary/50 last:border-b-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <ModelBadge model={response.modelUsed as ModelType} showText />
                          <span className="text-sm font-medium text-sophera-text-body">Response #{responses.length - index}</span>
                          <span className="text-xs text-sophera-text-subtle">{new Date(response.timestamp).toLocaleString()}</span>
                        </div>
                        {(response.imageAnalysis && response.imageAnalysis.length > 0) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="rounded-sophera-button border-sophera-accent-secondary text-sophera-accent-secondary bg-sophera-accent-secondary/10 text-xs h-7 px-2.5 cursor-help">
                                  <ImageIcon className="h-3.5 w-3.5 mr-1.5" /> Multimodal Analysis
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent className="rounded-sophera-input bg-sophera-text-heading text-white shadow-lg max-w-xs">
                                <p>This analysis was generated from both text and image inputs using advanced AI vision capabilities.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>

                      <div className="bg-sophera-gradient-start/60 rounded-xl p-4 border border-sophera-border-primary/50 shadow-sm">
                        <div className="flex items-start gap-3">
                          <MessageCircle className="h-5 w-5 mt-1 text-sophera-brand-primary flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-semibold text-sophera-text-heading mb-1.5">AI Analysis:</div>
                            <div className="text-sm text-sophera-text-body whitespace-pre-wrap leading-relaxed">{response.content}</div>
                          </div>
                        </div>
                      </div>

                      {response.imageAnalysis && response.imageAnalysis.length > 0 && (
                        <div className="bg-sophera-gradient-end/60 rounded-xl p-4 border border-sophera-border-primary/50 shadow-sm">
                          <div className="flex items-start gap-3">
                            <ImageIcon className="h-5 w-5 mt-1 text-sophera-accent-secondary flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-semibold text-sophera-text-heading mb-1.5">Image Insights:</div>
                              <div className="space-y-2">
                                {response.imageAnalysis.map((analysis, i) => (
                                  <div key={`img-${i}`} className="text-sm">
                                    <div className="font-medium text-xs text-sophera-text-subtle mb-1">Image {i + 1} Description:</div>
                                    <div className="text-sophera-text-body whitespace-pre-wrap leading-relaxed">{analysis.description}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {response.contextualInsights && response.contextualInsights.length > 0 && (
                        <div className="bg-sophera-accent-tertiary/10 rounded-xl p-4 border border-sophera-accent-tertiary/30 shadow-sm">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 mt-1 text-sophera-accent-tertiary flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-semibold text-sophera-text-heading mb-1.5">Contextual Connections:</div>
                              <ul className="space-y-1.5 list-disc pl-5">
                                {response.contextualInsights.map((insight, i) => (
                                  <li key={`insight-${i}`} className="text-sm text-sophera-text-body leading-relaxed">{insight}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t border-sophera-border-primary text-xs text-sophera-text-subtle">
              <Info className="h-3.5 w-3.5 mr-1.5"/>
              Analysis results in this sandbox are for exploration and are not stored permanently. Export any important findings.
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
