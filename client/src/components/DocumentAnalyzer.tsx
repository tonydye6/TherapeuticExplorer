import React, { useState } from "react";
import { File, FileText, Upload, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the document analysis result types based on documentService.ts
export type DocumentEntity = {
  type: string;
  text: string;
  start: number;
  end: number;
  category: string;
};

export type DocumentKeyInfo = {
  labValues?: Record<string, number | string | null>;
  diagnoses?: string[];
  medications?: string[];
  procedures?: string[];
  dates?: {
    type: string;
    date: string;
  }[];
  healthMetrics?: Record<string, number | null>;
};

export type DocumentAnalysisResult = {
  entities: DocumentEntity[];
  keyInfo: DocumentKeyInfo;
  summary: string;
  sourceType: string;
};

type DocumentAnalyzerProps = {
  onAnalyzeDocument: (content: string) => Promise<DocumentAnalysisResult>;
  onSaveDocument?: (documentData: {
    title: string;
    content: string;
    parsedContent: DocumentAnalysisResult;
    documentType: string;
    date: Date;
  }) => Promise<void>;
};

export default function DocumentAnalyzer({
  onAnalyzeDocument,
  onSaveDocument,
}: DocumentAnalyzerProps) {
  const [documentContent, setDocumentContent] = useState("");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentDate, setDocumentDate] = useState(new Date());
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Auto-set document title from filename
    setDocumentTitle(file.name.split('.')[0]);
    
    try {
      // For simplicity we'll just read text files directly
      // In a real app, you'd use OCR or document parsing services
      if (file.type === "text/plain") {
        const content = await file.text();
        setDocumentContent(content);
      } else if (file.type === "application/pdf" || 
                file.type.includes("image/") || 
                file.type.includes("application/msword")) {
        // In a real app, this would call an OCR service or PDF parser
        setError("This file type would require OCR processing. For this demo, please use plain text files.");
      } else {
        setError("Unsupported file type.");
      }
    } catch (err) {
      setError("Error reading file: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Handle document analysis
  const analyzeDocument = async () => {
    if (!documentContent.trim()) {
      setError("Please enter or upload document content first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await onAnalyzeDocument(documentContent);
      setAnalysisResult(result);
      
      // Auto-set document type if not already set
      if (!documentType) {
        setDocumentType(result.sourceType);
      }
    } catch (err) {
      setError("Error analyzing document: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle saving the document
  const saveDocument = async () => {
    if (!analysisResult) {
      setError("Please analyze the document first.");
      return;
    }

    if (!documentTitle.trim()) {
      setError("Please enter a title for the document.");
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      if (onSaveDocument) {
        await onSaveDocument({
          title: documentTitle,
          content: documentContent,
          parsedContent: analysisResult,
          documentType: documentType || analysisResult.sourceType,
          date: documentDate
        });
        setSaved(true);
        // Reset form after successful save
        setTimeout(() => {
          setDocumentContent("");
          setDocumentTitle("");
          setDocumentType("");
          setAnalysisResult(null);
          setSaved(false);
        }, 2000);
      }
    } catch (err) {
      setError("Error saving document: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to highlight entities in text
  const highlightEntities = (text: string, entities: DocumentEntity[]) => {
    // Sort entities by their starting position, from end to start
    // to avoid position shifts when adding highlight markup
    const sortedEntities = [...entities].sort((a, b) => b.start - a.start);
    
    let highlightedText = text;
    
    sortedEntities.forEach(entity => {
      const before = highlightedText.substring(0, entity.start);
      const entityText = highlightedText.substring(entity.start, entity.end);
      const after = highlightedText.substring(entity.end);
      
      // Different colors for different entity types
      const colorClass = 
        entity.type === "DIAGNOSIS" ? "bg-red-100 text-red-800" :
        entity.type === "MEDICATION" ? "bg-green-100 text-green-800" :
        entity.type === "PROCEDURE" ? "bg-blue-100 text-blue-800" :
        entity.type === "LAB_VALUE" ? "bg-purple-100 text-purple-800" :
        entity.type === "DATE" ? "bg-yellow-100 text-yellow-800" :
        "bg-gray-100 text-gray-800";
      
      highlightedText = `${before}<span class="${colorClass} px-1 rounded">${entityText}</span>${after}`;
    });
    
    return highlightedText;
  };

  return (
    <div className="document-analyzer w-full bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Medical Document Analyzer</h2>
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-2/3">
            <label htmlFor="documentTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Document Title
            </label>
            <input
              id="documentTitle"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter document title"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-1/3">
            <label htmlFor="documentDate" className="block text-sm font-medium text-gray-700 mb-1">
              Document Date
            </label>
            <input
              id="documentDate"
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={documentDate.toISOString().split('T')[0]}
              onChange={(e) => setDocumentDate(new Date(e.target.value))}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
          </label>
          <select
            id="documentType"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <option value="">Select document type</option>
            <option value="LAB_REPORT">Lab Report</option>
            <option value="IMAGING_REPORT">Imaging Report</option>
            <option value="CLINICAL_NOTE">Clinical Note</option>
            <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
            <option value="PATHOLOGY_REPORT">Pathology Report</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="documentContent" className="block text-sm font-medium text-gray-700 mb-1">
            Document Content
          </label>
          
          {!documentContent ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-2">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Upload a document or paste text to analyze
              </p>
              <div className="flex flex-col items-center space-y-3">
                <label
                  htmlFor="fileUpload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </label>
                <input
                  id="fileUpload"
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                />
                <span className="text-xs text-gray-500">or</span>
                <Button
                  variant="outline"
                  onClick={() => setDocumentContent("Enter document text here...")}
                >
                  Enter Text Manually
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <textarea
                id="documentContent"
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
              />
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setDocumentContent("")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {saved && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">Document saved successfully!</p>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setDocumentContent("");
              setDocumentTitle("");
              setDocumentType("");
              setAnalysisResult(null);
              setError(null);
            }}
            disabled={isAnalyzing || isSaving}
          >
            Clear
          </Button>
          
          <Button
            onClick={analyzeDocument}
            disabled={!documentContent || isAnalyzing || isSaving}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Document"
            )}
          </Button>
        </div>
      </div>
      
      {/* Analysis Results Section */}
      {analysisResult && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Results</h3>
          
          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="entities">Extracted Entities</TabsTrigger>
              <TabsTrigger value="highlighted">Highlighted Content</TabsTrigger>
              <TabsTrigger value="structured">Structured Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">Document Summary</h4>
              <p className="text-gray-700">{analysisResult.summary}</p>
              
              <div className="mt-4 flex items-center">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">
                  Identified as: <span className="font-medium">{analysisResult.sourceType}</span>
                </span>
              </div>
            </TabsContent>
            
            <TabsContent value="entities">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analysisResult.entities.map((entity, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {entity.text}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={cn(
                            "px-2 py-1 text-xs font-semibold rounded-full",
                            entity.type === "DIAGNOSIS" ? "bg-red-100 text-red-800" :
                            entity.type === "MEDICATION" ? "bg-green-100 text-green-800" :
                            entity.type === "PROCEDURE" ? "bg-blue-100 text-blue-800" :
                            entity.type === "LAB_VALUE" ? "bg-purple-100 text-purple-800" :
                            entity.type === "DATE" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          )}>
                            {entity.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entity.category}
                        </td>
                      </tr>
                    ))}
                    
                    {analysisResult.entities.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          No entities detected.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="highlighted">
              <div 
                className="p-4 bg-white border rounded-md whitespace-pre-wrap text-sm"
                dangerouslySetInnerHTML={{ 
                  __html: highlightEntities(documentContent, analysisResult.entities) 
                }}
              />
            </TabsContent>
            
            <TabsContent value="structured">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lab Values */}
                {analysisResult.keyInfo.labValues && Object.keys(analysisResult.keyInfo.labValues).length > 0 && (
                  <div className="bg-white p-4 rounded-md shadow-sm">
                    <h4 className="font-medium mb-3 text-gray-900">Lab Values</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Test</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {Object.entries(analysisResult.keyInfo.labValues).map(([key, value], idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm text-gray-900">{key}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{value?.toString() || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Diagnoses */}
                {analysisResult.keyInfo.diagnoses && analysisResult.keyInfo.diagnoses.length > 0 && (
                  <div className="bg-white p-4 rounded-md shadow-sm">
                    <h4 className="font-medium mb-3 text-gray-900">Diagnoses</h4>
                    <ul className="space-y-1">
                      {analysisResult.keyInfo.diagnoses.map((diagnosis, idx) => (
                        <li key={idx} className="text-sm bg-red-50 text-red-800 px-3 py-1 rounded-md">
                          {diagnosis}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Medications */}
                {analysisResult.keyInfo.medications && analysisResult.keyInfo.medications.length > 0 && (
                  <div className="bg-white p-4 rounded-md shadow-sm">
                    <h4 className="font-medium mb-3 text-gray-900">Medications</h4>
                    <ul className="space-y-1">
                      {analysisResult.keyInfo.medications.map((medication, idx) => (
                        <li key={idx} className="text-sm bg-green-50 text-green-800 px-3 py-1 rounded-md">
                          {medication}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Procedures */}
                {analysisResult.keyInfo.procedures && analysisResult.keyInfo.procedures.length > 0 && (
                  <div className="bg-white p-4 rounded-md shadow-sm">
                    <h4 className="font-medium mb-3 text-gray-900">Procedures</h4>
                    <ul className="space-y-1">
                      {analysisResult.keyInfo.procedures.map((procedure, idx) => (
                        <li key={idx} className="text-sm bg-blue-50 text-blue-800 px-3 py-1 rounded-md">
                          {procedure}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Dates */}
                {analysisResult.keyInfo.dates && analysisResult.keyInfo.dates.length > 0 && (
                  <div className="bg-white p-4 rounded-md shadow-sm">
                    <h4 className="font-medium mb-3 text-gray-900">Important Dates</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {analysisResult.keyInfo.dates.map((dateItem, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm text-gray-900">{dateItem.type}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{dateItem.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Health Metrics */}
                {analysisResult.keyInfo.healthMetrics && Object.keys(analysisResult.keyInfo.healthMetrics).length > 0 && (
                  <div className="bg-white p-4 rounded-md shadow-sm">
                    <h4 className="font-medium mb-3 text-gray-900">Health Metrics</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Metric</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {Object.entries(analysisResult.keyInfo.healthMetrics).map(([key, value], idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm text-gray-900">{key}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{value?.toString() || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 flex justify-end">
            <Button
              onClick={saveDocument}
              disabled={isSaving || !analysisResult || saved}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Document"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}