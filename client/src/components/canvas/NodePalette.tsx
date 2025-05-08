import { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  FileText, HeartPulse, FlaskConical, BookOpen, Heart, 
  CalendarRange, Pill, Stethoscope, User
} from 'lucide-react';

// Define a node template interface
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

// Node templates organized by category
const nodeTemplates: NodeTemplate[] = [
  // Treatment nodes
  {
    id: 'treatment-medication',
    type: 'treatment',
    title: 'Medication',
    category: 'treatment',
    description: 'Track a medication treatment',
    icon: <Pill className="h-5 w-5" />
  },
  {
    id: 'treatment-therapy',
    type: 'treatment',
    title: 'Therapy',
    category: 'treatment',
    description: 'Track a therapy session or plan',
    icon: <HeartPulse className="h-5 w-5" />
  },
  {
    id: 'treatment-procedure',
    type: 'treatment',
    title: 'Procedure',
    category: 'treatment',
    description: 'Track a medical procedure',
    icon: <Stethoscope className="h-5 w-5" />
  },
  
  // Document nodes
  {
    id: 'document-report',
    type: 'document',
    title: 'Medical Report',
    category: 'document',
    description: 'Link to a medical report',
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: 'document-research',
    type: 'document',
    title: 'Research Item',
    category: 'document',
    description: 'Link to saved research',
    icon: <FlaskConical className="h-5 w-5" />
  },

  // Journal nodes
  {
    id: 'journal-note',
    type: 'journal',
    title: 'Journal Entry',
    category: 'journal',
    description: 'Add a journal entry',
    icon: <BookOpen className="h-5 w-5" />
  },
  {
    id: 'journal-milestone',
    type: 'journal',
    title: 'Milestone',
    category: 'journal',
    description: 'Mark an important milestone',
    icon: <CalendarRange className="h-5 w-5" />
  },

  // Hope nodes
  {
    id: 'hope-snippet',
    type: 'hope',
    title: 'Hope Snippet',
    category: 'hope',
    description: 'Add an inspirational note',
    icon: <Heart className="h-5 w-5" />
  },
  {
    id: 'hope-contact',
    type: 'hope',
    title: 'Support Contact',
    category: 'hope',
    description: 'Add a support contact',
    icon: <User className="h-5 w-5" />
  }
];

export default function NodePalette({ onNodeSelect }: NodePaletteProps) {
  const [activeCategory, setActiveCategory] = useState('treatment');

  // Filter templates by active category
  const filteredTemplates = nodeTemplates.filter(
    template => template.category === activeCategory
  );

  return (
    <Card className="w-[280px] shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Add Node</CardTitle>
        <CardDescription>
          Drag a node to the canvas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="treatment" className="px-2">
              <Pill className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="document" className="px-2">
              <FileText className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="journal" className="px-2">
              <BookOpen className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="hope" className="px-2">
              <Heart className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
          
          {/* Node templates grid */}
          <div className="grid grid-cols-1 gap-2">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className={`p-3 bg-white border-2 border-gray-800 rounded-lg 
                  cursor-grab hover:shadow-neo-sm transition-shadow
                  border-l-4 border-l-${template.type === 'treatment' ? 'neo-red-300' : 
                    template.type === 'document' ? 'neo-cyan-300' : 
                    template.type === 'journal' ? 'neo-violet-300' : 
                    'neo-yellow-300'}`}
                onClick={() => onNodeSelect(template)}
                draggable
                onDragStart={(e) => {
                  // Set drag data for canvas to interpret
                  e.dataTransfer.setData('node-template', JSON.stringify(template));
                }}
              >
                <div className="flex items-center space-x-2">
                  {template.icon}
                  <div>
                    <h4 className="font-medium text-sm">{template.title}</h4>
                    <p className="text-xs text-gray-500">{template.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}