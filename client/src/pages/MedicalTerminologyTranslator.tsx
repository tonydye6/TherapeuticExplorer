import MedicalTermTranslator from '@/components/MedicalTermTranslator';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, ArrowRight } from 'lucide-react';

const MedicalTerminologyTranslatorPage = () => {
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Medical Terminology Translator</h1>
        <p className="text-gray-600 mt-2">
          Understand complex medical language with our one-click translation tools.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-4 mt-1 bg-orange-100 p-2 rounded-md">
                <Lightbulb className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Why translate medical terms?</h3>
                <p className="text-sm text-gray-600">
                  Medical terminology can be confusing. Our translator helps you understand
                  your diagnosis, treatment options, and medical documents in plain language.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-4 mt-1 bg-blue-100 p-2 rounded-md">
                <ArrowRight className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Translate entire documents</h3>
                <p className="text-sm text-gray-600">
                  Paste any medical text - from doctor's notes to research papers - 
                  and get a patient-friendly version instantly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-100">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <div className="mr-4 mt-1 bg-green-100 p-2 rounded-md">
                <ArrowRight className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Explain specific terms</h3>
                <p className="text-sm text-gray-600">
                  Not sure what a specific medical term means? Use our single-term
                  translator for detailed, easy-to-understand explanations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <MedicalTermTranslator />
    </div>
  );
};

export default MedicalTerminologyTranslatorPage;