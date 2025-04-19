import { useEffect, useState } from "react";
import ChatInterface from "../components/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { HelpCircle, Lightbulb, ArrowRight } from "lucide-react";
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

// Define suggested prompt categories and examples
const suggestedPrompts = [
  {
    category: "Treatment Options",
    icon: <Lightbulb className="h-4 w-4 text-amber-500" />,
    examples: [
      "What are the latest treatment options for stage II esophageal adenocarcinoma?",
      "Compare surgery vs. chemoradiation for T2N0 esophageal cancer",
      "When is endoscopic resection preferred over esophagectomy?"
    ]
  },
  {
    category: "Clinical Research",
    icon: <Lightbulb className="h-4 w-4 text-blue-500" />,
    examples: [
      "What do recent studies show about immunotherapy for esophageal cancer?",
      "Explain the CROSS trial results for esophageal cancer",
      "Are there any promising new targeted therapies in clinical trials?"
    ]
  },
  {
    category: "Side Effects & Recovery",
    icon: <Lightbulb className="h-4 w-4 text-green-500" />,
    examples: [
      "What are common side effects of radiation to the esophagus?",
      "How can I manage dysphagia after esophagectomy?",
      "What nutritional support is recommended during chemotherapy?"
    ]
  }
];

export default function ResearchAssistant() {
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  
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
      {/* Suggested Prompts Section - Now at the top, especially helpful for mobile */}
      <div className="p-4 border-b bg-muted/20">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Suggested Research Topics</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestedPrompts.map((category, idx) => (
            <Card key={idx} className="bg-card">
              <CardHeader className="py-3">
                <div className="flex items-center gap-2">
                  {category.icon}
                  <CardTitle className="text-sm">{category.category}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <ul className="space-y-2">
                  {category.examples.map((prompt, promptIdx) => (
                    <li key={promptIdx}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start h-auto py-1 px-2 w-full text-left text-xs font-normal"
                        onClick={() => handleSelectPrompt(prompt)}
                      >
                        <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0" />
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
      
      {/* Chat Interface - Now below the suggested prompts */}
      <div className="flex-1">
        <ChatInterface 
          title="Research Assistant" 
          description="Ask questions about esophageal cancer treatments, research, and more"
          inputValue={inputValue}
          onInputChange={setInputValue}
          preferredModel={ModelType.GEMINI} // Specify Gemini as the preferred model for deep research
        />
      </div>
    </div>
  );
}
