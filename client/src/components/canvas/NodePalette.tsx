import { useState } from 'react';
import { useCanvas } from '@/contexts/CanvasContext';
import {
  PlusCircle,
  Calendar,
  FileText,
  Activity,
  Star,
  Clipboard,
  Pill,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NodeTemplate } from '@shared/canvas-types';

// Define our node templates
const nodeTemplates: NodeTemplate[] = [
  {
    type: 'treatment',
    title: 'Treatment',
    inputs: [{ name: 'In', type: 'any' }],
    outputs: [{ name: 'Out', type: 'any' }],
    defaultSize: [200, 120],
    defaultProperties: {
      name: 'New Treatment',
      startDate: '',
      endDate: '',
      provider: '',
      notes: '',
    },
    visual: {
      color: '#0D9488',
      icon: 'pill',
    },
  },
  {
    type: 'journal',
    title: 'Journal Entry',
    inputs: [{ name: 'In', type: 'any' }],
    outputs: [{ name: 'Out', type: 'any' }],
    defaultSize: [200, 140],
    defaultProperties: {
      title: 'New Journal Entry',
      date: '',
      content: '',
      mood: '',
    },
    visual: {
      color: '#4A88DB',
      icon: 'clipboard',
    },
  },
  {
    type: 'document',
    title: 'Document',
    inputs: [{ name: 'In', type: 'any' }],
    outputs: [{ name: 'Out', type: 'any' }],
    defaultSize: [200, 100],
    defaultProperties: {
      title: 'New Document',
      type: '',
      date: '',
      url: '',
    },
    visual: {
      color: '#F59E0B',
      icon: 'fileText',
    },
  },
  {
    type: 'symptom',
    title: 'Symptom',
    inputs: [{ name: 'In', type: 'any' }],
    outputs: [{ name: 'Out', type: 'any' }],
    defaultSize: [180, 100],
    defaultProperties: {
      name: 'New Symptom',
      severity: '',
      startDate: '',
      endDate: '',
      notes: '',
    },
    visual: {
      color: '#EF4444',
      icon: 'activity',
    },
  },
  {
    type: 'milestone',
    title: 'Milestone',
    inputs: [{ name: 'In', type: 'any' }],
    outputs: [{ name: 'Out', type: 'any' }],
    defaultSize: [180, 100],
    defaultProperties: {
      title: 'New Milestone',
      date: '',
      description: '',
      significance: '',
    },
    visual: {
      color: '#8B5CF6',
      icon: 'star',
    },
  },
  {
    type: 'note',
    title: 'Note',
    inputs: [],
    outputs: [{ name: 'Out', type: 'any' }],
    defaultSize: [180, 120],
    defaultProperties: {
      title: 'New Note',
      content: '',
    },
    visual: {
      color: '#FBBF24',
      icon: 'fileText',
    },
  },
  {
    type: 'appointment',
    title: 'Appointment',
    inputs: [{ name: 'In', type: 'any' }],
    outputs: [{ name: 'Out', type: 'any' }],
    defaultSize: [200, 120],
    defaultProperties: {
      title: 'New Appointment',
      date: '',
      time: '',
      provider: '',
      location: '',
      notes: '',
    },
    visual: {
      color: '#0D9488',
      icon: 'calendar',
    },
  },
];

// Helper to get icon component
const getIconForTemplate = (iconName: string) => {
  switch (iconName) {
    case 'pill':
      return <Pill className="h-5 w-5" />;
    case 'clipboard':
      return <Clipboard className="h-5 w-5" />;
    case 'fileText':
      return <FileText className="h-5 w-5" />;
    case 'activity':
      return <Activity className="h-5 w-5" />;
    case 'star':
      return <Star className="h-5 w-5" />;
    case 'calendar':
      return <Calendar className="h-5 w-5" />;
    default:
      return <FileText className="h-5 w-5" />;
  }
};

// Get styles for a specific node type
const getNodeTypeStyles = (type: string) => {
  const template = nodeTemplates.find(t => t.type === type);
  if (!template) return {};
  
  return {
    backgroundColor: template.visual.color,
    color: '#FFFFFF',
  };
};

interface NodePaletteProps {
  className?: string;
}

const NodePalette = ({ className = '' }: NodePaletteProps) => {
  const { activeTabId, createNode } = useCanvas();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter templates based on search
  const filteredTemplates = searchTerm
    ? nodeTemplates.filter(
        (template) =>
          template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : nodeTemplates;

  const handleAddNode = async (template: NodeTemplate) => {
    if (!activeTabId) return;
    
    await createNode({
      tabId: activeTabId,
      type: template.type,
      title: template.title,
      position: [100, 100], // Default position
      size: template.defaultSize,
      inputs: template.inputs,
      outputs: template.outputs,
      properties: { ...template.defaultProperties },
      visual: template.visual,
    });
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      <div className="p-3 border-b border-border">
        <h2 className="font-bold text-lg mb-2">Node Palette</h2>
        <div className="relative mb-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            All
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            Recent
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            Favorites
          </Badge>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          <div className="grid gap-2">
            {filteredTemplates.map((template) => (
              <div key={template.type} className="group">
                <Button
                  variant="outline"
                  className="w-full justify-start border-2 border-black shadow-neo-brutalism hover:shadow-neo-brutalism-hover transition-transform hover:-translate-y-0.5"
                  style={{
                    borderColor: template.visual.color,
                    boxShadow: `3px 3px 0 ${template.visual.color}`,
                  }}
                  onClick={() => handleAddNode(template)}
                  disabled={!activeTabId}
                >
                  <div className="mr-2 p-1 rounded-sm" style={getNodeTypeStyles(template.type)}>
                    {template.visual.icon ? getIconForTemplate(template.visual.icon) : <FileText className="h-5 w-5" />}
                  </div>
                  <span className="mr-auto">{template.title}</span>
                  <PlusCircle className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            ))}
          </div>
          
          <Separator className="my-3" />
          
          <div>
            <h3 className="font-semibold mb-2">Recently Used</h3>
            <div className="text-sm text-muted-foreground">
              Your recently used nodes will appear here.
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default NodePalette;