import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, AlertTriangle, Plus, X } from 'lucide-react';
import SideEffectProfile, { SideEffectProfile as SideEffectProfileType } from '@/components/SideEffectProfile';

// Patient characteristics schema for side effect analysis
const patientSideEffectSchema = z.object({
  treatmentName: z.string().min(1, 'Treatment name is required'),
  age: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  gender: z.string().optional(),
  performanceStatus: z.string().optional(),
  height: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  weight: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  smokingStatus: z.string().optional(),
  alcoholUse: z.string().optional(),
  comorbidities: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  priorAdverseReactions: z.array(z.string()).optional()
});

type PatientSideEffectFormData = z.infer<typeof patientSideEffectSchema>;

const SideEffectAnalyzer = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('patient-info');
  const [sideEffectProfile, setSideEffectProfile] = useState<SideEffectProfileType | null>(null);
  
  // For dynamic fields (comorbidities, medications, etc.)
  const [newComorbidity, setNewComorbidity] = useState<string>('');
  const [newAllergy, setNewAllergy] = useState<string>('');
  const [newMedication, setNewMedication] = useState<string>('');
  const [newAdverseReaction, setNewAdverseReaction] = useState<string>('');

  // Form setup
  const form = useForm<PatientSideEffectFormData>({
    resolver: zodResolver(patientSideEffectSchema),
    defaultValues: {
      treatmentName: '',
      age: undefined,
      gender: undefined,
      performanceStatus: undefined,
      height: undefined,
      weight: undefined,
      smokingStatus: undefined,
      alcoholUse: undefined,
      comorbidities: [],
      allergies: [],
      currentMedications: [],
      priorAdverseReactions: []
    }
  });

  // Side effect analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async (patientData: PatientSideEffectFormData) => {
      const { treatmentName, ...patientCharacteristics } = patientData;
      
      return apiRequest<SideEffectProfileType>('/api/treatments/side-effects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          treatmentName, 
          patientCharacteristics 
        }),
      });
    },
    onSuccess: (data) => {
      setSideEffectProfile(data);
      setActiveTab('results');
      toast({
        title: "Side effect analysis complete",
        description: `Analysis of potential side effects for ${data.treatmentName} has been completed.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze side effects.",
        variant: "destructive",
      });
    }
  });

  // Submit handler
  const handleSubmit = (data: PatientSideEffectFormData) => {
    analyzeMutation.mutate(data);
  };

  // Handlers for dynamic fields
  const addComorbidity = () => {
    if (newComorbidity && newComorbidity.trim()) {
      const currentValues = form.getValues('comorbidities') || [];
      form.setValue('comorbidities', [...currentValues, newComorbidity.trim()]);
      setNewComorbidity('');
    }
  };

  const removeComorbidity = (index: number) => {
    const currentValues = form.getValues('comorbidities') || [];
    form.setValue('comorbidities', currentValues.filter((_, i) => i !== index));
  };

  const addAllergy = () => {
    if (newAllergy && newAllergy.trim()) {
      const currentValues = form.getValues('allergies') || [];
      form.setValue('allergies', [...currentValues, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    const currentValues = form.getValues('allergies') || [];
    form.setValue('allergies', currentValues.filter((_, i) => i !== index));
  };

  const addMedication = () => {
    if (newMedication && newMedication.trim()) {
      const currentValues = form.getValues('currentMedications') || [];
      form.setValue('currentMedications', [...currentValues, newMedication.trim()]);
      setNewMedication('');
    }
  };

  const removeMedication = (index: number) => {
    const currentValues = form.getValues('currentMedications') || [];
    form.setValue('currentMedications', currentValues.filter((_, i) => i !== index));
  };

  const addAdverseReaction = () => {
    if (newAdverseReaction && newAdverseReaction.trim()) {
      const currentValues = form.getValues('priorAdverseReactions') || [];
      form.setValue('priorAdverseReactions', [...currentValues, newAdverseReaction.trim()]);
      setNewAdverseReaction('');
    }
  };

  const removeAdverseReaction = (index: number) => {
    const currentValues = form.getValues('priorAdverseReactions') || [];
    form.setValue('priorAdverseReactions', currentValues.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Side Effect Analyzer</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="patient-info">Treatment & Patient Information</TabsTrigger>
          <TabsTrigger value="results" disabled={!sideEffectProfile}>
            Side Effect Profile
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="patient-info" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Side Effect Risk Analysis</CardTitle>
              <CardDescription>
                Enter patient information and treatment details to analyze potential side effects.
                More complete information leads to more accurate side effect predictions.
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
                          <FormLabel>Treatment Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Cisplatin + 5-FU Chemotherapy" {...field} />
                          </FormControl>
                          <FormDescription>
                            Specify the treatment to analyze for side effects
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Basic Patient Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Patient Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="175" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="70" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="smokingStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Smoking Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="never">Never smoker</SelectItem>
                                <SelectItem value="former">Former smoker</SelectItem>
                                <SelectItem value="current">Current smoker</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="alcoholUse"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alcohol Use</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="occasional">Occasional (1-2 drinks/week)</SelectItem>
                                <SelectItem value="moderate">Moderate (3-7 drinks/week)</SelectItem>
                                <SelectItem value="heavy">Heavy (7+ drinks/week)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Medical History</h3>
                    
                    {/* Comorbidities */}
                    <FormField
                      control={form.control}
                      name="comorbidities"
                      render={() => (
                        <FormItem>
                          <FormLabel>Comorbidities</FormLabel>
                          <div className="flex items-center gap-2 mb-2">
                            <Input 
                              value={newComorbidity}
                              onChange={e => setNewComorbidity(e.target.value)}
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
                            {form.watch('comorbidities')?.map((item, index) => (
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
                    
                    {/* Allergies */}
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={() => (
                        <FormItem>
                          <FormLabel>Allergies</FormLabel>
                          <div className="flex items-center gap-2 mb-2">
                            <Input 
                              value={newAllergy}
                              onChange={e => setNewAllergy(e.target.value)}
                              placeholder="e.g., Penicillin, Sulfa drugs"
                              className="flex-grow"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={addAllergy}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {form.watch('allergies')?.map((item, index) => (
                              <Badge key={index} variant="secondary" className="gap-1 px-3 py-1">
                                {item}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => removeAllergy(index)}
                                />
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Current Medications */}
                    <FormField
                      control={form.control}
                      name="currentMedications"
                      render={() => (
                        <FormItem>
                          <FormLabel>Current Medications</FormLabel>
                          <div className="flex items-center gap-2 mb-2">
                            <Input 
                              value={newMedication}
                              onChange={e => setNewMedication(e.target.value)}
                              placeholder="e.g., Metformin, Lisinopril"
                              className="flex-grow"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={addMedication}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {form.watch('currentMedications')?.map((item, index) => (
                              <Badge key={index} variant="secondary" className="gap-1 px-3 py-1">
                                {item}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => removeMedication(index)}
                                />
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Prior Adverse Reactions */}
                    <FormField
                      control={form.control}
                      name="priorAdverseReactions"
                      render={() => (
                        <FormItem>
                          <FormLabel>Prior Adverse Reactions</FormLabel>
                          <div className="flex items-center gap-2 mb-2">
                            <Input 
                              value={newAdverseReaction}
                              onChange={e => setNewAdverseReaction(e.target.value)}
                              placeholder="e.g., Nausea with previous chemotherapy"
                              className="flex-grow"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={addAdverseReaction}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {form.watch('priorAdverseReactions')?.map((item, index) => (
                              <Badge key={index} variant="secondary" className="gap-1 px-3 py-1">
                                {item}
                                <X
                                  className="h-3 w-3 cursor-pointer"
                                  onClick={() => removeAdverseReaction(index)}
                                />
                              </Badge>
                            ))}
                          </div>
                          <FormDescription>
                            List any previous adverse reactions to medications or treatments
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={analyzeMutation.isPending}
                    >
                      {analyzeMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing Side Effects...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Analyze Side Effects
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="results" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {!sideEffectProfile ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No side effect analysis data available. Enter treatment and patient information to generate analysis.</p>
                </div>
              ) : (
                <SideEffectProfile profile={sideEffectProfile} />
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
                  setSideEffectProfile(null);
                  setActiveTab('patient-info');
                }}
              >
                Start New Analysis
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SideEffectAnalyzer;