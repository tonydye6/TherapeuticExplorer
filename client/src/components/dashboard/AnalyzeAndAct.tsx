import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Check, RefreshCw, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

// This interface matches the schema in shared/schema.ts
interface ActionStep {
  id: number;
  userId: string;
  title: string;
  description: string;
  category: 'exercise' | 'nutrition' | 'mental' | 'treatment' | 'social' | 'research' | null;
  source: string | null;
  isCompleted: boolean;
  completedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export function AnalyzeAndAct() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch action steps from the API
  const { data: actionSteps, isLoading, error } = useQuery({
    queryKey: ['/api/action-steps'],
    refetchOnWindowFocus: false
  });

  // Mutation to toggle the completed status of an action step
  const toggleCompleteMutation = useMutation({
    mutationFn: async (actionStepId: number) => {
      // Fix the API request by using the proper method signature
      const response = await fetch(`/api/action-steps/${actionStepId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to toggle action step');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/action-steps'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update action step: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Mutation to generate new action steps
  const generateActionStepsMutation = useMutation({
    mutationFn: async () => {
      // Fix the API request by using the proper method signature
      const response = await fetch('/api/action-steps/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate action steps');
      }
      
      const responseData = await response.json();
      console.log('Generated action steps from API:', responseData);
      return responseData;
    },
    onSuccess: (data) => {
      console.log('Successfully generated action steps:', data);
      // Fetch the action steps immediately after generation
      fetch('/api/action-steps')
        .then(res => res.json())
        .then(fetchedSteps => {
          console.log('Current action steps after generation:', fetchedSteps);
          // Manually update the cache with the fetched data
          queryClient.setQueryData(['/api/action-steps'], fetchedSteps);
        })
        .catch(err => console.error('Failed to fetch updated action steps:', err));
      
      setRefreshing(false);
      toast({
        title: 'Action Steps Updated',
        description: 'New action steps have been generated based on your latest data.',
      });
    },
    onError: (error: any) => {
      console.error('Error generating action steps:', error);
      setRefreshing(false);
      toast({
        title: 'Error',
        description: `Failed to generate action steps: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Function to trigger confetti animation
  const triggerConfetti = () => {
    const end = Date.now() + 600;
    
    // Create a canvas element for the confetti
    const myCanvas = document.createElement('canvas');
    myCanvas.style.position = 'fixed';
    myCanvas.style.top = '0';
    myCanvas.style.left = '0';
    myCanvas.style.width = '100%';
    myCanvas.style.height = '100%';
    myCanvas.style.pointerEvents = 'none';
    myCanvas.style.zIndex = '1000';
    document.body.appendChild(myCanvas);
    
    const myConfetti = confetti.create(myCanvas, {
      resize: true,
      useWorker: true
    });
    
    const colors = ['#0D9488', '#FF7F50', '#FFC107']; // Sophera colors
    
    // Run the animation
    const frame = () => {
      myConfetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0.2, y: 0.6 },
        colors: colors,
      });
      myConfetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 0.8, y: 0.6 },
        colors: colors,
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        // Remove the canvas after animation completes
        setTimeout(() => {
          document.body.removeChild(myCanvas);
        }, 1000);
      }
    };
    
    frame();
  };

  // Handle completion of an action step
  const handleCompleteAction = (actionStep: ActionStep) => {
    if (!actionStep.isCompleted) {
      triggerConfetti();
    }
    toggleCompleteMutation.mutate(actionStep.id);
  };

  // Handle refreshing/generating new action steps
  const handleRefresh = () => {
    setRefreshing(true);
    generateActionStepsMutation.mutate();
  };

  // Get development data if no action steps are available
  useEffect(() => {
    if (!isLoading && (!actionSteps || !Array.isArray(actionSteps) || actionSteps.length === 0)) {
      handleRefresh();
    }
  }, [isLoading, actionSteps]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-sophera-brand-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-sophera-text-body mb-4">
          Could not load your action steps. Please try again later.
        </p>
        <button 
          onClick={handleRefresh}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-sophera-brand-primary text-white rounded-md hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        {Array.isArray(actionSteps) && actionSteps.length > 0 ? (
          <ul className="space-y-4">
            {actionSteps.map((step: ActionStep) => (
              <li key={step.id} className="flex items-start gap-3 group">
                <button
                  onClick={() => handleCompleteAction(step)}
                  className={`flex-shrink-0 h-6 w-6 mt-0.5 border-2 border-black rounded-md flex items-center justify-center transition-all ${
                    step.isCompleted 
                      ? 'bg-sophera-brand-primary text-white' 
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {step.isCompleted && <Check className="h-4 w-4" />}
                </button>
                <div className={`flex-1 ${step.isCompleted ? 'opacity-50' : ''}`}>
                  <h4 className={`font-semibold text-sophera-text-heading text-base ${step.isCompleted ? 'line-through decoration-2' : ''}`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-sophera-text-body">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6">
            <BrainCircuit className="h-12 w-12 mx-auto mb-4 text-sophera-brand-primary" />
            <p className="text-sophera-text-body">
              No action steps available. Click refresh to generate personalized recommendations.
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-sophera-accent-tertiary text-black rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Analyzing...' : 'Refresh Recommendations'}
        </button>
      </div>
    </div>
  );
}