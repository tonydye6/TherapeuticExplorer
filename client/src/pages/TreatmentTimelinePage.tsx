
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
    <div className="container mx-auto px-4 py-8 md:py-10 max-w-5xl">
      <h1 className="text-3xl lg:text-4xl font-extrabold mb-3 text-sophera-text-heading tracking-tight">Treatment Timeline</h1>
      <p className="text-lg text-sophera-text-body mb-8">Visualize the complete timeline for cancer treatments, including all phases and key milestones to help you plan and prepare.</p>
      
      {showTimeline && treatmentTimeline ? (
        <>
          <Card className="rounded-sophera-card border-sophera-border-primary shadow-lg bg-sophera-bg-card mb-8 overflow-hidden">
            <CardContent className="p-0">
              <TreatmentTimeline timeline={treatmentTimeline} />
            </CardContent>
          </Card>
          
          <div className="flex justify-end mt-8 gap-4">
            <Button
              variant="outline"
              className="rounded-sophera-button border-sophera-border-primary text-sophera-brand-primary hover:bg-sophera-brand-primary-light h-12 px-5"
              onClick={() => setShowTimeline(false)}
            >
              <FileText className="mr-2 h-5 w-5" />
              Edit Details
            </Button>
            <Button
              className="rounded-sophera-button bg-sophera-brand-primary hover:bg-sophera-brand-primary-dark text-white h-12 px-5 shadow-md"
              onClick={() => {
                form.reset();
                setShowTimeline(false);
                setTreatmentTimeline(null);
              }}
            >
              <Plus className="mr-2 h-5 w-5" />
              New Timeline
            </Button>
          </div>
        </>
      ) : (
        <Card className="rounded-sophera-card border-sophera-border-primary shadow-lg bg-sophera-bg-card overflow-hidden">
          <CardHeader className="bg-sophera-gradient-start/10 border-b border-sophera-border-soft px-6 py-5">
            <CardTitle className="text-2xl font-bold text-sophera-text-heading flex items-center">
              <Calendar className="h-6 w-6 mr-3 text-sophera-brand-primary" />
              Generate Treatment Timeline
            </CardTitle>
            <CardDescription className="text-sophera-text-body mt-1.5">
              Enter treatment information to visualize a complete timeline with all phases, milestones, and important events.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                {/* Treatment Information */}
                <div className="space-y-5">
                  <h3 className="text-xl font-semibold text-sophera-text-heading flex items-center">
                    <span className="w-1 h-5 bg-sophera-brand-primary rounded-full mr-2.5"></span>
                    Treatment Information
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="treatmentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sophera-text-heading font-medium">Treatment Name/Protocol *</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 border-sophera-border-primary rounded-sophera-input focus-visible:ring-sophera-brand-primary text-sophera-text-body bg-sophera-bg-input">
                                <SelectValue placeholder="Select or type a treatment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="border-sophera-border-primary rounded-sophera-card bg-sophera-bg-card">
                              {commonTreatments.map((treatment) => (
                                <SelectItem key={treatment} value={treatment} className="text-sophera-text-body focus:text-sophera-text-heading focus:bg-sophera-brand-primary/10">
                                  {treatment}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription className="text-sophera-text-subtle">
                          Choose a standard protocol or enter a custom treatment plan
                        </FormDescription>
                        <FormMessage className="text-sophera-accent-primary" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator className="bg-sophera-border-soft my-6" />
                
                {/* Patient Factors */}
                <div className="space-y-5">
                  <h3 className="text-xl font-semibold text-sophera-text-heading flex items-center">
                    <span className="w-1 h-5 bg-sophera-accent-secondary rounded-full mr-2.5"></span>
                    Patient Factors
                  </h3>
                  <p className="text-base text-sophera-text-body">
                    Adding patient-specific factors allows for a more tailored treatment timeline.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="patientFactors.age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sophera-text-heading font-medium">Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="65" 
                              {...field} 
                              className="h-12 border-sophera-border-primary rounded-sophera-input focus-visible:ring-sophera-brand-primary text-sophera-text-body bg-sophera-bg-input"
                            />
                          </FormControl>
                          <FormMessage className="text-sophera-accent-primary" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="patientFactors.performanceStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sophera-text-heading font-medium">ECOG Performance Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 border-sophera-border-primary rounded-sophera-input focus-visible:ring-sophera-brand-primary text-sophera-text-body bg-sophera-bg-input">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="border-sophera-border-primary rounded-sophera-card bg-sophera-bg-card">
                              <SelectItem value="0" className="text-sophera-text-body focus:text-sophera-text-heading focus:bg-sophera-brand-primary/10">0 - Fully active</SelectItem>
                              <SelectItem value="1" className="text-sophera-text-body focus:text-sophera-text-heading focus:bg-sophera-brand-primary/10">1 - Restricted but ambulatory</SelectItem>
                              <SelectItem value="2" className="text-sophera-text-body focus:text-sophera-text-heading focus:bg-sophera-brand-primary/10">2 - Ambulatory, capable of self-care</SelectItem>
                              <SelectItem value="3" className="text-sophera-text-body focus:text-sophera-text-heading focus:bg-sophera-brand-primary/10">3 - Limited self-care</SelectItem>
                              <SelectItem value="4" className="text-sophera-text-body focus:text-sophera-text-heading focus:bg-sophera-brand-primary/10">4 - Completely disabled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-sophera-accent-primary" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="patientFactors.stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sophera-text-heading font-medium">Cancer Stage</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 border-sophera-border-primary rounded-sophera-input focus-visible:ring-sophera-brand-primary text-sophera-text-body bg-sophera-bg-input">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-sophera-border-primary rounded-sophera-card bg-sophera-bg-card">
                            <SelectItem value="Stage I" className="text-sophera-text-body focus:text-sophera-text-heading focus:bg-sophera-brand-primary/10">Stage I</SelectItem>
                            <SelectItem value="Stage II" className="text-sophera-text-body focus:text-sophera-text-heading focus:bg-sophera-brand-primary/10">Stage II</SelectItem>
                            <SelectItem value="Stage III" className="text-sophera-text-body focus:text-sophera-text-heading focus:bg-sophera-brand-primary/10">Stage III</SelectItem>
                            <SelectItem value="Stage IVA" className="text-sophera-text-body focus:text-sophera-text-heading focus:bg-sophera-brand-primary/10">Stage IVA</SelectItem>
                            <SelectItem value="Stage IVB" className="text-sophera-text-body focus:text-sophera-text-heading focus:bg-sophera-brand-primary/10">Stage IVB</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-sophera-accent-primary" />
                      </FormItem>
                    )}
                  />
                  
                  {/* Comorbidities */}
                  <FormField
                    control={form.control}
                    name="patientFactors.comorbidities"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-sophera-text-heading font-medium">Comorbidities</FormLabel>
                        <div className="flex items-center gap-3 mb-3">
                          <Input
                            value={newComorbidity}
                            onChange={(e) => setNewComorbidity(e.target.value)}
                            placeholder="e.g., Diabetes, Hypertension"
                            className="flex-grow h-12 border-sophera-border-primary rounded-sophera-input focus-visible:ring-sophera-brand-primary text-sophera-text-body bg-sophera-bg-input"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={addComorbidity}
                            className="h-12 w-12 rounded-sophera-input border-sophera-border-primary hover:bg-sophera-brand-primary-light hover:text-sophera-brand-primary"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {form.watch('patientFactors.comorbidities')?.map((item, index) => (
                            <Badge 
                              key={index} 
                              className="gap-1.5 px-3 py-1.5 rounded-full bg-sophera-bg-secondary text-sophera-text-body border-sophera-border-soft"
                            >
                              {item}
                              <X
                                className="h-3.5 w-3.5 cursor-pointer hover:text-sophera-accent-primary"
                                onClick={() => removeComorbidity(index)}
                              />
                            </Badge>
                          ))}
                        </div>
                        <FormDescription className="text-sophera-text-subtle mt-2">
                          Add any existing medical conditions
                        </FormDescription>
                        <FormMessage className="text-sophera-accent-primary" />
                      </FormItem>
                    )}
                  />
                  
                  {/* Previous Treatments */}
                  <FormField
                    control={form.control}
                    name="patientFactors.previousTreatments"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-sophera-text-heading font-medium">Previous Treatments</FormLabel>
                        <div className="flex items-center gap-3 mb-3">
                          <Input
                            value={newPreviousTreatment}
                            onChange={(e) => setNewPreviousTreatment(e.target.value)}
                            placeholder="e.g., Chemotherapy, Surgery"
                            className="flex-grow h-12 border-sophera-border-primary rounded-sophera-input focus-visible:ring-sophera-brand-primary text-sophera-text-body bg-sophera-bg-input"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={addPreviousTreatment}
                            className="h-12 w-12 rounded-sophera-input border-sophera-border-primary hover:bg-sophera-brand-primary-light hover:text-sophera-brand-primary"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {form.watch('patientFactors.previousTreatments')?.map((item, index) => (
                            <Badge 
                              key={index} 
                              className="gap-1.5 px-3 py-1.5 rounded-full bg-sophera-bg-secondary text-sophera-text-body border-sophera-border-soft"
                            >
                              {item}
                              <X
                                className="h-3.5 w-3.5 cursor-pointer hover:text-sophera-accent-primary"
                                onClick={() => removePreviousTreatment(index)}
                              />
                            </Badge>
                          ))}
                        </div>
                        <FormMessage className="text-sophera-accent-primary" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Alert className="rounded-sophera-input bg-sophera-accent-tertiary/10 border-sophera-accent-tertiary/30 text-sophera-text-body">
                  <Info className="h-5 w-5 text-sophera-accent-tertiary" />
                  <AlertTitle className="text-sophera-text-heading font-medium">Privacy Notice</AlertTitle>
                  <AlertDescription>
                    This information is used only to generate the timeline and is not stored on our servers.
                  </AlertDescription>
                </Alert>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-sophera-brand-primary hover:bg-sophera-brand-primary-dark text-white rounded-sophera-button shadow-md"
                    disabled={generateTimelineMutation.isPending}
                  >
                    {generateTimelineMutation.isPending ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Generating Timeline...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-3 h-5 w-5" />
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
