import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MultimodalChat } from '@/components/MultimodalChat';
import { ModelType } from '@shared/schema';
import { MessageCircle, Image as ImageIcon, Info, Lightbulb, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ModelBadge from '@/components/ModelBadge';

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

  const handleResponseReceived = (response: MultimodalResponse) => {
    setResponses(prev => [response, ...prev]);
  };

  return (
    <div className="container py-6 max-w-6xl">
      <div className="flex flex-col space-y-4">
        <div className="pb-2">
          <h1 className="text-2xl font-bold">Medical Image Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Upload medical images along with your message to get AI-powered insights and analysis.
          </p>
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
