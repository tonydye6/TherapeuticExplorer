import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { NeoButton } from '@/components/ui/neo-button';
import { NeoCard, NeoCardHeader, NeoCardContent, NeoCardTitle, NeoCardFooter } from '@/components/ui/neo-card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlertTriangle, 
  Trash2, 
  FileUp, 
  SendHorizontal, 
  DownloadCloud, 
  X, 
  Image as ImageIcon, 
  MessageCircle, 
  Lightbulb,
  Info,
  CheckCircle2,
  Zap,
  Copy,
  Cpu,
  Bot,
  FileText,
  Plus,
  Star
} from 'lucide-react';
import { ModelType } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  images?: { url: string; preview: string }[];
}

export default function MultimodalChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.GPT4O);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the disclaimer has been accepted before
    const hasAcceptedDisclaimer = localStorage.getItem('sophera_creative_disclaimer_accepted');
    if (!hasAcceptedDisclaimer) {
      setIsDisclaimerOpen(true);
    } else {
      setIsDisclaimerAccepted(true);
    }

    // Add welcome message
    setMessages([
      {
        id: '1',
        content: "Welcome to Creative Exploration! This space is designed for exploring innovative approaches to your cancer journey. You can share medical images or describe symptoms to receive insights about alternative treatments, complementary therapies, and experimental approaches that might be worth discussing with your healthcare team.",
        role: 'assistant',
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDisclaimerAccept = () => {
    localStorage.setItem('sophera_creative_disclaimer_accepted', 'true');
    setIsDisclaimerAccepted(true);
    setIsDisclaimerOpen(false);
    toast({
      title: "Welcome to Creative Exploration",
      description: "You can now explore creative solutions and treatments beyond traditional approaches.",
      duration: 5000
    });
  };

  const handleFileSelection = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    
    Array.from(e.target.files).forEach(file => {
      if (selectedFiles.length + newFiles.length >= 5) {
        toast({
          title: "Maximum files reached",
          description: "You can only upload up to 5 images at once.",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Only image files are supported.",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Images must be under 10MB.",
          variant: "destructive"
        });
        return;
      }
      
      newFiles.push(file);
      const preview = URL.createObjectURL(file);
      newPreviews.push(preview);
    });
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setFilePreviews(prev => [...prev, ...newPreviews]);
    
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...filePreviews];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const clearAllFiles = () => {
    // Revoke all object URLs
    filePreviews.forEach(preview => URL.revokeObjectURL(preview));
    
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && selectedFiles.length === 0) || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Create a new user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: inputValue,
        role: 'user',
        timestamp: new Date(),
        images: selectedFiles.length > 0 ? selectedFiles.map((file, index) => ({
          url: URL.createObjectURL(file),
          preview: filePreviews[index]
        })) : undefined
      };
      
      // Add user message to the conversation
      setMessages(prev => [...prev, userMessage]);
      
      // Clear input and files after sending
      setInputValue('');
      
      // In a real implementation, you would:
      // 1. Upload files to server
      // 2. Send message content and file references to AI service
      // 3. Receive response from AI
      
      // For now, simulate response after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate AI response based on content and model
      let responseContent = "";
      
      if (selectedFiles.length > 0) {
        if (inputValue.toLowerCase().includes("treatment") || inputValue.toLowerCase().includes("therapy")) {
          responseContent = "Based on the image and your query about alternative treatments, I can identify several relevant approaches that might be worth exploring:\n\n• Integrative therapy approaches combining conventional treatment with complementary methods\n• Nutritional interventions specific to your condition\n• Mind-body practices that may help manage treatment side effects\n\nWould you like me to explore any of these areas in more detail?";
        } else {
          responseContent = "I've analyzed the medical image you've shared. While I can see certain patterns, I'd need more context about your specific question. Are you interested in learning about alternative treatments, visualization techniques, or complementary approaches for this condition?";
        }
      } else if (inputValue.toLowerCase().includes("alternative") || inputValue.toLowerCase().includes("treatment")) {
        responseContent = "There are several innovative approaches being explored for cancer care beyond traditional treatments:\n\n• Immunotherapy enhancements through lifestyle modifications\n• Targeted nutritional protocols based on biomarker profiles\n• Mind-body techniques with promising preliminary research\n• Heat therapy and hyperthermia as treatment adjuncts\n\nRemember that any alternative approach should be discussed with your healthcare team to ensure it complements your primary treatment plan.";
      } else {
        responseContent = "Thank you for sharing. To provide the most helpful creative exploration insights, could you share:\n\n1. What specific aspect of your cancer journey are you looking to explore alternatives for? (e.g., side effect management, treatment enhancement, emotional wellbeing)\n\n2. What approaches have you already tried or considered?\n\nThis will help me tailor information to your unique situation.";
      }
      
      // Add AI response to the conversation
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Clear the files after response
      clearAllFiles();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateDoctorBrief = async () => {
    if (messages.length <= 1) { // Only the welcome message
      toast({
        title: "No content to export",
        description: "Please have a conversation first before generating a doctor brief.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Generating Doctor Brief",
      description: "Your doctor discussion brief is being prepared...",
    });
    
    // In a real implementation, you would call your backend API to generate the brief
    // For now, simulate the process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Doctor Brief Generated",
      description: "Your doctor discussion brief has been downloaded.",
    });
  };

  return (
    <div className="fixed inset-0 p-4 md:p-6 overflow-hidden" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="flex flex-col h-full w-full">
        {/* Page Header - Neo Brutalism style */}
        <div 
          className="relative w-full bg-[#fb9678] border-4 border-black rounded-xl p-4 md:p-5 mb-4 shadow-[0.3rem_0.3rem_0_#000000] translate-x-[-4px] translate-y-[-4px]"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 40px 0, 40px 40px, 0 40px)"
          }}
        >
          <div className="absolute left-0 top-0 w-10 h-10 bg-[#f87a5c] border-r-4 border-b-4 border-black"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide ml-8">CREATIVE EXPLORATION</h1>
              <p className="text-white text-opacity-90 font-medium ml-8 max-w-2xl">
                Explore innovative approaches and ideas for your cancer journey in a safe space.
              </p>
            </div>
            
            <div className="h-12 w-12 rounded-full bg-[#ffe066] border-4 border-black shadow-[0.15rem_0.15rem_0_#000] flex items-center justify-center">
              <Zap className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>
        

        
        {/* Main Chat Container - Flex-grow to fill available space */}
        <div className="flex-grow flex flex-col min-h-0 border-4 border-black rounded-xl shadow-[0.3rem_0.3rem_0_#000000] translate-x-[-4px] translate-y-[-4px] bg-[#3db4ab] overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[#2d9d94] border-b-4 border-black p-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-extrabold text-white ml-2">UPLOAD & ANALYZE</h2>
              <p className="text-white text-opacity-90 ml-2 text-sm">
                Share medical images with AI for professional analysis
              </p>
            </div>
            
            {/* Model Selection - Simplified for mobile */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-full border-2 border-black ${selectedModel === ModelType.GPT4O ? 'bg-[#2a8f87] text-white' : 'bg-white text-gray-800'} cursor-pointer shadow-[0.1rem_0.1rem_0_#000] text-xs font-bold`}
                   onClick={() => setSelectedModel(ModelType.GPT4O)}>
                GPT-4o
              </div>
              <div className={`px-3 py-1.5 rounded-full border-2 border-black ${selectedModel === ModelType.GEMINI ? 'bg-[#2a8f87] text-white' : 'bg-white text-gray-800'} cursor-pointer shadow-[0.1rem_0.1rem_0_#000] text-xs font-bold`}
                   onClick={() => setSelectedModel(ModelType.GEMINI)}>
                GEMINI
              </div>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-grow min-h-0 bg-white overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4 pb-2">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 mr-3">
                        <div className="h-10 w-10 rounded-full bg-[#3db4ab] border-3 border-black shadow-[0.15rem_0.15rem_0_#000] flex items-center justify-center">
                          <Lightbulb className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div 
                      className={`relative max-w-[85%] ${
                        message.role === 'user' 
                          ? 'bg-blue-50 border-3 border-black rounded-xl p-4 shadow-[0.3rem_0.3rem_0_#000] translate-x-[-4px] translate-y-[-4px]' 
                          : 'bg-white border-3 border-black rounded-xl p-4 shadow-[0.3rem_0.3rem_0_#000] translate-x-[-4px] translate-y-[-4px] pl-6'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#3db4ab]"></div>
                      )}
                      
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 ml-3 absolute -right-14 top-0">
                          <Avatar className="h-10 w-10 border-3 border-black shadow-[0.15rem_0.15rem_0_#000]">
                            <AvatarFallback className="bg-[#ffe066] text-gray-800 font-bold">U</AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      
                      {/* Display uploaded images if any */}
                      {message.images && message.images.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {message.images.map((img, imgIndex) => (
                            <div key={imgIndex} className="relative border-2 border-black rounded-lg overflow-hidden shadow-[0.1rem_0.1rem_0_#000] bg-white">
                              <img 
                                src={img.preview} 
                                alt={`Uploaded image ${imgIndex + 1}`}
                                className="w-full h-32 object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="whitespace-pre-wrap text-gray-800">
                        {message.content}
                      </div>
                      
                      <div className="pt-2 mt-2 border-t-2 border-dashed border-gray-300 flex justify-between items-center">
                        <div className="text-xs text-gray-500 font-medium">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        {message.role === 'assistant' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 border-2 border-black rounded-lg shadow-[0.1rem_0.1rem_0_#000] hover:translate-y-[-1px] hover:shadow-[0.15rem_0.15rem_0_#000] transition-all"
                            onClick={() => {
                              navigator.clipboard.writeText(message.content);
                              toast({
                                title: "Copied",
                                description: "Text copied to clipboard",
                              });
                            }}
                          >
                            <Copy className="h-3.5 w-3.5 mr-1 text-[#3db4ab]" />
                            <span className="font-bold text-[#3db4ab]">COPY</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-10 w-10 rounded-full bg-[#3db4ab] border-3 border-black shadow-[0.15rem_0.15rem_0_#000] flex items-center justify-center">
                        <Lightbulb className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    
                    <div className="bg-white border-3 border-black rounded-xl p-4 shadow-[0.3rem_0.3rem_0_#000] translate-x-[-4px] translate-y-[-4px] pl-6 max-w-[85%] relative">
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#3db4ab]"></div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse"></div>
                        <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        <span className="font-bold text-gray-400 ml-1">Analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messageEndRef} />
              </div>
            </ScrollArea>
          </div>
          
          {/* File Upload Preview */}
          {selectedFiles.length > 0 && (
            <div className="border-t-3 border-black p-3 bg-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-800">SELECTED IMAGES ({selectedFiles.length}/5)</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFiles}
                  className="h-8 px-2 hover:bg-red-50 text-red-500 font-bold"
                >
                  CLEAR ALL
                </Button>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {filePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={preview} 
                      alt={`Preview ${index}`} 
                      className="h-16 w-16 object-cover rounded-lg border-2 border-black"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center border border-black"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Input Area - Always at bottom */}
          <div className="bg-[#3db4ab] bg-opacity-5 border-t-3 border-black p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input 
                  className="h-12 px-4 py-2 border-3 border-black rounded-xl bg-white shadow-[0.2rem_0.2rem_0_#000] focus-visible:ring-[#3db4ab] focus-visible:ring-offset-2 font-medium text-gray-800 translate-x-[-2px] translate-y-[-2px]"
                  placeholder="Type a message and/or upload images..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelection}
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={selectedFiles.length >= 5 || isProcessing}
                />
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        className={`h-12 w-12 border-3 border-black rounded-xl shadow-[0.2rem_0.2rem_0_#000] hover:translate-y-[-2px] hover:shadow-[0.25rem_0.25rem_0_#000] transition-all ${selectedFiles.length >= 5 ? 'bg-gray-300' : 'bg-white'} translate-x-[-2px] translate-y-[-2px]`}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={selectedFiles.length >= 5 || isProcessing}
                      >
                        <Plus className="h-5 w-5 text-gray-700" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold border-2 border-black">
                      Upload Images (Max 5)
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button 
                  className="h-12 w-12 bg-[#fb9678] hover:bg-[#fa8668] border-3 border-black rounded-xl shadow-[0.2rem_0.2rem_0_#000] hover:translate-y-[-2px] hover:shadow-[0.25rem_0.25rem_0_#000] transition-all translate-x-[-2px] translate-y-[-2px]"
                  onClick={handleSendMessage}
                  disabled={(!inputValue.trim() && selectedFiles.length === 0) || isProcessing}
                >
                  <SendHorizontal className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>
            
            {/* Doctor Brief Button */}
            <div className="flex justify-end mt-3">
              <NeoButton
                buttonText="GENERATE DOCTOR BRIEF"
                icon={<FileText className="h-5 w-5" />}
                color="cyan"
                size="sm"
                className="bg-[#4a88db] hover:bg-[#4a88db]/90 text-white border-black"
                onClick={handleGenerateDoctorBrief}
                disabled={messages.length <= 1}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer Dialog */}
      <Dialog open={isDisclaimerOpen} onOpenChange={setIsDisclaimerOpen}>
        <DialogContent className="border-4 border-black rounded-xl shadow-[0.4rem_0.4rem_0_#000] max-w-lg mx-4 overflow-y-auto max-h-[90vh] md:max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-extrabold">CREATIVE EXPLORATION DISCLAIMER</DialogTitle>
            <DialogDescription>
              Before using the Creative Exploration space, please read and acknowledge the following:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-bold text-lg">What is Creative Exploration?</h3>
              <p className="text-gray-700">
                The Creative Exploration space allows you to explore unconventional or experimental approaches to cancer care that may not be part of standard medical practice.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Important Disclaimer</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Ideas and suggestions provided in this section are <strong>not medical advice</strong>.</li>
                <li>Always consult with your healthcare team before trying any new treatments or approaches.</li>
                <li>Information here may include approaches not supported by traditional clinical evidence.</li>
                <li>We encourage creative thinking but prioritize your safety above all.</li>
              </ul>
            </div>
            
            <div className="flex items-start sm:items-center gap-3 p-4 bg-amber-50 border-3 border-black rounded-xl">
              <div className="flex items-center h-5 mt-0.5 sm:mt-0">
                <Checkbox
                  id="disclaimer-checkbox"
                  checked={isDisclaimerAccepted}
                  onCheckedChange={() => setIsDisclaimerAccepted(!isDisclaimerAccepted)}
                  className="h-5 w-5 border-2 border-black data-[state=checked]:bg-[#3db4ab] data-[state=checked]:text-white"
                />
              </div>
              <Label
                htmlFor="disclaimer-checkbox"
                className="text-sm font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand this is for exploratory purposes only and not medical advice
              </Label>
            </div>
          </div>
          
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <NeoButton 
              buttonText="CANCEL" 
              color="pink"
              className="border-black w-full sm:w-auto"
              onClick={() => {
                setIsDisclaimerOpen(false);
                // In a real implementation, you might redirect from this page
                toast({
                  title: "Disclaimer",
                  description: "You need to accept the disclaimer to use Creative Exploration.",
                });
              }}
            />
            
            <NeoButton 
              buttonText="I UNDERSTAND" 
              color="cyan"
              className="border-black bg-[#3db4ab] w-full sm:w-auto"
              disabled={!isDisclaimerAccepted}
              onClick={handleDisclaimerAccept}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}