import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { AlternativeTreatment, insertAlternativeTreatmentSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Create a form schema extending the insert schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  background: z.string().optional(),
  traditionalUsage: z.string().optional(),
  mechanismOfAction: z.string().optional(),
  scientificEvidence: z.string().optional(),
  cancerSpecificEvidence: z.string().optional(),
  safetyProfile: z.string().optional(),
  contraindications: z.string().optional(),
  interactions: z.string().optional(),
  practitionerRequirements: z.string().optional(),
  recommendedBy: z.string().optional(),
  patientExperiences: z.string().optional(),
  evidenceRating: z.string().optional(),
  safetyRating: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string().url({ message: "Please enter a valid URL" }).optional(),
    author: z.string().optional(),
    year: z.number().optional(),
    publisher: z.string().optional(),
  })).optional(),
  isFavorite: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface AlternativeTreatmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<AlternativeTreatment>;
}

const CATEGORIES = [
  "Herbal Compounds and Plant Extracts",
  "Alt Protocols",
  "Biological",
  "Nutritional Therapy",
  "Mind-Body Therapy",
  "Traditional Chinese Medicine",
  "Ayurvedic Medicine",
  "Naturopathy",
  "Homeopathy",
  "Energy Healing",
  "Manual Therapy",
  "Other"
];

const EVIDENCE_RATINGS = ["Strong", "Moderate", "Limited", "Preliminary", "Anecdotal", "Insufficient"];
const SAFETY_RATINGS = ["Very Safe", "Generally Safe", "Safe with Precautions", "Use with Caution", "Potentially Harmful"];

export default function AlternativeTreatmentForm({ 
  onSuccess, 
  onCancel,
  initialData = {} 
}: AlternativeTreatmentFormProps) {
  const [sources, setSources] = useState<{title: string; url?: string; author?: string; year?: number; publisher?: string}[]>(
    initialData.sources as any[] || [{ title: "", url: "" }]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form with default values or initial data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || "",
      category: initialData.category || "",
      description: initialData.description || "",
      background: initialData.background || "",
      traditionalUsage: initialData.traditionalUsage || "",
      mechanismOfAction: initialData.mechanismOfAction || "",
      scientificEvidence: initialData.scientificEvidence || "",
      cancerSpecificEvidence: initialData.cancerSpecificEvidence || "",
      safetyProfile: initialData.safetyProfile || "",
      contraindications: initialData.contraindications || "",
      interactions: initialData.interactions || "",
      practitionerRequirements: initialData.practitionerRequirements || "",
      recommendedBy: initialData.recommendedBy || "",
      patientExperiences: initialData.patientExperiences || "",
      evidenceRating: initialData.evidenceRating || "",
      safetyRating: initialData.safetyRating || "",
      tags: initialData.tags as string[] || [],
      sources: sources,
      isFavorite: initialData.isFavorite || false
    }
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      const payload = {
        ...values,
        sources: sources.filter(s => s.title), // Filter out empty sources
      };

      await apiRequest<AlternativeTreatment>('/api/alternative-treatments', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      toast({
        title: "Treatment added successfully",
        description: "The alternative treatment has been added to your collection.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding treatment:', error);
      toast({
        title: "Error adding treatment",
        description: "There was a problem adding the alternative treatment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSource = () => {
    setSources([...sources, { title: "", url: "" }]);
  };

  const updateSource = (index: number, field: string, value: string | number) => {
    const newSources = [...sources];
    newSources[index] = { ...newSources[index], [field]: value };
    setSources(newSources);
  };

  const removeSource = (index: number) => {
    const newSources = [...sources];
    newSources.splice(index, 1);
    setSources(newSources);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Treatment name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Brief description of the treatment"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Background & Usage */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Background & Usage</h3>
            
            <FormField
              control={form.control}
              name="background"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historical Background</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Historical and cultural context"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="traditionalUsage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Traditional Usage</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="How this treatment has been traditionally used"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Scientific Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Scientific Information</h3>
            
            <FormField
              control={form.control}
              name="mechanismOfAction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mechanism of Action</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="How the treatment is believed to work"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="scientificEvidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scientific Evidence</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Overview of scientific research on this treatment"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cancerSpecificEvidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancer-Specific Evidence</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Evidence related specifically to cancer treatment"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Safety Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Safety Information</h3>
            
            <FormField
              control={form.control}
              name="safetyProfile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Safety Profile</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="General safety information"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contraindications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraindications</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Conditions where this treatment should not be used"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="interactions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interactions</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Interactions with medications or other treatments"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Practical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Practical Information</h3>
            
            <FormField
              control={form.control}
              name="practitionerRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Practitioner Requirements</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Qualifications for practitioners who administer this treatment"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="recommendedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommended By</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Organizations or experts who recommend this treatment"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="patientExperiences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Experiences</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Summary of patient reports and experiences"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Ratings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ratings</h3>
            
            <FormField
              control={form.control}
              name="evidenceRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidence Rating</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EVIDENCE_RATINGS.map(rating => (
                        <SelectItem key={rating} value={rating}>
                          {rating}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Rate the strength of scientific evidence for this treatment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="safetyRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Safety Rating</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SAFETY_RATINGS.map(rating => (
                        <SelectItem key={rating} value={rating}>
                          {rating}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Rate the overall safety of this treatment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Sources */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-medium">Sources</h3>
            
            <div className="space-y-4">
              {sources.map((source, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormLabel htmlFor={`source-title-${index}`}>Title</FormLabel>
                      <Input
                        id={`source-title-${index}`}
                        placeholder="Source title"
                        value={source.title}
                        onChange={(e) => updateSource(index, 'title', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <FormLabel htmlFor={`source-url-${index}`}>URL</FormLabel>
                      <Input
                        id={`source-url-${index}`}
                        placeholder="Source URL"
                        value={source.url || ''}
                        onChange={(e) => updateSource(index, 'url', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <FormLabel htmlFor={`source-author-${index}`}>Author</FormLabel>
                      <Input
                        id={`source-author-${index}`}
                        placeholder="Author"
                        value={source.author || ''}
                        onChange={(e) => updateSource(index, 'author', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <FormLabel htmlFor={`source-year-${index}`}>Year</FormLabel>
                      <Input
                        id={`source-year-${index}`}
                        placeholder="Publication year"
                        type="number"
                        value={source.year || ''}
                        onChange={(e) => updateSource(index, 'year', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <FormLabel htmlFor={`source-publisher-${index}`}>Publisher</FormLabel>
                      <Input
                        id={`source-publisher-${index}`}
                        placeholder="Publisher"
                        value={source.publisher || ''}
                        onChange={(e) => updateSource(index, 'publisher', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSource(index)}
                      disabled={sources.length <= 1}
                    >
                      Remove Source
                    </Button>
                  </div>
                </Card>
              ))}
              
              <Button type="button" variant="outline" onClick={addSource}>
                Add Source
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Treatment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}