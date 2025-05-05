import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PlanItem } from "@shared/schema";

type PlanItemInput = Omit<PlanItem, 'id' | 'createdAt' | 'updatedAt'>;
type PlanItemUpdate = Partial<Omit<PlanItem, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Custom hook to fetch and manage plan items
 */
export function usePlanItems() {
  const { toast } = useToast();

  // Fetch all plan items
  const { data: planItems = [], isLoading, error, refetch } = useQuery<PlanItem[]>({
    queryKey: ["/api/plan-items"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/plan-items");
      return response.json();
    },
  });

  // Create a new plan item
  const createMutation = useMutation({
    mutationFn: async (planItem: PlanItemInput) => {
      const response = await apiRequest("POST", "/api/plan-items", planItem);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plan-items"] });
      toast({
        title: "Success",
        description: "Plan item created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create plan item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update an existing plan item
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & PlanItemUpdate) => {
      const response = await apiRequest("PUT", `/api/plan-items/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plan-items"] });
      toast({
        title: "Success",
        description: "Plan item updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update plan item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete a plan item
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/plan-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plan-items"] });
      toast({
        title: "Success",
        description: "Plan item deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete plan item: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Toggle completion status of a plan item
  const toggleCompletionMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number; isCompleted: boolean }) => {
      const response = await apiRequest(
        "POST", 
        `/api/plan-items/${id}/complete`, 
        { isCompleted }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plan-items"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update completion status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    planItems,
    isLoading,
    error,
    refetch,
    createPlanItem: createMutation.mutate,
    updatePlanItem: updateMutation.mutate,
    deletePlanItem: deleteMutation.mutate,
    toggleCompletion: toggleCompletionMutation.mutate,
    isPending: {
      create: createMutation.isPending,
      update: updateMutation.isPending,
      delete: deleteMutation.isPending,
      toggleCompletion: toggleCompletionMutation.isPending,
    },
  };
}
