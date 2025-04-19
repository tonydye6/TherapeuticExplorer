import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, MessageSquare, Type, LucideRefreshCcw } from 'lucide-react';

const MedicalTermTranslator = () => {
  // State for text translation
  const [medicalText, setMedicalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  
  // State for term translation
  const [medicalTerm, setMedicalTerm] = useState('');
  const [termExplanation, setTermExplanation] = useState('');
  
  // Mutation for translating full medical text
  const translateTextMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest('POST', '/api/medical-terms/translate-text', { text });
      const data = await res.json();
      return data.translatedText;
    },
    onSuccess: (data) => {
      setTranslatedText(data);
    },
    onError: (error) => {
      console.error('Error translating text:', error);
    }
  });
  
  // Mutation for translating single medical terms
  const translateTermMutation = useMutation({
    mutationFn: async (term: string) => {
      const res = await apiRequest('POST', '/api/medical-terms/translate-term', { term });
      const data = await res.json();
      return data.explanation;
    },
    onSuccess: (data) => {
      setTermExplanation(data);
    },
    onError: (error) => {
      console.error('Error translating term:', error);
    }
  });
  
  // Handle text translation
  const handleTranslateText = () => {
    if (medicalText.trim()) {
      translateTextMutation.mutate(medicalText);
    }
  };
  
  // Handle term translation
  const handleTranslateTerm = () => {
    if (medicalTerm.trim()) {
      translateTermMutation.mutate(medicalTerm);
    }
  };
  
  // Handle clearing the form
  const handleClearText = () => {
    setMedicalText('');
    setTranslatedText('');
  };
  
  // Handle clearing the term
  const handleClearTerm = () => {
    setMedicalTerm('');
    setTermExplanation('');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Medical Terminology Translator</h1>
        <p className="text-gray-600">
          Understand complex medical terminology with our one-click translation tool.
          Simply paste medical text or enter a specific term to get a patient-friendly explanation.
        </p>
      </div>
      
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Translate Medical Text
          </TabsTrigger>
          <TabsTrigger value="term" className="flex items-center">
            <Type className="mr-2 h-4 w-4" />
            Explain Medical Term
          </TabsTrigger>
        </TabsList>
        
        {/* Medical Text Translation Tab */}
        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Translate Medical Document</CardTitle>
              <CardDescription>
                Paste medical text below to convert it into patient-friendly language
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <label className="text-sm font-medium">Medical Text</label>
                  <Textarea
                    placeholder="Paste medical text here (e.g., 'The patient presents with dysphagia and odynophagia consistent with esophageal pathology...')"
                    className="min-h-32 resize-y"
                    value={medicalText}
                    onChange={(e) => setMedicalText(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    onClick={handleTranslateText}
                    disabled={!medicalText.trim() || translateTextMutation.isPending}
                    className="w-32"
                  >
                    {translateTextMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Translating</>
                    ) : (
                      'Translate'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClearText}
                    className="w-32"
                  >
                    Clear
                  </Button>
                </div>
                
                {translatedText && (
                  <div className="grid gap-3 mt-4">
                    <label className="text-sm font-medium">Patient-Friendly Translation</label>
                    <div className="border rounded-md p-4 bg-gray-50 min-h-32 whitespace-pre-wrap">
                      {translatedText}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Medical Term Explanation Tab */}
        <TabsContent value="term" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Explain Medical Term</CardTitle>
              <CardDescription>
                Enter a medical term to get a clear, patient-friendly explanation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <label className="text-sm font-medium">Medical Term</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter a medical term (e.g., 'dysphagia', 'Barrett's esophagus')"
                      value={medicalTerm}
                      onChange={(e) => setMedicalTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleTranslateTerm}
                      disabled={!medicalTerm.trim() || translateTermMutation.isPending}
                      className="w-32"
                    >
                      {translateTermMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Explaining</>
                      ) : (
                        'Explain'
                      )}
                    </Button>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClearTerm}
                    className="w-32"
                  >
                    Clear
                  </Button>
                </div>
                
                {termExplanation && (
                  <div className="grid gap-3 mt-4">
                    <label className="text-sm font-medium">Explanation</label>
                    <Alert className="bg-primary/10 border-primary/20">
                      <AlertDescription className="whitespace-pre-wrap">
                        <strong className="text-primary">{medicalTerm}:</strong> {termExplanation}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                
                {/* Common medical terms examples */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Common Medical Terms</h3>
                  <div className="flex flex-wrap gap-2">
                    {['dysphagia', 'esophageal cancer', 'Barrett\'s esophagus', 'endoscopy', 
                      'biopsy', 'chemotherapy', 'radiation therapy', 'metastasis'].map((term) => (
                      <Button 
                        key={term} 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setMedicalTerm(term);
                          translateTermMutation.mutate(term);
                        }}
                        className="text-xs"
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalTermTranslator;