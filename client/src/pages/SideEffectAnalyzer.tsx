
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, AlertTriangle } from 'lucide-react';
import SideEffectProfile, { SideEffectProfile as SideEffectProfileType } from '@/components/SideEffectProfile';

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

interface SideEffectAnalyzerProps {
  inTabView?: boolean;
}

export default function SideEffectAnalyzer({ inTabView = false }: SideEffectAnalyzerProps) {
  const { toast } = useToast();
  const [sideEffectProfile, setSideEffectProfile] = useState<SideEffectProfileType | null>(null);

  const form = useForm<PatientSideEffectFormData>({
    resolver: zodResolver(patientSideEffectSchema),
    defaultValues: {
      treatmentName: '',
      comorbidities: [],
      allergies: [],
      currentMedications: [],
      priorAdverseReactions: []
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: PatientSideEffectFormData) => {
      const response = await apiRequest<SideEffectProfileType>('/api/treatments/side-effects/analyze', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response;
    },
    onSuccess: (data) => {
      setSideEffectProfile(data);
      toast({
        title: "Analysis Complete",
        description: "Side effect profile has been generated.",
        className: "bg-sophera-brand-primary text-white",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze side effects. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: PatientSideEffectFormData) => {
    analyzeMutation.mutate(data);
  };

  return (
    <div className={`space-y-8 ${!inTabView ? 'container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 md:py-12' : ''}`}>
      {!inTabView && (
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-sophera-text-heading">Side Effect Analyzer</h1>
          <p className="text-sophera-text-body">
            Analyze potential side effects based on your personal characteristics and treatment plan.
          </p>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-sophera-bg-card border-sophera-border-primary shadow-lg">
          <CardHeader>
            <CardTitle>Treatment Information</CardTitle>
            <CardDescription>Enter treatment details and personal characteristics</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="treatmentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter treatment name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Years" {...field} />
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
                              <SelectValue placeholder="Select gender" />
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

                <Button 
                  type="submit" 
                  className="w-full bg-sophera-brand-primary hover:bg-sophera-brand-primary-hover"
                  disabled={analyzeMutation.isPending}
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Side Effects'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {analyzeMutation.isPending ? (
            <Card className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Analyzing potential side effects...</p>
            </Card>
          ) : sideEffectProfile ? (
            <SideEffectProfile profile={sideEffectProfile} />
          ) : (
            <Card className="p-8 text-center bg-sophera-bg-card border-sophera-border-primary">
              <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-sophera-text-subtle" />
              <p className="text-sophera-text-body">
                Enter treatment information to analyze potential side effects
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
