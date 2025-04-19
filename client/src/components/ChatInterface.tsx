import { useState, useRef, useEffect } from "react";
import { 
  Paperclip, 
  Mic, 
  Camera, 
  ArrowUp,
  Search,
  Bell
} from "lucide-react";
import MessageBubble from "./MessageBubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatMessages } from "@/hooks/useChatMessages";

type ChatInterfaceProps = {
  title: string;
  description: string;
};

export default function ChatInterface({ title, description }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading } = useChatMessages();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue("");
      
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full ml-2">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
      </div>
      
      {/* Chat conversation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin bg-gray-50" id="conversation-container">
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            role={message.role}
            content={message.content}
            sources={message.sources}
            modelUsed={message.modelUsed}
          />
        ))}
        
        {isLoading && (
          <MessageBubble
            role="assistant"
            content="Researching your question..."
            isLoading={true}
          />
        )}
        
        <div ref={messageEndRef} />
      </div>
      
      {/* Input area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <form onSubmit={handleSubmit} className="flex items-center max-w-3xl mx-auto">
          <div className="flex space-x-2 mr-3">
            <Button type="button" variant="ghost" size="icon" className="rounded-full">
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Button type="button" variant="ghost" size="icon" className="rounded-full">
              <Camera className="h-5 w-5" />
              <span className="sr-only">Take photo</span>
            </Button>
            <Button type="button" variant="ghost" size="icon" className="rounded-full">
              <Mic className="h-5 w-5" />
              <span className="sr-only">Voice input</span>
            </Button>
          </div>
          <div className="flex-1 relative">
            <Textarea 
              ref={inputRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about treatments, research, clinical trials..."
              className="py-2 px-3 min-h-[48px] max-h-[200px] resize-none"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit"
            className="ml-3 bg-primary-800 hover:bg-primary-900"
            disabled={isLoading || !inputValue.trim()}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
