import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Info, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';

// Treatment prediction result interface
interface TreatmentPrediction {
  treatmentName: string;
  treatmentType: string;
  description: string;
  effectivenessScore: number;
  confidenceInterval: [number, number];
  keySupportingFactors: string[];
  potentialChallenges: string[];
  comparisonToStandard: string;
  estimatedSurvivalBenefit?: string;
  qualityOfLifeImpact?: string;
  evidenceLevel: 'high' | 'moderate' | 'low';
  references: Array<{
    title: string;
    authors?: string;
    publication?: string;
    year?: number;
    url?: string;
  }>;
}

// Patient data form schema
const patientFormSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  age: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  gender: z.string().optional(),
  diagnosisDate: z.string().optional(),
  tumorCharacteristics: z.object({
    stage: z.string().optional(),
    grade: z.string().optional(),
    size: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    location: z.string().optional(),
    histology: z.string().optional(),
    histologicalSubtype: z.string().optional(),
    lymphNodeInvolvement: z.boolean().optional(),
    metastasis: z.boolean().optional()
  }).optional(),
  medicalHistory: z.object({
    comorbidities: z.array(z.string()).optional(),
    previousCancers: z.array(z.string()).optional(),
    previousTreatments: z.array(z.string()).optional(),
    familyHistory: z.array(z.string()).optional(),
    smokingHistory: z.enum(['never', 'former', 'current']).optional(),
    alcoholHistory: z.enum(['none', 'light', 'moderate', 'heavy']).optional()
  }).optional(),
  performanceStatus: z.string().optional()
});

type PatientFormData = z.infer<typeof patientFormSchema>;

const TreatmentPredictor = () => {
  const [activeTab, setActiveTab] = useState('patient-info');
  const [expandedTreatment, setExpandedTreatment] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<TreatmentPrediction[]>([]);
  const { toast } = useToast();

  // Initialize form
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      diagnosis: '',
      tumorCharacteristics: {
        lymphNodeInvolvement: false,
        metastasis: false
      },
      medicalHistory: {
        comorbidities: [],
        previousTreatments: []
      }
    }
  });

  // Treatment prediction mutation
  const predictMutation = useMutation<TreatmentPrediction[], Error, PatientFormData>({
    mutationFn: async (patientData: PatientFormData) => {
      return apiRequest<TreatmentPrediction[]>('/api/treatments/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientData }),
      });
    },
    onSuccess: (data) => {
      // Handle both array response and object response that contains an array
      let predictionsArray = Array.isArray(data) ? data : [];
      
      // If data is an object and not an array, try to extract arrays from it
      if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
        // Look for any array property in the response
        const arrayProps = Object.entries(data)
          .filter(([_, value]) => Array.isArray(value))
          .map(([_, value]) => value as TreatmentPrediction[]);
          
        if (arrayProps.length > 0) {
          // Use the first array found in the object
          predictionsArray = arrayProps[0];
        }
      }
      
      setPredictions(predictionsArray);
      setActiveTab('results');
      toast({
        title: "Treatment prediction complete",
        description: `${predictionsArray.length} potential treatments analyzed for effectiveness.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Prediction failed",
        description: error instanceof Error ? error.message : "Failed to predict treatment effectiveness.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: PatientFormData) => {
    predictMutation.mutate(data);
  };

  const toggleTreatmentDetails = (treatmentName: string) => {
    if (expandedTreatment === treatmentName) {
      setExpandedTreatment(null);
    } else {
      setExpandedTreatment(treatmentName);
    }
  };

  // Get badge color based on evidence level
  const getEvidenceBadgeColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get color for effectiveness score
  const getEffectivenessColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-lime-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Treatment Effectiveness Predictor</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="patient-info">Patient Information</TabsTrigger>
          <TabsTrigger value="results" disabled={predictions.length === 0}>
            Prediction Results
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="patient-info" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Profile</CardTitle>
              <CardDescription>
                Enter patient information to predict treatment effectiveness.
                The more complete the information, the more accurate the predictions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="diagnosis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diagnosis *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Esophageal Adenocarcinoma" {...field} />
                            </FormControl>
                            <FormDescription>
                              Specify the primary diagnosis
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="age"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Age</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="65" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="diagnosisDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diagnosis Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="performanceStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ECOG Performance Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">0 - Fully active</SelectItem>
                                <SelectItem value="1">1 - Restricted but ambulatory</SelectItem>
                                <SelectItem value="2">2 - Ambulatory, capable of self-care</SelectItem>
                                <SelectItem value="3">3 - Limited self-care</SelectItem>
                                <SelectItem value="4">4 - Completely disabled</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              ECOG scale measures a patient's level of functioning
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Tumor Characteristics */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Tumor Characteristics</h3>
                      
                      <FormField
                        control={form.control}
                        name="tumorCharacteristics.stage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stage</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">Stage 0</SelectItem>
                                <SelectItem value="I">Stage I</SelectItem>
                                <SelectItem value="II">Stage II</SelectItem>
                                <SelectItem value="III">Stage III</SelectItem>
                                <SelectItem value="IV">Stage IV</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="tumorCharacteristics.grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="G1">G1 - Well differentiated</SelectItem>
                                <SelectItem value="G2">G2 - Moderately differentiated</SelectItem>
                                <SelectItem value="G3">G3 - Poorly differentiated</SelectItem>
                                <SelectItem value="G4">G4 - Undifferentiated</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="tumorCharacteristics.size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tumor Size (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" placeholder="3.5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="tumorCharacteristics.location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Distal esophagus" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="tumorCharacteristics.histology"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Histology</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Adenocarcinoma" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex space-x-4 items-center">
                        <FormField
                          control={form.control}
                          name="tumorCharacteristics.lymphNodeInvolvement"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel>Lymph Node Involvement</FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="tumorCharacteristics.metastasis"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel>Metastasis</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Medical History Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Medical History</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="medicalHistory.smokingHistory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Smoking History</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="never">Never</SelectItem>
                                <SelectItem value="former">Former</SelectItem>
                                <SelectItem value="current">Current</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="medicalHistory.alcoholHistory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alcohol History</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="heavy">Heavy</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="mt-6" 
                    disabled={predictMutation.isPending}
                  >
                    {predictMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : 'Predict Treatment Effectiveness'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Effectiveness Predictions</CardTitle>
              <CardDescription>
                Analyzing {predictions.length} potential treatments for the specified patient profile.
                Results are based on clinical evidence and patient characteristics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictions.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No predictions available. Enter patient data to generate predictions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Sort predictions by effectiveness score descending */}
                  {[...predictions]
                    .sort((a, b) => b.effectivenessScore - a.effectivenessScore)
                    .map((prediction) => (
                      <Card key={prediction.treatmentName} className="overflow-hidden">
                        <div className="p-4 cursor-pointer" onClick={() => toggleTreatmentDetails(prediction.treatmentName)}>
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-medium">{prediction.treatmentName}</h3>
                              <p className="text-sm text-gray-500">{prediction.treatmentType}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className={getEvidenceBadgeColor(prediction.evidenceLevel || 'unknown')}>
                                {prediction.evidenceLevel ? 
                                  `${prediction.evidenceLevel.charAt(0).toUpperCase()}${prediction.evidenceLevel.slice(1)} Evidence` :
                                  'Evidence Level Unknown'
                                }
                              </Badge>
                              <span className="font-semibold">{prediction.effectivenessScore}%</span>
                              {expandedTreatment === prediction.treatmentName ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </div>
                          </div>
                          <Progress 
                            value={prediction.effectivenessScore} 
                            className={`h-2 mt-2 ${getEffectivenessColor(prediction.effectivenessScore)}`}
                          />
                        </div>
                        
                        {expandedTreatment === prediction.treatmentName && (
                          <div className="px-4 pb-4">
                            <Separator className="my-2" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-sm mb-4">{prediction.description}</p>
                                
                                <h4 className="font-medium mb-2">Key Supporting Factors</h4>
                                <ul className="list-disc list-inside text-sm space-y-1 mb-4">
                                  {prediction.keySupportingFactors?.map((factor, i) => (
                                    <li key={i} className="text-green-700">
                                      {factor}
                                    </li>
                                  )) || <li className="text-gray-500">No supporting factors provided</li>}
                                </ul>
                                
                                <h4 className="font-medium mb-2">Potential Challenges</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                  {prediction.potentialChallenges?.map((challenge, i) => (
                                    <li key={i} className="text-red-700">
                                      {challenge}
                                    </li>
                                  )) || <li className="text-gray-500">No potential challenges identified</li>}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Effectiveness Analysis</h4>
                                <div className="space-y-2 text-sm mb-4">
                                  <p>
                                    <span className="font-medium">Effectiveness Score:</span> {prediction.effectivenessScore ?? 'N/A'}% 
                                    {prediction.confidenceInterval ? 
                                      ` (Confidence Interval: ${prediction.confidenceInterval[0]}-${prediction.confidenceInterval[1]}%)` :
                                      ''}
                                  </p>
                                  <p>
                                    <span className="font-medium">Compared to Standard Care:</span> {prediction.comparisonToStandard || 'Comparison not available'}
                                  </p>
                                  {prediction.estimatedSurvivalBenefit && (
                                    <p>
                                      <span className="font-medium">Estimated Survival Benefit:</span> {prediction.estimatedSurvivalBenefit}
                                    </p>
                                  )}
                                  {prediction.qualityOfLifeImpact && (
                                    <p>
                                      <span className="font-medium">Quality of Life Impact:</span> {prediction.qualityOfLifeImpact}
                                    </p>
                                  )}
                                </div>
                                
                                <h4 className="font-medium mb-2">References</h4>
                                <div className="space-y-2 text-sm">
                                  {prediction.references?.length ? (
                                    prediction.references.map((ref, i) => (
                                      <div key={i} className="text-sm">
                                        <p className="font-medium">{ref.title}</p>
                                        {ref.authors && <p className="text-xs">{ref.authors}</p>}
                                        <p className="text-xs text-gray-500">
                                          {ref.publication} {ref.year && `(${ref.year})`}
                                        </p>
                                        {ref.url && (
                                          <a 
                                            href={ref.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-xs"
                                          >
                                            View Source
                                          </a>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-500">No references available</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('patient-info')}>
                Back to Patient Information
              </Button>
              <Button 
                variant="default" 
                onClick={() => {
                  // Reset form and go back to patient info tab
                  form.reset();
                  setPredictions([]);
                  setActiveTab('patient-info');
                }}
              >
                Start New Prediction
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TreatmentPredictor;