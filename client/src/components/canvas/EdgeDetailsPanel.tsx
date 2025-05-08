import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { X, Link as LinkIcon } from 'lucide-react';
import { CanvasEdge } from '@shared/canvas-types';

interface EdgeDetailsPanelProps {
  edge: CanvasEdge;
  sourceTitle?: string;
  targetTitle?: string;
  onClose: () => void;
  onUpdate: (edge: CanvasEdge, properties: Record<string, any>) => void;
}

const relationshipTypes = [
  { label: 'Related To', value: 'related' },
  { label: 'Causes', value: 'causes' },
  { label: 'Treats', value: 'treats' },
  { label: 'Correlates With', value: 'correlates' },
  { label: 'Improves', value: 'improves' },
  { label: 'Worsens', value: 'worsens' },
  { label: 'Precedes', value: 'precedes' },
  { label: 'Follows', value: 'follows' },
  { label: 'Part Of', value: 'part_of' }
];

export default function EdgeDetailsPanel({ 
  edge,
  sourceTitle = "Source Node",
  targetTitle = "Target Node",
  onClose,
  onUpdate
}: EdgeDetailsPanelProps) {
  // Get relationship from edge properties or use 'related' as default
  const [relationship, setRelationship] = useState<string>(
    edge.properties?.relationship || 'related'
  );
  
  // Get notes from edge properties or use empty string as default
  const [notes, setNotes] = useState<string>(
    edge.properties?.notes || ''
  );
  
  // Handle saving changes
  const handleSave = () => {
    onUpdate(edge, {
      relationship,
      notes,
      updatedAt: new Date()
    });
  };

  return (
    <Card className="border-4 border-black shadow-neo-sm neo-brutalism-card w-80 ml-4 bg-white animate-fadeIn edge-details-panel">
      <div className="absolute -top-1 -left-1 w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
      <CardHeader className="border-b-4 border-black p-4 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold flex items-center">
            <LinkIcon className="w-5 h-5 mr-2 text-primary" />
            CONNECTION DETAILS
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-5">
        <div className="p-3 bg-primary/10 rounded-md border-2 border-black shadow-neo-sm">
          <div className="text-sm font-bold text-primary uppercase mb-1">Source Node</div>
          <div className="font-medium truncate">{sourceTitle}</div>
        </div>
        
        <div className="flex items-center justify-center py-2">
          <div className="w-1/3 h-1 bg-secondary"></div>
          <div className="mx-2 h-6 w-6 rounded-full border-2 border-black bg-white flex items-center justify-center">
            <LinkIcon className="h-3 w-3 text-primary" />
          </div>
          <div className="w-1/3 h-1 bg-secondary"></div>
        </div>
        
        <div className="p-3 bg-secondary/10 rounded-md border-2 border-black shadow-neo-sm">
          <div className="text-sm font-bold text-secondary uppercase mb-1">Target Node</div>
          <div className="font-medium truncate">{targetTitle}</div>
        </div>
        
        <div className="space-y-2 mt-2">
          <label className="text-sm font-bold uppercase">Relationship Type</label>
          <Select 
            value={relationship} 
            onValueChange={setRelationship}
          >
            <SelectTrigger className="border-2 border-black neo-brutalism-input bg-white">
              <SelectValue placeholder="Select a relationship type" />
            </SelectTrigger>
            <SelectContent className="border-2 border-black">
              {relationshipTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase">Connection Notes</label>
          <Input 
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
            placeholder="Add notes about this connection..."
            className="border-2 border-black neo-brutalism-input bg-white"
          />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t-4 border-black flex justify-end space-x-3 bg-gradient-to-r from-primary/5 to-secondary/5">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="border-2 border-black hover:bg-gray-100 transition-colors"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          className="border-2 border-black bg-primary text-white hover:bg-primary-hover transition-colors"
        >
          Save Connection
        </Button>
      </CardFooter>
    </Card>
  );
}