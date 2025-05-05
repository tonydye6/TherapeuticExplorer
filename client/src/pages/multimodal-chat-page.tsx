import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MultimodalChat } from '@/components/MultimodalChat';
import { ModelType } from '@shared/schema';
import { MessageCircle, Image as ImageIcon } from 'lucide-react';
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

export default function MultimodalChatPage() {
  const [responses, setResponses] = useState<MultimodalResponse[]>([]);

  const handleResponseReceived = (response: MultimodalResponse) => {
    setResponses(prev => [response, ...prev]);
  };

  return (
    <div className="container py-6 max-w-6xl">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Multimodal Analysis</h1>
          <p className="text-muted-foreground">
            Upload medical images along with your message to get AI-powered insights and analysis.
          </p>
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
                      <div className="flex items-center gap-2">
                        <ModelBadge model={response.modelUsed as ModelType} />
                        <span className="text-sm font-medium">Response #{responses.length - index}</span>
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
                        <div>
                          <div className="font-medium text-sm mb-2">Contextual Insights</div>
                          <ul className="list-disc list-inside space-y-1">
                            {response.contextualInsights.map((insight, i) => (
                              <li key={i} className="text-sm">{insight}</li>
                            ))}
                          </ul>
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
