import { useQuery, useMutation } from "@tanstack/react-query";
import { JournalLog } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface JournalLogInput {
  entryDate: Date;
  content: string;
  mood: string;
  energyLevel: number;
  sleepQuality: number;
  painLevel: number;
  symptoms: string[];
  medication: string[];
  foodDiary: string;
  images?: string[];
}

export function useJournalLogs() {
  const {
    data: journalLogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/journal-logs"],
  });

  const createJournalLogMutation = useMutation({
    mutationFn: async (journalLog: JournalLogInput) => {
      const res = await apiRequest("POST", "/api/journal-logs", journalLog);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-logs"] });
      toast({
        title: "Success",
        description: "Journal log created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create journal log: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateJournalLogMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<JournalLogInput> }) => {
      const res = await apiRequest("PUT", `/api/journal-logs/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-logs"] });
      toast({
        title: "Success",
        description: "Journal log updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update journal log: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteJournalLogMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/journal-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal-logs"] });
      toast({
        title: "Success",
        description: "Journal log deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete journal log: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    journalLogs: journalLogs as JournalLog[] | undefined,
    isLoading,
    error,
    createJournalLog: createJournalLogMutation.mutate,
    updateJournalLog: updateJournalLogMutation.mutate,
    deleteJournalLog: deleteJournalLogMutation.mutate,
    isCreating: createJournalLogMutation.isPending,
    isUpdating: updateJournalLogMutation.isPending,
    isDeleting: deleteJournalLogMutation.isPending,
  };
}
