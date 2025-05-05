import { useState, useRef } from 'react';
import { Send, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import ModelBadge from './ModelBadge';
import { ModelType } from '@shared/schema';
import { Loader2 } from 'lucide-react';

interface MultimodalChatProps {
  onSend?: (response: any) => void;
}

interface UploadedImage {
  previewUrl: string;
  base64Data: string;
}

export function MultimodalChat({ onSend }: MultimodalChatProps) {
  const [message, setMessage] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelType | undefined>(ModelType.GPT);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/multimodal/upload', {
        method: 'POST',
        body: formData
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.images && data.images.length > 0) {
        const newImages = data.images.map((base64Data: string) => ({
          previewUrl: `data:image/jpeg;base64,${base64Data}`,
          base64Data
        }));
        setUploadedImages([...uploadedImages, ...newImages]);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload images',
        variant: 'destructive',
      });
    },
  });

  // Message send mutation
  const sendMutation = useMutation({
    mutationFn: async (data: {
      message: string;
      images?: string[];
      preferredModel?: ModelType;
    }) => {
      const response = await fetch('/api/multimodal/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setMessage('');
      setUploadedImages([]);
      
      // Invalidate the messages query to refresh the chat
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      
      // Callback with response data
      if (onSend) {
        onSend(data);
      }
      
      toast({
        title: 'Message sent',
        description: 'Your message was processed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to send message',
        description: error.message || 'There was an error processing your message',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Limit to 5 images total
    if (uploadedImages.length + files.length > 5) {
      toast({
        title: 'Too many images',
        description: 'You can upload a maximum of 5 images',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    uploadMutation.mutate(formData);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const handleSendMessage = () => {
    if (!message.trim() && uploadedImages.length === 0) return;

    sendMutation.mutate({
      message: message.trim(),
      images: uploadedImages.map(img => img.base64Data),
      preferredModel: selectedModel,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isLoading = uploadMutation.isPending || sendMutation.isPending;

  return (
    <div className="flex flex-col space-y-4 w-full max-w-4xl">
      {/* Model selector */}
      <div className="flex items-center justify-end space-x-2">
        <span className="text-sm text-muted-foreground">AI Model:</span>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={selectedModel === ModelType.GPT ? 'default' : 'outline'}
            onClick={() => setSelectedModel(ModelType.GPT)}
            className="h-8"
          >
            <ModelBadge model={ModelType.GPT} /> GPT-4o Vision
          </Button>
          <Button
            size="sm"
            variant={selectedModel === ModelType.GEMINI ? 'default' : 'outline'}
            onClick={() => setSelectedModel(ModelType.GEMINI)}
            className="h-8"
          >
            <ModelBadge model={ModelType.GEMINI} /> Gemini Pro
          </Button>
        </div>
      </div>
      
      {/* Image preview area */}
      {uploadedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted/20 rounded-md">
          {uploadedImages.map((img, index) => (
            <div key={index} className="relative">
              <img
                src={img.previewUrl}
                alt={`Uploaded image ${index + 1}`}
                className="w-24 h-24 object-cover rounded-md"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                disabled={isLoading}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Message input area */}
      <div className="flex items-end gap-2">
        <div className="flex-grow relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message and/or upload images..."
            className="min-h-[100px] p-4 pr-12 resize-none"
            disabled={isLoading}
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={isLoading || uploadedImages.length >= 5}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 bottom-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || uploadedImages.length >= 5}
          >
            <Image size={20} />
          </Button>
        </div>
        <Button
          size="icon"
          className="h-10 w-10"
          onClick={handleSendMessage}
          disabled={isLoading || (!message.trim() && uploadedImages.length === 0)}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={20} />}
        </Button>
      </div>
      
      {/* Info text */}
      <p className="text-xs text-muted-foreground text-center">
        Upload up to 5 images (JPEG, PNG). Images are analyzed for medical content.
      </p>
    </div>
  );
}

export default MultimodalChat;
