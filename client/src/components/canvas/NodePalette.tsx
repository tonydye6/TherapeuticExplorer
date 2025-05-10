import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NodeType } from '@shared/canvas-types';

interface NodePaletteProps {
  onNodeSelect: (nodeType: NodeType) => void;
}

export default function NodePalette({ onNodeSelect }: NodePaletteProps) {
  return (
    <div className="w-64 bg-neutral-900 text-white h-full flex flex-col">
      <div className="p-4 border-b border-neutral-700">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
          <Input 
            placeholder="Search nodes" 
            className="pl-8 bg-neutral-800 border-neutral-700 text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <h3 className="text-sm font-semibold mb-2 text-neutral-400">MEDICAL</h3>
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.TREATMENT)}
            >
              Treatment
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.MEDICATION)}
            >
              Medication
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.SYMPTOM)}
            >
              Symptom
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.LAB_RESULT)}
            >
              Lab Result
            </Button>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-2 text-neutral-400">JOURNAL</h3>
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.MOOD_ENTRY)}
            >
              Mood
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.SYMPTOM_LOG)}
            >
              Symptom Log
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.DIET_LOG)}
            >
              Diet Log
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.EXERCISE_LOG)}
            >
              Exercise
            </Button>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-2 text-neutral-400">SUPPORT</h3>
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.MILESTONE)}
            >
              Milestone
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.HOPE_SNIPPET)}
            >
              Hope Snippet
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.VICTORY)}
            >
              Victory Marker
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.CAREGIVER_NOTE)}
            >
              Caregiver Note
            </Button>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-2 text-neutral-400">DOCUMENTS</h3>
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.RESEARCH)}
            >
              Research Article
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.DOCTOR_NOTE)}
            >
              Doctor's Note
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.MEDICAL_IMAGE)}
            >
              Medical Image
            </Button>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-2 text-neutral-400">OTHER</h3>
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-neutral-100 hover:bg-neutral-800"
              onClick={() => onNodeSelect(NodeType.CUSTOM)}
            >
              Custom Node
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}