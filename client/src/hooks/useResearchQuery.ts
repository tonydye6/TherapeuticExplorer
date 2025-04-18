import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ResearchItem } from '@shared/schema';

interface ResearchResults {
  treatments?: any[];
  clinicalTrials?: any[];
  researchSummary?: {
    text: string;
    sources: string[];
  };
  sources?: {
    title: string;
    url?: string;
    type: string;
    date?: string;
  }[];
}

interface UseResearchQueryReturn {
  search: (query: string) => Promise<ResearchResults | null>;
  saveResearchItem: (item: Omit<ResearchItem, 'id' | 'userId' | 'dateAdded'>) => Promise<void>;
  isSearching: boolean;
  isSaving: boolean;
  searchResults: ResearchResults | null;
  error: Error | null;
}

export function useResearchQuery(): UseResearchQueryReturn {
  const [searchResults, setSearchResults] = useState<ResearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const saveItemMutation = useMutation({
    mutationFn: async (item: Omit<ResearchItem, 'id' | 'userId' | 'dateAdded'>) => {
      const response = await apiRequest('POST', '/api/research', item);
      if (!response.ok) {
        throw new Error('Failed to save research item');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/research'] });
      toast({
        title: 'Success',
        description: 'Research item saved successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save research item',
        variant: 'destructive',
      });
    },
  });
  
  const search = async (query: string): Promise<ResearchResults | null> => {
    if (!query.trim()) return null;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/research/search', { query });
      
      if (!response.ok) {
        throw new Error('Failed to perform research');
      }
      
      const results = await response.json();
      setSearchResults(results);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      toast({
        title: 'Research Error',
        description: err instanceof Error ? err.message : 'Failed to perform research',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsSearching(false);
    }
  };
  
  const saveResearchItem = async (item: Omit<ResearchItem, 'id' | 'userId' | 'dateAdded'>) => {
    await saveItemMutation.mutateAsync(item);
  };
  
  return {
    search,
    saveResearchItem,
    isSearching,
    isSaving: saveItemMutation.isPending,
    searchResults,
    error,
  };
}
