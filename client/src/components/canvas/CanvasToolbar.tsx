import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar as CalendarIcon, Grid3X3 } from 'lucide-react';
import { CanvasTab, CanvasType } from '@shared/canvas-types';
import { useCanvas } from '@/contexts/CanvasContext';

export interface CanvasToolbarProps {
  className?: string;
}

/**
 * Canvas Toolbar Component
 * Provides controls for managing canvas tabs and operations
 */
export default function CanvasToolbar({ className = '' }: CanvasToolbarProps) {
  const { 
    tabs, 
    activeTabId, 
    setActiveTabId, 
    addTab,
    updateTab, 
    deleteTab 
  } = useCanvas();

  return (
    <div className={`canvas-toolbar ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex space-x-2">
          <Button 
            onClick={() => addTab(CanvasType.FREEFORM)} 
            className="neo-brutalism-btn"
            size="sm"
          >
            <Grid3X3 size={14} className="mr-1" />
            New Canvas
          </Button>
          <Button 
            onClick={() => addTab(CanvasType.CALENDAR)} 
            className="neo-brutalism-btn"
            size="sm"
          >
            <CalendarIcon size={14} className="mr-1" />
            New Calendar
          </Button>
        </div>
      </div>
      
      {/* Tab bar */}
      <div className="flex overflow-x-auto space-x-2 pb-2">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`px-3 py-1 cursor-pointer rounded-md border-2 border-black 
              ${tab.id === activeTabId ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.title}
            
            {/* Delete button */}
            <button 
              className="ml-2 text-xs opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                deleteTab(tab.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}