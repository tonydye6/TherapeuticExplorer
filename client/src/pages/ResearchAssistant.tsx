
import { useEffect, useState } from "react";
import ChatInterface from "../components/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { HelpCircle, Lightbulb, ArrowRight, ChevronDown, Search, Info, BookOpen, BookmarkPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ModelType } from "@shared/schema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import useMobile from "@/hooks/use-mobile";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
        // Mobile view with Sophera v6 styling
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
          
          <div className="p-4 border-t border-sophera-border-subtle bg-sophera-gradient-start/30">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-sophera-brand-primary" />
                <h3 className="text-sm font-medium text-sophera-text-heading">Suggested Research Topics</h3>
              </div>
            </div>
            
            <div className="space-y-3">
              {suggestedPrompts.map((category, idx) => (
                <div key={idx} className="border border-sophera-border-primary rounded-sophera-card overflow-hidden bg-sophera-bg-card shadow-sm">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 text-sm text-sophera-text-heading hover:bg-sophera-brand-primary-light/20"
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
                        className="justify-start h-auto py-3 px-4 w-full text-left text-sm font-normal border-t border-sophera-border-subtle first:border-t-0 text-sophera-text-body hover:bg-sophera-gradient-start/20"
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
        // Desktop view with tabs and improved sidebar - Sophera v6 styling
        <div className="flex h-full">
          <div className="flex-1">
            <Card className="h-full border-none rounded-none bg-transparent shadow-none">
              <CardHeader className="pb-2 md:pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold text-sophera-text-heading">Guided Research</CardTitle>
                    <CardDescription className="text-sophera-text-subtle pt-1">
                      Get clear answers from trusted medical sources tailored to your needs
                    </CardDescription>
                  </div>
                  <div>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                      <TabsList className="grid w-full grid-cols-2 p-1.5 bg-sophera-gradient-start rounded-sophera-button gap-1.5">
                        <TabsTrigger 
                          value="chat" 
                          className="flex items-center gap-2 text-sm md:text-base rounded-sophera-input h-11 data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md"
                        >
                          <div className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            <span>Ask Questions</span>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="saved" 
                          className="flex items-center gap-2 text-sm md:text-base rounded-sophera-input h-11 data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md"
                        >
                          <div className="flex items-center gap-2">
                            <BookmarkPlus className="h-4 w-4" />
                            <span>Saved Research</span>
                            {isLoading ? null : researchItems && researchItems.length > 0 ?
                              <Badge className="ml-1 bg-sophera-brand-primary-light text-sophera-brand-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                                {researchItems.length}
                              </Badge> : null}
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-85px)]">
                {/* Wrap TabsContent inside the same Tabs component */}
                <Tabs value={activeTab} className="h-full">
                  <TabsContent value="chat" className="m-0 h-full">
                    <div className="h-full">
                      <Alert className="mb-4 mx-4 mt-2 bg-sophera-brand-primary/10 border-sophera-brand-primary/20 text-sophera-text-body rounded-sophera-card">
                        <Info className="h-4 w-4 text-sophera-brand-primary" />
                        <AlertTitle className="font-medium text-sophera-text-heading">Human-Friendly Explanations</AlertTitle>
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
                        className="h-[calc(100%-70px)]"
                        onMessageSend={handleSaveResearch}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="saved" className="m-0 h-full">
                    <div className="h-full p-4 md:p-6 flex flex-col">
                      <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sophera-text-subtle" />
                          <Input
                            placeholder="Search saved research..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rounded-sophera-input border-sophera-border-primary focus:border-sophera-brand-primary"
                          />
                        </div>
                      </div>
                      
                      <ScrollArea className="flex-1 pr-4">
                        {isLoading ? (
                          <div className="flex justify-center items-center h-40">
                            <div className="animate-spin h-8 w-8 border-4 border-sophera-brand-primary border-t-transparent rounded-full"></div>
                          </div>
                        ) : researchItems && researchItems.length > 0 ? (
                          <div className="space-y-4 md:space-y-6">
                            {researchItems.map((item: any) => (
                              <Card key={item.id} className="overflow-hidden bg-sophera-bg-card border-sophera-border-primary rounded-sophera-card shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader className="p-4 md:p-5 pb-2 md:pb-3">
                                  <CardTitle className="text-lg flex justify-between items-start text-sophera-text-heading">
                                    <span className="line-clamp-1">{item.title}</span>
                                    <Badge variant="outline" className="ml-2 whitespace-nowrap bg-sophera-gradient-start border-sophera-border-primary text-sophera-brand-primary rounded-full px-2.5 py-0.5">
                                      {item.sourceType || 'Research'}
                                    </Badge>
                                  </CardTitle>
                                  <CardDescription className="line-clamp-2 text-sophera-text-subtle pt-1">
                                    {new Date(item.dateCreated).toLocaleDateString()}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 md:p-5 pt-0 md:pt-0">
                                  <p className="text-sm text-sophera-text-body line-clamp-3">{item.content}</p>
                                </CardContent>
                                <CardFooter className="p-4 md:p-5 pt-0 md:pt-0 flex justify-between">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs border-sophera-border-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light hover:text-sophera-brand-primary-dark rounded-sophera-button"
                                    onClick={() => {
                                      setInputValue(`Tell me more about ${item.title}`);
                                      setActiveTab("chat");
                                    }}
                                  >
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    Continue Research
                                  </Button>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-8 border border-sophera-border-primary rounded-sophera-card bg-sophera-bg-card shadow-sm">
                            <BookmarkPlus className="h-12 w-12 mx-auto text-sophera-text-subtle mb-4" />
                            <h3 className="font-medium text-lg mb-2 text-sophera-text-heading">No Saved Research Yet</h3>
                            <p className="text-sophera-text-body text-sm max-w-md mx-auto mb-6">
                              Your research findings will be saved here. Ask questions in the Ask Questions tab to get started.
                            </p>
                            <Button 
                              onClick={() => setActiveTab("chat")}
                              className="bg-sophera-brand-primary hover:bg-sophera-brand-primary-dark text-white rounded-sophera-button shadow-sm transition-colors"
                            >
                              Start Researching
                            </Button>
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Sidebar */}
          <div className="w-80 border-l border-sophera-border-subtle bg-sophera-gradient-start/20 p-4 md:p-5 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-4 w-4 text-sophera-brand-primary" />
              <h3 className="text-sm font-medium text-sophera-text-heading">Research Suggestions</h3>
            </div>
            
            <Alert className="mb-4 bg-sophera-brand-primary/10 border-sophera-brand-primary/20 rounded-sophera-card">
              <AlertDescription className="text-xs text-sophera-text-body">
                These topics may be helpful based on your diagnosis and treatment plan.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              {suggestedPrompts.map((category, idx) => (
                <div key={idx} className="border border-sophera-border-primary rounded-sophera-card bg-sophera-bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 md:p-4 text-sm hover:bg-sophera-brand-primary-light/10 text-sophera-text-heading"
                    onClick={() => setOpenCategory(openCategory === category.category ? null : category.category)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {category.icon}
                      <span className="font-medium">{category.category}</span>
                      <ChevronDown className={`h-4 w-4 ml-auto transition-transform text-sophera-text-subtle ${openCategory === category.category ? "transform rotate-180" : ""}`} />
                    </div>
                  </Button>
                  <div className={`${openCategory === category.category ? "block" : "hidden"}`}>
                    {category.examples.map((prompt, promptIdx) => (
                      <Button
                        key={promptIdx}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left py-3 px-4 text-sm font-normal border-t border-sophera-border-subtle hover:bg-sophera-gradient-start/20 text-sophera-text-body"
                        onClick={() => handleSelectPrompt(prompt)}
                      >
                        <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0 text-sophera-brand-primary" />
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
