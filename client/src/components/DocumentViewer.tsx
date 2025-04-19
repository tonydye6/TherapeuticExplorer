import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Document } from '@shared/schema';
import MedicalTermHighlighter from './MedicalTermHighlighter';
import { Loader2, Download, X, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MedicalTermCategory } from '../lib/types';

interface DocumentViewerProps {
  documentId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentViewer = ({ documentId, isOpen, onClose }: DocumentViewerProps) => {
  const [activeTab, setActiveTab] = useState('highlighted');
  const [selectedTerm, setSelectedTerm] = useState<{ term: string; category: string } | null>(null);

  // Reset active tab when document changes
  useEffect(() => {
    setActiveTab('highlighted');
    setSelectedTerm(null);
  }, [documentId]);

  // Fetch document details
  const { data: document, isLoading, error } = useQuery<Document>({
    queryKey: ['/api/documents', documentId],
    queryFn: async () => {
      if (!documentId) return null;
      try {
        const response = await fetch(`/api/documents/${documentId}`);
        if (!response.ok) throw new Error('Failed to fetch document');
        return await response.json();
      } catch (error) {
        console.error('Error fetching document:', error);
        throw error;
      }
    },
    enabled: !!documentId && isOpen,
  });

  // Fetch highlighted content with medical terms
  const { data: highlightedContent, isLoading: isHighlightLoading } = useQuery<{ html: string }>({
    queryKey: ['/api/documents/highlight', documentId],
    queryFn: async () => {
      if (!documentId) return { html: '' };
      try {
        const response = await fetch(`/api/documents/${documentId}/highlight`);
        if (!response.ok) throw new Error('Failed to fetch highlighted content');
        return await response.json();
      } catch (error) {
        console.error('Error fetching highlighted content:', error);
        return { html: document?.content || 'Error loading highlighted content' };
      }
    },
    enabled: !!documentId && !!document && isOpen,
  });

  // Handle medical term click
  const handleTermClick = (term: string, category: string) => {
    setSelectedTerm({ term, category });
    // You can add additional actions here, like fetching term details
  };

  // Helper to get category label
  const getCategoryLabel = (category: string): string => {
    const categories = {
      diagnosis: 'Diagnosis',
      medication: 'Medication',
      procedure: 'Procedure',
      lab_test: 'Lab Test',
      vital_sign: 'Vital Sign',
      anatomy: 'Anatomy',
      medical_device: 'Medical Device',
      genetic_marker: 'Genetic Marker',
      treatment: 'Treatment',
      symptom: 'Symptom',
    };
    return categories[category as keyof typeof categories] || 'Unknown';
  };

  // Get category color for styled badges
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      diagnosis: 'bg-red-100 text-red-800',
      medication: 'bg-blue-100 text-blue-800',
      procedure: 'bg-purple-100 text-purple-800',
      lab_test: 'bg-green-100 text-green-800',
      vital_sign: 'bg-teal-100 text-teal-800',
      anatomy: 'bg-orange-100 text-orange-800',
      medical_device: 'bg-gray-100 text-gray-800',
      genetic_marker: 'bg-pink-100 text-pink-800',
      treatment: 'bg-indigo-100 text-indigo-800',
      symptom: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <DialogTitle className="text-xl font-bold">{document?.title || 'Loading document...'}</DialogTitle>
            {document && (
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <span>{new Date(document.dateAdded).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <Badge variant="outline" className="font-normal">
                  {document.type}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4 mr-1" /> Close
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading document...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="my-4">
            <AlertDescription>
              Error loading document. Please try again later.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
              <TabsList className="mb-4">
                <TabsTrigger value="highlighted">Highlighted Terms</TabsTrigger>
                <TabsTrigger value="original">Original Document</TabsTrigger>
                {document?.parsedContent ? <TabsTrigger value="structured">Structured Data</TabsTrigger> : null}
              </TabsList>

              <TabsContent value="highlighted" className="h-full overflow-auto">
                {isHighlightLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Processing medical terms...</span>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-4 h-full">
                    <div className="flex-1 overflow-auto p-1">
                      <MedicalTermHighlighter
                        html={highlightedContent?.html || document?.content || ''}
                        showTermCounts={true}
                        enableTooltips={true}
                        onTermClick={handleTermClick}
                      />
                    </div>
                    
                    {selectedTerm && (
                      <div className="w-full md:w-64 bg-gray-50 p-4 rounded-md border">
                        <h3 className="font-medium text-lg mb-2">{selectedTerm.term}</h3>
                        <Badge className={`mb-3 ${getCategoryColor(selectedTerm.category)}`}>
                          {getCategoryLabel(selectedTerm.category)}
                        </Badge>
                        
                        <div className="mt-4 text-sm text-gray-500">
                          <Info className="h-4 w-4 inline mr-1" />
                          Click on highlighted terms in the document to view more information about them.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="original" className="h-full overflow-auto">
                <div className="prose prose-slate max-w-none">
                  {document?.content ? (
                    <div dangerouslySetInnerHTML={{ __html: document.content }} />
                  ) : (
                    <p>No content available</p>
                  )}
                </div>
              </TabsContent>

              {document?.parsedContent && (
                <TabsContent value="structured" className="h-full overflow-auto">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Extracted Data</h3>
                    <pre className="text-sm overflow-auto p-4 bg-gray-100 rounded-md">
                      {JSON.stringify(document.parsedContent, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;