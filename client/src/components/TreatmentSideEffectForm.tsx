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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Slider } from "@/components/ui/slider";

interface TreatmentSideEffectFormProps {
  isOpen: boolean;
  onClose: () => void;
  treatmentId: number;
  treatmentName: string;
  onSubmit: ({ treatmentId, sideEffect }: { treatmentId: number; sideEffect: any }) => void;
  isSubmitting: boolean;
}

// Side effect form schema
const formSchema = z.object({
  date: z.date(),
  type: z.string().min(1, { message: "Please select a side effect type" }),
  severity: z.number().min(0).max(10),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TreatmentSideEffectForm({
  isOpen,
  onClose,
  treatmentId,
  treatmentName,
  onSubmit,
  isSubmitting,
}: TreatmentSideEffectFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      type: "",
      severity: 5,
      notes: "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      treatmentId,
      sideEffect: values,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Side Effect</DialogTitle>
          <DialogDescription>
            Record a side effect for {treatmentName}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Observed</FormLabel>
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Side Effect Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select side effect type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="nausea">Nausea</SelectItem>
                      <SelectItem value="fatigue">Fatigue</SelectItem>
                      <SelectItem value="pain">Pain</SelectItem>
                      <SelectItem value="skin_reaction">Skin Reaction</SelectItem>
                      <SelectItem value="headache">Headache</SelectItem>
                      <SelectItem value="diarrhea">Diarrhea</SelectItem>
                      <SelectItem value="constipation">Constipation</SelectItem>
                      <SelectItem value="loss_of_appetite">Loss of Appetite</SelectItem>
                      <SelectItem value="neuropathy">Neuropathy</SelectItem>
                      <SelectItem value="hair_loss">Hair Loss</SelectItem>
                      <SelectItem value="vomiting">Vomiting</SelectItem>
                      <SelectItem value="fever">Fever</SelectItem>
                      <SelectItem value="chills">Chills</SelectItem>
                      <SelectItem value="swelling">Swelling</SelectItem>
                      <SelectItem value="dizziness">Dizziness</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity (0-10)</FormLabel>
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
                          <span>Mild (0)</span>
                          <span>Moderate (5)</span>
                          <span>Severe (10)</span>
                        </div>
                      </div>
                    </FormControl>
                  </div>
                  <div className="text-center font-medium mt-2">
                    Current: {field.value}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this side effect"
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
