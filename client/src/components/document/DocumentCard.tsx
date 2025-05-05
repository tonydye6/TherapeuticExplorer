import React, { useState } from "react";
import { Document } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircleIcon, 
  FileIcon, 
  FileTextIcon, 
  FileType2Icon, 
  ImageIcon, 
  SearchIcon, 
  Trash2Icon, 
  DownloadIcon,
  FileSpreadsheetIcon,
  BookIcon,
  XIcon,
  FilePlusIcon,
  MessageCircleIcon,
  PencilIcon,
  MoreHorizontalIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DocumentCardProps {
  document: Document;
  onDelete: (id: number) => void;
  onExtractText: (id: number) => void;
  onAskQuestion: (id: number, question: string) => void;
  isDeleting: boolean;
  isExtracting: boolean;
}

export default function DocumentCard({ 
  document, 
  onDelete, 
  onExtractText,
  onAskQuestion,
  isDeleting,
  isExtracting
}: DocumentCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  
  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  // Get document type display name
  const getDocumentTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      clinical_notes: "Clinical Notes",
      lab_report: "Lab Report",
      imaging_report: "Imaging Report",
      medication_list: "Medication List",
      discharge_summary: "Discharge Summary",
      pathology_report: "Pathology Report",
      treatment_plan: "Treatment Plan",
      research_paper: "Research Paper",
      insurance: "Insurance Document",
      other: "Other Document"
    };
    return typeMap[type] || type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Get appropriate icon based on document type
  const getDocumentIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      clinical_notes: <FileTextIcon className="h-5 w-5" />,
      lab_report: <FileSpreadsheetIcon className="h-5 w-5" />,
      imaging_report: <ImageIcon className="h-5 w-5" />,
      medication_list: <FileType2Icon className="h-5 w-5" />,
      discharge_summary: <FileTextIcon className="h-5 w-5" />,
      pathology_report: <FileTextIcon className="h-5 w-5" />,
      treatment_plan: <FileTextIcon className="h-5 w-5" />,
      research_paper: <BookIcon className="h-5 w-5" />,
      insurance: <FileIcon className="h-5 w-5" />,
    };
    return iconMap[type] || <FileIcon className="h-5 w-5" />;
  };

  // Handle ask question submission
  const handleAskQuestion = () => {
    if (!question.trim()) return;
    
    setIsAskingQuestion(true);
    onAskQuestion(document.id, question);
    
    // Reset after submission
    setTimeout(() => {
      setIsAskingQuestion(false);
      setQuestion("");
      setIsDialogOpen(false);
    }, 1000);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-muted rounded">
              {getDocumentIcon(document.type)}
            </div>
            <CardTitle className="text-base truncate">{document.title}</CardTitle>
          </div>
          <Badge variant="outline">
            {getDocumentTypeDisplay(document.type)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-2 text-sm">
        <p className="text-muted-foreground text-xs mb-2">
          Added: {formatDate(document.dateAdded)}
          {document.sourceDate && (
            <> • Document date: {formatDate(document.sourceDate)}</>
          )}
        </p>
        
        {document.parsedContent ? (
          <div className="mt-2">
            <details className="text-sm">
              <summary className="font-medium cursor-pointer hover:text-primary transition-colors">
                View extracted content
              </summary>
              <div className="mt-2 p-3 bg-muted rounded-md max-h-40 overflow-y-auto text-xs">
                {typeof document.parsedContent === 'string' 
                  ? document.parsedContent 
                  : JSON.stringify(document.parsedContent, null, 2)}
              </div>
            </details>
          </div>
        ) : (
          <div className="flex items-center text-amber-600 text-xs gap-1 mt-1">
            <AlertCircleIcon className="h-3.5 w-3.5" />
            <span>Text content not yet extracted</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onExtractText(document.id)}
            disabled={isExtracting}
          >
            <FileTextIcon className="h-4 w-4 mr-1" />
            {isExtracting ? "Extracting..." : "Extract Text"}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageCircleIcon className="h-4 w-4 mr-1" />
                Ask Question
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ask about "{document.title}"</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Your Question</Label>
                  <Input
                    id="question"
                    placeholder="What is the main finding in this document?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || isAskingQuestion}
                >
                  {isAskingQuestion ? "Processing..." : "Submit Question"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(`/documents/${document.id}`, '_blank')}>
              <SearchIcon className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(document.id)}
              className="text-destructive focus:text-destructive">
              <Trash2Icon className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
