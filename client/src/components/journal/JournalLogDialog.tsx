import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { JournalLog } from "@shared/schema";
import { commonSymptoms } from "@/lib/healthMetrics";

// UI Components
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, Plus, X } from "lucide-react";

const formSchema = z.object({
  entryDate: z.date(),
  content: z.string().min(1, "Please enter your journal entry"),
  mood: z.string().min(1, "Please select a mood"),
  energyLevel: z.number().min(1).max(5),
  sleepQuality: z.number().min(1).max(5),
  painLevel: z.number().min(0).max(5),
  symptoms: z.array(z.string()).optional(),
  medication: z.array(z.string()).optional(),
  foodDiary: z.string().optional(),
  images: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface JournalLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: FormValues) => void;
  initialData?: JournalLog;
  isLoading?: boolean;
}

const moods = ["Excellent", "Good", "Okay", "Fair", "Poor", "Terrible"];

export function JournalLogDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  initialData, 
  isLoading = false 
}: JournalLogDialogProps) {
  const [newSymptom, setNewSymptom] = useState("");
  const [newMedication, setNewMedication] = useState("");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entryDate: new Date(),
      content: "",
      mood: "Okay",
      energyLevel: 3,
      sleepQuality: 3,
      painLevel: 0,
      symptoms: [],
      medication: [],
      foodDiary: "",
      images: [],
    },
  });
  
  // Reset form when dialog opens/closes or when initial data changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Convert date string to Date object if needed
        const entryDate = typeof initialData.entryDate === 'string' 
          ? new Date(initialData.entryDate) 
          : initialData.entryDate;
          
        form.reset({
          entryDate,
          content: initialData.content,
          mood: initialData.mood,
          energyLevel: initialData.energyLevel,
          sleepQuality: initialData.sleepQuality,
          painLevel: initialData.painLevel,
          symptoms: initialData.symptoms || [],
          medication: initialData.medication || [],
          foodDiary: initialData.foodDiary || "",
          images: initialData.images || [],
        });
      } else {
        form.reset({
          entryDate: new Date(),
          content: "",
          mood: "Okay",
          energyLevel: 3,
          sleepQuality: 3,
          painLevel: 0,
          symptoms: [],
          medication: [],
          foodDiary: "",
          images: [],
        });
      }
    }
  }, [open, initialData, form]);
  
  const onSubmit = (values: FormValues) => {
    onSave(values);
  };
  
  // Handler for adding a symptom
  const handleAddSymptom = () => {
    if (newSymptom.trim() !== "") {
      const currentSymptoms = form.getValues("symptoms") || [];
      if (!currentSymptoms.includes(newSymptom.trim())) {
        form.setValue("symptoms", [...currentSymptoms, newSymptom.trim()]);
      }
      setNewSymptom("");
    }
  };
  
  // Handler for removing a symptom
  const handleRemoveSymptom = (symptom: string) => {
    const currentSymptoms = form.getValues("symptoms") || [];
    form.setValue("symptoms", currentSymptoms.filter(s => s !== symptom));
  };
  
  // Handler for adding a medication
  const handleAddMedication = () => {
    if (newMedication.trim() !== "") {
      const currentMedications = form.getValues("medication") || [];
      if (!currentMedications.includes(newMedication.trim())) {
        form.setValue("medication", [...currentMedications, newMedication.trim()]);
      }
      setNewMedication("");
    }
  };
  
  // Handler for removing a medication
  const handleRemoveMedication = (medication: string) => {
    const currentMedications = form.getValues("medication") || [];
    form.setValue("medication", currentMedications.filter(m => m !== medication));
  };
  
  // Handler for adding a common symptom
  const handleAddCommonSymptom = (symptom: string) => {
    const currentSymptoms = form.getValues("symptoms") || [];
    if (!currentSymptoms.includes(symptom)) {
      form.setValue("symptoms", [...currentSymptoms, symptom]);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Journal Entry" : "New Journal Entry"}</DialogTitle>
          <DialogDescription>
            Record how you're feeling, your symptoms, medications, and other health-related information.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Field */}
              <FormField
                control={form.control}
                name="entryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "MMMM d, yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Mood Field */}
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mood</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {moods.map((mood) => (
                        <Badge
                          key={mood}
                          variant="outline"
                          className={`cursor-pointer ${field.value === mood ? 'bg-primary-100 border-primary-500' : ''}`}
                          onClick={() => form.setValue("mood", mood)}
                        >
                          {mood}
                          {field.value === mood && (
                            <Check className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Content Field */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Journal Entry</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="How are you feeling today?" 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Energy Level Field */}
              <FormField
                control={form.control}
                name="energyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Energy Level (1-5)</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Very Low</span>
                      <span>Very High</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Sleep Quality Field */}
              <FormField
                control={form.control}
                name="sleepQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleep Quality (1-5)</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Very Poor</span>
                      <span>Excellent</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Pain Level Field */}
              <FormField
                control={form.control}
                name="painLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pain Level (0-5)</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>None</span>
                      <span>Extreme</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Symptoms Field */}
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptoms</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {field.value?.map((symptom) => (
                      <Badge key={symptom} variant="secondary">
                        {symptom}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveSymptom(symptom)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSymptom}
                      onChange={(e) => setNewSymptom(e.target.value)}
                      placeholder="Add a symptom"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSymptom();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddSymptom}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>
                    Common symptoms: 
                    <div className="flex flex-wrap gap-1 mt-1">
                      {commonSymptoms.slice(0, 8).map((symptom) => (
                        <Badge 
                          key={symptom} 
                          variant="outline" 
                          className="cursor-pointer"
                          onClick={() => handleAddCommonSymptom(symptom)}
                        >
                          {symptom}
                          <Plus className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Medications Field */}
            <FormField
              control={form.control}
              name="medication"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medications</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {field.value?.map((med) => (
                      <Badge key={med} variant="secondary">
                        {med}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveMedication(med)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      placeholder="Add a medication"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMedication();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddMedication}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Food Diary Field */}
            <FormField
              control={form.control}
              name="foodDiary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Diary (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What did you eat today?" 
                      className="min-h-20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
