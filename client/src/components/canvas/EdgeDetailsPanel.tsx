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
    <Card className="border-2 border-black shadow-neo neo-brutalism-card w-80 ml-4">
      <CardHeader className="border-b border-black p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold flex items-center">
            <LinkIcon className="w-4 h-4 mr-2" />
            Connection
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div className="p-2 bg-muted rounded-md">
          <div className="text-sm text-muted-foreground">Source</div>
          <div className="font-medium truncate">{sourceTitle}</div>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="w-1/3 h-0.5 bg-primary"></div>
          <LinkIcon className="mx-2 h-4 w-4" />
          <div className="w-1/3 h-0.5 bg-primary"></div>
        </div>
        
        <div className="p-2 bg-muted rounded-md">
          <div className="text-sm text-muted-foreground">Target</div>
          <div className="font-medium truncate">{targetTitle}</div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Relationship Type</label>
          <Select 
            value={relationship} 
            onValueChange={setRelationship}
          >
            <SelectTrigger className="neo-brutalism-input">
              <SelectValue placeholder="Select a relationship type" />
            </SelectTrigger>
            <SelectContent>
              {relationshipTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <Input 
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
            placeholder="Add notes about this connection..."
            className="neo-brutalism-input"
          />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="neo-brutalism-btn"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          className="neo-brutalism-btn"
        >
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}