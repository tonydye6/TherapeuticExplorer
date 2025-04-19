import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import ModelBadge from "@/components/ModelBadge";
import ResearchTabs from "@/components/ResearchTabs";
import { ModelType } from "@shared/schema";
import { User, Stethoscope } from "lucide-react";

export type MessageRole = "user" | "assistant";

export interface MessageSource {
  title: string;
  url?: string;
  type: string;
  date?: string;
}

export interface MessageContent {
  text?: string;
  treatments?: any[];
  clinicalTrials?: any[];
  sources?: MessageSource[];
  structuredData?: any;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: MessageContent;
  timestamp: Date;
  modelUsed?: ModelType;
  isLoading?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  className?: string;
}

export default function MessageBubble({ message, className }: MessageBubbleProps) {
  // Determine if message has research content
  const hasResearchContent = 
    (message.content.treatments && message.content.treatments.length > 0) ||
    (message.content.clinicalTrials && message.content.clinicalTrials.length > 0) ||
    (message.content.sources && message.content.sources.length > 0);
  
  const isAssistant = message.role === "assistant";
  
  return (
    <div
      className={cn(
        "flex w-full",
        isAssistant ? "justify-start" : "justify-end",
        className
      )}
    >
      {isAssistant && (
        <Avatar className="h-8 w-8 mr-3 mt-1">
          <AvatarFallback className="bg-primary/10">
            <Stethoscope className="h-4 w-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn("flex flex-col max-w-[80%]", isAssistant ? "" : "items-end")}>
        {/* If AI message, show model badge */}
        {isAssistant && message.modelUsed && (
          <div className="mb-1 ml-1">
            <ModelBadge model={message.modelUsed} />
          </div>
        )}
        
        {/* Message content */}
        <Card
          className={cn(
            "rounded-lg overflow-hidden",
            isAssistant 
              ? "bg-gray-100 text-gray-800 border-gray-200" 
              : "bg-primary-800 text-white border-primary-700",
          )}
        >
          <CardContent className={cn(
            "p-3",
            message.isLoading && "animate-pulse"
          )}>
            {/* Regular text message */}
            {message.content.text && !hasResearchContent && (
              <div className="whitespace-pre-wrap">{message.content.text}</div>
            )}
            
            {/* Research content with tabs */}
            {hasResearchContent && (
              <div className="research-content">
                <ResearchTabs 
                  content={message.content.text || ""}
                  treatments={message.content.treatments}
                  clinicalTrials={message.content.clinicalTrials}
                  sources={message.content.sources}
                  modelUsed={message.modelUsed || "AI"}
                />
              </div>
            )}
            
            {/* Loading state */}
            {message.isLoading && (
              <div className="flex space-x-2">
                <div className="h-2 w-2 rounded-full bg-current animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Timestamp */}
        <div className={cn(
          "text-xs text-gray-500 mt-1",
          isAssistant ? "ml-1" : "mr-1"
        )}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {!isAssistant && (
        <Avatar className="h-8 w-8 ml-3 mt-1">
          <AvatarFallback className="bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}