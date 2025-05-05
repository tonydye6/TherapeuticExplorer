import { useQuery, useMutation } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Helper function to handle FormData POST requests
async function postFormData(url: string, formData: FormData) {
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text || response.statusText}`);
  }
  
  return response;
}

export function useDocuments() {
  const { toast } = useToast();
  const queryKey = ["/api/documents"];

  // Get all documents
  const {
    data: documents = [],
    isLoading,
    error,
  } = useQuery<Document[]>({
    queryKey,
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await postFormData("/api/documents/upload", formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Document uploaded",
        description: "Your document has been successfully uploaded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document.",
        variant: "destructive",
      });
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await apiRequest("DELETE", `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Document deleted",
        description: "Document has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete document.",
        variant: "destructive",
      });
    },
  });

  // Extract text from document mutation
  const extractTextMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiRequest("POST", `/api/documents/${documentId}/extract-text`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Text extracted",
        description: "Text content has been extracted from the document.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Extraction failed",
        description: error.message || "Failed to extract text from document.",
        variant: "destructive",
      });
    },
  });

  // Search documents
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("GET", `/api/documents/search?q=${encodeURIComponent(query)}`);
      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Search failed",
        description: error.message || "Failed to search documents.",
        variant: "destructive",
      });
    },
  });

  // Ask question about document
  const askQuestionMutation = useMutation({
    mutationFn: async ({ documentId, question }: { documentId: number; question: string }) => {
      const response = await apiRequest("POST", `/api/documents/${documentId}/ask`, { question });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Answer ready",
        description: "AI has analyzed the document and provided an answer.",
      });
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Question failed",
        description: error.message || "Failed to process your question.",
        variant: "destructive",
      });
    },
  });

  return {
    documents,
    isLoading,
    error,
    uploadDocument: uploadMutation.mutate,
    deleteDocument: deleteMutation.mutate,
    extractText: extractTextMutation.mutate,
    searchDocuments: searchMutation.mutate,
    askQuestion: (documentId: number, question: string) =>
      askQuestionMutation.mutate({ documentId, question }),
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isExtracting: extractTextMutation.isPending,
    isSearching: searchMutation.isPending,
    isAsking: askQuestionMutation.isPending,
  };
}
