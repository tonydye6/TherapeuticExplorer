import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

export function useHopeSnippets() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch all snippets
  const { data: snippets, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/hope-snippets"],
    refetchOnWindowFocus: false,
  });

  // Create new snippet
  const { mutateAsync: createSnippet, isPending: isCreating } = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/hope-snippets', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hope-snippets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hope-snippets/random"] });
      toast({
        title: "Success",
        description: "Hope snippet created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create hope snippet",
        variant: "destructive",
      });
    },
  });

  // Update snippet
  const { mutateAsync: updateSnippet, isPending: isUpdating } = useMutation({
    mutationFn: async (data: any) => {
      const { id, ...rest } = data;
      const response = await apiRequest('PUT', `/api/hope-snippets/${id}`, rest);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hope-snippets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hope-snippets/random"] });
      toast({
        title: "Success",
        description: "Hope snippet updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update hope snippet",
        variant: "destructive",
      });
    },
  });

  // Delete snippet
  const { mutateAsync: deleteSnippet, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/hope-snippets/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hope-snippets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hope-snippets/random"] });
      toast({
        title: "Success",
        description: "Hope snippet deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete hope snippet",
        variant: "destructive",
      });
    },
  });

  // Fetch a random snippet
  const queryKey = selectedCategory 
    ? ["/api/hope-snippets/random", selectedCategory] 
    : ["/api/hope-snippets/random"];

  const { 
    data: randomSnippet, 
    isLoading: isRandomLoading, 
    refetch: refetchRandom
  } = useQuery({
    queryKey,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const url = selectedCategory
        ? `/api/hope-snippets/random?category=${encodeURIComponent(selectedCategory)}`
        : '/api/hope-snippets/random';
      
      const response = await apiRequest('GET', url);
      return response.json();
    }
  });

  return {
    snippets,
    isLoading,
    error,
    refetch,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    isCreating,
    isUpdating,
    isDeleting,
    randomSnippet,
    isRandomLoading,
    refetchRandom,
    selectedCategory,
    setSelectedCategory
  };
}
