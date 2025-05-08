import { useState } from 'react';
import { useCanvas } from '@/contexts/CanvasContext';
import { Button } from '@/components/ui/button';
import CanvasMenu from './CanvasMenu';
import {
  Plus,
  Trash2,
  PanelLeft,
  ZoomIn,
  ZoomOut,
  Save,
  History,
  LayoutGrid,
  Calendar,
  FileSpreadsheet,
  Route,
  Settings,
  Download,
  Upload,
  Copy,
} from 'lucide-react';
import { CanvasTabType } from '@shared/canvas-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CanvasToolbarProps {
  onToggleSidebar?: () => void;
  showSidebar?: boolean;
  className?: string;
}

const CanvasToolbar = ({
  onToggleSidebar,
  showSidebar = true,
  className = '',
}: CanvasToolbarProps) => {
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    createTab,
    deleteTab,
    scale,
    setScale,
    setOffset,
  } = useCanvas();
  
  const [newTabName, setNewTabName] = useState('');
  const [newTabType, setNewTabType] = useState<CanvasTabType>('freeform');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateTab = async () => {
    if (!newTabName) return;
    
    const tabId = await createTab(newTabName, newTabType);
    setActiveTabId(tabId);
    setNewTabName('');
    setIsCreateDialogOpen(false);
  };

  const handleDeleteTab = async () => {
    if (!activeTabId) return;
    await deleteTab(activeTabId);
  };

  const handleZoomIn = () => {
    setScale(Math.min(2, scale + 0.1));
  };

  const handleZoomOut = () => {
    setScale(Math.max(0.3, scale - 0.1));
  };

  const handleReset = () => {
    setScale(1);
    setOffset([0, 0]);
  };

  const getTypeIcon = (type: CanvasTabType) => {
    switch (type) {
      case 'freeform':
        return <LayoutGrid className="h-4 w-4 mr-2" />;
      case 'calendar':
        return <Calendar className="h-4 w-4 mr-2" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-4 w-4 mr-2" />;
      case 'journey':
        return <Route className="h-4 w-4 mr-2" />;
      case 'template':
        return <Copy className="h-4 w-4 mr-2" />;
      default:
        return <LayoutGrid className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className={`flex items-center justify-between p-2 bg-white border-b border-border ${className}`}>
      {/* Left side - Tab management */}
      <div className="flex items-center space-x-2">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            title={showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
          >
            <PanelLeft className={`h-5 w-5 ${!showSidebar ? 'rotate-180' : ''}`} />
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="font-semibold">
              {activeTabId
                ? tabs.find((tab) => tab.id === activeTabId)?.name || 'Select Canvas'
                : 'Select Canvas'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {tabs.map((tab) => (
              <DropdownMenuItem
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center ${activeTabId === tab.id ? 'bg-muted' : ''}`}
              >
                {getTypeIcon(tab.type)}
                <span>{tab.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="flex items-center text-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Create New Canvas</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Canvas</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="canvas-name">Canvas Name</Label>
                    <Input
                      id="canvas-name"
                      value={newTabName}
                      onChange={(e) => setNewTabName(e.target.value)}
                      placeholder="My Canvas"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="canvas-type">Canvas Type</Label>
                    <Select
                      value={newTabType}
                      onValueChange={(value) => setNewTabType(value as CanvasTabType)}
                    >
                      <SelectTrigger id="canvas-type">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="freeform">Freeform</SelectItem>
                        <SelectItem value="calendar">Calendar</SelectItem>
                        <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                        <SelectItem value="journey">Journey</SelectItem>
                        <SelectItem value="template">Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateTab}
                    disabled={!newTabName}
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Center - View controls */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <div className="text-xs bg-muted px-2 py-1 rounded-md">
          {Math.round(scale * 100)}%
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          title="Reset View"
        >
          <History className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Right side - Actions */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          title="Canvas Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Export Canvas"
        >
          <Download className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Import Canvas"
        >
          <Upload className="h-5 w-5" />
        </Button>
        {/* Canvas Menu */}
        <CanvasMenu />
      </div>
    </div>
  );
};

export default CanvasToolbar;