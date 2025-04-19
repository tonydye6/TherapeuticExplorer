import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import MessageBubble, { Message, MessageRole, MessageContent } from "@/components/MessageBubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModelType } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import { Send, StopCircle, MicIcon, FileText, RotateCcw, X } from "lucide-react";

interface ChatInterfaceProps {
  title?: string;
  placeholder?: string;
  initialMessages?: Message[];
  onSendMessage?: (message: string) => Promise<any>;
  onClearChat?: () => void;
  preferredModel?: ModelType;
  className?: string;
}

export default function ChatInterface({
  title = "Research Assistant",
  placeholder = "Ask about esophageal cancer treatments, clinical trials, or research...",
  initialMessages = [],
  onSendMessage,
  onClearChat,
  preferredModel,
  className
}: ChatInterfaceProps) {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
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
  
  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      role: "user" as MessageRole,
      content: { text: inputValue.trim() },
      timestamp: new Date(),
    };
    
    const tempAssistantMessage: Message = {
      id: uuidv4(),
      role: "assistant" as MessageRole,
      content: { text: "" },
      timestamp: new Date(),
      isLoading: true,
      modelUsed: preferredModel || ModelType.GPT,
    };
    
    setMessages(prev => [...prev, userMessage, tempAssistantMessage]);
    setInputValue("");
    setIsProcessing(true);
    
    try {
      let response;
      
      if (onSendMessage) {
        response = await onSendMessage(userMessage.content.text || "");
      } else {
        // Default API call if no custom handler provided
        const result = await apiRequest("POST", "/api/message", { 
          content: userMessage.content.text,
          preferredModel: preferredModel
        });
        
        if (!result.ok) {
          throw new Error("Failed to send message");
        }
        
        response = await result.json();
      }
      
      // Replace the loading message with the actual response
      setMessages(prev => prev.map(msg => 
        msg.id === tempAssistantMessage.id
          ? {
              ...tempAssistantMessage,
              content: {
                text: response.content,
                treatments: response.treatments || [],
                clinicalTrials: response.clinicalTrials || [],
                sources: response.sources || [],
              },
              modelUsed: response.modelUsed || preferredModel || ModelType.GPT,
              isLoading: false,
            }
          : msg
      ));
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Update the loading message to show the error
      setMessages(prev => prev.map(msg => 
        msg.id === tempAssistantMessage.id
          ? {
              ...tempAssistantMessage,
              content: { 
                text: "I'm sorry, I encountered an error while processing your request. Please try again." 
              },
              isLoading: false,
            }
          : msg
      ));
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle voice input
  const handleVoiceInput = () => {
    // Check if browser supports speech recognition
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert("Speech recognition is not supported in your browser.");
    }
  };
  
  // Handle document upload
  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file); // Changed from "document" to "file" to match backend
      formData.append("title", file.name);
      formData.append("type", "medical_record");
      
      const userMessage: Message = {
        id: uuidv4(),
        role: "user" as MessageRole,
        content: { text: `Uploaded medical document: ${file.name}` },
        timestamp: new Date(),
      };
      
      const tempAssistantMessage: Message = {
        id: uuidv4(),
        role: "assistant" as MessageRole,
        content: { text: "Analyzing document with OCR..." },
        timestamp: new Date(),
        isLoading: true,
        modelUsed: preferredModel || ModelType.CLAUDE,
      };
      
      setMessages(prev => [...prev, userMessage, tempAssistantMessage]);
      
      // Use our new OCR endpoint
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze document");
      }
      
      const result = await response.json();
      
      // Extract relevant information from the OCR results
      const document = result.document;
      const processingResults = result.processingResults;
      const analysis = document.parsedContent?.analysis;
      
      // Format a user-friendly summary message
      let summaryText = "Here's what I found in your document:\n\n";
      
      if (analysis?.sourceType) {
        summaryText += `Document Type: ${analysis.sourceType}\n\n`;
      }
      
      if (analysis?.summary) {
        summaryText += `${analysis.summary}\n\n`;
      }
      
      if (analysis?.keyInfo) {
        const keyInfo = analysis.keyInfo;
        
        if (keyInfo.diagnoses && keyInfo.diagnoses.length > 0) {
          summaryText += "Key Diagnoses:\n";
          keyInfo.diagnoses.forEach((diagnosis: string) => {
            summaryText += `- ${diagnosis}\n`;
          });
          summaryText += "\n";
        }
        
        if (keyInfo.medications && keyInfo.medications.length > 0) {
          summaryText += "Medications:\n";
          keyInfo.medications.forEach((medication: string) => {
            summaryText += `- ${medication}\n`;
          });
          summaryText += "\n";
        }
        
        if (keyInfo.procedures && keyInfo.procedures.length > 0) {
          summaryText += "Procedures:\n";
          keyInfo.procedures.forEach((procedure: string) => {
            summaryText += `- ${procedure}\n`;
          });
          summaryText += "\n";
        }
        
        if (keyInfo.labValues && Object.keys(keyInfo.labValues).length > 0) {
          summaryText += "Lab Values:\n";
          Object.entries(keyInfo.labValues).forEach(([key, value]) => {
            summaryText += `- ${key}: ${value}\n`;
          });
          summaryText += "\n";
        }
      }
      
      if (processingResults?.confidence) {
        summaryText += `\nDocument processing confidence: ${Math.round(processingResults.confidence * 100)}%\n`;
      }
      
      summaryText += "\nWould you like me to analyze this information further in relation to esophageal cancer research?";
      
      // Replace the loading message with the analysis results
      setMessages(prev => prev.map(msg => 
        msg.id === tempAssistantMessage.id
          ? {
              ...tempAssistantMessage,
              content: {
                text: summaryText,
                sources: [{ title: file.name, type: "Medical Document", date: new Date().toISOString() }],
                structuredData: analysis?.keyInfo || {},
              },
              modelUsed: ModelType.CLAUDE,
              isLoading: false,
            }
          : msg
      ));
    } catch (error) {
      console.error("Error uploading document:", error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant" as MessageRole,
        content: { 
          text: "I'm sorry, I couldn't analyze that document. Please make sure it's a supported file type (PDF, JPEG, PNG, TIFF, GIF) and try again." 
        },
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsUploading(false);
      event.target.value = ""; // Reset the file input
    }
  };
  
  // Handle clearing chat
  const handleClearChat = () => {
    if (onClearChat) {
      onClearChat();
    }
    setMessages([]);
  };
  
  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      {title && (
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="text-lg font-medium">{title}</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearChat}
            disabled={messages.length === 0}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear Chat
          </Button>
        </div>
      )}
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t p-3 bg-background">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              className="min-h-[60px] max-h-[200px] resize-none pr-10 py-3"
              disabled={isProcessing}
            />
            {inputValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6 opacity-70 hover:opacity-100"
                onClick={() => setInputValue("")}
                tabIndex={-1}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            {/* Document upload button */}
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                className="sr-only"
                accept=".pdf,.jpeg,.jpg,.png,.tiff,.tif,.gif"
                onChange={handleDocumentUpload}
                disabled={isProcessing || isUploading}
              />
              <Button
                variant="outline"
                size="icon"
                disabled={isProcessing || isUploading}
                className={isUploading ? "animate-pulse" : ""}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <FileText className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Voice input button */}
            <Button
              variant="outline"
              size="icon"
              disabled={isProcessing}
              className={isListening ? "bg-red-100 text-red-700 animate-pulse" : ""}
              onClick={handleVoiceInput}
            >
              <MicIcon className="h-5 w-5" />
            </Button>
            
            {/* Send button */}
            <Button
              type="submit"
              disabled={!inputValue.trim() || isProcessing}
              onClick={handleSendMessage}
            >
              {isProcessing ? (
                <StopCircle className="h-5 w-5" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Helper text */}
        <div className="text-xs text-gray-500 mt-2 text-center">
          THRIVE uses multiple AI models optimized for specific medical tasks. Your queries are automatically routed to the most appropriate model.
        </div>
      </div>
    </div>
  );
}