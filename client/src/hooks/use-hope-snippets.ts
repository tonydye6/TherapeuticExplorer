import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type HopeSnippet = {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string | null;
  source: string | null;
  tags: string[] | null;
  isActive: boolean;
  createdAt: Date;
};

type CreateHopeSnippetData = {
  title: string;
  content: string;
  category: string;
  author?: string | null;
  source?: string | null;
  tags?: string[] | null;
  isActive?: boolean;
};

export function useHopeSnippets() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Query for all hope snippets
  const {
    data: snippets = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<HopeSnippet[]>({
    queryKey: ['/api/hope-snippets', selectedCategory],
    enabled: true,
    queryFn: async () => {
      const url = selectedCategory
        ? `/api/hope-snippets?category=${encodeURIComponent(selectedCategory)}`
        : '/api/hope-snippets';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch hope snippets');
      }
      return await response.json();
    }
  });

  // Query for a random hope snippet
  const {
    data: randomSnippet,
    isLoading: isRandomLoading,
    refetch: refetchRandom
  } = useQuery<HopeSnippet>({
    queryKey: ['/api/hope-snippets/random', selectedCategory],
    enabled: true,
    queryFn: async () => {
      const url = selectedCategory
        ? `/api/hope-snippets/random?category=${encodeURIComponent(selectedCategory)}`
        : '/api/hope-snippets/random';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch random hope snippet');
      }
      return await response.json();
    }
  });

  // Mutation to create a new hope snippet
  const createSnippetMutation = useMutation({
    mutationFn: async (snippetData: CreateHopeSnippetData) => {
      const response = await fetch('/api/hope-snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snippetData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create hope snippet');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hope snippet created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hope-snippets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hope-snippets/random'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation to update a hope snippet
  const updateSnippetMutation = useMutation({
    mutationFn: async ({id, ...data}: {id: number} & Partial<CreateHopeSnippetData>) => {
      const response = await fetch(`/api/hope-snippets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update hope snippet');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hope snippet updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hope-snippets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hope-snippets/random'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation to delete a hope snippet
  const deleteSnippetMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/hope-snippets/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete hope snippet');
      }
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hope snippet deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hope-snippets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hope-snippets/random'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    snippets,
    randomSnippet,
    isLoading,
    isRandomLoading,
    isError,
    error,
    refetch,
    refetchRandom,
    createSnippet: createSnippetMutation.mutate,
    updateSnippet: updateSnippetMutation.mutate,
    deleteSnippet: deleteSnippetMutation.mutate,
    selectedCategory,
    setSelectedCategory,
    isCreating: createSnippetMutation.isPending,
    isUpdating: updateSnippetMutation.isPending,
    isDeleting: deleteSnippetMutation.isPending
  };
}
