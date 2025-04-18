import { useEffect } from "react";
import ChatInterface from "../components/ChatInterface";
import { useToast } from "@/hooks/use-toast";

export default function ResearchAssistant() {
  const { toast } = useToast();
  
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

  return (
    <ChatInterface 
      title="Research Assistant" 
      description="Ask questions about esophageal cancer treatments, research, and more" 
    />
  );
}
