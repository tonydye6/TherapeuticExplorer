// client/src/pages/Documents.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Document } from "@shared/schema";
import DocumentViewer from "@/components/document/DocumentViewer";
import {
  Search,
  FileText,
  FileImage,
  FilePlus,
  UploadCloud,
  Beaker,
  BookOpen,
  CalendarDays,
  ListFilter,
  Eye,
  LayoutGrid,
  List,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MockDocument extends Document {
  id: number;
  title: string;
  type: 'lab_report' | 'imaging' | 'notes' | 'book';
  dateAdded: string;
  content?: string;
}

const sampleDocs: MockDocument[] = [
  { id: 1, title: "CBC Results - May 2025", type: 'lab_report', dateAdded: "2025-05-03T10:00:00Z", content: "Hemoglobin 11.2" },
  { id: 2, title: "PET Scan Report - April 2025", type: 'imaging', dateAdded: "2025-04-20T14:30:00Z", content: "No distant metastases noted." },
  { id: 3, title: "Oncology Consult Notes", type: 'notes', dateAdded: "2025-04-15T09:00:00Z", content: "Discussed chemoradiation plan." },
  { id: 4, title: "Excerpt - Radical Remission", type: 'book', dateAdded: "2025-04-10T12:00:00Z", content: "Chapter on dietary changes." },
  { id: 5, title: "Pathology Report - Biopsy", type: 'lab_report', dateAdded: "2025-04-01T16:00:00Z", content: "Adenocarcinoma confirmed." },
];

const getDocumentIcon = (type: string) => {
  const iconClass = "h-10 w-10";
  switch (type) {
    case 'lab_report':
      return <Beaker className={`${iconClass} text-blue-500`} />;
    case 'imaging':
      return <FileImage className={`${iconClass} text-purple-500`} />;
    case 'notes':
      return <FileText className={`${iconClass} text-green-500`} />;
    case 'book':
      return <BookOpen className={`${iconClass} text-sophera-accent-tertiary`} />;
    default:
      return <FileText className={`${iconClass} text-sophera-text-subtle`} />;
  }
};

const getDocumentTypeLabel = (type: string) => {
  switch (type) {
    case 'lab_report': return "Lab Report";
    case 'imaging': return "Imaging Report";
    case 'notes': return "Clinical Notes";
    case 'book': return "Book/Excerpt";
    default: return "Document";
  }
};

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const documents = sampleDocs;
  const isLoading = false;
  const error = null;

  const filteredDocuments = documents?.filter(doc => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === "" ||
      doc.title.toLowerCase().includes(lowerCaseQuery) ||
      (doc.content && doc.content.toLowerCase().includes(lowerCaseQuery));
    const matchesType = typeFilter === "all" || doc.type === typeFilter;

    if (dateFilter === "all") return matchesSearch && matchesType;
    const docDate = new Date(doc.dateAdded);
    const now = new Date();
    if (dateFilter === "last7days") {
      const lastWeek = new Date(now); lastWeek.setDate(lastWeek.getDate() - 7);
      return matchesSearch && matchesType && docDate >= lastWeek;
    }
    if (dateFilter === "last30days") {
      const lastMonth = new Date(now); lastMonth.setDate(lastMonth.getDate() - 30);
      return matchesSearch && matchesType && docDate >= lastMonth;
    }
    if (dateFilter === "last90days") {
      const last3Months = new Date(now); last3Months.setDate(last3Months.getDate() - 90);
      return matchesSearch && matchesType && docDate >= last3Months;
    }
    return matchesSearch && matchesType;
  }) || [];

  const handleViewDocument = (docId: number) => {
    setSelectedDocumentId(docId);
    setIsViewerOpen(true);
  };

  const renderDocumentCard = (doc: MockDocument) => (
    <Card
      key={doc.id}
      className="bg-sophera-bg-card border border-sophera-border-primary rounded-sophera-card shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out overflow-hidden flex flex-col"
    >
      <CardHeader className="flex flex-row items-center gap-4 p-5 space-y-0">
        <div className="flex-shrink-0">
          {getDocumentIcon(doc.type)}
        </div>
        <div className="flex-grow min-w-0">
          <CardTitle className="text-base font-semibold text-sophera-text-heading leading-tight truncate" title={doc.title}>
            {doc.title}
          </CardTitle>
          <CardDescription className="text-xs text-sophera-text-subtle mt-0.5">
            {getDocumentTypeLabel(doc.type)} • Added {new Date(doc.dateAdded).toLocaleDateString()}
          </CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="mt-auto border-t border-sophera-border-primary/50 bg-sophera-gradient-start/30 p-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDocument(doc.id)}
          className="rounded-sophera-button text-xs border-sophera-brand-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light"
        >
          <Eye className="h-4 w-4 mr-1.5" />
          View Document
        </Button>
      </CardFooter>
    </Card>
  );

  const renderDocumentListItem = (doc: MockDocument) => (
    <div key={doc.id} className="flex items-center border border-sophera-border-primary rounded-sophera-input p-4 bg-sophera-bg-card shadow-sm hover:shadow-md transition-shadow duration-150 ease-in-out">
      <div className="flex-shrink-0 mr-4">
        {getDocumentIcon(doc.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sophera-text-heading truncate" title={doc.title}>{doc.title}</h3>
        <p className="text-sm text-sophera-text-subtle">
          {getDocumentTypeLabel(doc.type)} • Added {new Date(doc.dateAdded).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2 ml-4 shrink-0">
        {doc.type === 'lab_report' && (
          <Badge variant="outline" className="text-xs rounded-md border-blue-300 bg-blue-50 text-blue-700 hidden sm:flex items-center">
            Analyzed
          </Badge>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDocument(doc.id)}
          className="rounded-sophera-button text-xs border-sophera-brand-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light"
        >
          <Eye className="h-4 w-4 mr-1.5 sm:mr-1" />
          <span className="hidden sm:inline">View</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <DocumentViewer
        documentId={selectedDocumentId}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setSelectedDocumentId(null);
        }}
      />

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-sophera-text-heading">My Documents</h1>
            <p className="text-lg text-sophera-text-body mt-1">
              Upload, organize, and analyze your medical records and notes.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-sophera-button h-11 px-5 border-sophera-brand-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light flex items-center gap-2">
              <UploadCloud className="h-5 w-5" />
              Upload
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-sophera-text-subtle pointer-events-none" />
            <Input
              type="search"
              className="pl-11 h-12 rounded-sophera-input text-base w-full bg-sophera-bg-card border-sophera-border-primary placeholder-sophera-text-subtle focus:border-sophera-brand-primary focus:ring-2 focus:ring-sophera-brand-primary-focusRing"
              placeholder="Search document titles or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-3 shrink-0">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px] h-12 rounded-sophera-input text-base bg-sophera-bg-card border-sophera-border-primary">
                <ListFilter className="h-5 w-5 mr-2 text-sophera-text-subtle" />
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent className="rounded-sophera-input">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lab_report">Lab Reports</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="notes">Clinical Notes</SelectItem>
                <SelectItem value="book">Books</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px] h-12 rounded-sophera-input text-base bg-sophera-bg-card border-sophera-border-primary">
                <CalendarDays className="h-5 w-5 mr-2 text-sophera-text-subtle" />
                <SelectValue placeholder="Filter by Date" />
              </SelectTrigger>
              <SelectContent className="rounded-sophera-input">
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border border-sophera-border-primary rounded-sophera-button overflow-hidden h-12 bg-sophera-bg-card">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-full w-12 rounded-none",
                  viewMode === "grid" 
                    ? "bg-sophera-brand-primary-light text-sophera-brand-primary" 
                    : "text-sophera-text-subtle hover:bg-sophera-brand-primary-light/50"
                )}
                aria-label="Grid View"
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-full w-12 rounded-none",
                  viewMode === "list" 
                    ? "bg-sophera-brand-primary-light text-sophera-brand-primary" 
                    : "text-sophera-text-subtle hover:bg-sophera-brand-primary-light/50"
                )}
                aria-label="List View"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh] p-4">
            <Loader2 className="h-12 w-12 animate-spin text-sophera-brand-primary mb-4" />
            <h3 className="text-lg font-semibold text-sophera-text-heading">Loading documents...</h3>
          </div>
        ) : error ? (
          <Card className="text-center py-16 md:py-24 bg-red-50 border-red-200 rounded-sophera-card shadow-lg">
            <AlertTriangle className="h-16 w-16 mx-auto mb-6 text-red-500" />
            <p className="text-xl font-semibold text-red-700">Error Loading Documents</p>
            <p className="text-red-600 mt-2 max-w-md mx-auto">We couldn't retrieve your documents. Please try again later.</p>
          </Card>
        ) : filteredDocuments.length === 0 ? (
          <Card className="text-center py-16 md:py-24 bg-sophera-bg-card border-sophera-border-primary rounded-sophera-card shadow-lg">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-sophera-brand-primary-light rounded-full">
                <FileText className="h-12 w-12 text-sophera-brand-primary" />
              </div>
              <h3 className="text-xl font-semibold text-sophera-text-heading">
                {searchQuery || typeFilter !== 'all' || dateFilter !== 'all' ? "No Matching Documents Found" : "No Documents Uploaded Yet"}
              </h3>
              <p className="text-sophera-text-body mt-1 max-w-md">
                {searchQuery || typeFilter !== 'all' || dateFilter !== 'all'
                  ? "Try adjusting your search or filters."
                  : "Upload your medical records, notes, or book excerpts to keep everything organized."}
              </p>
              {!(searchQuery || typeFilter !== 'all' || dateFilter !== 'all') && (
                <Button className="mt-6 bg-sophera-accent-secondary text-white rounded-sophera-button py-3 px-6 text-base font-semibold tracking-wide hover:bg-sophera-accent-secondary-hover transform hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg">
                  <UploadCloud className="mr-2 h-5 w-5" />
                  Upload Your First Document
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="all" value={typeFilter} onValueChange={setTypeFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto p-1.5 bg-sophera-gradient-start rounded-sophera-button mb-6 gap-1.5">
              <TabsTrigger value="all" className="text-sm data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-11">All Docs</TabsTrigger>
              <TabsTrigger value="lab_report" className="text-sm data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-11">Lab Reports</TabsTrigger>
              <TabsTrigger value="imaging" className="text-sm data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-11">Imaging</TabsTrigger>
              <TabsTrigger value="notes" className="text-sm data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-11">Notes</TabsTrigger>
              <TabsTrigger value="book" className="text-sm data-[state=active]:bg-sophera-bg-card data-[state=active]:text-sophera-brand-primary data-[state=active]:shadow-md rounded-sophera-input h-11">Books</TabsTrigger>
            </TabsList>

            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
              {filteredDocuments.map((doc) => (
                viewMode === "grid" ? renderDocumentCard(doc) : renderDocumentListItem(doc)
              ))}
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
}