import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Treatment } from "@shared/schema";
import { useToast } from "./use-toast";
import { apiRequest } from "@/lib/queryClient";

export function useTreatments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all treatments
  const {
    data: treatments = [],
    isLoading,
    isError,
    error,
  } = useQuery<Treatment[]>({
    queryKey: ["/api/treatments"],
  });

  // Get active treatments
  const activeTreatments = treatments.filter((treatment) => treatment.active);

  // Get inactive treatments
  const inactiveTreatments = treatments.filter((treatment) => !treatment.active);

  // Add a new treatment
  const addTreatmentMutation = useMutation({
    mutationFn: async (treatment: Omit<Treatment, "id">) => {
      const res = await apiRequest("POST", "/api/treatments", treatment);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      toast({
        title: "Success",
        description: "Treatment added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add treatment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update an existing treatment
  const updateTreatmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Treatment> }) => {
      const res = await apiRequest("PATCH", `/api/treatments/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      toast({
        title: "Success",
        description: "Treatment updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update treatment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Toggle treatment active status
  const toggleActiveMutation = useMutation({
    mutationFn: async (id: number) => {
      const treatment = treatments.find((t) => t.id === id);
      if (!treatment) throw new Error("Treatment not found");
      
      const res = await apiRequest("PATCH", `/api/treatments/${id}`, {
        active: !treatment.active,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      toast({
        title: "Success",
        description: "Treatment status updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update treatment status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete a treatment
  const deleteTreatmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/treatments/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      toast({
        title: "Success",
        description: "Treatment deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete treatment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add side effect entry for a treatment
  const addSideEffectMutation = useMutation({
    mutationFn: async ({ 
      treatmentId, 
      sideEffect 
    }: { 
      treatmentId: number; 
      sideEffect: { severity: number; type: string; date: Date; notes?: string; }
    }) => {
      const treatment = treatments.find((t) => t.id === treatmentId);
      if (!treatment) throw new Error("Treatment not found");
      
      const currentSideEffects = treatment.sideEffects ? [...treatment.sideEffects] : [];
      const newSideEffects = [...currentSideEffects, {
        ...sideEffect,
        id: Date.now(), // Generate a temporary ID
        date: sideEffect.date.toISOString(),
      }];
      
      const res = await apiRequest("PATCH", `/api/treatments/${treatmentId}`, {
        sideEffects: newSideEffects,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      toast({
        title: "Success",
        description: "Side effect recorded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to record side effect: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add effectiveness assessment for a treatment
  const addEffectivenessMutation = useMutation({
    mutationFn: async ({ 
      treatmentId, 
      assessment 
    }: { 
      treatmentId: number; 
      assessment: { rating: number; date: Date; metrics?: Record<string, number>; notes?: string; }
    }) => {
      const treatment = treatments.find((t) => t.id === treatmentId);
      if (!treatment) throw new Error("Treatment not found");
      
      const currentEffectiveness = treatment.effectiveness ? [...treatment.effectiveness] : [];
      const newEffectiveness = [...currentEffectiveness, {
        ...assessment,
        id: Date.now(), // Generate a temporary ID
        date: assessment.date.toISOString(),
      }];
      
      const res = await apiRequest("PATCH", `/api/treatments/${treatmentId}`, {
        effectiveness: newEffectiveness,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatments"] });
      toast({
        title: "Success",
        description: "Effectiveness assessment recorded",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to record effectiveness: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    treatments,
    activeTreatments,
    inactiveTreatments,
    isLoading,
    isError,
    error,
    addTreatment: addTreatmentMutation.mutate,
    updateTreatment: updateTreatmentMutation.mutate,
    toggleActive: toggleActiveMutation.mutate,
    deleteTreatment: deleteTreatmentMutation.mutate,
    addSideEffect: addSideEffectMutation.mutate,
    addEffectiveness: addEffectivenessMutation.mutate,
    isAddingTreatment: addTreatmentMutation.isPending,
    isUpdatingTreatment: updateTreatmentMutation.isPending,
    isTogglingActive: toggleActiveMutation.isPending,
    isDeletingTreatment: deleteTreatmentMutation.isPending,
    isAddingSideEffect: addSideEffectMutation.isPending,
    isAddingEffectiveness: addEffectivenessMutation.isPending,
  };
}
