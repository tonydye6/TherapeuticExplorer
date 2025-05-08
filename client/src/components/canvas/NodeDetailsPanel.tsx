import React, { useState, useEffect } from 'react';
import { LGraphNode } from 'litegraph.js';
import { NodeType } from '@shared/canvas-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';

interface NodeDetailsPanelProps {
  selectedNode: LGraphNode | null;
  onNodeUpdate?: (node: LGraphNode, props: any) => void;
  onClose?: () => void;
}

const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ 
  selectedNode, 
  onNodeUpdate,
  onClose 
}) => {
  const [nodeProperties, setNodeProperties] = useState<Record<string, any>>({});
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (selectedNode) {
      // Initialize from node properties
      setNodeProperties(selectedNode.properties || {});
    } else {
      setNodeProperties({});
      setIsEditing(false);
    }
  }, [selectedNode]);
  
  if (!selectedNode) return null;
  
  // Determine node type
  const nodeType = selectedNode.type ? selectedNode.type.split('/')[1] : 'unknown';
  const nodeTitle = nodeProperties.title || nodeProperties.name || 'Untitled Node';
  
  const handleInputChange = (key: string, value: any) => {
    setNodeProperties((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const handleSave = () => {
    if (selectedNode && onNodeUpdate) {
      onNodeUpdate(selectedNode, nodeProperties);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    if (selectedNode) {
      // Reset to original properties
      setNodeProperties(selectedNode.properties || {});
    }
    setIsEditing(false);
  };
  
  const getNodeIcon = () => {
    switch (nodeType) {
      case 'treatment':
        return '💊';
      case 'journal-entry':
        return '📓';
      case 'symptom':
        return '🩹';
      case 'document':
        return '📄';
      case 'note':
        return '📝';
      default:
        return '📌';
    }
  };
  
  // Render different forms based on node type
  const renderNodeForm = () => {
    switch (nodeType) {
      case 'treatment':
        return renderTreatmentForm();
      case 'journal-entry':
        return renderJournalForm();
      case 'symptom':
        return renderSymptomForm();
      case 'document':
        return renderDocumentForm();
      case 'note':
        return renderNoteForm();
      default:
        return renderGenericForm();
    }
  };
  
  const renderTreatmentForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Treatment Name</label>
          <Input 
            value={nodeProperties.name || ''} 
            onChange={(e) => handleInputChange('name', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <Input 
            value={nodeProperties.type || 'medication'} 
            onChange={(e) => handleInputChange('type', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input 
              type="date"
              value={nodeProperties.startDate 
                ? new Date(nodeProperties.startDate).toISOString().split('T')[0] 
                : ''}
              onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
              readOnly={!isEditing}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input 
              type="date"
              value={nodeProperties.endDate 
                ? new Date(nodeProperties.endDate).toISOString().split('T')[0] 
                : ''}
              onChange={(e) => handleInputChange('endDate', e.target.value ? new Date(e.target.value) : null)}
              readOnly={!isEditing}
              className="w-full"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <Textarea 
            value={nodeProperties.notes || ''} 
            onChange={(e) => handleInputChange('notes', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
            rows={4}
          />
        </div>
      </div>
    );
  };
  
  const renderJournalForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input 
            value={nodeProperties.title || ''} 
            onChange={(e) => handleInputChange('title', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input 
            type="date"
            value={nodeProperties.dateCreated 
              ? new Date(nodeProperties.dateCreated).toISOString().split('T')[0] 
              : ''}
            onChange={(e) => handleInputChange('dateCreated', new Date(e.target.value))}
            readOnly={!isEditing}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Mood</label>
          <Input 
            value={nodeProperties.mood || ''} 
            onChange={(e) => handleInputChange('mood', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <Textarea 
            value={nodeProperties.content || ''} 
            onChange={(e) => handleInputChange('content', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
            rows={6}
          />
        </div>
      </div>
    );
  };
  
  const renderSymptomForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Symptom Name</label>
          <Input 
            value={nodeProperties.name || ''} 
            onChange={(e) => handleInputChange('name', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Severity (1-5)</label>
          <Input 
            type="number"
            min={1}
            max={5}
            value={nodeProperties.severity || 3} 
            onChange={(e) => handleInputChange('severity', parseInt(e.target.value))}
            readOnly={!isEditing}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Frequency</label>
          <Input 
            value={nodeProperties.frequency || ''} 
            onChange={(e) => handleInputChange('frequency', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Observed</label>
            <Input 
              type="date"
              value={nodeProperties.dateStarted 
                ? new Date(nodeProperties.dateStarted).toISOString().split('T')[0] 
                : ''}
              onChange={(e) => handleInputChange('dateStarted', new Date(e.target.value))}
              readOnly={!isEditing}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Last Observed</label>
            <Input 
              type="date"
              value={nodeProperties.dateEnded 
                ? new Date(nodeProperties.dateEnded).toISOString().split('T')[0] 
                : ''}
              onChange={(e) => handleInputChange('dateEnded', e.target.value ? new Date(e.target.value) : null)}
              readOnly={!isEditing}
              className="w-full"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <Textarea 
            value={nodeProperties.notes || ''} 
            onChange={(e) => handleInputChange('notes', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
            rows={4}
          />
        </div>
      </div>
    );
  };
  
  const renderDocumentForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input 
            value={nodeProperties.title || ''} 
            onChange={(e) => handleInputChange('title', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Document Type</label>
          <Input 
            value={nodeProperties.type || ''} 
            onChange={(e) => handleInputChange('type', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input 
            type="date"
            value={nodeProperties.date 
              ? new Date(nodeProperties.date).toISOString().split('T')[0] 
              : ''}
            onChange={(e) => handleInputChange('date', new Date(e.target.value))}
            readOnly={!isEditing}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Provider/Source</label>
          <Input 
            value={nodeProperties.provider || ''} 
            onChange={(e) => handleInputChange('provider', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Summary</label>
          <Textarea 
            value={nodeProperties.summary || ''} 
            onChange={(e) => handleInputChange('summary', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
            rows={5}
          />
        </div>
      </div>
    );
  };
  
  const renderNoteForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input 
            value={nodeProperties.title || ''} 
            onChange={(e) => handleInputChange('title', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <Textarea 
            value={nodeProperties.content || ''} 
            onChange={(e) => handleInputChange('content', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
            rows={8}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <div className="flex space-x-2">
            {['yellow', 'blue', 'green', 'pink', 'purple'].map((color) => (
              <div 
                key={color}
                className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                  nodeProperties.color === color ? 'border-black' : 'border-transparent'
                }`}
                style={{ 
                  backgroundColor: 
                    color === 'yellow' ? '#FEF3C7' : 
                    color === 'blue' ? '#DBEAFE' : 
                    color === 'green' ? '#DCFCE7' : 
                    color === 'pink' ? '#FCE7F3' : 
                    color === 'purple' ? '#EDE9FE' : '#FEF3C7'
                }}
                onClick={() => isEditing && handleInputChange('color', color)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const renderGenericForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input 
            value={nodeProperties.title || nodeProperties.name || ''} 
            onChange={(e) => handleInputChange(nodeProperties.title ? 'title' : 'name', e.target.value)}
            readOnly={!isEditing}
            className="w-full"
          />
        </div>
        
        {Object.entries(nodeProperties)
          .filter(([key]) => !['id', 'title', 'name'].includes(key))
          .map(([key, value]) => {
            // Skip rendering complex objects and arrays
            if (typeof value === 'object' && value !== null) return null;
            
            return (
              <div key={key}>
                <label className="block text-sm font-medium mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <Input 
                  value={value?.toString() || ''} 
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  readOnly={!isEditing}
                  className="w-full"
                />
              </div>
            );
          })}
      </div>
    );
  };
  
  return (
    <div className="border-l-2 border-black w-72 h-full bg-white overflow-y-auto flex flex-col neo-brutalism shadow-md">
      <div className="p-4 border-b-2 border-black bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center">
          <span className="mr-2">{getNodeIcon()}</span>
          {nodeType.charAt(0).toUpperCase() + nodeType.slice(1).replace(/-/g, ' ')}
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="p-4 flex-grow overflow-y-auto">
        {renderNodeForm()}
      </div>
      
      <div className="p-4 border-t-2 border-black bg-gray-50 flex justify-end space-x-3">
        {isEditing ? (
          <>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="neo-brutalism-btn border-2 border-black"
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleSave}
              className="neo-brutalism-btn border-2 border-black bg-cyan-200 hover:bg-cyan-300"
            >
              Save
            </Button>
          </>
        ) : (
          <Button 
            variant="default" 
            onClick={() => setIsEditing(true)}
            className="neo-brutalism-btn border-2 border-black bg-violet-200 hover:bg-violet-300"
          >
            Edit
          </Button>
        )}
      </div>
    </div>
  );
};

export default NodeDetailsPanel;