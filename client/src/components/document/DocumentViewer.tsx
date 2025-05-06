import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Document } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  FileTextIcon,
  DownloadIcon,
  XIcon,
  ClipboardCheckIcon,
  BrainCircuitIcon,
  SearchIcon,
  MessageCircleIcon,
  LanguagesIcon,
  ArrowRightIcon,
  BookmarkIcon,
  InfoIcon
} from "lucide-react";

interface DocumentViewerProps {
  documentId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentViewer({ documentId, isOpen, onClose }: DocumentViewerProps) {
  const { toast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [askingQuestion, setAskingQuestion] = useState(false);

  useEffect(() => {
    if (documentId && isOpen) {
      fetchDocument();
    } else {
      setDocument(null);
      setInsights(null);
      setShowInsights(false);
      setAnswer(null);
      setQuestion("");
    }
  }, [documentId, isOpen]);

  const fetchDocument = async () => {
    if (!documentId) return;
    
    try {
      setLoading(true);
      const response = await apiRequest<Document>(`/api/documents/${documentId}`);
      setDocument(response);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching document:", error);
      toast({
        title: "Error",
        description: "Failed to load document.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!documentId) return;
    
    try {
      setInsightsLoading(true);
      const response = await apiRequest<any>(`/api/documents/${documentId}/insights`, {
        method: 'POST'
      });
      setInsights(response);
      setShowInsights(true);
      setInsightsLoading(false);
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: "Failed to generate insights for this document.",
        variant: "destructive",
      });
      setInsightsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!documentId || !question.trim()) return;
    
    try {
      setAskingQuestion(true);
      const response = await apiRequest<{answer: string}>(`/api/documents/${documentId}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });
      setAnswer(response.answer);
      setAskingQuestion(false);
    } catch (error) {
      console.error("Error asking question:", error);
      toast({
        title: "Error",
        description: "Failed to process your question.",
        variant: "destructive",
      });
      setAskingQuestion(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string | null | Date) => {
    if (!dateString) return "Not specified";
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString();
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">
              {loading ? "Loading document..." : document?.title}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <XIcon className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          {document && (
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">
                {document.type.charAt(0).toUpperCase() + document.type.slice(1).replace(/_/g, ' ')}
              </Badge>
              <Badge variant="outline">
                Added: {formatDate(document.dateAdded)}
              </Badge>
              {document.sourceDate && (
                <Badge variant="outline">
                  Document date: {formatDate(document.sourceDate)}
                </Badge>
              )}
            </div>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div role="status">
              <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : document ? (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="preview">
                  <FileTextIcon className="h-4 w-4 mr-1" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="analyze">
                  <BrainCircuitIcon className="h-4 w-4 mr-1" />
                  Analyze
                </TabsTrigger>
                <TabsTrigger value="ask">
                  <MessageCircleIcon className="h-4 w-4 mr-1" />
                  Ask Questions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <DownloadIcon className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(document.content || document.parsedContent?.toString() || '')}>
                    <ClipboardCheckIcon className="h-4 w-4 mr-1" />
                    Copy Text
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Document Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {document.parsedContent ? (
                      <div className="whitespace-pre-wrap text-sm">
                        {typeof document.parsedContent === 'string' 
                          ? document.parsedContent 
                          : JSON.stringify(document.parsedContent, null, 2)}
                      </div>
                    ) : document.content ? (
                      <div className="whitespace-pre-wrap text-sm">{document.content}</div>
                    ) : (
                      <div className="text-muted-foreground text-center py-4">
                        No content extracted yet. Use the "Analyze" tab to process this document.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analyze" className="space-y-4">
                <div className="flex flex-col gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Document Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {showInsights ? (
                        <div className="space-y-4">
                          {insights?.summary && (
                            <div className="space-y-2">
                              <h3 className="font-medium">Summary</h3>
                              <p className="text-sm">{insights.summary}</p>
                            </div>
                          )}
                          
                          {insights?.keyTerms?.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="font-medium">Key Medical Terms</h3>
                              <div className="flex flex-wrap gap-2">
                                {insights.keyTerms.map((term: string, idx: number) => (
                                  <Badge key={idx} variant="secondary">
                                    {term}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {insights?.clinicalFindings?.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="font-medium">Clinical Findings</h3>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {insights.clinicalFindings.map((finding: string, idx: number) => (
                                  <li key={idx}>{finding}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {insights?.recommendations?.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="font-medium">Recommendations</h3>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {insights.recommendations.map((rec: string, idx: number) => (
                                  <li key={idx}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 space-y-4">
                          <BrainCircuitIcon className="h-12 w-12 text-primary/40" />
                          <div className="text-center space-y-2">
                            <h3 className="font-medium">Generate AI Insights</h3>
                            <p className="text-sm text-muted-foreground">
                              Use AI to extract key information, summarize content, and identify important medical terms in this document.
                            </p>
                          </div>
                          <Button onClick={handleGenerateInsights} disabled={insightsLoading}>
                            {insightsLoading ? "Processing..." : "Generate Insights"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ask" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ask Questions About This Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="question">Your Question</Label>
                        <div className="flex gap-2">
                          <Input
                            id="question"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="What are the main findings in this document?"
                            disabled={askingQuestion}
                          />
                          <Button onClick={handleAskQuestion} disabled={!question.trim() || askingQuestion}>
                            {askingQuestion ? "Processing..." : "Ask"}
                          </Button>
                        </div>
                      </div>

                      {answer && (
                        <div className="p-4 bg-muted/50 rounded-md space-y-2">
                          <div className="flex items-center space-x-2">
                            <InfoIcon className="h-4 w-4 text-primary" />
                            <h3 className="font-medium">Answer</h3>
                          </div>
                          <p className="text-sm">{answer}</p>
                        </div>
                      )}

                      <div className="pt-2">
                        <h3 className="font-medium text-sm">Suggested Questions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {[
                            "What are the key findings in this document?",
                            "Summarize the main points of this document",
                            "Are there any critical values in this report?",
                            "What treatments are mentioned in this document?",
                            "Explain the medical terminology in this document",
                          ].map((q, idx) => (
                            <Button 
                              key={idx} 
                              variant="outline" 
                              size="sm" 
                              className="justify-start font-normal text-xs"
                              onClick={() => setQuestion(q)}
                              disabled={askingQuestion}
                            >
                              <ArrowRightIcon className="h-3 w-3 mr-1 text-primary" /> {q}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Document not found or could not be loaded.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
