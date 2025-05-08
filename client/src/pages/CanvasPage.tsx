import { useState } from 'react';
import { CanvasProvider } from '@/contexts/CanvasContext';
import LiteGraphWrapper from '@/components/canvas/LiteGraphWrapper';
import CanvasToolbar from '@/components/canvas/CanvasToolbar';
import NodePalette from '@/components/canvas/NodePalette';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

const CanvasPage = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // In the future, we'll get this from the authentication context
  const mockUserId = 'user-123';
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Simulate asking AI for help with canvas creation
  const askAIForHelp = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // In the future, this would trigger an AI assistant to help create a canvas
      alert('AI assistance for canvas creation is coming soon!');
    }, 1500);
  };

  return (
    <CanvasProvider userId={mockUserId}>
      <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gradient-start to-gradient-end">
        {/* Top toolbar */}
        <CanvasToolbar 
          onToggleSidebar={toggleSidebar} 
          showSidebar={showSidebar}
          className="border-b bg-white"
        />
        
        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Node palette */}
          {showSidebar && (
            <div className="w-64 border-r bg-white">
              <NodePalette />
            </div>
          )}
          
          {/* Main canvas area */}
          <div className="relative flex-1 overflow-hidden">
            <LiteGraphWrapper />
            
            {/* AI Assistance Floating Button */}
            <div className="absolute bottom-6 right-6">
              <Button
                onClick={askAIForHelp}
                className="rounded-full px-4 py-2 bg-primary text-white shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5 mr-2" />
                )}
                AI Assist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CanvasProvider>
  );
};

export default CanvasPage;