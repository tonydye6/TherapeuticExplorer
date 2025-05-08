# AI Implementation Strategy for Sophera Canvas

## Executive Summary

This document outlines a comprehensive strategy for implementing AI capabilities in the new canvas-based version of Sophera. Building upon the existing multi-model AI architecture, this implementation will extend Sophera's AI capabilities to support the canvas paradigm while enhancing the human-centered approach that differentiates Sophera from typical medical applications.

## Current AI Implementation Analysis

Sophera currently employs a sophisticated multi-model AI system with three primary components:

1. **AI Router (aiRouter.ts)**: Orchestrates query routing to appropriate models based on query type
2. **Model-Specific Services**:
   - OpenAI Service (GPT-4o): Structured data analysis and clinical information
   - Anthropic Service (Claude-3-7-sonnet): Medical literature analysis and emotional support
   - Gemini Service (Gemini-1.5-pro): Multimodal inputs and research synthesis

3. **Specialized AI Features**:
   - Medical document analysis with term extraction and highlighting
   - Treatment analysis for side effects and interactions
   - Research assistance with semantic search capabilities
   - Creative exploration for unconventional approaches

## Canvas-Specific AI Requirements

The canvas implementation introduces new AI requirements that extend beyond the current functionality:

1. **Context-Aware Node Analysis**: AI must understand the relationships between nodes on the canvas
2. **Visual Pattern Recognition**: Identify meaningful patterns in node arrangements
3. **Relationship Suggestions**: Recommend logical connections between nodes
4. **Multi-Node Context Building**: Build context from multiple selected nodes for targeted queries
5. **Canvas-Specific Response Generation**: Format AI responses as visual elements on the canvas

## Implementation Strategy

### 1. Enhanced AI Router

The existing AI router should be extended to include canvas-specific routing logic:

```typescript
// Enhanced AI Router with Canvas Support
class EnhancedAIRouter extends AIRouter {
  async processCanvasQuery(options: {
    query: string;
    selectedNodes: CanvasNode[];
    canvasType: 'freeform' | 'calendar' | 'spreadsheet' | 'journey';
    userId: string;
    responseFormat?: 'text' | 'nodes' | 'connections' | 'visual';
  }): Promise<CanvasQueryResponse> {
    const { query, selectedNodes, canvasType, userId, responseFormat = 'text' } = options;
    
    // 1. Determine the optimal model based on query and canvas type
    const modelType = this.determineModelForCanvasQuery(query, canvasType, selectedNodes);
    
    // 2. Build context from selected nodes
    const context = await this.buildNodeContext(selectedNodes, userId);
    
    // 3. Route to appropriate service based on model determination
    switch (modelType) {
      case 'claude':
        return this.anthropicService.processCanvasQuery(query, context, canvasType, responseFormat);
      case 'gpt':
        return this.openaiService.processCanvasQuery(query, context, canvasType, responseFormat);
      case 'gemini':
        return this.geminiService.processCanvasQuery(query, context, canvasType, responseFormat);
      default:
        // Fall back to Claude for most canvas interactions
        return this.anthropicService.processCanvasQuery(query, context, canvasType, responseFormat);
    }
  }

  private determineModelForCanvasQuery(
    query: string, 
    canvasType: string,
    selectedNodes: CanvasNode[]
  ): 'claude' | 'gpt' | 'gemini' {
    // Calendar-specific time analysis is best with GPT
    if (canvasType === 'calendar' && (
      query.includes('schedule') || 
      query.includes('when') || 
      query.includes('timeline')
    )) {
      return 'gpt';
    }
    
    // Spreadsheet data analysis is best with GPT
    if (canvasType === 'spreadsheet' && (
      query.includes('analyze') ||
      query.includes('pattern') ||
      query.includes('trend')
    )) {
      return 'gpt';
    }
    
    // Journey emotional analysis is best with Claude
    if (canvasType === 'journey') {
      return 'claude';
    }
    
    // If nodes contain images or multimodal content, use Gemini
    if (selectedNodes.some(node => node.type === 'image' || node.type === 'document')) {
      return 'gemini';
    }
    
    // Default to Claude for most canvas interactions due to its contextual understanding
    return 'claude';
  }

  private async buildNodeContext(nodes: CanvasNode[], userId: string): Promise<string> {
    // Build a rich context description from the selected nodes
    // This aggregates data from all selected nodes into a structured context
    let context = `The user has selected ${nodes.length} nodes on their canvas:\n\n`;
    
    for (const node of nodes) {
      // Fetch complete node data if it references external data
      const nodeData = node.dataRef 
        ? await this.fetchNodeReferenceData(node.dataRef, userId)
        : node.properties;
      
      context += `- ${node.type.toUpperCase()} NODE: "${node.title}"\n`;
      
      // Add type-specific details
      switch (node.type) {
        case 'treatment':
          context += `  Treatment type: ${nodeData.type}\n`;
          context += `  Start date: ${nodeData.startDate}\n`;
          context += `  Status: ${nodeData.active ? 'Active' : 'Inactive'}\n`;
          if (nodeData.notes) context += `  Notes: ${nodeData.notes}\n`;
          break;
        case 'journal':
          context += `  Date: ${nodeData.date}\n`;
          context += `  Content: ${nodeData.content}\n`;
          if (nodeData.mood) context += `  Mood: ${nodeData.mood}\n`;
          break;
        // Add cases for other node types
      }
      
      context += '\n';
    }
    
    return context;
  }
}
```

### 2. Canvas-Specific Service Extensions

Each AI service (OpenAI, Anthropic, Gemini) should be extended with canvas-specific methods:

```typescript
// Example extension for Anthropic Service
class EnhancedAnthropicService extends AnthropicService {
  async processCanvasQuery(
    query: string,
    context: string,
    canvasType: string,
    responseFormat: 'text' | 'nodes' | 'connections' | 'visual'
  ): Promise<CanvasQueryResponse> {
    // Construct a canvas-aware prompt
    const canvasPrompt = this.buildCanvasPrompt(query, context, canvasType, responseFormat);
    
    // Get raw response from Claude
    const response = await this.client.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: canvasPrompt.systemPrompt,
      messages: [
        { role: 'user', content: canvasPrompt.userPrompt }
      ],
      max_tokens: 4000
    });
    
    // Parse response based on desired format
    return this.parseCanvasResponse(response, responseFormat);
  }
  
  private buildCanvasPrompt(
    query: string,
    context: string,
    canvasType: string,
    responseFormat: string
  ): { systemPrompt: string; userPrompt: string } {
    // System prompt for canvas-based reasoning
    const systemPrompt = `You are an AI assistant integrated into Sophera, a cancer healing companion application. 
    You're currently helping the user with a query about information on their ${canvasType} canvas. 
    The user has selected specific nodes on their canvas that provide context for their question.
    
    When responding, remember:
    1. Be compassionate and human-centered in your approach
    2. Focus on the relationships between selected items when relevant
    3. Maintain a hopeful but realistic tone
    4. Format your response appropriately for the requested output type (${responseFormat})
    5. Consider the specific nature of a ${canvasType} canvas when responding`;
    
    // User prompt combines context and query
    const userPrompt = `CANVAS CONTEXT:\n${context}\n\nMY QUESTION: ${query}`;
    
    return { systemPrompt, userPrompt };
  }
  
  private parseCanvasResponse(
    response: any,
    responseFormat: 'text' | 'nodes' | 'connections' | 'visual'
  ): CanvasQueryResponse {
    const textContent = response.content[0].text;
    
    // For text responses, simply return the content
    if (responseFormat === 'text') {
      return {
        type: 'text',
        content: textContent
      };
    }
    
    // For node responses, try to parse JSON nodes
    if (responseFormat === 'nodes') {
      try {
        // Look for JSON node definitions
        const nodeMatch = textContent.match(/```json\n([\s\S]*?)\n```/);
        if (nodeMatch && nodeMatch[1]) {
          const nodes = JSON.parse(nodeMatch[1]);
          return {
            type: 'nodes',
            content: textContent,
            nodes
          };
        }
      } catch (e) {
        console.error('Failed to parse node JSON', e);
      }
    }
    
    // For connections, similar approach
    if (responseFormat === 'connections') {
      try {
        const connectionMatch = textContent.match(/```json\n([\s\S]*?)\n```/);
        if (connectionMatch && connectionMatch[1]) {
          const connections = JSON.parse(connectionMatch[1]);
          return {
            type: 'connections',
            content: textContent,
            connections
          };
        }
      } catch (e) {
        console.error('Failed to parse connections JSON', e);
      }
    }
    
    // Default to text if parsing fails
    return {
      type: 'text',
      content: textContent
    };
  }
}
```

### 3. AI Model Specialization for Canvas Types

Different canvas types benefit from different AI model strengths:

| Canvas Type | Optimal Model | Reasoning |
|-------------|---------------|-----------|
| Freeform | Claude | Best for open-ended exploration, relationship identification, and contextual understanding |
| Calendar | GPT-4o | Superior at temporal reasoning, scheduling optimization, and structured data |
| Spreadsheet | GPT-4o | Excels at data analysis, pattern recognition, and tabular formatting |
| Journey | Claude | Best for emotional narrative construction, nuanced reflection, and supportive framing |

### 4. Canvas-Specific AI Features

#### Node Relationship Analysis

```typescript
// In canvas-ai-service.ts
async analyzeNodeRelationships(nodes: CanvasNode[]): Promise<NodeRelationship[]> {
  // Extract relevant information from nodes
  const nodeInfos = nodes.map(node => ({
    id: node.id,
    type: node.type,
    title: node.title,
    properties: node.properties
  }));
  
  // Determine appropriate model based on node types
  const model = this.determineOptimalModelForRelationshipAnalysis(nodes);
  
  // Format prompt for relationship analysis
  const prompt = `Analyze the relationships between the following items in a medical context:
  ${JSON.stringify(nodeInfos, null, 2)}
  
  Identify meaningful relationships between these items, such as:
  - Potential cause and effect relationships
  - Temporal sequences
  - Conflicting or reinforcing effects
  - Missing information that would connect these items
  
  Format your response as a JSON array of relationship objects with the following structure:
  {
    "sourceId": "node id",
    "targetId": "node id",
    "relationshipType": "one of: causes, alleviates, conflicts, precedes, supports, correlates",
    "confidence": 0-1 value representing confidence,
    "explanation": "brief explanation of the relationship"
  }`;
  
  // Get response from model service
  const response = await this.getModelResponse(model, prompt);
  
  // Parse and validate relationships
  try {
    const relationships = JSON.parse(response);
    return this.validateRelationships(relationships, nodes);
  } catch (error) {
    console.error('Failed to parse relationships', error);
    return [];
  }
}
```

#### Visual Pattern Recognition

```typescript
// In canvas-ai-service.ts
async identifyVisualPatterns(tabId: string, nodes: CanvasNode[]): Promise<PatternInsight[]> {
  // Get spatial data for the nodes
  const spatialData = nodes.map(node => ({
    id: node.id,
    type: node.type,
    title: node.title,
    x: node.position[0],
    y: node.position[1],
    width: node.size[0],
    height: node.size[1]
  }));
  
  // Group nodes by type to detect patterns
  const typeGroups = this.groupByProperty(nodes, 'type');
  
  // Analyze temporal patterns if dates are available
  const temporalPatterns = await this.analyzeTemporalPatterns(nodes);
  
  // Analyze spatial clusters
  const spatialClusters = this.identifySpatialClusters(spatialData);
  
  // Use GPT-4 for pattern analysis as it handles structured data well
  const prompt = `Analyze the following canvas node data to identify meaningful patterns:
  
  Node spatial data: ${JSON.stringify(spatialData)}
  Node type groupings: ${JSON.stringify(typeGroups)}
  Temporal patterns detected: ${JSON.stringify(temporalPatterns)}
  Spatial clusters detected: ${JSON.stringify(spatialClusters)}
  
  Identify the top 3-5 most meaningful patterns a cancer patient should be aware of.
  For each pattern, provide:
  1. A concise name for the pattern
  2. A brief description of what it represents
  3. The medical or health significance
  4. Any suggested actions
  
  Format your response as a JSON array of pattern insight objects.`;
  
  const response = await this.openaiService.getStructuredCompletion(prompt, {
    responseFormat: 'json',
    temperature: 0.3
  });
  
  return JSON.parse(response);
}
```

#### Node Generation from AI Responses

```typescript
// In canvas-ai-service.ts
async generateNodesFromQuery(query: string, selectedNodes: CanvasNode[], canvasType: string): Promise<CanvasNode[]> {
  // Get context from selected nodes
  const context = await this.buildNodeContext(selectedNodes);
  
  // Create prompt for node generation
  const prompt = `Based on the following canvas context and user query, generate 1-3 new nodes that would be helpful additions to their canvas.
  
  Canvas type: ${canvasType}
  Selected nodes: ${JSON.stringify(context, null, 2)}
  User query: "${query}"
  
  For each node:
  1. Determine an appropriate node type (treatment, symptom, research, etc.)
  2. Create a title that is concise but informative
  3. Include relevant properties based on the node type
  4. Suggest a position relative to existing nodes
  5. Suggest connections to existing nodes where relevant
  
  Format your response as a JSON array of node objects that could be directly added to the canvas.`;
  
  // Use Claude for creative generation with medical accuracy
  const response = await this.anthropicService.getStructuredCompletion(prompt, {
    responseFormat: 'json',
    temperature: 0.7
  });
  
  // Parse and validate generated nodes
  try {
    const generatedNodes = JSON.parse(response);
    return this.validateAndFormatGeneratedNodes(generatedNodes, selectedNodes);
  } catch (error) {
    console.error('Failed to parse generated nodes', error);
    return [];
  }
}
```

### 5. Canvas-Specific User Interface for AI Interaction

```tsx
// AIQueryPanel.tsx
import React, { useState } from 'react';
import { useCanvasState } from '@/hooks/useCanvasState';
import { useAIService } from '@/hooks/useAIService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, Search, Lightbulb, 
  Network, Plus, Wand2
} from 'lucide-react';

interface AIQueryPanelProps {
  selectedNodes: CanvasNode[];
  canvasType: string;
  onResponseReceived: (response: CanvasQueryResponse) => void;
}

export function AIQueryPanel({ 
  selectedNodes, 
  canvasType,
  onResponseReceived 
}: AIQueryPanelProps) {
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState<'ask' | 'analyze' | 'suggest' | 'create'>('ask');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const aiService = useAIService();
  
  // Query suggestions based on selected nodes and canvas type
  const querySuggestions = getQuerySuggestions(selectedNodes, canvasType, queryType);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Determine response format based on query type
      const responseFormat = 
        queryType === 'create' ? 'nodes' :
        queryType === 'suggest' ? 'connections' :
        'text';
      
      // Process query with selected nodes as context
      const response = await aiService.processCanvasQuery({
        query,
        selectedNodes,
        canvasType,
        responseFormat
      });
      
      onResponseReceived(response);
    } catch (err) {
      setError('Failed to process your query. Please try again.');
      console.error('AI query error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-sophera-bg-card shadow-md">
      <h3 className="text-lg font-semibold text-sophera-text-heading mb-3 flex items-center">
        <Wand2 className="w-5 h-5 mr-2 text-sophera-brand-primary" />
        AI Assistant
      </h3>
      
      {selectedNodes.length === 0 ? (
        <div className="text-sophera-text-subtle text-sm p-3 bg-sophera-gradient-start rounded-lg mb-3">
          <p>Select nodes on the canvas to provide context for your query.</p>
        </div>
      ) : (
        <div className="mb-3">
          <p className="text-sm text-sophera-text-body mb-2">
            Context: <Badge>{selectedNodes.length} nodes selected</Badge>
          </p>
        </div>
      )}
      
      <Tabs value={queryType} onValueChange={(value) => setQueryType(value as any)} className="mb-3">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="ask" className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Ask</span>
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center gap-1">
            <Search className="h-3.5 w-3.5" />
            <span>Analyze</span>
          </TabsTrigger>
          <TabsTrigger value="suggest" className="flex items-center gap-1">
            <Network className="h-3.5 w-3.5" />
            <span>Connect</span>
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span>Create</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ask">
          <p className="text-xs text-sophera-text-subtle mb-2">
            Ask questions about the selected nodes to get information and insights.
          </p>
        </TabsContent>
        <TabsContent value="analyze">
          <p className="text-xs text-sophera-text-subtle mb-2">
            Analyze relationships, patterns, and potential insights from selected nodes.
          </p>
        </TabsContent>
        <TabsContent value="suggest">
          <p className="text-xs text-sophera-text-subtle mb-2">
            Get suggestions for connections between nodes based on medical knowledge.
          </p>
        </TabsContent>
        <TabsContent value="create">
          <p className="text-xs text-sophera-text-subtle mb-2">
            Generate new nodes based on selected context and your request.
          </p>
        </TabsContent>
      </Tabs>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getPlaceholder(queryType)}
            className="pr-24" // Make space for the button
            disabled={selectedNodes.length === 0 || isLoading}
          />
          <Button 
            type="submit"
            size="sm"
            className="absolute right-1 top-1 bottom-1"
            disabled={selectedNodes.length === 0 || !query.trim() || isLoading}
          >
            {isLoading ? 'Processing...' : 'Submit'}
          </Button>
        </div>
        
        {error && (
          <div className="text-sm text-red-500 p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        {/* Query suggestions */}
        {querySuggestions.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-sophera-text-subtle mb-1">Try asking:</p>
            <div className="flex flex-wrap gap-1">
              {querySuggestions.map((suggestion, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setQuery(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

// Helper functions
function getPlaceholder(queryType: string): string {
  switch (queryType) {
    case 'ask':
      return 'Ask a question about the selected nodes...';
    case 'analyze':
      return 'Ask for an analysis of the selected nodes...';
    case 'suggest':
      return 'Request connection suggestions...';
    case 'create':
      return 'Describe what nodes to create...';
    default:
      return 'Enter your query...';
  }
}

function getQuerySuggestions(
  selectedNodes: CanvasNode[], 
  canvasType: string,
  queryType: string
): string[] {
  // If no nodes selected, return empty array
  if (selectedNodes.length === 0) return [];
  
  // Get the types of selected nodes
  const nodeTypes = selectedNodes.map(node => node.type);
  
  // Suggestions based on query type
  switch (queryType) {
    case 'ask':
      if (nodeTypes.includes('treatment') && nodeTypes.includes('symptom')) {
        return [
          "How might these treatments affect these symptoms?",
          "What's the relationship between these treatments and symptoms?"
        ];
      }
      if (nodeTypes.includes('treatment')) {
        return [
          "Explain how these treatments work",
          "What are common side effects of these treatments?"
        ];
      }
      return [
        "Summarize the key information in these nodes",
        "What should I know about these items?"
      ];
      
    case 'analyze':
      if (canvasType === 'calendar') {
        return [
          "Analyze this treatment schedule for potential conflicts",
          "Are there patterns in symptom timing I should know about?"
        ];
      }
      if (canvasType === 'spreadsheet') {
        return [
          "Find patterns in this health data",
          "What trends do you notice in these measurements?"
        ];
      }
      return [
        "Find relationships between these items",
        "What insights can you provide about these elements?"
      ];
      
    case 'suggest':
      return [
        "Suggest logical connections between these nodes",
        "How might these elements be related medically?",
        "What's missing from this picture?"
      ];
      
    case 'create':
      if (nodeTypes.includes('treatment')) {
        return [
          "Create nodes for possible side effects",
          "Add nodes for complementary approaches"
        ];
      }
      if (nodeTypes.includes('symptom')) {
        return [
          "Create nodes for possible causes",
          "Add nodes for management strategies"
        ];
      }
      return [
        "Create nodes to complete this picture",
        "What nodes would enhance this information?"
      ];
      
    default:
      return [];
  }
}
```

### 6. Tab-Specific AI Implementations

#### Freeform Canvas AI Helpers

```typescript
// freeform-canvas-ai.ts
export async function suggestFreeformLayout(nodes: CanvasNode[]): Promise<LayoutSuggestion> {
  // Create a prompt for layout suggestions
  const prompt = `The user has the following nodes on their freeform cancer care canvas:
  ${JSON.stringify(nodes.map(n => ({ id: n.id, type: n.type, title: n.title })))}
  
  Suggest an organized layout for these nodes that:
  1. Groups related nodes together
  2. Places nodes in a logical flow (e.g., chronological for treatments)
  3. Highlights important relationships
  4. Creates a visually balanced arrangement
  
  Provide absolute (x,y) coordinates for each node on a 1000x1000 canvas.
  Your response should be a JSON object with node IDs as keys and {x, y} coordinates as values.`;
  
  // Use Gemini for spatial reasoning
  const response = await aiService.geminiService.getStructuredCompletion(prompt, {
    responseFormat: 'json',
    temperature: 0.2
  });
  
  return JSON.parse(response);
}
```

#### Calendar Canvas AI Helpers

```typescript
// calendar-canvas-ai.ts
export async function optimizeSchedule(nodes: CanvasNode[]): Promise<ScheduleSuggestion> {
  // Extract treatment nodes with timing information
  const treatmentNodes = nodes.filter(n => 
    n.type === 'treatment' || 
    n.type === 'appointment' || 
    n.type === 'medication'
  );
  
  // Extract constraints like working hours, rest days, etc.
  const constraints = extractScheduleConstraints(nodes);
  
  // Create a prompt for schedule optimization
  const prompt = `The user has the following treatment-related items that need scheduling:
  ${JSON.stringify(treatmentNodes.map(n => ({ 
    id: n.id, 
    type: n.type, 
    title: n.title,
    properties: n.properties
  })))}
  
  Consider these scheduling constraints:
  ${JSON.stringify(constraints)}
  
  Optimize the schedule to:
  1. Minimize conflicts between treatments
  2. Allow adequate recovery time between intensive treatments
  3. Consider time-of-day preferences
  4. Group related appointments when possible
  5. Create a sustainable rhythm for the patient
  
  Provide a JSON object with node IDs as keys and suggested datetime values as values.
  Also include a brief explanation for each change you suggest.`;
  
  // Use GPT-4o for temporal reasoning and scheduling optimization
  const response = await aiService.openaiService.getStructuredCompletion(prompt, {
    responseFormat: 'json',
    temperature: 0.3,
    maxTokens: 2000
  });
  
  return JSON.parse(response);
}
```

#### Spreadsheet Canvas AI Helpers

```typescript
// spreadsheet-canvas-ai.ts
export async function analyzeDataPatterns(nodes: CanvasNode[]): Promise<DataAnalysisResult> {
  // Extract data points from nodes
  const dataPoints = extractDataFromNodes(nodes);
  
  // Group by categories (time periods, types, etc.)
  const groupedData = groupDataByProperties(dataPoints);
  
  // Create a prompt for data analysis
  const prompt = `Analyze the following health data from a cancer patient's tracking spreadsheet:
  ${JSON.stringify(dataPoints)}
  
  The data is organized into these groups:
  ${JSON.stringify(groupedData)}
  
  Please provide:
  1. Key statistical observations (min, max, mean, median, notable outliers)
  2. Significant trends over time
  3. Correlations between different measures
  4. Potential actionable insights
  5. Suggested visualizations that would help the patient understand their data
  
  Format your response as a structured JSON object with sections for observations, trends, correlations, insights, and visualizations.`;
  
  // Use GPT-4o for statistical analysis and pattern detection
  const response = await aiService.openaiService.getStructuredCompletion(prompt, {
    responseFormat: 'json',
    temperature: 0.2,
    maxTokens: 2500
  });
  
  return JSON.parse(response);
}
```

#### Journey Canvas AI Helpers

```typescript
// journey-canvas-ai.ts
export async function generateReflectionPrompts(nodes: CanvasNode[]): Promise<ReflectionPrompt[]> {
  // Extract emotional journey data
  const journeyEvents = nodes.filter(n => 
    n.type === 'milestone' || 
    n.type === 'challenge' || 
    n.type === 'victory' ||
    n.type === 'emotion'
  );
  
  // Sort by chronological order if timestamps available
  const sortedEvents = sortNodesByTimestamp(journeyEvents);
  
  // Create a prompt for reflection suggestions
  const prompt = `The user has documented these events in their cancer journey:
  ${JSON.stringify(sortedEvents.map(n => ({ 
    id: n.id, 
    type: n.type, 
    title: n.title,
    properties: n.properties,
    timestamp: n.properties.date || n.properties.timestamp
  })))}
  
  Based on these events, generate 5 thoughtful reflection prompts that:
  1. Encourage emotional processing appropriate to their journey
  2. Help identify sources of strength and resilience
  3. Promote meaning-making and growth perspective
  4. Acknowledge challenges while maintaining hope
  5. Support connection with their support system
  
  For each prompt, provide:
  - The reflection question/prompt
  - A brief explanation of why this reflection might be valuable
  - 1-2 gentle follow-up questions
  
  Format your response as a JSON array of reflection prompt objects.`;
  
  // Use Claude for emotionally nuanced, human-centered reflection prompts
  const response = await aiService.anthropicService.getStructuredCompletion(prompt, {
    responseFormat: 'json',
    temperature: 0.7,
    maxTokens: 2000
  });
  
  return JSON.parse(response);
}
```

## Implementation Roadmap

The canvas-specific AI implementation should be rolled out in phases:

### Phase 1: Foundation

1. **AI Router Extension**
   - Extend the existing AI router with canvas-specific routing logic
   - Implement node context building functionality
   - Add model selection logic for canvas queries

2. **Basic Canvas AI Features**
   - Simple text queries about selected nodes
   - Node relationship identification
   - Basic layout suggestions

3. **AIQueryPanel Component**
   - User interface for canvas-specific AI interactions
   - Query type selection (ask, analyze, suggest, create)
   - Query suggestions based on node selection

### Phase 2: Advanced Features

1. **Tab-Specific AI Helpers**
   - Implement calendar optimization
   - Add spreadsheet data analysis
   - Create journey reflection tools
   - Develop freeform layout optimization

2. **Visual Response Generation**
   - Generate new nodes from AI responses
   - Create visual representations of relationships
   - Design pattern highlighting on canvas

3. **Enhanced Context Building**
   - Incorporate spatial relationships between nodes
   - Consider connection types and strengths
   - Include historical query context

### Phase 3: Emotional Intelligence & Refinement

1. **Canvas-Specific Emotional Support**
   - Journey tab emotional narration
   - Milestone recognition and celebration
   - Challenge-specific support responses

2. **Multimodal Integration**
   - Image node analysis
   - Document node summarization
   - Visual pattern recognition

3. **Performance Optimization**
   - Caching for common queries
   - Progressive response generation
   - Batch processing for large node sets

## Best Practices for Canvas AI Implementation

1. **Human-Centered Throughout**
   - Maintain empathetic, supportive tone in all AI responses
   - Focus on empowerment and agency, not just information delivery
   - Design AI interfaces that are approachable and non-intimidating

2. **Context-Aware Responses**
   - Ground all AI responses in the user's specific canvas data
   - Reference selected nodes by name in responses
   - Consider the user's journey stage and emotional state

3. **Maintain Medical Accuracy**
   - Ensure all health-related information is evidence-based
   - Use model routing to select the most accurate model for medical content
   - Include source citations or confidence levels for medical claims

4. **Privacy & Security**
   - Process all canvas data server-side to avoid exposing sensitive info
   - Anonymize user data when sending to AI services
   - Implement strict access controls for caregiver-shared canvases

5. **Responsible AI Guidelines**
   - Always include appropriate medical disclaimers in responses
   - Recommend professional medical advice for critical decisions
   - Avoid making definitive predictions about treatment outcomes
   - Design responses that complement rather than replace medical care

## Conclusion

The AI implementation for Sophera's canvas-based architecture builds upon its existing strengths while introducing powerful new capabilities that enhance the visual, spatial, and relational aspects of the canvas paradigm. By extending the current multi-model AI system with canvas-specific features, Sophera can offer users an unprecedented level of intelligent support for organizing, understanding, and acting upon their health information.

The canvas approach opens new possibilities for AI to provide visual, contextual, and relationship-based insights that weren't possible in the previous interface paradigm. When implemented with Sophera's human-centered philosophy at its core, this enhanced AI system will help users not only manage their complex health journeys but find meaning, connection, and hope throughout the process.