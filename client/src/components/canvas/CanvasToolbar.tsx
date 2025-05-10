
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Grid, FileText, Pill, Brain, Book, Layout, PlusCircle, Files } from 'lucide-react';
import { CanvasType } from '@shared/canvas-types';
import { useCanvas } from '@/contexts/CanvasContext';

export interface CanvasToolbarProps {
  className?: string;
}

export default function CanvasToolbar({ className = '' }: CanvasToolbarProps) {
  const { addTab } = useCanvas();

  return (
    <div className="canvas-toolbar flex items-center gap-1 p-2 bg-neutral-900 text-white border-b border-neutral-700">
      <Button 
        variant="ghost" 
        size="sm"
        className="text-white hover:bg-neutral-800"
        onClick={() => addTab(CanvasType.FREEFORM)}
      >
        <Plus size={16} className="mr-1" />
        New Canvas
      </Button>
      
      <div className="h-4 w-px bg-neutral-700 mx-1" />
      
      <Button variant="ghost" size="sm" className="text-white hover:bg-neutral-800">
        <Grid size={16} className="mr-1" />
        Explore
      </Button>
      
      <Button variant="ghost" size="sm" className="text-white hover:bg-neutral-800">
        <Calendar size={16} className="mr-1" />
        Calendar
      </Button>
      
      <Button variant="ghost" size="sm" className="text-white hover:bg-neutral-800">
        <Files size={16} className="mr-1" />
        Spreadsheet
      </Button>
      
      <Button variant="ghost" size="sm" className="text-white hover:bg-neutral-800">
        <FileText size={16} className="mr-1" />
        Records
      </Button>
      
      <Button variant="ghost" size="sm" className="text-white hover:bg-neutral-800">
        <Pill size={16} className="mr-1" />
        Treatment
      </Button>
      
      <Button variant="ghost" size="sm" className="text-white hover:bg-neutral-800">
        <Brain size={16} className="mr-1" />
        Symptom
      </Button>
      
      <Button variant="ghost" size="sm" className="text-white hover:bg-neutral-800">
        <Book size={16} className="mr-1" />
        Journal
      </Button>
      
      <Button variant="ghost" size="sm" className="text-white hover:bg-neutral-800">
        <Layout size={16} className="mr-1" />
        Templates
      </Button>
      
      <Button variant="ghost" size="sm" className="text-white hover:bg-neutral-800">
        <PlusCircle size={16} className="mr-1" />
        Quick Note
      </Button>
      
      <div className="flex-grow" />
      
      <Button variant="ghost" size="sm" className="text-white hover:bg-neutral-800">
        Hide Palette
      </Button>
    </div>
  );
}
