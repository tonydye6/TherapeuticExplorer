import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Message } from '@shared/schema';

interface UseMessagesReturn {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

// Initial welcome message
const initialMessages: Message[] = [
  {
    id: 0,
    userId: 0,
    role: 'assistant',
    content: `Hello Matt, I'm THRIVE - your Therapeutic Health Research Intelligent Virtual Explorer. I'm here to help with your esophageal cancer research journey.

You can ask me about:
- Treatment options and comparisons
- Clinical trials you might be eligible for
- Research from medical literature
- Information from your cancer books
- Help understanding medical terms and concepts

How can I assist you today?`,
    timestamp: new Date(),
    sources: null,
    modelUsed: null
  }
];

export function useChatMessages(): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Load messages from server on first mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        
        const data = await response.json();
        
        if (data.length > 0) {
          // If we have messages from the server, use them instead of the initial message
          setMessages(data);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        // Keep the welcome message if we fail to fetch
      }
    };
    
    fetchMessages();
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Optimistically add user message
    const userMessage: Message = {
      id: Date.now(),
      userId: 0, // This will be set by the server
      content,
      role: 'user',
      timestamp: new Date(),
      sources: null,
      modelUsed: null
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/messages', { content });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const assistantMessage = await response.json();
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to get a response',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
    error
  };
}
