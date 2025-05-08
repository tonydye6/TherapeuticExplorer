import { useState } from 'react';
import { useCanvas } from '@/contexts/CanvasContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Trash,
  Copy,
  ClipboardCopy,
  Download,
  Upload,
  Settings,
  Save,
  MoreVertical,
  Info,
} from 'lucide-react';

interface CanvasMenuProps {
  className?: string;
}

const CanvasMenu = ({ className = '' }: CanvasMenuProps) => {
  const { activeTabId, tabs, deleteTab } = useCanvas();
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  
  const handleDeleteCanvas = async () => {
    if (!activeTabId) return;
    
    if (window.confirm('Are you sure you want to delete this canvas?')) {
      await deleteTab(activeTabId);
    }
  };
  
  const handleExportCanvas = () => {
    if (!activeTab) return;
    
    // In a production version, this would export the canvas data
    // For now, just show a placeholder
    alert('Export Canvas feature coming soon!');
  };
  
  const handleDuplicateCanvas = () => {
    if (!activeTab) return;
    
    // In a production version, this would duplicate the canvas
    // For now, just show a placeholder
    alert('Duplicate Canvas feature coming soon!');
  };

  return (
    <div className={`flex items-center ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Canvas Options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Canvas Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem disabled={!activeTab} onClick={handleDuplicateCanvas}>
            <Copy className="h-4 w-4 mr-2" />
            <span>Duplicate Canvas</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem disabled={!activeTab}>
            <Save className="h-4 w-4 mr-2" />
            <span>Save Canvas</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem disabled={!activeTab} onClick={handleExportCanvas}>
            <Download className="h-4 w-4 mr-2" />
            <span>Export Canvas</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem disabled={!activeTab}>
            <Upload className="h-4 w-4 mr-2" />
            <span>Import to Canvas</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem disabled={!activeTab}>
            <ClipboardCopy className="h-4 w-4 mr-2" />
            <span>Copy Canvas Link</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem disabled={!activeTab}>
            <Settings className="h-4 w-4 mr-2" />
            <span>Canvas Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem disabled={!activeTab}>
            <Info className="h-4 w-4 mr-2" />
            <span>Canvas Info</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            disabled={!activeTab} 
            onClick={handleDeleteCanvas}
            className="text-destructive"
          >
            <Trash className="h-4 w-4 mr-2" />
            <span>Delete Canvas</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CanvasMenu;