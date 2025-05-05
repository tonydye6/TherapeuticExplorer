import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileIcon, UploadIcon, XIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  onUpload: (formData: FormData) => void;
  isUploading: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf", // PDF
  "application/msword", // DOC
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "image/jpeg", // JPEG
  "image/png", // PNG
  "text/plain", // TXT
  "text/csv", // CSV
  "application/vnd.ms-excel", // XLS
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
];

export default function DocumentUpload({ onUpload, isUploading }: DocumentUploadProps) {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [sourceDate, setSourceDate] = useState("");

  const documentTypes = [
    { label: "Clinical Notes", value: "clinical_notes" },
    { label: "Lab Report", value: "lab_report" },
    { label: "Imaging Report", value: "imaging_report" },
    { label: "Medication List", value: "medication_list" },
    { label: "Discharge Summary", value: "discharge_summary" },
    { label: "Pathology Report", value: "pathology_report" },
    { label: "Treatment Plan", value: "treatment_plan" },
    { label: "Research Paper", value: "research_paper" },
    { label: "Insurance Document", value: "insurance" },
    { label: "Other", value: "other" },
  ];

  // Set up dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        
        // Check file size
        if (selectedFile.size > MAX_FILE_SIZE) {
          toast({
            title: "File too large",
            description: "Maximum file size is 50MB",
            variant: "destructive",
          });
          return;
        }
        
        // Check file type
        if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
          toast({
            title: "Unsupported file type",
            description: "Please upload a PDF, Word, image, or text document",
            variant: "destructive",
          });
          return;
        }
        
        setFile(selectedFile);
        // Extract a suggested title from the filename
        const fileName = selectedFile.name.split(".")[0];
        setTitle(fileName);
      }
    },
    multiple: false,
  });

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for the document",
        variant: "destructive",
      });
      return;
    }
    
    if (!type) {
      toast({
        title: "Document type required",
        description: "Please select a document type",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("type", type);
    if (sourceDate) {
      formData.append("sourceDate", sourceDate);
    }
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);
    
    onUpload(formData);
    
    // Reset form after successful upload
    setTimeout(() => {
      if (!isUploading) {
        setFile(null);
        setTitle("");
        setType("");
        setSourceDate("");
        setUploadProgress(0);
        clearInterval(progressInterval);
      }
    }, 1000);
  };

  const removeFile = () => {
    setFile(null);
    setTitle("");
    setUploadProgress(0);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <UploadIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Drag & drop a file here</h3>
          <p className="text-muted-foreground text-sm mb-4">
            or click to browse files (PDF, Word, text files, or images, up to 50MB)
          </p>
          <Button type="button" variant="outline">
            Select File
          </Button>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-muted rounded-md flex items-center justify-center">
                <FileIcon className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between w-full">
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
                {isUploading && (
                  <Progress className="mt-2" value={uploadProgress} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Document Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            disabled={isUploading}
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Document Type</Label>
          <Select
            value={type}
            onValueChange={setType}
            disabled={isUploading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((docType) => (
                <SelectItem key={docType.value} value={docType.value}>
                  {docType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date">Document Date (Optional)</Label>
          <Input
            id="date"
            type="date"
            value={sourceDate}
            onChange={(e) => setSourceDate(e.target.value)}
            disabled={isUploading}
          />
        </div>

        <Button type="submit" disabled={isUploading || !file}>
          {isUploading ? "Uploading..." : "Upload Document"}
        </Button>
      </div>
    </form>
  );
}
