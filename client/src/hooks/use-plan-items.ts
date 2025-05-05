import { useQuery, useMutation } from "@tanstack/react-query";
import { PlanItem, InsertPlanItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function usePlanItems() {
  const { toast } = useToast();

  // Fetch all plan items
  const {
    data: planItems = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/plan-items"],
  });

  // Create plan item
  const { mutate: createPlanItem, isPending: isCreating } = useMutation({
    mutationFn: async (data: Omit<InsertPlanItem, "userId">) => {
      const response = await apiRequest("POST", "/api/plan-items", data);
      return await response.json();
    },
    onSuccess: (newItem: PlanItem) => {
      queryClient.invalidateQueries({ queryKey: ["/api/plan-items"] });
      toast({
        title: "Plan item created",
        description: "Your plan item has been added.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create plan item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update plan item
  const { mutate: updatePlanItem, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PlanItem> }) => {
      const response = await apiRequest("PATCH", `/api/plan-items/${id}`, data);
      return await response.json();
    },
    onSuccess: (updatedItem: PlanItem) => {
      queryClient.invalidateQueries({ queryKey: ["/api/plan-items"] });
      toast({
        title: "Plan item updated",
        description: "Your plan item has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update plan item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete plan item
  const { mutate: deletePlanItem, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/plan-items/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete plan item");
      }
      return id;
    },
    onSuccess: (id: number) => {
      queryClient.invalidateQueries({ queryKey: ["/api/plan-items"] });
      toast({
        title: "Plan item deleted",
        description: "Your plan item has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete plan item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mark plan item as complete/incomplete
  const { mutate: togglePlanItemComplete, isPending: isToggling } = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number; isCompleted: boolean }) => {
      const response = await apiRequest("PATCH", `/api/plan-items/${id}/complete`, { isCompleted });
      return await response.json();
    },
    onSuccess: (updatedItem: PlanItem) => {
      queryClient.invalidateQueries({ queryKey: ["/api/plan-items"] });
      toast({
        title: updatedItem.isCompleted ? "Marked as complete" : "Marked as incomplete",
        description: "Your plan item has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update plan item status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    planItems,
    isLoading,
    isError,
    createPlanItem,
    updatePlanItem,
    deletePlanItem,
    togglePlanItemComplete,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
  };
}
