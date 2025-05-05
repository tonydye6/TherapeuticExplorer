import { useQuery, useMutation } from "@tanstack/react-query";
import { DietLog } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface DietLogInput {
  mealDate: Date;
  mealType: string;
  foodItems: string[];
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  notes: string;
  images?: string[];
}

export function useDietLogs() {
  const {
    data: dietLogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/diet-logs"],
  });

  const createDietLogMutation = useMutation({
    mutationFn: async (dietLog: DietLogInput) => {
      const res = await apiRequest("POST", "/api/diet-logs", dietLog);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diet-logs"] });
      toast({
        title: "Success",
        description: "Diet log created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create diet log: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateDietLogMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DietLogInput> }) => {
      const res = await apiRequest("PUT", `/api/diet-logs/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diet-logs"] });
      toast({
        title: "Success",
        description: "Diet log updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update diet log: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteDietLogMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/diet-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diet-logs"] });
      toast({
        title: "Success",
        description: "Diet log deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete diet log: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    dietLogs: dietLogs as DietLog[] | undefined,
    isLoading,
    error,
    createDietLog: createDietLogMutation.mutate,
    updateDietLog: updateDietLogMutation.mutate,
    deleteDietLog: deleteDietLogMutation.mutate,
    isCreating: createDietLogMutation.isPending,
    isUpdating: updateDietLogMutation.isPending,
    isDeleting: deleteDietLogMutation.isPending,
  };
}
