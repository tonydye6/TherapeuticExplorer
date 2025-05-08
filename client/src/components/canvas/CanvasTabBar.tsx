import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasTab } from '@shared/canvas-types';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CanvasTabBarProps {
  tabs: CanvasTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onRenameTab: (tabId: string, newName: string) => void;
  onDeleteTab: (tabId: string) => void;
  onDuplicateTab?: (tabId: string) => void;
}

const CanvasTabBar: React.FC<CanvasTabBarProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onRenameTab,
  onDeleteTab,
  onDuplicateTab
}) => {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTabId, setCurrentTabId] = useState<string>('');
  const [newTabName, setNewTabName] = useState('');

  const handleOpenRenameDialog = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setCurrentTabId(tabId);
      setNewTabName(tab.title);
      setRenameDialogOpen(true);
    }
  };

  const handleOpenDeleteDialog = (tabId: string) => {
    setCurrentTabId(tabId);
    setDeleteDialogOpen(true);
  };

  const handleRenameTab = () => {
    if (newTabName.trim() && currentTabId) {
      onRenameTab(currentTabId, newTabName.trim());
      setRenameDialogOpen(false);
    }
  };

  const handleDeleteTab = () => {
    onDeleteTab(currentTabId);
    setDeleteDialogOpen(false);
  };

  const handleDuplicateTab = (tabId: string) => {
    if (onDuplicateTab) {
      onDuplicateTab(tabId);
    }
  };

  return (
    <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
      {tabs.map(tab => (
        <div 
          key={tab.id} 
          className={`
            flex items-center 
            px-3 py-2 rounded-t-lg
            border-2 border-black
            ${activeTabId === tab.id 
              ? 'bg-cyan-200 border-b-0 shadow-[3px_0px_0px_rgba(0,0,0,1)]' 
              : 'bg-violet-200 hover:bg-violet-300 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
            }
            transition-all duration-200
            cursor-pointer
            min-w-[120px] max-w-[200px]
            whitespace-nowrap overflow-hidden text-ellipsis
          `}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="mr-2 flex-grow overflow-hidden text-ellipsis font-medium">
            {tab.title}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal size={14} />
                <span className="sr-only">Tab options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenRenameDialog(tab.id)}>
                <Edit size={14} className="mr-2" /> Rename
              </DropdownMenuItem>
              {onDuplicateTab && (
                <DropdownMenuItem onClick={() => handleDuplicateTab(tab.id)}>
                  <Copy size={14} className="mr-2" /> Duplicate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => handleOpenDeleteDialog(tab.id)}
                className="text-red-600"
              >
                <Trash size={14} className="mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px] neo-brutalism">
          <DialogHeader>
            <DialogTitle>Rename Canvas Tab</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              placeholder="Enter new tab name"
              className="neo-brutalism-input"
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="neo-brutalism-btn">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleRenameTab} className="neo-brutalism-btn">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] neo-brutalism">
          <DialogHeader>
            <DialogTitle>Delete Canvas Tab</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this canvas tab? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="neo-brutalism-btn">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleDeleteTab} 
              variant="destructive"
              className="neo-brutalism-btn bg-red-500 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CanvasTabBar;