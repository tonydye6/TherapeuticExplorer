import { useEffect, useState } from "react";
import ChatInterface from "../components/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { HelpCircle, Lightbulb, ArrowRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ModelType } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import useMobile from "@/hooks/use-mobile";

// Define suggested prompt categories and examples (reduced to 2 per category for better mobile view)
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
  const isMobile = useMobile();
  
  // Show welcome message on first visit
  useEffect(() => {
    // Check if this is the first visit
    const isFirstVisit = !localStorage.getItem('thrive_visited');
    
    if (isFirstVisit) {
      // Mark as visited
      localStorage.setItem('thrive_visited', 'true');
      
      // Show welcome toast
      toast({
        title: "Welcome to THRIVE!",
        description: "Your AI research assistant for esophageal cancer. Ask any questions to get started.",
        duration: 8000,
      });
    }
  }, [toast]);

  // Handle selecting a suggested prompt
  const handleSelectPrompt = (prompt: string) => {
    // We'll pass this to the ChatInterface
    setInputValue(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile view uses accordions */}
      {isMobile ? (
        <div className="flex flex-col h-full">
          {/* Chat Interface first for mobile */}
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
          
          {/* Collapsible Suggested Prompts as Accordions for mobile */}
          <div className="p-2 border-t bg-muted/20">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Suggested Research Topics</h3>
              </div>
            </div>
            
            <Accordion type="multiple" className="space-y-2">
              {suggestedPrompts.map((category, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-md overflow-hidden">
                  <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline bg-card/60">
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span className="font-medium">{category.category}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <div className="bg-white">
                      {category.examples.map((prompt, promptIdx) => (
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
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      ) : (
        /* Desktop view uses cards */
        <div className="flex flex-col h-full">
          {/* Suggested Prompts Section at top for desktop */}
          <div className="p-4 border-b bg-muted/20 md:pb-6 md:pt-6">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Suggested Research Topics</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestedPrompts.map((category, idx) => (
                <Card key={idx} className="bg-card">
                  <CardHeader className="py-2 md:py-3">
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <CardTitle className="text-sm font-medium">{category.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="py-1 md:py-2">
                    <ul className="space-y-1 md:space-y-2">
                      {category.examples.map((prompt, promptIdx) => (
                        <li key={promptIdx}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start h-auto py-2 px-2 w-full text-left text-sm md:text-xs font-normal hover:bg-primary-50"
                            onClick={() => handleSelectPrompt(prompt)}
                          >
                            <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0 text-primary-500" />
                            <span className="line-clamp-2">{prompt}</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Chat Interface - Below suggested prompts for desktop */}
          <div className="flex-1 flex flex-col md:max-h-[50vh]">
            <ChatInterface 
              title="Research Assistant" 
              description="Ask questions about esophageal cancer treatments, research, and more"
              inputValue={inputValue}
              onInputChange={setInputValue}
              preferredModel={ModelType.GEMINI}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
