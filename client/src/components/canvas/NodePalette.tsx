import React from 'react';
import { 
  FileText, Pill, Calendar, Book, HeartPulse, 
  BookOpen, FileQuestion, Clock, Search, BarChart, 
  Feather, Leaf, 
  Microscope
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

export interface NodeTemplate {
  id: string;
  type: string;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
}

interface NodePaletteProps {
  onNodeSelect: (template: NodeTemplate) => void;
}

export default function NodePalette({ onNodeSelect }: NodePaletteProps) {
  // Node templates categorized
  const nodeTemplates: NodeTemplate[] = [
    // Journey Nodes
    {
      id: 'treatment-node',
      type: 'treatment',
      title: 'Treatment',
      category: 'journey',
      description: 'Track a treatment or medication',
      icon: <Pill className="h-4 w-4" />
    },
    {
      id: 'appointment-node',
      type: 'appointment',
      title: 'Appointment',
      category: 'journey',
      description: 'Schedule a healthcare appointment',
      icon: <Calendar className="h-4 w-4" />
    },
    {
      id: 'milestone-node',
      type: 'milestone',
      title: 'Milestone',
      category: 'journey',
      description: 'Mark an important point in your journey',
      icon: <HeartPulse className="h-4 w-4" />
    },
    
    // Document Nodes
    {
      id: 'report-node',
      type: 'report',
      title: 'Medical Report',
      category: 'documents',
      description: 'Medical or lab report',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'journal-node',
      type: 'journal',
      title: 'Journal Entry',
      category: 'documents',
      description: 'Personal reflection or journal entry',
      icon: <Book className="h-4 w-4" />
    },
    {
      id: 'resource-node',
      type: 'resource',
      title: 'Resource',
      category: 'documents',
      description: 'Link to helpful resource',
      icon: <BookOpen className="h-4 w-4" />
    },
    
    // Research Nodes
    {
      id: 'question-node',
      type: 'question',
      title: 'Research Question',
      category: 'research',
      description: 'Question for research',
      icon: <FileQuestion className="h-4 w-4" />
    },
    {
      id: 'clinical-trial-node',
      type: 'clinicalTrial',
      title: 'Clinical Trial',
      category: 'research',
      description: 'Information about a clinical trial',
      icon: <Microscope className="h-4 w-4" />
    },
    {
      id: 'finding-node',
      type: 'finding',
      title: 'Research Finding',
      category: 'research',
      description: 'Insights from research',
      icon: <Search className="h-4 w-4" />
    },
    
    // Insights Nodes
    {
      id: 'symptom-tracker-node',
      type: 'symptomTracker',
      title: 'Symptom Tracker',
      category: 'insights',
      description: 'Track and analyze symptoms',
      icon: <BarChart className="h-4 w-4" />
    },
    {
      id: 'timeline-node',
      type: 'timeline',
      title: 'Timeline',
      category: 'insights',
      description: 'Visualize event timeline',
      icon: <Clock className="h-4 w-4" />
    },
    
    // Hope Nodes
    {
      id: 'hope-snippet-node',
      type: 'hopeSnippet',
      title: 'Hope Snippet',
      category: 'hope',
      description: 'Inspirational note or reminder',
      icon: <Feather className="h-4 w-4" />
    },
    {
      id: 'mindfulness-node',
      type: 'mindfulness',
      title: 'Mindfulness',
      category: 'hope',
      description: 'Mindfulness exercise or reflection',
      icon: <Leaf className="h-4 w-4" />
    }
  ];
  
  // Group templates by category
  const categories = nodeTemplates.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, NodeTemplate[]>);
  
  // Render the palette
  return (
    <div className="w-full flex flex-col">
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search nodes..."
          className="mb-2"
        />
      </div>
      
      <ScrollArea className="h-[calc(100vh-270px)] pr-3">
        <Accordion type="multiple" defaultValue={['journey', 'documents', 'research']}>
          {Object.entries(categories).map(([category, templates]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-sm font-semibold capitalize">
                {category}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white p-3 rounded-md border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                      onClick={() => onNodeSelect(template)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-gray-100">
                          {template.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{template.title}</h3>
                          <p className="text-xs text-gray-500">{template.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
}