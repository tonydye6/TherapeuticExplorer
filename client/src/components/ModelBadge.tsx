import { cn } from "@/lib/utils";
import { SiOpenai, SiGoogle } from "react-icons/si";
import { Brain } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

type ModelBadgeProps = {
  modelType: string | null;
};

const getModelDisplayInfo = (modelType: string | null) => {
  switch (modelType?.toLowerCase()) {
    case "gpt":
      return {
        name: "GPT-4o",
        description: "OpenAI's GPT-4o model, specialized in structured clinical information",
        icon: SiOpenai,
        className: "bg-green-100 text-green-800 border-green-200",
      };
    case "claude":
      return {
        name: "Claude",
        description: "Anthropic's Claude model, specialized in medical research analysis",
        icon: Brain,
        className: "bg-purple-100 text-purple-800 border-purple-200",
      };
    case "gemini":
      return {
        name: "Gemini",
        description: "Google's Gemini model, specialized in deep research synthesis",
        icon: SiGoogle,
        className: "bg-blue-100 text-blue-800 border-blue-200",
      };
    default:
      return {
        name: "AI",
        description: "THRIVE's AI assistant",
        icon: Brain,
        className: "bg-gray-100 text-gray-800 border-gray-200",
      };
  }
};

export default function ModelBadge({ modelType }: ModelBadgeProps) {
  const { name, description, icon: Icon, className } = getModelDisplayInfo(modelType);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
            className
          )}>
            <Icon className="mr-1 h-3 w-3" />
            {name}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}