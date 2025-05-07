import { useEffect, useState } from "react";
import ChatInterface from "../components/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { NeoButton } from "@/components/ui/neo-button";
import { HelpCircle, Lightbulb, ArrowRight, ChevronDown, Search, Info, BookOpen, BookmarkPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ModelType } from "@shared/schema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import useMobile from "@/hooks/use-mobile";
import { NeoCard, NeoCardHeader, NeoCardContent, NeoCardTitle, NeoCardDescription, NeoCardFooter, NeoCardDecoration, NeoCardBadge } from "@/components/ui/neo-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

const suggestedPrompts = [
  {
    category: "Treatment Options",
    icon: <Lightbulb className="h-4 w-4 text-sophera-accent-tertiary" />,
    examples: [
      "What are the latest treatment options for stage II esophageal adenocarcinoma?",
      "Compare surgery vs. chemoradiation for T2N0 esophageal cancer"
    ]
  },
  {
    category: "Clinical Research",
    icon: <Lightbulb className="h-4 w-4 text-sophera-brand-primary" />,
    examples: [
      "What do recent studies show about immunotherapy for esophageal cancer?",
      "Explain the CROSS trial results for esophageal cancer"
    ]
  },
  {
    category: "Side Effects & Recovery",
    icon: <Lightbulb className="h-4 w-4 text-sophera-accent-secondary" />,
    examples: [
      "What are common side effects of radiation to the esophagus?",
      "How can I manage dysphagia after esophagectomy?"
    ]
  }
];

interface ResearchAssistantProps {
  inTabView?: boolean;
}

export default function ResearchAssistant({ inTabView = false }: ResearchAssistantProps) {
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const isMobile = useMobile();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [savedResearch, setSavedResearch] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("chat");
  
  // Fetch saved research from API
  const { data: researchItems, isLoading } = useQuery({
    queryKey: ["/api/research"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/research");
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error("Error fetching research items:", error);
        return [];
      }
    },
  });
  
  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('sophera_visited');
    if (isFirstVisit) {
      localStorage.setItem('sophera_visited', 'true');
      toast({
        title: "Welcome to Sophera!",
        description: "Your AI research assistant for cancer information. Ask questions to get clear, helpful information.",
        duration: 8000,
      });
    }
  }, [toast]);
  
  const handleSelectPrompt = (prompt: string) => {
    setInputValue(prompt);
    setOpenCategory(null);
    setActiveTab("chat");
  };
  
  const handleSaveResearch = (research: any) => {
    toast({
      title: "Research Saved",
      description: "Your research has been saved for future reference.",
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      {isMobile ? (
        // Mobile view with Neo Brutalism styling
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
          
          <div className="p-4 border-t-3 border-sophera-text-heading bg-sophera-gradient-start/30">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-sophera-brand-primary" />
                <h3 className="text-sm font-extrabold text-sophera-text-heading">SUGGESTED RESEARCH TOPICS</h3>
              </div>
            </div>
            
            <div className="space-y-3">
              {suggestedPrompts.map((category, idx) => (
                <div key={idx} className="border-3 border-sophera-text-heading rounded-xl overflow-hidden bg-sophera-bg-card shadow-[0.3rem_0.3rem_0_#05060f]">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 text-sm font-bold text-sophera-text-heading hover:bg-sophera-brand-primary-light/20"
                    onClick={() => setOpenCategory(openCategory === category.category ? null : category.category)}
                  >
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span className="font-extrabold">{category.category.toUpperCase()}</span>
                    </div>
                  </Button>
                  {openCategory === category.category && (
                    category.examples.map((prompt, promptIdx) => (
                      <Button
                        key={promptIdx}
                        variant="ghost"
                        size="sm"
                        className="justify-start h-auto py-3 px-4 w-full text-left text-sm font-medium border-t-2 border-sophera-text-heading first:border-t-0 text-sophera-text-body hover:bg-sophera-gradient-start/20"
                        onClick={() => handleSelectPrompt(prompt)}
                      >
                        <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0 text-sophera-brand-primary" />
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
        // Desktop view with tabs and improved sidebar - Neo Brutalism styling
        <div className="flex h-full">
          <div className="flex-1">
            <NeoCard className="h-full border-none rounded-none shadow-none">
              <NeoCardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <NeoCardTitle>GUIDED RESEARCH</NeoCardTitle>
                    <NeoCardDescription>
                      Get clear answers from trusted medical sources tailored to your needs
                    </NeoCardDescription>
                  </div>
                  <div>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                      <TabsList className="grid w-full grid-cols-2 p-1.5 border-2 border-sophera-text-heading rounded-xl gap-1.5 bg-white">
                        <TabsTrigger 
                          value="chat" 
                          className="flex items-center gap-2 text-sm md:text-base rounded-lg h-11 font-bold data-[state=active]:bg-sophera-brand-primary data-[state=active]:text-white data-[state=active]:border-sophera-text-heading"
                        >
                          <div className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            <span>ASK QUESTIONS</span>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="saved" 
                          className="flex items-center gap-2 text-sm md:text-base rounded-lg h-11 font-bold data-[state=active]:bg-sophera-brand-primary data-[state=active]:text-white data-[state=active]:border-sophera-text-heading"
                        >
                          <div className="flex items-center gap-2">
                            <BookmarkPlus className="h-4 w-4" />
                            <span>SAVED RESEARCH</span>
                            {isLoading ? null : researchItems && researchItems.length > 0 ?
                              <Badge className="ml-1 bg-white text-sophera-text-heading border-2 border-sophera-text-heading rounded-md shadow-[0.1rem_0.1rem_0_#05060f] font-bold">
                                {researchItems.length}
                              </Badge> : null}
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </NeoCardHeader>
              <NeoCardContent className="p-0 h-[calc(100%-85px)]">
                {/* Wrap TabsContent inside the same Tabs component */}
                <Tabs value={activeTab} className="h-full">
                  <TabsContent value="chat" className="m-0 h-full">
                    <div className="h-full">
                      <Alert className="mb-6 mx-4 mt-2 border-3 border-sophera-text-heading bg-sophera-accent-secondary/10 rounded-xl shadow-[0.2rem_0.2rem_0_#05060f]">
                        <Info className="h-5 w-5 text-sophera-brand-primary" />
                        <AlertTitle className="font-extrabold text-sophera-text-heading">HUMAN-FRIENDLY EXPLANATIONS</AlertTitle>
                        <AlertDescription className="text-sophera-text-body">
                          We explain medical information in clear, everyday language to help you understand your options.
                        </AlertDescription>
                      </Alert>
                      <ChatInterface
                        title=""
                        description=""
                        inputValue={inputValue}
                        onInputChange={setInputValue}
                        preferredModel={ModelType.CLAUDE}
                        className="h-[calc(100%-100px)]"
                        onMessageSend={handleSaveResearch}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="saved" className="m-0 h-full">
                    <div className="h-full p-4 md:p-6 flex flex-col">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sophera-text-subtle" />
                          <Input
                            placeholder="Search saved research..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 border-3 border-sophera-text-heading rounded-lg bg-sophera-bg-card focus-visible:ring-sophera-brand-primary text-sophera-text-heading"
                          />
                        </div>
                      </div>
                      
                      <ScrollArea className="flex-1 pr-4">
                        {isLoading ? (
                          <div className="flex justify-center items-center h-40">
                            <div className="animate-spin h-8 w-8 border-4 border-sophera-brand-primary border-t-transparent rounded-full"></div>
                          </div>
                        ) : researchItems && researchItems.length > 0 ? (
                          <div className="space-y-6">
                            {researchItems.map((item: any) => (
                              <NeoCard key={item.id} className="h-auto">
                                <NeoCardDecoration />
                                <NeoCardHeader>
                                  <NeoCardTitle>{item.title}</NeoCardTitle>
                                  <NeoCardBadge>
                                    {item.sourceType || 'RESEARCH'}
                                  </NeoCardBadge>
                                </NeoCardHeader>
                                <NeoCardContent>
                                  <p className="text-base text-sophera-text-body line-clamp-3 mb-2">{item.content}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Saved on {new Date(item.dateCreated).toLocaleDateString()}
                                  </p>
                                </NeoCardContent>
                                <NeoCardFooter>
                                  <NeoButton 
                                    buttonText="Continue Research"
                                    size="sm" 
                                    color="primary"
                                    onClick={() => {
                                      setInputValue(`Tell me more about ${item.title}`);
                                      setActiveTab("chat");
                                    }}
                                    icon={<BookOpen className="h-4 w-4" />}
                                  />
                                </NeoCardFooter>
                              </NeoCard>
                            ))}
                          </div>
                        ) : (
                          <NeoCard className="h-auto text-center p-8">
                            <NeoCardDecoration />
                            <NeoCardContent>
                              <BookmarkPlus className="h-16 w-16 mx-auto text-sophera-text-subtle mb-6" />
                              <h3 className="font-extrabold text-xl mb-4 text-sophera-text-heading">NO SAVED RESEARCH YET</h3>
                              <p className="text-sophera-text-body text-base max-w-md mx-auto mb-8">
                                Your research findings will be saved here. Ask questions in the Ask Questions tab to get started.
                              </p>
                              <NeoButton 
                                buttonText="Start Researching"
                                color="primary"
                                onClick={() => setActiveTab("chat")}
                              />
                            </NeoCardContent>
                          </NeoCard>
                        )}
                      </ScrollArea>
                    </div>
                  </TabsContent>
                </Tabs>
              </NeoCardContent>
            </NeoCard>
          </div>
          
          {/* Right Sidebar */}
          <div className="w-80 border-l-3 border-sophera-text-heading bg-sophera-gradient-start/20 p-5 overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <HelpCircle className="h-5 w-5 text-sophera-brand-primary" />
              <h3 className="text-base font-extrabold text-sophera-text-heading">RESEARCH SUGGESTIONS</h3>
            </div>
            
            <div className="space-y-4">
              {suggestedPrompts.map((category, idx) => (
                <Collapsible
                  key={idx}
                  open={openCategory === category.category}
                  onOpenChange={() => setOpenCategory(openCategory === category.category ? null : category.category)}
                  className="border-3 border-sophera-text-heading rounded-xl overflow-hidden bg-sophera-bg-card shadow-[0.3rem_0.3rem_0_#05060f]"
                >
                  <CollapsibleTrigger className="w-full">
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 text-base font-bold text-sophera-text-heading hover:bg-sophera-brand-primary-light/20"
                    >
                      <div className="flex items-center gap-2">
                        {category.icon}
                        <span className="font-extrabold">{category.category.toUpperCase()}</span>
                      </div>
                      <ChevronDown className="h-5 w-5 text-sophera-text-heading transition-transform duration-200 ease-in-out" style={{ transform: openCategory === category.category ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {category.examples.map((prompt, promptIdx) => (
                      <Button
                        key={promptIdx}
                        variant="ghost"
                        size="sm"
                        className="justify-start h-auto py-4 px-5 w-full text-left text-sm font-medium border-t-2 border-sophera-text-heading first:border-t-0 text-sophera-text-body hover:bg-sophera-gradient-start/20"
                        onClick={() => handleSelectPrompt(prompt)}
                      >
                        <ArrowRight className="h-4 w-4 mr-2 flex-shrink-0 text-sophera-brand-primary" />
                        <span>{prompt}</span>
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}