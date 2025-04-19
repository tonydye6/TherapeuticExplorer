import { cn } from "@/lib/utils";
import { User, AlertCircle, ShieldCheck } from "lucide-react";
import TreatmentCard from "./TreatmentCard";
import ClinicalTrialCard from "./ClinicalTrialCard";
import ResearchSummaryCard from "./ResearchSummaryCard";
import { Skeleton } from "@/components/ui/skeleton";
import ModelBadge from "./ModelBadge";
import ResearchTabs, { DeepResearchContent } from "./ResearchTabs"; 
import { parseResearchContent } from "@/lib/parseResearchContent";
import { useState } from "react";

type MessageSource = {
  title: string;
  url?: string;
  type: string;
  date?: string;
};

type TreatmentInfo = {
  name: string;
  evidenceLevel: "high" | "medium" | "low";
  benefits: { text: string }[];
  sideEffects: { text: string; warning?: boolean; info?: boolean }[];
  source: string;
};

type ClinicalTrialInfo = {
  title: string;
  phase: string;
  matchScore: number; // 0-100
  location: string;
  distance: number;
  id: string;
  status: string;
};

type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
  sources?: MessageSource[];
  treatments?: TreatmentInfo[];
  clinicalTrials?: ClinicalTrialInfo[];
  researchSummary?: {
    text: string;
    sources: string[];
  };
  modelUsed?: string | null;
};

const processText = (text: string) => {
  // Highlight medical terms
  const processedText = text.replace(
    /\b([A-Z]{2,}(?:-[A-Z0-9]+)?|\w+(?:-\w+)+(?:omab|tinib|ciclib|rafenib|mab|nib))\b/g,
    '<span class="medical-term">$1</span>'
  );
  
  // Convert markdown-style lists to HTML lists
  return processedText;
};

export default function MessageBubble({
  role,
  content,
  isLoading = false,
  sources = [],
  treatments = [],
  clinicalTrials = [],
  researchSummary,
  modelUsed
}: MessageBubbleProps) {
  // Use state to track whether structured data is expanded
  const [expandStructured, setExpandStructured] = useState(false);
  
  // Try to parse structured research content from Gemini responses
  const structuredContent = modelUsed === "gemini" ? parseResearchContent(content) : null;
  
  // Extract structured parts from markdown if content contains them
  // This is a simplified approach - in a real app, you'd use a proper markdown parser

  // Message UI based on role
  const isUser = role === "user";
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-start max-w-3xl mx-auto">
        <div className="flex-shrink-0 mr-4">
          <div className="h-10 w-10 rounded-full bg-primary-800 flex items-center justify-center text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-5 max-w-xl w-full">
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "flex items-start max-w-3xl mx-auto",
      isUser && "justify-end"
    )}>
      {/* Avatar - Only show on non-user messages */}
      {!isUser && (
        <div className="flex-shrink-0 mr-4">
          <div className="h-10 w-10 rounded-full bg-primary-800 flex items-center justify-center text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
      )}
      
      {/* Message content */}
      <div 
        className={cn(
          "rounded-lg shadow-sm p-4 max-w-xl",
          isUser 
            ? "bg-primary-700 text-white" 
            : "bg-white text-gray-800"
        )}
      >
        {/* Model badge - only show for assistant messages and if model is specified */}
        {!isUser && modelUsed && (
          <div className="flex justify-between items-center mb-3">
            <ModelBadge modelType={modelUsed} />
          </div>
        )}
        
        {/* Regular content when it's not a Gemini deep research response */}
        {(!structuredContent || !expandStructured) && (
          <div 
            className={isUser ? "" : "mb-4"} 
            dangerouslySetInnerHTML={{ __html: processText(content) }} 
          />
        )}
        
        {/* Structured content for Gemini deep research (if available) */}
        {structuredContent && expandStructured && (
          <ResearchTabs content={structuredContent} />
        )}
        
        {/* Toggle button to switch between text view and structured view (only for Gemini responses) */}
        {structuredContent && (
          <button 
            onClick={() => setExpandStructured(!expandStructured)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-2 mb-3 underline"
          >
            {expandStructured ? "View as text" : "View structured research data"}
          </button>
        )}
        
        {/* Treatments section */}
        {treatments && treatments.length > 0 && (
          <div className="space-y-4 mb-6 mt-4">
            {treatments.map((treatment, index) => (
              <TreatmentCard 
                key={index} 
                treatment={treatment}
              />
            ))}
          </div>
        )}
        
        {/* Clinical trials section */}
        {clinicalTrials && clinicalTrials.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-6 mt-4">
            {clinicalTrials.map((trial, index) => (
              <ClinicalTrialCard 
                key={index} 
                trial={trial} 
              />
            ))}
          </div>
        )}
        
        {/* Research summary */}
        {researchSummary && (
          <ResearchSummaryCard 
            text={researchSummary.text} 
            sources={researchSummary.sources} 
          />
        )}
        
        {/* Sources */}
        {sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Sources:</strong> {sources.map(source => source.title).join(', ')}
            </p>
          </div>
        )}
        
        {/* Medical disclaimer */}
        {!isUser && (
          <div className="text-xs text-gray-500 italic mt-3">
            <AlertCircle className="inline-block h-3 w-3 mr-1" />
            This information is for research purposes only and should not be considered medical advice.
          </div>
        )}
      </div>
      
      {/* User avatar - only show on user messages */}
      {isUser && (
        <div className="flex-shrink-0 ml-4">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
}
