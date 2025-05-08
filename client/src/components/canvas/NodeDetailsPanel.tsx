import React, { useState, useEffect } from 'react';
import { LGraphNode } from 'litegraph.js';
import { NodeType } from '@shared/canvas-types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  X, 
  Pill, 
  BookOpen, 
  FileText, 
  StickyNote,
  Activity,
  Link as LinkIcon,
  MessageSquare,
  BrainCircuit
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

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
  
  // Function to get the appropriate icon component based on node type
  const getNodeIconComponent = () => {
    switch (nodeType) {
      case 'treatment':
        return <Pill className="w-5 h-5 mr-2 text-primary" />;
      case 'journal-entry':
        return <BookOpen className="w-5 h-5 mr-2 text-primary" />;
      case 'symptom':
        return <Activity className="w-5 h-5 mr-2 text-primary" />;
      case 'document':
        return <FileText className="w-5 h-5 mr-2 text-primary" />;
      case 'note':
        return <StickyNote className="w-5 h-5 mr-2 text-primary" />;
      default:
        return <StickyNote className="w-5 h-5 mr-2 text-primary" />;
    }
  };

  // Mock data for related nodes - in a real implementation this would come from the database
  const relatedNodes = [
    { id: '1', title: 'Related Treatment', type: 'treatment' },
    { id: '2', title: 'Journal Entry from March', type: 'journal-entry' },
    { id: '3', title: 'Doctor\'s Note', type: 'document' }
  ];

  // Mock data for AI insights - in a real implementation this would come from an AI service
  const aiInsights = nodeProperties.aiInsights || [
    "This symptom is commonly associated with the treatment you started on March 15th.",
    "83% of patients with similar symptoms reported improvement after 3 weeks of treatment.",
    "Consider tracking your hydration levels alongside this symptom."
  ];

  // Format the node title for display
  const displayTitle = nodeTitle || (nodeType ? nodeType.charAt(0).toUpperCase() + nodeType.slice(1).replace(/-/g, ' ') : 'Node');
  
  return (
    <Card className="border-4 border-black shadow-neo-sm neo-brutalism-card w-80 h-full bg-white animate-fadeIn node-details-panel overflow-hidden">
      {/* Animated corner elements */}
      <div className="absolute -top-1 -left-1 w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-pulse"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
      
      <CardHeader className="border-b-4 border-black p-4 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold flex items-center">
            {getNodeIconComponent()}
            {nodeType.toUpperCase().replace(/-/g, ' ')}
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
        <CardDescription className="text-md font-medium mt-1 truncate">{displayTitle}</CardDescription>
      </CardHeader>
      
      <div className="flex-grow overflow-y-auto max-h-[calc(100vh-200px)]">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full border-b-4 border-black bg-background grid grid-cols-3">
            <TabsTrigger value="details" className="uppercase font-bold">Details</TabsTrigger>
            <TabsTrigger value="insights" className="uppercase font-bold">AI Insights</TabsTrigger>
            <TabsTrigger value="connections" className="uppercase font-bold">Connections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="p-0">
            <CardContent className="p-4 space-y-4 overflow-y-auto">
              {renderNodeForm()}
            </CardContent>
          </TabsContent>
          
          <TabsContent value="insights" className="p-0">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <BrainCircuit className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="font-bold uppercase">AI Analysis</h3>
                </div>
                
                {aiInsights.map((insight: string, index: number) => (
                  <div 
                    key={index} 
                    className="p-3 bg-primary/10 rounded-md border-2 border-black shadow-neo-xs flex items-start"
                  >
                    <div className="mr-3 mt-1 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
                
                <div className="pt-2">
                  <Button 
                    className="w-full border-2 border-black bg-secondary hover:bg-secondary/80 text-white shadow-neo-xs"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Ask About This {nodeType.replace(/-/g, ' ')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="connections" className="p-0">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <LinkIcon className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="font-bold uppercase">Connected Nodes</h3>
                </div>
                
                {relatedNodes.map((node) => (
                  <div 
                    key={node.id} 
                    className="p-3 bg-secondary/10 rounded-md border-2 border-black shadow-neo-xs cursor-pointer hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-center">
                      {/* Display appropriate icon based on node type */}
                      {node.type === 'treatment' && <Pill className="w-4 h-4 mr-2 text-primary" />}
                      {node.type === 'journal-entry' && <BookOpen className="w-4 h-4 mr-2 text-primary" />}
                      {node.type === 'document' && <FileText className="w-4 h-4 mr-2 text-primary" />}
                      {node.type === 'symptom' && <Activity className="w-4 h-4 mr-2 text-primary" />}
                      {node.type === 'note' && <StickyNote className="w-4 h-4 mr-2 text-primary" />}
                      <div className="flex-1 truncate">
                        <div className="font-medium truncate">{node.title}</div>
                        <div className="text-xs text-gray-500 uppercase">{node.type.replace(/-/g, ' ')}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2">
                  <Button 
                    className="w-full border-2 border-black bg-primary hover:bg-primary/80 text-white shadow-neo-xs"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Create New Connection
                  </Button>
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </div>
      
      <CardFooter className="p-4 border-t-4 border-black flex justify-end space-x-3 bg-gradient-to-r from-primary/5 to-secondary/5">
        {isEditing ? (
          <>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="border-2 border-black hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="border-2 border-black bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              Save Changes
            </Button>
          </>
        ) : (
          <Button 
            variant="default" 
            onClick={() => setIsEditing(true)}
            className="border-2 border-black bg-primary text-white hover:bg-primary-hover transition-colors"
          >
            Edit Node
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default NodeDetailsPanel;