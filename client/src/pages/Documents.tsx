import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Document } from "@shared/schema";
import { 
  Search, 
  Filter, 
  FileText, 
  FileImage, 
  FilePlus, 
  UploadCloud,
  TableProperties,
  CalendarDays,
  ListFilter,
  Eye
} from "lucide-react";

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Fetch documents
  const { data: documents, isLoading, error } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    // If API doesn't exist yet, return empty array
    queryFn: async () => {
      try {
        const response = await fetch('/api/documents');
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error("Error fetching documents:", error);
        return [];
      }
    },
  });
  
  // Filter documents based on search query and filters
  const filteredDocuments = documents?.filter(doc => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.content && doc.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Type filter
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    
    // Date filter - this is simplified; in a real app you'd have more complex date filtering
    if (dateFilter === "all") return matchesSearch && matchesType;
    
    const docDate = new Date(doc.dateAdded);
    const now = new Date();
    
    if (dateFilter === "last7days") {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      return matchesSearch && matchesType && docDate >= lastWeek;
    }
    
    if (dateFilter === "last30days") {
      const lastMonth = new Date(now);
      lastMonth.setDate(lastMonth.getDate() - 30);
      return matchesSearch && matchesType && docDate >= lastMonth;
    }
    
    if (dateFilter === "last90days") {
      const last3Months = new Date(now);
      last3Months.setDate(last3Months.getDate() - 90);
      return matchesSearch && matchesType && docDate >= last3Months;
    }
    
    return matchesSearch && matchesType;
  });
  
  // Group documents by type
  const labReports = filteredDocuments?.filter(doc => doc.type === 'lab_report');
  const imagingReports = filteredDocuments?.filter(doc => doc.type === 'imaging');
  const clinicalNotes = filteredDocuments?.filter(doc => doc.type === 'notes');
  const bookExcerpts = filteredDocuments?.filter(doc => doc.type === 'book');
  
  // Helper function to get document icon
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'lab_report':
        return <TableProperties className="h-10 w-10 text-blue-500" />;
      case 'imaging':
        return <FileImage className="h-10 w-10 text-purple-500" />;
      case 'notes':
        return <FileText className="h-10 w-10 text-green-500" />;
      case 'book':
        return <FileText className="h-10 w-10 text-amber-500" />;
      default:
        return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };
  
  // Helper function for document type labels
  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'lab_report':
        return "Lab Report";
      case 'imaging':
        return "Imaging";
      case 'notes':
        return "Clinical Notes";
      case 'book':
        return "Book Excerpt";
      default:
        return "Document";
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-1">
              <UploadCloud className="h-4 w-4" />
              Upload
            </Button>
            <Button className="bg-primary-800 hover:bg-primary-900 flex items-center gap-1">
              <FilePlus className="h-4 w-4" />
              New Document
            </Button>
          </div>
        </div>
      
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <ListFilter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lab_report">Lab Reports</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="notes">Clinical Notes</SelectItem>
                <SelectItem value="book">Books</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <CalendarDays className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex border rounded-md overflow-hidden">
              <Button 
                variant={viewMode === "grid" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-primary-800 hover:bg-primary-900" : ""}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                </svg>
              </Button>
              <Button 
                variant={viewMode === "list" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-primary-800 hover:bg-primary-900" : ""}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Documents display */}
        {isLoading ? (
          <div className="text-center py-12">
            <p>Loading documents...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>Error loading documents. Please try again.</p>
          </div>
        ) : filteredDocuments?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No documents found</p>
            <p className="text-sm mt-2">Upload documents to organize your medical information.</p>
            <Button className="mt-4 bg-primary-800 hover:bg-primary-900 flex items-center gap-1">
              <UploadCloud className="h-4 w-4" />
              Upload Documents
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="labs">Lab Reports</TabsTrigger>
              <TabsTrigger value="imaging">Imaging</TabsTrigger>
              <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
              <TabsTrigger value="books">Books</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDocuments?.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden">
                      <div className="flex items-center p-4">
                        {getDocumentIcon(doc.type)}
                        <div className="ml-4">
                          <h3 className="font-medium">{doc.title}</h3>
                          <p className="text-sm text-gray-500">
                            {getDocumentTypeLabel(doc.type)} • {new Date(doc.dateAdded).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <CardContent className="border-t bg-gray-50 p-4">
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          {doc.type === 'lab_report' && (
                            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Analyzed
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments?.map((doc) => (
                    <div key={doc.id} className="flex items-center border rounded-lg p-4 bg-white">
                      <div className="flex-shrink-0 mr-4">
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{doc.title}</h3>
                        <p className="text-sm text-gray-500">
                          {getDocumentTypeLabel(doc.type)} • {new Date(doc.dateAdded).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {doc.type === 'lab_report' && (
                          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                            Analyzed
                          </span>
                        )}
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="labs">
              {labReports?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No lab reports found.</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {labReports?.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden">
                      <div className="flex items-center p-4">
                        <TableProperties className="h-10 w-10 text-blue-500" />
                        <div className="ml-4">
                          <h3 className="font-medium">{doc.title}</h3>
                          <p className="text-sm text-gray-500">
                            Lab Report • {new Date(doc.dateAdded).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <CardContent className="border-t bg-gray-50 p-4">
                        <div className="flex justify-between">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Analyzed
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {labReports?.map((doc) => (
                    <div key={doc.id} className="flex items-center border rounded-lg p-4 bg-white">
                      <div className="flex-shrink-0 mr-4">
                        <TableProperties className="h-10 w-10 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{doc.title}</h3>
                        <p className="text-sm text-gray-500">
                          Lab Report • {new Date(doc.dateAdded).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                          Analyzed
                        </span>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="imaging">
              {imagingReports?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No imaging reports found.</p>
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
                  {imagingReports?.map((doc) => renderDocument(doc, viewMode))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="notes">
              {clinicalNotes?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No clinical notes found.</p>
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
                  {clinicalNotes?.map((doc) => renderDocument(doc, viewMode))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="books">
              {bookExcerpts?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No book excerpts found.</p>
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
                  {bookExcerpts?.map((doc) => renderDocument(doc, viewMode))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
  
  // Helper function to render a document in both view modes
  function renderDocument(doc: Document, mode: "grid" | "list") {
    if (mode === "grid") {
      return (
        <Card key={doc.id} className="overflow-hidden">
          <div className="flex items-center p-4">
            {getDocumentIcon(doc.type)}
            <div className="ml-4">
              <h3 className="font-medium">{doc.title}</h3>
              <p className="text-sm text-gray-500">
                {getDocumentTypeLabel(doc.type)} • {new Date(doc.dateAdded).toLocaleDateString()}
              </p>
            </div>
          </div>
          <CardContent className="border-t bg-gray-50 p-4">
            <div className="flex justify-between">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                View
              </Button>
              {doc.type === 'lab_report' && (
                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Analyzed
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      );
    } else {
      return (
        <div key={doc.id} className="flex items-center border rounded-lg p-4 bg-white">
          <div className="flex-shrink-0 mr-4">
            {getDocumentIcon(doc.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{doc.title}</h3>
            <p className="text-sm text-gray-500">
              {getDocumentTypeLabel(doc.type)} • {new Date(doc.dateAdded).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            {doc.type === 'lab_report' && (
              <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                Analyzed
              </span>
            )}
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              View
            </Button>
          </div>
        </div>
      );
    }
  }
}
