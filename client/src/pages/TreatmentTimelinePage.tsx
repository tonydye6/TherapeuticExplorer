import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Info, CheckCircle2, AlertCircle, Calendar, Plus, X, FileText } from 'lucide-react';
import TreatmentTimeline, { TreatmentTimeline as TreatmentTimelineType } from '@/components/TreatmentTimeline';

// Form schema for treatment timeline generation
const timelineFormSchema = z.object({
  treatmentName: z.string().min(1, 'Treatment name is required'),
  patientFactors: z.object({
    age: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
    performanceStatus: z.string().optional(),
    stage: z.string().optional(),
    comorbidities: z.array(z.string()).optional(),
    previousTreatments: z.array(z.string()).optional(),
  }),
});

type TimelineFormData = z.infer<typeof timelineFormSchema>;

const TreatmentTimelinePage = () => {
  const { toast } = useToast();
  const [treatmentTimeline, setTreatmentTimeline] = useState<TreatmentTimelineType | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  
  // For dynamic fields
  const [newComorbidity, setNewComorbidity] = useState<string>('');
  const [newPreviousTreatment, setNewPreviousTreatment] = useState<string>('');
  
  // Form setup
  const form = useForm<TimelineFormData>({
    resolver: zodResolver(timelineFormSchema),
    defaultValues: {
      treatmentName: '',
      patientFactors: {
        age: undefined,
        performanceStatus: undefined,
        stage: undefined,
        comorbidities: [],
        previousTreatments: [],
      },
    },
  });
  
  // Timeline generation mutation
  const generateTimelineMutation = useMutation({
    mutationFn: async (data: TimelineFormData) => {
      return apiRequest<TreatmentTimelineType>('/api/treatments/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setTreatmentTimeline(data);
      setShowTimeline(true);
      toast({
        title: "Timeline generated",
        description: `Treatment timeline for ${data.treatmentName} has been generated successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate timeline",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  });
  
  // Submit handler
  const handleSubmit = (data: TimelineFormData) => {
    generateTimelineMutation.mutate(data);
  };
  
  // Handlers for dynamic fields
  const addComorbidity = () => {
    if (newComorbidity && newComorbidity.trim()) {
      const currentValues = form.getValues('patientFactors.comorbidities') || [];
      form.setValue('patientFactors.comorbidities', [...currentValues, newComorbidity.trim()]);
      setNewComorbidity('');
    }
  };
  
  const removeComorbidity = (index: number) => {
    const currentValues = form.getValues('patientFactors.comorbidities') || [];
    form.setValue('patientFactors.comorbidities', currentValues.filter((_, i) => i !== index));
  };
  
  const addPreviousTreatment = () => {
    if (newPreviousTreatment && newPreviousTreatment.trim()) {
      const currentValues = form.getValues('patientFactors.previousTreatments') || [];
      form.setValue('patientFactors.previousTreatments', [...currentValues, newPreviousTreatment.trim()]);
      setNewPreviousTreatment('');
    }
  };
  
  const removePreviousTreatment = (index: number) => {
    const currentValues = form.getValues('patientFactors.previousTreatments') || [];
    form.setValue('patientFactors.previousTreatments', currentValues.filter((_, i) => i !== index));
  };
  
  // Example treatments for autocomplete
  const commonTreatments = [
    "Trimodality (Chemoradiation + Surgery)",
    "Definitive Chemoradiation",
    "CROSS Protocol",
    "Esophagectomy",
    "FLOT Chemotherapy",
    "Cisplatin + 5-FU Chemotherapy",
    "Carboplatin + Paclitaxel + Radiation",
    "Immunotherapy (Pembrolizumab)",
    "FOLFOX Chemotherapy",
    "ECF/ECX Chemotherapy"
  ];
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">Treatment Timeline</h1>
      <p className="text-gray-600 mb-6">Visualize the complete timeline for esophageal cancer treatments, including all phases and key milestones.</p>
      
      {showTimeline && treatmentTimeline ? (
        <>
          <TreatmentTimeline timeline={treatmentTimeline} />
          
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              className="mr-2"
              onClick={() => setShowTimeline(false)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Edit Details
            </Button>
            <Button
              variant="default"
              onClick={() => {
                form.reset();
                setShowTimeline(false);
                setTreatmentTimeline(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Timeline
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Generate Treatment Timeline</CardTitle>
            <CardDescription>
              Enter treatment information to visualize a complete timeline with all phases, milestones, and important events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Treatment Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Treatment Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="treatmentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treatment Name/Protocol *</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select or type a treatment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {commonTreatments.map((treatment) => (
                                <SelectItem key={treatment} value={treatment}>
                                  {treatment}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Choose a standard protocol or enter a custom treatment plan
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                {/* Patient Factors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Patient Factors</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Adding patient-specific factors allows for a more tailored treatment timeline.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patientFactors.age"
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
                      name="patientFactors.performanceStatus"
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="patientFactors.stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cancer Stage</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Stage I">Stage I</SelectItem>
                            <SelectItem value="Stage II">Stage II</SelectItem>
                            <SelectItem value="Stage III">Stage III</SelectItem>
                            <SelectItem value="Stage IVA">Stage IVA</SelectItem>
                            <SelectItem value="Stage IVB">Stage IVB</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Comorbidities */}
                  <FormField
                    control={form.control}
                    name="patientFactors.comorbidities"
                    render={() => (
                      <FormItem>
                        <FormLabel>Comorbidities</FormLabel>
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            value={newComorbidity}
                            onChange={(e) => setNewComorbidity(e.target.value)}
                            placeholder="e.g., Diabetes, Hypertension"
                            className="flex-grow"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addComorbidity}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch('patientFactors.comorbidities')?.map((item, index) => (
                            <Badge key={index} variant="secondary" className="gap-1 px-3 py-1">
                              {item}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removeComorbidity(index)}
                              />
                            </Badge>
                          ))}
                        </div>
                        <FormDescription>
                          Add any existing medical conditions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Previous Treatments */}
                  <FormField
                    control={form.control}
                    name="patientFactors.previousTreatments"
                    render={() => (
                      <FormItem>
                        <FormLabel>Previous Treatments</FormLabel>
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            value={newPreviousTreatment}
                            onChange={(e) => setNewPreviousTreatment(e.target.value)}
                            placeholder="e.g., Chemotherapy, Surgery"
                            className="flex-grow"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addPreviousTreatment}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch('patientFactors.previousTreatments')?.map((item, index) => (
                            <Badge key={index} variant="secondary" className="gap-1 px-3 py-1">
                              {item}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removePreviousTreatment(index)}
                              />
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle>Privacy Notice</AlertTitle>
                  <AlertDescription>
                    This information is used only to generate the timeline and is not stored on our servers.
                  </AlertDescription>
                </Alert>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={generateTimelineMutation.isPending}
                  >
                    {generateTimelineMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Timeline...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Generate Treatment Timeline
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TreatmentTimelinePage;