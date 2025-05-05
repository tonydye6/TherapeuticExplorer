import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { useToast } from "./use-toast";
import { apiRequest } from "@/lib/queryClient";

export function useDocuments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all documents
  const {
    data: documents = [],
    isLoading,
    isError,
    error,
  } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // Add a new document
  const addDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to upload document");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to upload document: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete a document
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/documents/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete document: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Get a document by ID
  const getDocumentById = (id: number) => {
    return useQuery<Document>({
      queryKey: ["/api/documents", id],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/documents/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch document");
        }
        return res.json();
      },
      enabled: !!id,
    });
  };

  // Search within documents
  const searchDocumentsMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await apiRequest("POST", "/api/documents/search", { query });
      return res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Search Error",
        description: `Failed to search documents: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Extract text from a document
  const extractTextMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/documents/${id}/extract`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Text extracted successfully",
      });
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to extract text: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Ask a question about a document
  const askQuestionMutation = useMutation({
    mutationFn: async ({ documentId, question }: { documentId: number; question: string }) => {
      const res = await apiRequest("POST", `/api/documents/${documentId}/ask`, { question });
      return res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ask question: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    documents,
    isLoading,
    isError,
    error,
    uploadDocument: addDocumentMutation.mutate,
    deleteDocument: deleteDocumentMutation.mutate,
    getDocumentById,
    searchDocuments: searchDocumentsMutation.mutate,
    extractText: extractTextMutation.mutate,
    askQuestion: askQuestionMutation.mutate,
    isUploading: addDocumentMutation.isPending,
    isDeleting: deleteDocumentMutation.isPending,
    isSearching: searchDocumentsMutation.isPending,
    isExtracting: extractTextMutation.isPending,
    isAsking: askQuestionMutation.isPending,
  };
}
