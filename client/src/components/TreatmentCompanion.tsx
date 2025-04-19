import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertCircle, 
  Heart, 
  Send, 
  User, 
  Bot, 
  Info, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Lightbulb,
  HelpCircle 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Define message types
interface CompanionMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
}

interface CompanionOptions {
  patientName?: string;
  diagnosis?: string;
  currentTreatment?: string;
  treatmentHistory?: string[];
  recentSymptoms?: string[];
  userPreferences?: {
    communicationStyle?: 'detailed' | 'concise' | 'encouraging' | 'factual';
    emotionalTone?: 'empathetic' | 'practical' | 'hopeful' | 'neutral';
  };
}

interface CopingStrategy {
  strategies: string[];
  disclaimer: string;
}

interface TreatmentCompanionProps {
  initialMessages?: CompanionMessage[];
  currentTreatment?: string;
  className?: string;
}

const TreatmentCompanion: React.FC<TreatmentCompanionProps> = ({
  initialMessages = [],
  currentTreatment = "",
  className = ""
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<CompanionMessage[]>(
    initialMessages.length > 0 ? initialMessages : [
      {
        id: uuidv4(),
        role: 'assistant',
        content: `Hello, I'm your Treatment Companion. I'm here to support you throughout your cancer treatment journey. 

How are you feeling today? You can share any concerns, ask questions about your treatment, or just chat about your day.`,
        timestamp: new Date(),
      },
    ]
  );
  
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [communicationStyle, setCommunicationStyle] = useState<string>("empathetic");
  const [isCopingVisible, setIsCopingVisible] = useState(false);
  const [concernInput, setConcernInput] = useState("");
  const [copingStrategies, setCopingStrategies] = useState<CopingStrategy | null>(null);
  const [loadingCoping, setLoadingCoping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);
  
  // Generate companion response mutation
  const generateResponseMutation = useMutation({
    mutationFn: async ({ message, previousMessages }: { message: string, previousMessages: CompanionMessage[] }) => {
      const options: CompanionOptions = {
        currentTreatment,
        userPreferences: {
          emotionalTone: communicationStyle as any,
        }
      };
      
      return apiRequest<{ content: string }>('/api/companion/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          previousMessages: previousMessages.map(m => ({ role: m.role, content: m.content })),
          options 
        }),
      });
    },
  });
  
  // Generate coping strategies mutation
  const generateCopingMutation = useMutation({
    mutationFn: async (concern: string) => {
      return apiRequest<CopingStrategy>('/api/companion/coping-strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concern }),
      });
    },
  });
  
  // Generate follow-up question mutation
  const generateFollowUpMutation = useMutation({
    mutationFn: async (treatmentName: string) => {
      return apiRequest<{ question: string }>('/api/companion/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treatmentName }),
      });
    },
  });
  
  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    const userMessage: CompanionMessage = {
      id: uuidv4(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };
    
    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);
    
    // Create a temporary placeholder for assistant response
    const assistantPlaceholderId = uuidv4();
    setMessages(prev => [
      ...prev, 
      {
        id: assistantPlaceholderId,
        role: "assistant",
        content: "...",
        timestamp: new Date(),
      }
    ]);
    
    try {
      // Get the last few messages for context, limited to 6 messages
      const recentMessages = messages.slice(-6);
      // Add the current user message
      const contextMessages = [...recentMessages, userMessage];
      
      // Generate response
      const response = await generateResponseMutation.mutateAsync({
        message: userMessage.content,
        previousMessages: contextMessages
      });
      
      // Replace placeholder with actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantPlaceholderId 
            ? {
                id: assistantPlaceholderId,
                role: "assistant",
                content: response.content,
                timestamp: new Date(),
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error generating companion response:", error);
      
      // Replace placeholder with error message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantPlaceholderId 
            ? {
                id: assistantPlaceholderId,
                role: "assistant",
                content: "I'm sorry, I encountered an issue while processing your message. Please try again.",
                timestamp: new Date(),
              }
            : msg
        )
      );
      
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle clearing chat
  const handleClearChat = () => {
    setMessages([
      {
        id: uuidv4(),
        role: 'assistant',
        content: `Hello, I'm your Treatment Companion. I'm here to support you throughout your cancer treatment journey. 

How are you feeling today? You can share any concerns, ask questions about your treatment, or just chat about your day.`,
        timestamp: new Date(),
      },
    ]);
  };
  
  // Handle getting follow-up question
  const handleGetFollowUp = async () => {
    if (!currentTreatment || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const response = await generateFollowUpMutation.mutateAsync(currentTreatment);
      
      // Add assistant message with the follow-up question
      const followUpMessage: CompanionMessage = {
        id: uuidv4(),
        role: "assistant",
        content: response.question,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, followUpMessage]);
    } catch (error) {
      console.error("Error generating follow-up question:", error);
      toast({
        title: "Error",
        description: "Failed to generate a follow-up question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle message feedback
  const handleFeedback = (messageId: string, feedbackType: 'positive' | 'negative') => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, feedback: feedbackType }
          : msg
      )
    );
    
    // You could also send this feedback to your backend for logging or improvement
    toast({
      title: "Thank you",
      description: "Your feedback helps improve the companion's responses.",
    });
  };
  
  // Handle generating coping strategies
  const handleGetCopingStrategies = async () => {
    if (!concernInput.trim() || loadingCoping) return;
    
    setLoadingCoping(true);
    
    try {
      const response = await generateCopingMutation.mutateAsync(concernInput);
      setCopingStrategies(response);
    } catch (error) {
      console.error("Error generating coping strategies:", error);
      toast({
        title: "Error",
        description: "Failed to generate coping strategies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingCoping(false);
    }
  };
  
  return (
    <div className={`treatment-companion ${className}`}>
      <Card className="relative h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2 bg-primary">
                <AvatarFallback>TC</AvatarFallback>
                <AvatarImage src="/treatment-companion-avatar.png" />
              </Avatar>
              <div>
                <CardTitle className="text-lg">Treatment Companion</CardTitle>
                <CardDescription>Personalized support for your cancer journey</CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCopingVisible(!isCopingVisible)}
                title="Coping strategies"
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Coping</span>
              </Button>
              
              <Select
                value={communicationStyle}
                onValueChange={setCommunicationStyle}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empathetic">Empathetic</SelectItem>
                  <SelectItem value="practical">Practical</SelectItem>
                  <SelectItem value="hopeful">Hopeful</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearChat}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Coping Strategies Panel */}
          {isCopingVisible && (
            <div className="mb-4 bg-muted/20 p-4 rounded-lg border">
              <h3 className="font-medium mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                Coping Strategies Generator
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Describe a symptom or concern you're experiencing, and I'll suggest some coping strategies.
              </p>
              
              <div className="flex gap-2 mb-4">
                <Textarea
                  placeholder="e.g., anxiety about upcoming surgery, trouble sleeping, nausea from chemotherapy"
                  value={concernInput}
                  onChange={(e) => setConcernInput(e.target.value)}
                  className="min-h-[60px] flex-1"
                />
                <Button 
                  onClick={handleGetCopingStrategies}
                  disabled={loadingCoping || !concernInput.trim()}
                  className="self-end"
                >
                  {loadingCoping ? "Loading..." : "Generate"}
                </Button>
              </div>
              
              {copingStrategies && (
                <div className="mt-2">
                  <h4 className="font-medium mb-2">Suggested Strategies:</h4>
                  <ul className="space-y-2">
                    {copingStrategies.strategies.map((strategy, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{strategy}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 text-xs text-muted-foreground flex items-start gap-2">
                    <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{copingStrategies.disclaimer}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Chat Messages */}
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-2 max-w-[90%] ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div
                    className={`flex flex-col space-y-2 ${
                      message.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content === "..." ? (
                        <div className="flex items-center gap-1 animate-pulse">
                          <div className="h-1.5 w-1.5 bg-current rounded-full"></div>
                          <div className="h-1.5 w-1.5 bg-current rounded-full"></div>
                          <div className="h-1.5 w-1.5 bg-current rounded-full"></div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                    
                    {/* Feedback buttons, only for assistant messages and not for loading state */}
                    {message.role === "assistant" && message.content !== "..." && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFeedback(message.id, "positive")}
                          className={`text-xs flex items-center gap-1 ${
                            message.feedback === "positive"
                              ? "text-green-600"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          disabled={message.feedback !== undefined}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>Helpful</span>
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, "negative")}
                          className={`text-xs flex items-center gap-1 ${
                            message.feedback === "negative"
                              ? "text-red-600"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          disabled={message.feedback !== undefined}
                        >
                          <ThumbsDown className="h-3 w-3" />
                          <span>Not helpful</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        
        <CardFooter className="p-4 border-t flex-shrink-0">
          <div className="grid w-full gap-2">
            {currentTreatment && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGetFollowUp}
                  disabled={isProcessing}
                  className="text-xs"
                >
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Get treatment follow-up
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Textarea
                ref={textareaRef}
                placeholder="Type your message here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[60px] flex-1"
                disabled={isProcessing}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isProcessing || !inputValue.trim()}
                className="self-end"
              >
                {isProcessing ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            <div className="text-xs flex items-start gap-2 text-muted-foreground">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>
                This companion provides emotional support and general information.
                For medical concerns, always consult your healthcare team.
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TreatmentCompanion;