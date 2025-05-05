import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { Slider } from "@/components/ui/slider";

interface TreatmentEffectivenessFormProps {
  isOpen: boolean;
  onClose: () => void;
  treatmentId: number;
  treatmentName: string;
  onSubmit: ({ treatmentId, assessment }: { treatmentId: number; assessment: any }) => void;
  isSubmitting: boolean;
}

// Effectiveness form schema
const formSchema = z.object({
  date: z.date(),
  rating: z.number().min(0).max(10),
  notes: z.string().optional(),
  metrics: z.record(z.string(), z.number()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TreatmentEffectivenessForm({
  isOpen,
  onClose,
  treatmentId,
  treatmentName,
  onSubmit,
  isSubmitting,
}: TreatmentEffectivenessFormProps) {
  const [metrics, setMetrics] = React.useState<{name: string; value: number}[]>([]);
  const [newMetricName, setNewMetricName] = React.useState("");
  const [newMetricValue, setNewMetricValue] = React.useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      rating: 5,
      notes: "",
      metrics: {},
    },
  });

  const handleSubmit = (values: FormValues) => {
    // Convert metrics array to object
    const metricsObject = metrics.reduce((acc, curr) => {
      acc[curr.name] = curr.value;
      return acc;
    }, {} as Record<string, number>);

    onSubmit({
      treatmentId,
      assessment: {
        ...values,
        metrics: metricsObject,
      },
    });
  };

  const addMetric = () => {
    if (newMetricName.trim() === "" || newMetricValue.trim() === "") return;
    
    const value = parseFloat(newMetricValue);
    if (isNaN(value)) return;
    
    setMetrics([...metrics, { name: newMetricName, value }]);
    setNewMetricName("");
    setNewMetricValue("");
  };

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Treatment Effectiveness</DialogTitle>
          <DialogDescription>
            How effective is {treatmentName} right now?
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Assessment Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant={"outline"}
                          className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select date</span>
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
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Effectiveness (0-10)</FormLabel>
                  <div className="pt-2">
                    <FormControl>
                      <div className="flex flex-col space-y-2">
                        <Slider
                          min={0}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Not Effective (0)</span>
                          <span>Moderate (5)</span>
                          <span>Very Effective (10)</span>
                        </div>
                      </div>
                    </FormControl>
                  </div>
                  <div className="text-center font-medium mt-2">
                    Rating: {field.value}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border p-4 rounded-md">
              <FormLabel className="block mb-2">Health Metrics (Optional)</FormLabel>
              <div className="space-y-2">
                {metrics.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center bg-muted p-2 rounded">
                    <div>
                      <span className="font-medium">{metric.name}:</span> {metric.value}
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeMetric(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Metric name (e.g., Tumor Marker)" 
                    value={newMetricName}
                    onChange={(e) => setNewMetricName(e.target.value)}
                    className="flex-1"
                  />
                  <Input 
                    placeholder="Value" 
                    type="number"
                    value={newMetricValue}
                    onChange={(e) => setNewMetricValue(e.target.value)}
                    className="w-24"
                  />
                  <Button type="button" variant="outline" onClick={addMetric}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add lab values, biomarkers, or other measurable indicators of treatment effectiveness
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes about how the treatment is working, your overall feeling, etc."
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
