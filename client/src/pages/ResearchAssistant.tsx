import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { NeoButton } from "@/components/ui/neo-button";
import { Badge } from "@/components/ui/badge";
import { ModelType } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { apiRequest } from "@/lib/queryClient";
import {
  Search,
  Info,
  BookOpen,
  BookmarkPlus,
  ArrowRight,
  MessageSquare,
  ChevronDown,
  Save,
  Edit,
  Bookmark,
  Check,
  X,
  SendIcon,
  Lightbulb,
  AlertTriangle,
  ChevronRight,
  Clock,
  Copy,
  Trash2,
  Download,
  Share2,
  FileText,
  Tag,
  Filter,
  Star,
  StarOff
} from "lucide-react";
import { format } from 'date-fns';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ResearchItem {
  id: string;
  title: string;
  content: string;
  sourceType: string;
  dateCreated: string;
  tags?: string[];
  isFavorite?: boolean;
}

// Source type colors for vertical indicators
const sourceTypeColors: Record<string, string> = {
  'research': '#3db4ab',
  'treatment': '#3db4ab',
  'side effects': '#fb9678',
  'symptoms': '#fb9678',
  'questions': '#7e57c2',
  'doctor': '#4a88db',
  'default': '#4a88db'
};

const getSourceTypeColor = (sourceType: string): string => {
  const type = sourceType.toLowerCase();
  for (const [key, value] of Object.entries(sourceTypeColors)) {
    if (type.includes(key)) {
      return value;
    }
  }
  return sourceTypeColors.default;
};

const suggestedPrompts = [
  {
    category: "Treatment Options",
    icon: <Lightbulb className="h-4 w-4 text-teal-500" />,
    examples: [
      "What are the latest treatment options for stage II esophageal adenocarcinoma?",
      "Compare surgery vs. chemoradiation for T2N0 esophageal cancer",
      "Explain targeted therapy options for HER2-positive esophageal cancer"
    ]
  },
  {
    category: "Clinical Research",
    icon: <Lightbulb className="h-4 w-4 text-blue-500" />,
    examples: [
      "What do recent studies show about immunotherapy for esophageal cancer?",
      "Explain the CROSS trial results for esophageal cancer",
      "Are there any promising phase 3 trials for metastatic esophageal cancer?"
    ]
  },
  {
    category: "Side Effects & Recovery",
    icon: <Lightbulb className="h-4 w-4 text-amber-500" />,
    examples: [
      "What are common side effects of radiation to the esophagus?",
      "How can I manage dysphagia after esophagectomy?",
      "Tips for improving nutrition during chemotherapy for esophageal cancer"
    ]
  }
];

interface ResearchAssistantProps {
  inTabView?: boolean;
}

export default function ResearchAssistant({ inTabView = false }: ResearchAssistantProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [filter, setFilter] = useState("all");
  
  // Fetch saved research from API
  const { data: researchItems, isLoading } = useQuery<ResearchItem[]>({
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
  
  // Delete research item mutation
  const deleteResearchMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/research/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research"] });
      toast({
        title: "Research item deleted",
        description: "The research item has been successfully removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete",
        description: "There was an error deleting the research item.",
        variant: "destructive",
      });
    }
  });
  
  // Save research item mutation
  const saveResearchMutation = useMutation({
    mutationFn: async (data: { title: string, content: string, sourceType: string }) => {
      const response = await apiRequest("POST", "/api/research", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research"] });
      toast({
        title: "Research saved",
        description: "Your research has been saved to your library.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save",
        description: "There was an error saving your research.",
        variant: "destructive",
      });
    }
  });
  
  // Toggle favorite status mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({id, isFavorite}: {id: string, isFavorite: boolean}) => {
      return await apiRequest("PATCH", `/api/research/${id}`, { isFavorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update",
        description: "There was an error updating the favorite status.",
        variant: "destructive",
      });
    }
  });
  
  // Sample research items when API fails or returns empty
  const sampleResearchItems: ResearchItem[] = [
    {
      id: "1",
      title: "Immunotherapy basics for esophageal cancer",
      content: "Immunotherapy works by helping your immune system identify and attack cancer cells. For esophageal cancer, checkpoint inhibitors like pembrolizumab and nivolumab have shown promise, especially for patients with certain biomarkers like PD-L1 expression or MSI-H/dMMR tumors.",
      sourceType: "Research",
      dateCreated: "2025-05-01T10:30:00Z",
      tags: ["Immunotherapy", "Treatment"],
      isFavorite: true
    },
    {
      id: "2",
      title: "Managing treatment fatigue during therapy",
      content: "Fatigue is one of the most common side effects during cancer treatment. Practical strategies include: planned rest periods throughout the day, light exercise as tolerated, maintaining good nutrition, staying hydrated, and discussing medication adjustments with your healthcare team if fatigue becomes severe.",
      sourceType: "Side Effects",
      dateCreated: "2025-04-28T14:15:00Z",
      tags: ["Fatigue", "Side Effects", "Self-Care"]
    },
    {
      id: "3",
      title: "Doctor discussion brief: Questions about treatment duration",
      content: "Key questions to ask: 1) What is the expected duration of my immunotherapy treatment? 2) How will we know if the treatment is working? 3) What testing schedule will be used to monitor effectiveness? 4) Is combination with other treatments possible if this approach alone isn't sufficient?",
      sourceType: "Questions",
      dateCreated: "2025-05-03T09:45:00Z",
      tags: ["Doctor Visit", "Treatment Plan"],
      isFavorite: false
    }
  ];
  
  const displayedResearchItems = researchItems?.length ? researchItems : sampleResearchItems;
  
  const filteredResearchItems = displayedResearchItems.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === "all" || 
      (filter === "favorites" && item.isFavorite) || 
      (item.sourceType.toLowerCase() === filter.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('sophera_research_visited');
    if (isFirstVisit) {
      localStorage.setItem('sophera_research_visited', 'true');
      toast({
        title: "Welcome to Sophera Research Assistant!",
        description: "Ask questions to get clear, helpful information about cancer treatments, side effects, and more.",
        duration: 8000,
      });
      
      // Add initial welcome message
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: "Hello! I'm your Sophera Research Assistant. I can help you understand treatments, research findings, and medical information related to esophageal cancer. What would you like to learn about today?",
          timestamp: new Date()
        }
      ]);
    }
  }, [toast]);
  
  const handleSelectPrompt = (prompt: string) => {
    setInputValue(prompt);
    setActiveCategory(null);
    setActiveTab("chat");
  };
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);
    
    try {
      // Simulate API call for now - in a real app, this would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sample response based on user query (this would come from the AI service in production)
      let responseContent = "";
      if (userMessage.content.toLowerCase().includes("side effect") || userMessage.content.toLowerCase().includes("immunotherapy")) {
        responseContent = "Based on current research, the most common side effects of immunotherapy for esophageal cancer include:\n\n• Fatigue (feeling very tired)\n• Skin reactions (rash, itching)\n• Diarrhea or other digestive issues\n• Flu-like symptoms (fever, chills)\n• Hormone changes affecting thyroid, adrenal glands, or pituitary\n\nSome patients may experience more serious immune-related side effects that require prompt medical attention. It's important to report any new symptoms to your healthcare team immediately.";
      } else if (userMessage.content.toLowerCase().includes("treatment") || userMessage.content.toLowerCase().includes("options")) {
        responseContent = "Current standard treatment options for esophageal cancer include:\n\n• Surgery (esophagectomy)\n• Chemotherapy (before or after surgery)\n• Radiation therapy\n• Combined chemoradiation\n• Targeted therapy (for certain types)\n• Immunotherapy (especially for advanced cases)\n\nThe approach depends on the cancer stage, location, histology type (squamous cell or adenocarcinoma), biomarkers, and your overall health status.";
      } else {
        responseContent = "I understand you're asking about " + userMessage.content + ". This is an important topic in esophageal cancer care.\n\nThe most current research suggests several approaches to address this, including new treatment protocols and supportive care strategies. Would you like me to explore a specific aspect of this topic in more detail?";
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error processing message:", error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSaveResearch = (message: Message) => {
    // Extract title from first sentence or use truncated content
    const firstSentence = message.content.split('.')[0];
    const title = firstSentence.length > 60 
      ? firstSentence.substring(0, 57) + '...' 
      : firstSentence;
      
    saveResearchMutation.mutate({
      title: title + (title.endsWith('?') ? '' : '...'),
      content: message.content,
      sourceType: "Research Assistant"
    });
  };
  
  const handleDeleteResearch = (id: string) => {
    if (window.confirm("Are you sure you want to delete this research item?")) {
      deleteResearchMutation.mutate(id);
    }
  };
  
  const handleToggleFavorite = (id: string, currentStatus: boolean = false) => {
    toggleFavoriteMutation.mutate({
      id,
      isFavorite: !currentStatus
    });
  };
  
  const handleExportResearch = () => {
    toast({
      title: "Export Started",
      description: "Preparing your research library for export...",
    });
    
    // In a real implementation, you would call your backend API
    // For now, simulate the process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your research library has been exported successfully.",
      });
    }, 1500);
  };
  
  return (
    <div className="fixed inset-0 p-4 overflow-hidden" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="flex h-full w-full gap-4">
        {/* Left Panel - Chat Interface */}
        <div className="w-[65%] flex flex-col h-full">
          {/* Header */}
          <div 
            className="bg-[#3db4ab] border-4 border-black rounded-xl p-5 mb-4 shadow-[0.3rem_0.3rem_0_#000000] translate-x-[-4px] translate-y-[-4px] relative"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 40px 0, 40px 40px, 0 40px)"
            }}
          >
            <div className="absolute left-0 top-0 w-10 h-10 bg-[#2a8f87] border-r-4 border-b-4 border-black"></div>
            <h1 className="text-2xl font-extrabold text-white tracking-wide ml-8">GUIDED RESEARCH</h1>
            <p className="text-white text-opacity-90 font-medium ml-8">
              Get clear answers from trusted medical sources tailored to your needs
            </p>
          </div>
          
          {/* Main Chat Area */}
          <div className="flex-grow flex flex-col min-h-0 border-4 border-black rounded-xl shadow-[0.3rem_0.3rem_0_#000000] translate-x-[-4px] translate-y-[-4px] bg-white overflow-hidden">
            {/* Info Banner */}
            <div className="p-4">
              <Alert className="border-3 border-black bg-amber-50 rounded-xl p-4 shadow-[0.3rem_0.3rem_0_#000]">
                <Info className="h-5 w-5 text-[#3db4ab]" />
                <AlertTitle className="font-extrabold text-black">HUMAN-FRIENDLY EXPLANATIONS</AlertTitle>
                <AlertDescription className="text-gray-800">
                  We explain medical information in clear, everyday language to help you understand your options.
                </AlertDescription>
              </Alert>
            </div>
            
            {/* Message Area */}
            <div className="flex-grow min-h-0 overflow-hidden">
              <ScrollArea className="h-full px-4 pb-4">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 mr-3">
                          <div className="h-10 w-10 rounded-full bg-[#3db4ab] border-3 border-black shadow-[0.15rem_0.15rem_0_#000] flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div 
                        className={`relative max-w-[85%] ${
                          message.role === 'user' 
                            ? 'bg-blue-50 border-4 border-black rounded-xl p-4 shadow-[0.3rem_0.3rem_0_#000] translate-x-[-4px] translate-y-[-4px]' 
                            : 'bg-white border-4 border-black rounded-xl p-4 shadow-[0.3rem_0.3rem_0_#000] translate-x-[-4px] translate-y-[-4px] pl-12'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="absolute left-0 top-0 bottom-0 w-8 rounded-l-lg bg-[#3db4ab] border-r-4 border-black"></div>
                        )}
                        
                        {message.role === 'user' && (
                          <div className="flex-shrink-0 ml-3 absolute -right-14 top-0">
                            <Avatar className="h-10 w-10 border-3 border-black shadow-[0.15rem_0.15rem_0_#000]">
                              <AvatarFallback className="bg-amber-200 text-amber-800 font-bold">U</AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          {message.role === 'assistant' && (
                            <div className="font-extrabold text-black uppercase">
                              {message.content.split("\n")[0].length > 50 
                                ? message.content.split("\n")[0].substring(0, 50) + "..." 
                                : message.content.split("\n")[0]}
                            </div>
                          )}
                          
                          <div className="whitespace-pre-wrap text-gray-800">
                            {message.role === 'assistant' 
                              ? message.content.split("\n").slice(message.content.includes("\n\n") ? 2 : 1).join("\n")
                              : message.content}
                          </div>
                          
                          <div className="pt-2 mt-2 border-t-2 border-dashed border-gray-300 flex justify-between items-center">
                            <div className="text-xs text-gray-500 font-medium">
                              {format(message.timestamp, 'MMM d, yyyy · h:mm a')}
                            </div>
                            
                            {message.role === 'assistant' && (
                              <div className="flex gap-2">
                                <NeoButton
                                  buttonText="COPY"
                                  size="sm"
                                  color="white"
                                  icon={<Copy className="h-4 w-4" />}
                                  className="border-2 border-black text-gray-700"
                                  onClick={() => {
                                    navigator.clipboard.writeText(message.content);
                                    toast({
                                      title: "Copied!",
                                      description: "Text copied to clipboard.",
                                    });
                                  }}
                                />
                                
                                <NeoButton
                                  buttonText="SAVE"
                                  size="sm"
                                  color="primary"
                                  icon={<Save className="h-4 w-4" />}
                                  onClick={() => handleSaveResearch(message)}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="h-10 w-10 rounded-full bg-[#3db4ab] border-3 border-black shadow-[0.15rem_0.15rem_0_#000] flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      
                      <div className="relative bg-white border-4 border-black rounded-xl p-5 shadow-[0.3rem_0.3rem_0_#000] translate-x-[-4px] translate-y-[-4px] pl-12 max-w-[85%]">
                        <div className="absolute left-0 top-0 bottom-0 w-8 rounded-l-lg bg-[#3db4ab] border-r-4 border-black"></div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse"></div>
                          <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          <span className="font-bold text-gray-400 ml-1">Researching...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
            
            {/* Input Area */}
            <div className="border-t-4 border-black p-4 bg-gray-50">
              <div className="border-4 border-black rounded-xl p-4 bg-white shadow-[0.3rem_0.3rem_0_#000] translate-x-[-4px] translate-y-[-4px]">
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div className="relative">
                    <Input
                      className="border-3 border-black rounded-lg pl-4 pr-12 py-3 h-16 text-base shadow-[0.2rem_0.2rem_0_#000] focus-visible:ring-offset-2 focus-visible:ring-[#3db4ab]"
                      placeholder="Ask about treatments, side effects, or research..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isProcessing}
                    />
                    <NeoButton
                      type="submit"
                      size="sm"
                      color="primary"
                      className="absolute right-2 top-2"
                      icon={<SendIcon className="h-5 w-5" />}
                      disabled={!inputValue.trim() || isProcessing}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-xs font-extrabold text-gray-700">SUGGESTED:</span>
                    <div className="flex-1 overflow-x-auto flex gap-2 pb-1">
                      {activeCategory
                        ? suggestedPrompts
                            .find(cat => cat.category === activeCategory)
                            ?.examples.map((prompt, i) => (
                              <button
                                key={i}
                                onClick={() => handleSelectPrompt(prompt)}
                                className="flex-shrink-0 bg-blue-50 hover:bg-blue-100 border-2 border-black rounded-full px-3 py-1 text-xs font-bold shadow-[0.1rem_0.1rem_0_#000] hover:translate-y-[-0.2rem] hover:translate-x-[-0.2rem] hover:shadow-[0.2rem_0.2rem_0_#000] transition-all"
                              >
                                {prompt.length > 25 ? prompt.substring(0, 25) + '...' : prompt}
                              </button>
                            ))
                        : suggestedPrompts.map((category, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveCategory(category.category)}
                              className="flex-shrink-0 bg-blue-50 hover:bg-blue-100 border-2 border-black rounded-full px-3 py-1 text-xs font-bold shadow-[0.1rem_0.1rem_0_#000] hover:translate-y-[-0.2rem] hover:translate-x-[-0.2rem] hover:shadow-[0.2rem_0.2rem_0_#000] transition-all"
                            >
                              <span className="flex items-center gap-1">
                                {category.icon}
                                {category.category}
                              </span>
                            </button>
                          ))
                      }
                      
                      {activeCategory && (
                        <button
                          onClick={() => setActiveCategory(null)}
                          className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-full px-3 py-1 text-xs font-bold shadow-[0.1rem_0.1rem_0_#000] hover:translate-y-[-0.2rem] hover:translate-x-[-0.2rem] hover:shadow-[0.2rem_0.2rem_0_#000] transition-all"
                        >
                          <X className="h-3 w-3 text-gray-700" />
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Research Library */}
        <div className="w-[35%] flex flex-col h-full">
          {/* Header */}
          <div 
            className="bg-[#4a88db] border-4 border-black rounded-xl p-5 mb-4 shadow-[0.3rem_0.3rem_0_#000000] translate-x-[-4px] translate-y-[-4px] relative"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 0, 100% 40px, calc(100% - 40px) 40px, calc(100% - 40px) 0, 100% 0, 100% 100%, 0 100%)"
            }}
          >
            <div className="absolute right-0 top-0 w-10 h-10 bg-[#3b79cc] border-l-4 border-b-4 border-black"></div>
            <h1 className="text-2xl font-extrabold text-white tracking-wide">RESEARCH LIBRARY</h1>
            <p className="text-white text-opacity-90 font-medium">
              Save and reference important information for your cancer journey
            </p>
          </div>
          
          {/* Search and Filter Area */}
          <div className="border-4 border-black rounded-xl shadow-[0.3rem_0.3rem_0_#000000] translate-x-[-4px] translate-y-[-4px] bg-white p-4 mb-4">
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search saved research..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-3 border-black rounded-lg shadow-[0.2rem_0.2rem_0_#000] focus-visible:ring-[#4a88db] focus-visible:ring-offset-2"
              />
            </div>
            
            {/* Filter tabs */}
            <div className="flex border-3 border-black rounded-xl overflow-hidden">
              <button
                onClick={() => setFilter("all")}
                className={`flex-1 py-3 text-center font-bold ${
                  filter === "all" 
                    ? "bg-[#4a88db] text-white" 
                    : "bg-white text-gray-700 hover:bg-blue-50"
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setFilter("treatment")}
                className={`flex-1 py-3 text-center font-bold border-l-3 border-black ${
                  filter === "treatment" 
                    ? "bg-[#4a88db] text-white" 
                    : "bg-white text-gray-700 hover:bg-blue-50"
                }`}
              >
                TREATMENTS
              </button>
              <button
                onClick={() => setFilter("favorites")}
                className={`flex-1 py-3 text-center font-bold border-l-3 border-black ${
                  filter === "favorites" 
                    ? "bg-[#4a88db] text-white" 
                    : "bg-white text-gray-700 hover:bg-blue-50"
                }`}
              >
                <Star className="h-4 w-4 inline-block mr-1" />
                FAVORITES
              </button>
            </div>
          </div>
          
          {/* Research Items */}
          <div className="flex-grow min-h-0 border-4 border-black rounded-xl shadow-[0.3rem_0.3rem_0_#000000] translate-x-[-4px] translate-y-[-4px] bg-white overflow-hidden">
            <ScrollArea className="h-full p-4">
              {filteredResearchItems.length === 0 ? (
                <div className="text-center p-8 mt-4">
                  <BookmarkPlus className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-extrabold text-gray-800 mb-2">NO SAVED RESEARCH</h3>
                  <p className="text-gray-600 mb-6">
                    Save important information from your research sessions here for easy reference.
                  </p>
                  <NeoButton 
                    buttonText="START RESEARCHING"
                    color="cyan"
                    className="bg-[#4a88db]"
                    onClick={() => {
                      toast({
                        title: "Research Assistant",
                        description: "Let's start researching! Ask a question to get started.",
                      });
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredResearchItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="relative bg-white border-4 border-black rounded-xl shadow-[0.3rem_0.3rem_0_#000] translate-x-[-4px] translate-y-[-4px] overflow-hidden mb-6"
                    >
                      {/* Colored indicator based on source type */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-3"
                        style={{ backgroundColor: getSourceTypeColor(item.sourceType) }}
                      ></div>
                      
                      <div className="p-5 pl-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-extrabold text-gray-900 pr-8">
                            {item.title}
                          </h3>
                          <button 
                            className={`h-8 w-8 flex items-center justify-center rounded-full border-2 border-black ${item.isFavorite ? 'bg-amber-200' : 'bg-gray-100'} hover:translate-y-[-2px] transition-all`}
                            onClick={() => handleToggleFavorite(item.id, item.isFavorite)}
                          >
                            {item.isFavorite ? (
                              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                            ) : (
                              <StarOff className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        
                        <p className="text-gray-700 line-clamp-3">
                          {item.content}
                        </p>
                        
                        <div className="flex justify-between items-center mt-4 pt-3 border-t-2 border-dashed border-gray-200">
                          <div className="flex items-center gap-2">
                            <Badge className="px-3 py-1 font-medium border-2 border-black rounded-full bg-blue-50 text-[#4a88db] shadow-[0.1rem_0.1rem_0_#000]">
                              {item.sourceType}
                            </Badge>
                            <span className="flex items-center text-xs font-medium text-gray-500">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              {new Date(item.dateCreated).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <NeoButton 
                              buttonText=""
                              size="icon"
                              color="red"
                              className="h-9 w-9"
                              icon={<Trash2 className="h-4 w-4" />}
                              onClick={() => handleDeleteResearch(item.id)}
                            />
                            
                            <NeoButton 
                              buttonText="ASK"
                              size="sm"
                              color="cyan"
                              className="bg-[#4a88db]"
                              icon={<MessageSquare className="h-4 w-4" />}
                              onClick={() => {
                                setInputValue(`Tell me more about ${item.title.replace(/\.\.\.$/, '')}`);
                                setActiveTab("chat");
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Export Button */}
          <div className="mt-4">
            <NeoButton
              buttonText="EXPORT RESEARCH LIBRARY"
              color="cyan"
              className="w-full bg-[#4a88db]"
              icon={<Download className="h-5 w-5" />}
              onClick={handleExportResearch}
            />
          </div>
        </div>
      </div>
    </div>
  );
}