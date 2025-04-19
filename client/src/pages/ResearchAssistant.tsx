import { useEffect, useState } from "react";
import ChatInterface from "../components/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { HelpCircle, Lightbulb, ArrowRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ModelType } from "@shared/schema";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import useMobile from "@/hooks/use-mobile";

const suggestedPrompts = [
  {
    category: "Treatment Options",
    icon: <Lightbulb className="h-4 w-4 text-amber-500" />,
    examples: [
      "What are the latest treatment options for stage II esophageal adenocarcinoma?",
      "Compare surgery vs. chemoradiation for T2N0 esophageal cancer"
    ]
  },
  {
    category: "Clinical Research",
    icon: <Lightbulb className="h-4 w-4 text-blue-500" />,
    examples: [
      "What do recent studies show about immunotherapy for esophageal cancer?",
      "Explain the CROSS trial results for esophageal cancer"
    ]
  },
  {
    category: "Side Effects & Recovery",
    icon: <Lightbulb className="h-4 w-4 text-green-500" />,
    examples: [
      "What are common side effects of radiation to the esophagus?",
      "How can I manage dysphagia after esophagectomy?"
    ]
  }
];

export default function ResearchAssistant() {
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const isMobile = useMobile();

  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('thrive_visited');
    if (isFirstVisit) {
      localStorage.setItem('thrive_visited', 'true');
      toast({
        title: "Welcome to THRIVE!",
        description: "Your AI research assistant for esophageal cancer. Ask any questions to get started.",
        duration: 8000,
      });
    }
  }, [toast]);

  const handleSelectPrompt = (prompt: string) => {
    setInputValue(prompt);
    setOpenCategory(null);
  };

  return (
    <div className="flex flex-col h-full">
      {isMobile ? (
        // Mobile view remains unchanged
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <ChatInterface 
              title="Research Assistant" 
              description="Ask questions about esophageal cancer treatments, research, and more"
              inputValue={inputValue}
              onInputChange={setInputValue}
              preferredModel={ModelType.GEMINI}
              className="h-full"
            />
          </div>

          <div className="p-2 border-t bg-muted/20">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Suggested Research Topics</h3>
              </div>
            </div>

            <div className="space-y-2">
              {suggestedPrompts.map((category, idx) => (
                <div key={idx} className="border rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 text-sm"
                    onClick={() => setOpenCategory(openCategory === category.category ? null : category.category)}
                  >
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span className="font-medium">{category.category}</span>
                    </div>
                  </Button>
                  {openCategory === category.category && (
                    category.examples.map((prompt, promptIdx) => (
                      <Button
                        key={promptIdx}
                        variant="ghost"
                        size="sm"
                        className="justify-start h-auto py-3 px-4 w-full text-left text-sm font-normal border-t first:border-t-0"
                        onClick={() => handleSelectPrompt(prompt)}
                      >
                        <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0 text-primary-500" />
                        <span>{prompt}</span>
                      </Button>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Desktop view with right sidebar
        <div className="flex h-full">
          <div className="flex-1">
            <ChatInterface 
              title="Research Assistant" 
              description="Ask questions about esophageal cancer treatments, research, and more"
              inputValue={inputValue}
              onInputChange={setInputValue}
              preferredModel={ModelType.GEMINI}
              className="h-full"
            />
          </div>

          {/* Right Sidebar */}
          <div className="w-80 border-l bg-muted/20 p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Suggested Research Topics</h3>
            </div>

            <div className="space-y-4">
              {suggestedPrompts.map((category, idx) => (
                <div key={idx} className="border rounded-md bg-white overflow-hidden">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 text-sm"
                    onClick={() => setOpenCategory(openCategory === category.category ? null : category.category)}
                  >
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span className="font-medium">{category.category}</span>
                      <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${openCategory === category.category ? "transform rotate-180" : ""}`} />
                    </div>
                  </Button>
                  <div className={`${openCategory === category.category ? "block" : "hidden"}`}>
                    {category.examples.map((prompt, promptIdx) => (
                      <Button
                        key={promptIdx}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left py-3 px-4 text-sm font-normal border-t"
                        onClick={() => handleSelectPrompt(prompt)}
                      >
                        <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0 text-primary-500" />
                        <span className="line-clamp-2">{prompt}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}