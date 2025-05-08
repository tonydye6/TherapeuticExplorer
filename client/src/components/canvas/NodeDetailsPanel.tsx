import React, { useState, useEffect } from 'react';
import { X, Edit, Trash, Calendar, Tag, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface NodeDetailsProps {
  nodeId: string;
  tabId: string;
  onClose: () => void;
}

// This is a placeholder component that will be enhanced to handle actual node data
const NodeDetailsPanel: React.FC<NodeDetailsProps> = ({ 
  nodeId, 
  tabId, 
  onClose 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nodeDetails, setNodeDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simulate loading node data
  useEffect(() => {
    // This would be replaced with an actual API call or state lookup
    const loadNodeDetails = async () => {
      setLoading(true);
      try {
        // Simulated data - in reality, this would come from your state or API
        const mockNodeData = {
          id: nodeId,
          type: 'treatment',
          title: 'Chemotherapy Session',
          description: 'Weekly chemotherapy session with Cisplatin and Fluorouracil (5-FU).',
          properties: {
            startDate: '2023-09-15',
            endDate: '2023-10-15',
            dosage: '100mg',
            frequency: 'Weekly',
            sideEffects: ['Nausea', 'Fatigue', 'Hair loss']
          },
          tags: ['High Priority', 'Active Treatment'],
          connections: [
            { nodeId: 'node123', title: 'Side Effect Log', type: 'journal' },
            { nodeId: 'node456', title: 'Diet Recommendations', type: 'document' }
          ]
        };
        
        // Simulating API delay
        setTimeout(() => {
          setNodeDetails(mockNodeData);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error loading node details:', error);
        setLoading(false);
      }
    };
    
    loadNodeDetails();
  }, [nodeId]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // Save changes to node
    console.log('Saving node changes:', nodeDetails);
    setIsEditing(false);
    // In a real implementation, this would update state or call an API
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this node?')) {
      console.log('Deleting node:', nodeId);
      onClose();
      // In a real implementation, this would delete the node and update state
    }
  };

  // Render the edit form for the node
  const renderEditForm = () => {
    if (!nodeDetails) return null;
    
    return (
      <div className="space-y-4 p-4">
        <Input
          value={nodeDetails.title}
          onChange={(e) => setNodeDetails({...nodeDetails, title: e.target.value})}
          placeholder="Node title"
          className="neo-brutalism-input"
        />
        
        <Textarea
          value={nodeDetails.description}
          onChange={(e) => setNodeDetails({...nodeDetails, description: e.target.value})}
          placeholder="Description"
          className="neo-brutalism-input h-24"
        />
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Start Date</label>
            <Input
              type="date"
              value={nodeDetails.properties.startDate}
              onChange={(e) => setNodeDetails({
                ...nodeDetails, 
                properties: {...nodeDetails.properties, startDate: e.target.value}
              })}
              className="neo-brutalism-input"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">End Date</label>
            <Input
              type="date"
              value={nodeDetails.properties.endDate}
              onChange={(e) => setNodeDetails({
                ...nodeDetails, 
                properties: {...nodeDetails.properties, endDate: e.target.value}
              })}
              className="neo-brutalism-input"
            />
          </div>
        </div>
        
        {/* Additional form fields would be rendered based on node type */}
        
        <div className="pt-4 flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(false)}
            className="neo-brutalism-btn"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="neo-brutalism-btn"
          >
            Save Changes
          </Button>
        </div>
      </div>
    );
  };
  
  // Render the view mode for the node details
  const renderViewMode = () => {
    if (!nodeDetails) return null;
    
    return (
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{nodeDetails.title}</h3>
            <p className="text-sm text-muted-foreground">{nodeDetails.type}</p>
            
            <div className="mt-2 flex flex-wrap gap-1">
              {nodeDetails.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="neo-brutalism-badge">
                  <Tag size={12} className="mr-1" /> {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <p>{nodeDetails.description}</p>
          </div>
          
          <Card className="neo-brutalism-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                <span className="text-sm font-medium">Timeline</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium">Start</p>
                  <p>{new Date(nodeDetails.properties.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium">End</p>
                  <p>{nodeDetails.properties.endDate ? 
                    new Date(nodeDetails.properties.endDate).toLocaleDateString() : 
                    'Ongoing'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional content based on node type */}
          {nodeDetails.type === 'treatment' && (
            <Card className="neo-brutalism-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Treatment Details</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="font-medium">Dosage</p>
                    <p>{nodeDetails.properties.dosage}</p>
                  </div>
                  <div>
                    <p className="font-medium">Frequency</p>
                    <p>{nodeDetails.properties.frequency}</p>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium">Side Effects</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {nodeDetails.properties.sideEffects.map((effect: string, index: number) => (
                      <Badge key={index} variant="outline" className="neo-brutalism-badge-subtle">
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="connections" className="space-y-4">
          <h3 className="text-sm font-medium mb-2">Connected Nodes</h3>
          
          {nodeDetails.connections.length === 0 ? (
            <p className="text-muted-foreground text-sm">No connections</p>
          ) : (
            <div className="space-y-2">
              {nodeDetails.connections.map((connection: any, index: number) => (
                <Card key={index} className="neo-brutalism-card">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{connection.title}</p>
                      <p className="text-xs text-muted-foreground">{connection.type}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <LinkIcon size={16} />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <Button variant="outline" className="w-full neo-brutalism-btn mt-4">
            <LinkIcon size={16} className="mr-2" /> Add Connection
          </Button>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <h3 className="text-sm font-medium mb-2">Activity History</h3>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-cyan-500 mr-2"></div>
              <div>
                <p className="text-sm">Node created</p>
                <p className="text-xs text-muted-foreground">3 days ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-cyan-500 mr-2"></div>
              <div>
                <p className="text-sm">Connected to "Side Effect Log"</p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-cyan-500 mr-2"></div>
              <div>
                <p className="text-sm">Description updated</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l-2 border-black shadow-md z-10">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Node Details</h2>
        
        <div className="flex items-center space-x-1">
          {!isEditing && (
            <>
              <Button variant="ghost" size="icon" onClick={handleEditToggle}>
                <Edit size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash size={16} />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
      </div>
      
      <div className="overflow-y-auto h-[calc(100vh-60px)]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : isEditing ? (
          renderEditForm()
        ) : (
          renderViewMode()
        )}
      </div>
    </div>
  );
};

export default NodeDetailsPanel;