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
    <div className="h-full flex flex-col overflow-hidden p-4 max-w-screen">
      {/* Page Header - Neo Brutalism style */}
      <div 
        className="bg-[#fb9678] border-4 border-black rounded-xl p-6 mb-6 shadow-[0.3rem_0.3rem_0_#000000] translate-x-[-4px] translate-y-[-4px] relative"
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
      
      {/* Privacy Notice */}
      <div className="bg-amber-50 border-4 border-black rounded-xl p-5 mb-6 shadow-[0.3rem_0.3rem_0_#000000] translate-x-[-4px] translate-y-[-4px]">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-[#fb9678] border-3 border-black shadow-[0.15rem_0.15rem_0_#000] flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-black">IMPORTANT PRIVACY INFORMATION</h3>
            <p className="text-gray-800 mt-1">
              Before uploading any medical images, please ensure they contain no personal identifying information. 
              This tool is for informational purposes only and should not replace professional medical advice.
            </p>
          </div>
        </div>
      </div>
      
      {/* Three-step Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            step: 1,
            title: "UPLOAD IMAGES",
            description: "Add up to 5 medical images for analysis",
            icon: <ImageIcon className="h-5 w-5 text-[#4a88db]" />
          },
          {
            step: 2,
            title: "ADD CONTEXT",
            description: "Describe what you'd like to learn about",
            icon: <MessageCircle className="h-5 w-5 text-[#4a88db]" />
          },
          {
            step: 3,
            title: "RECEIVE INSIGHTS",
            description: "Get AI analysis of your medical images",
            icon: <Lightbulb className="h-5 w-5 text-[#4a88db]" />
          }
        ].map((step, index) => (
          <NeoCard key={index} className="h-auto border-[#000000]">
            <NeoCardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-white border-3 border-black shadow-[0.1rem_0.1rem_0_#000] flex items-center justify-center text-lg font-bold text-[#4a88db]">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-black">{step.title}</h3>
                  <p className="text-gray-700 mt-1">{step.description}</p>
                </div>
              </div>
            </NeoCardContent>
          </NeoCard>
        ))}
      </div>
      
      {/* Main Chat Container */}
      <NeoCard className="h-[calc(100vh-380px)] min-h-[400px] flex flex-col border-[#000000] bg-[#3db4ab] overflow-hidden">
        <NeoCardHeader className="bg-[#2d9d94] border-b-4 border-black p-5 flex justify-between items-center">
          <div>
            <NeoCardTitle className="text-white ml-8">UPLOAD & ANALYZE</NeoCardTitle>
            <p className="text-white text-opacity-90 ml-8">
              Share medical images with AI for professional analysis and explanations.
            </p>
          </div>
          <button 
            className="h-8 w-8 rounded-md bg-[#2a8f87] border-2 border-black flex items-center justify-center hover:translate-y-[-2px] transition-transform"
            onClick={() => {
              // For demonstration - in a real app this would close or minimize
              toast({
                title: "Info",
                description: "This would close the chat in a full implementation.",
              });
            }}
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </NeoCardHeader>
        
        <NeoCardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-white">
          {/* AI Model Selection */}
          <div className="flex justify-end items-center p-4 border-b-3 border-black gap-3 bg-[#3db4ab] bg-opacity-10">
            <span className="text-gray-800 font-bold">AI MODEL:</span>
            <RadioGroup 
              value={selectedModel} 
              onValueChange={(value) => setSelectedModel(value as ModelType)} 
              className="flex"
            >
              <div className={`relative px-4 py-2 rounded-full border-3 border-black ${selectedModel === ModelType.GPT4O ? 'bg-[#2d9d94] text-white' : 'bg-white text-gray-800'} mr-2 cursor-pointer shadow-[0.1rem_0.1rem_0_#000] flex items-center hover:translate-y-[-1px] transition-transform`}>
                <RadioGroupItem 
                  value={ModelType.GPT4O} 
                  id="gpt4o" 
                  className="opacity-0 absolute" 
                />
                <Label htmlFor="gpt4o" className="cursor-pointer flex items-center">
                  <Cpu className="h-4 w-4 mr-2" />
                  <span className="font-bold">GPT-4o VISION</span>
                </Label>
              </div>
              
              <div className={`relative px-4 py-2 rounded-full border-3 border-black ${selectedModel === ModelType.GEMINI ? 'bg-[#2d9d94] text-white' : 'bg-white text-gray-800'} cursor-pointer shadow-[0.1rem_0.1rem_0_#000] flex items-center hover:translate-y-[-1px] transition-transform`}>
                <RadioGroupItem 
                  value={ModelType.GEMINI} 
                  id="gemini" 
                  className="opacity-0 absolute" 
                />
                <Label htmlFor="gemini" className="cursor-pointer flex items-center">
                  <Bot className="h-4 w-4 mr-2" />
                  <span className="font-bold">GEMINI PRO</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Message Display Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {messages.map((message, index) => (
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
                      <div className="grid grid-cols-2 gap-2 mb-3">
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
                      <span className="font-bold text-gray-400 ml-1">Analyzing and researching...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messageEndRef} />
            </div>
          </ScrollArea>
          
          {/* File Upload Preview */}
          {selectedFiles.length > 0 && (
            <div className="p-3 bg-white border-t-3 border-black">
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
              
              <div className="grid grid-cols-5 gap-2">
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
          
          {/* Input Area */}
          <div className="border-t-3 border-black p-4 bg-[#3db4ab] bg-opacity-5">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input 
                  className="min-h-[80px] px-4 py-3 border-3 border-black rounded-xl bg-white shadow-[0.2rem_0.2rem_0_#000] focus-visible:ring-[#3db4ab] focus-visible:ring-offset-2 font-medium text-gray-800 resize-none translate-x-[-2px] translate-y-[-2px]"
                  placeholder="Type a message and/or upload images..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isProcessing}
                  style={{ minHeight: '80px', height: '80px' }}
                />
              </div>
              
              <div className="flex flex-col gap-2">
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
                        className={`h-[80px] w-12 border-3 border-black rounded-xl shadow-[0.2rem_0.2rem_0_#000] hover:translate-y-[-2px] hover:shadow-[0.25rem_0.25rem_0_#000] transition-all ${selectedFiles.length >= 5 ? 'bg-gray-300' : 'bg-white'} translate-x-[-2px] translate-y-[-2px]`}
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
                  className="h-[80px] w-12 bg-[#fb9678] hover:bg-[#fa8668] border-3 border-black rounded-xl shadow-[0.2rem_0.2rem_0_#000] hover:translate-y-[-2px] hover:shadow-[0.25rem_0.25rem_0_#000] transition-all translate-x-[-2px] translate-y-[-2px]"
                  onClick={handleSendMessage}
                  disabled={(!inputValue.trim() && selectedFiles.length === 0) || isProcessing}
                >
                  <SendHorizontal className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-5">
              <p className="text-sm text-gray-600 font-medium">
                Upload up to 5 images (JPEG, PNG). Images are analyzed for medical content.
              </p>
              
              <NeoButton
                buttonText="GENERATE DOCTOR BRIEF"
                icon={<FileText className="h-5 w-5" />}
                color="cyan"
                className="bg-[#4a88db] hover:bg-[#4a88db]/90 text-white border-black"
                onClick={handleGenerateDoctorBrief}
                disabled={messages.length <= 1}
              />
            </div>
          </div>
        </NeoCardContent>
      </NeoCard>
      
      {/* Decorative elements */}
      <div className="absolute bottom-8 left-8 hidden md:block">
        <div className="w-16 h-16 rounded-full bg-[#ffe066] border-3 border-black shadow-[0.25rem_0.25rem_0_#000] flex items-center justify-center">
          <Star className="h-8 w-8 text-amber-600" />
        </div>
      </div>
      
      <div className="absolute top-32 right-8 hidden md:block">
        <div className="w-8 h-8 bg-[#fb9678] border-3 border-black shadow-[0.15rem_0.15rem_0_#000] transform rotate-45"></div>
      </div>
      
      {/* Disclaimer Dialog */}
      <Dialog open={isDisclaimerOpen} onOpenChange={setIsDisclaimerOpen}>
        <DialogContent className="border-4 border-black rounded-xl shadow-[0.4rem_0.4rem_0_#000] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold">CREATIVE EXPLORATION DISCLAIMER</DialogTitle>
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
            
            <div className="flex items-center gap-3 p-4 bg-amber-50 border-3 border-black rounded-xl">
              <div className="flex items-center h-5">
                <Checkbox
                  id="disclaimer-checkbox"
                  checked={isDisclaimerAccepted}
                  onCheckedChange={() => setIsDisclaimerAccepted(!isDisclaimerAccepted)}
                  className="h-5 w-5 border-2 border-black data-[state=checked]:bg-[#3db4ab] data-[state=checked]:text-white"
                />
              </div>
              <Label
                htmlFor="disclaimer-checkbox"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand this is for exploratory purposes only and not medical advice
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <NeoButton 
              buttonText="CANCEL" 
              color="gray"
              className="border-black"
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
              color="primary"
              className="border-black"
              disabled={!isDisclaimerAccepted}
              onClick={handleDisclaimerAccept}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}