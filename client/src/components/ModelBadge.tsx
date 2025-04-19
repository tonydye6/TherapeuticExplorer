import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Brain, Bot, Sparkles } from "lucide-react";
import { ModelType } from "@shared/schema";

export interface ModelBadgeProps {
  model: ModelType | string;
  className?: string;
}

export default function ModelBadge({ model, className }: ModelBadgeProps) {
  // Determine model type and color
  const getModelInfo = (model: ModelType | string) => {
    switch (model) {
      case ModelType.CLAUDE:
        return {
          name: "Claude",
          icon: <Brain className="h-3 w-3 mr-1" />,
          tooltipText: "Powered by Anthropic's Claude model",
          badgeClass: "bg-purple-100 text-purple-800 hover:bg-purple-200"
        };
      case ModelType.GPT:
        return {
          name: "GPT-4o",
          icon: <Sparkles className="h-3 w-3 mr-1" />,
          tooltipText: "Powered by OpenAI's GPT-4o model",
          badgeClass: "bg-green-100 text-green-800 hover:bg-green-200"
        };
      case ModelType.GEMINI:
        return {
          name: "Gemini",
          icon: <Bot className="h-3 w-3 mr-1" />,
          tooltipText: "Powered by Google's Gemini 2.5 model",
          badgeClass: "bg-blue-100 text-blue-800 hover:bg-blue-200"
        };
      case ModelType.BIOBERT:
        return {
          name: "BioBERT",
          icon: <Brain className="h-3 w-3 mr-1" />,
          tooltipText: "Specialized biomedical language model",
          badgeClass: "bg-amber-100 text-amber-800 hover:bg-amber-200"
        };
      default:
        return {
          name: model.toString(),
          icon: <Bot className="h-3 w-3 mr-1" />,
          tooltipText: "AI-powered response",
          badgeClass: "bg-gray-100 text-gray-800 hover:bg-gray-200"
        };
    }
  };
  
  const modelInfo = getModelInfo(model);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline"
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${modelInfo.badgeClass} ${className}`}
          >
            {modelInfo.icon}
            {modelInfo.name}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{modelInfo.tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}