import React, { useState } from "react";
import { useDocuments } from "@/hooks/use-documents";
import DocumentUpload from "@/components/document/DocumentUpload";
import DocumentCard from "@/components/document/DocumentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileTextIcon, 
  SearchIcon, 
  PlusIcon, 
  FileIcon,
  FilterIcon,
  ImageIcon,
  FileSpreadsheetIcon,
  BookIcon,
  RefreshCwIcon,
  XIcon
} from "lucide-react";
import { Document } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SearchResultsProps {
  searchResults: any[];
  searchQuery: string;
  onClearSearch: () => void;
}

function SearchResults({ searchResults, searchQuery, onClearSearch }: SearchResultsProps) {
  if (!searchResults || searchResults.length === 0) {
    return (
      <div className="text-center py-12">
        <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No results found</h3>
        <p className="text-muted-foreground">No documents match your search criteria</p>
        <Button variant="outline" onClick={onClearSearch} className="mt-4">
          Clear Search
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Results for: <span className="font-bold">"{searchQuery}"</span>
        </h3>
        <Button variant="outline" size="sm" onClick={onClearSearch}>
          <XIcon className="h-4 w-4 mr-2" /> Clear Search
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map((result) => (
          <div key={result.id} className="border rounded-lg p-4">
            <div className="flex items-start gap-2 mb-2">
              <FileIcon className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-base">{result.title}</h4>
                <p className="text-sm text-muted-foreground">{result.type}</p>
              </div>
            </div>
            <p className="text-sm">{result.excerpt}</p>
            <div className="mt-2 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <a href={`/documents/${result.documentId}`}>Open Document</a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const {
    documents,
    isLoading,
    uploadDocument,
    deleteDocument,
    extractText,
    searchDocuments,
    askQuestion,
    isUploading,
    isDeleting,
    isSearching,
    isExtracting,
    isAsking,
  } = useDocuments();

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    searchDocuments(searchQuery, {
      onSuccess: (data) => {
        setSearchResults(data);
      },
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  const groupDocumentsByType = () => {
    if (!documents) return {};

    return documents.reduce((acc: Record<string, Document[]>, doc: Document) => {
      if (!acc[doc.type]) {
        acc[doc.type] = [];
      }
      acc[doc.type].push(doc);
      return acc;
    }, {});
  };

  const documentsByType = groupDocumentsByType();
  const documentTypes = Object.keys(documentsByType).sort();

  const filteredDocuments = selectedType
    ? documents?.filter((doc) => doc.type === selectedType) || []
    : documents || [];

  const recentDocuments = [...(documents || [])]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 5);

  const getFilteredDocuments = () => {
    if (selectedTab === "all") return filteredDocuments;
    if (selectedTab === "recent") return recentDocuments;
    return [];
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-6">
        {/* Header with search and upload */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center text-gray-900">
              <FileTextIcon className="h-6 w-6 mr-2 text-primary" />
              Documents
            </h1>
            <p className="text-muted-foreground mt-1">
              Upload, store, and analyze your medical documents
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex w-full md:w-auto">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-60 rounded-r-none"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button 
                variant="default" 
                className="rounded-l-none"
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
              >
                <SearchIcon className="h-4 w-4" />
              </Button>
            </div>

            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>
                <DocumentUpload 
                  onUpload={uploadDocument} 
                  isUploading={isUploading} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Show search results if there are any */}
        {searchResults !== null && (
          <SearchResults
            searchResults={searchResults}
            searchQuery={searchQuery}
            onClearSearch={clearSearch}
          />
        )}

        {/* Main content - only show if not searching */}
        {searchResults === null && (
          <div className="space-y-6">
            {/* Document type filters */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedType === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(null)}
              >
                All Types
              </Button>
              {documentTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                >
                  {type === "clinical_notes" && <FileTextIcon className="h-4 w-4 mr-1" />}
                  {type === "lab_report" && <FileSpreadsheetIcon className="h-4 w-4 mr-1" />}
                  {type === "imaging_report" && <ImageIcon className="h-4 w-4 mr-1" />}
                  {type === "research_paper" && <BookIcon className="h-4 w-4 mr-1" />}
                  {type !== "clinical_notes" && type !== "lab_report" && type !== "imaging_report" && type !== "research_paper" && 
                    <FileIcon className="h-4 w-4 mr-1" />
                  }
                  {type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                  {documentsByType[type] && (
                    <Badge variant="outline" className="ml-1">{documentsByType[type].length}</Badge>
                  )}
                </Button>
              ))}
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="all" className="flex items-center">
                  <FileTextIcon className="h-4 w-4 mr-1" />
                  All Documents
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex items-center">
                  <RefreshCwIcon className="h-4 w-4 mr-1" />
                  Recently Added
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="pt-4">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div role="status">
                      <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-4 text-muted-foreground">Loading documents...</p>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No documents yet</h3>
                    <p className="text-muted-foreground">Upload your first document to get started</p>
                    <Button
                      variant="outline"
                      onClick={() => setIsUploadDialogOpen(true)}
                      className="mt-4"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onDelete={deleteDocument}
                        onExtractText={extractText}
                        onAskQuestion={askQuestion}
                        isDeleting={isDeleting}
                        isExtracting={isExtracting}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recent" className="pt-4">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div role="status">
                      <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-4 text-muted-foreground">Loading documents...</p>
                  </div>
                ) : recentDocuments.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No documents yet</h3>
                    <p className="text-muted-foreground">Upload your first document to get started</p>
                    <Button
                      variant="outline"
                      onClick={() => setIsUploadDialogOpen(true)}
                      className="mt-4"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentDocuments.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onDelete={deleteDocument}
                        onExtractText={extractText}
                        onAskQuestion={askQuestion}
                        isDeleting={isDeleting}
                        isExtracting={isExtracting}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
