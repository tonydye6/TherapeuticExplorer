import React from "react";
import { cn } from "@/lib/utils";
import { ModelType } from "@shared/schema";

type ModelBadgeProps = {
  model: ModelType | string;
  className?: string;
};

export default function ModelBadge({ model, className }: ModelBadgeProps) {
  // Get model color and icon based on the model type
  const getModelConfig = (modelType: ModelType | string) => {
    switch (modelType) {
      case ModelType.CLAUDE:
        return {
          bgColor: "bg-purple-100",
          textColor: "text-purple-800",
          borderColor: "border-purple-200",
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
              <path 
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none"
              />
              <path 
                d="M12 7V14M12 14L16 11M12 14L8 11"
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
          name: "Claude"
        };
      case ModelType.GPT:
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
              <path 
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none"
              />
              <path 
                d="M9 9.5L11.5 11.5L9 13.5M12.5 14.5H15"
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
          name: "GPT-4"
        };
      case ModelType.GEMINI:
        return {
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
              <path 
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none"
              />
              <path 
                d="M8 11L12 7M12 7L16 11M12 7V16.5"
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
          name: "Gemini"
        };
      case ModelType.BIOBERT:
        return {
          bgColor: "bg-amber-100",
          textColor: "text-amber-800",
          borderColor: "border-amber-200",
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
              <path 
                d="M7 8H17M7 12H14M7 16H11" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <rect 
                x="3" 
                y="4" 
                width="18" 
                height="16" 
                rx="2" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none"
              />
            </svg>
          ),
          name: "BioBERT"
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
          icon: null,
          name: modelType
        };
    }
  };

  const config = getModelConfig(model);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {config.icon}
      {config.name}
    </span>
  );
}