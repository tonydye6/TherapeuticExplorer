import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DietLog } from "@shared/schema";
import { mealTypes, foodCategories } from "@/lib/healthMetrics";

// UI Components
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, Clock, Plus, X } from "lucide-react";

const formSchema = z.object({
  mealDate: z.date(),
  mealType: z.string().min(1, "Please select a meal type"),
  foodItems: z.array(z.string()).min(1, "Please add at least one food item"),
  calories: z.number().min(0, "Calories must be 0 or higher"),
  carbs: z.number().min(0, "Carbs must be 0 or higher"),
  protein: z.number().min(0, "Protein must be 0 or higher"),
  fat: z.number().min(0, "Fat must be 0 or higher"),
  notes: z.string().optional(),
  images: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DietLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: FormValues) => void;
  initialData?: DietLog;
  isLoading?: boolean;
}

export function DietLogDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  initialData, 
  isLoading = false 
}: DietLogDialogProps) {
  // State for managing the new food item input
  const [newFoodItem, setNewFoodItem] = useState("");
  const [mealTime, setMealTime] = useState<Date | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mealDate: new Date(),
      mealType: "Breakfast",
      foodItems: [],
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      notes: "",
      images: [],
    },
  });
  
  // Reset form when dialog opens/closes or when initial data changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Convert date string to Date object if needed
        const mealDate = typeof initialData.mealDate === 'string' 
          ? new Date(initialData.mealDate) 
          : initialData.mealDate;
        
        setMealTime(mealDate);
        
        form.reset({
          mealDate,
          mealType: initialData.mealType,
          foodItems: initialData.foodItems || [],
          calories: initialData.calories,
          carbs: initialData.carbs,
          protein: initialData.protein,
          fat: initialData.fat,
          notes: initialData.notes || "",
          images: initialData.images || [],
        });
      } else {
        setMealTime(new Date());
        form.reset({
          mealDate: new Date(),
          mealType: "Breakfast",
          foodItems: [],
          calories: 0,
          carbs: 0,
          protein: 0,
          fat: 0,
          notes: "",
          images: [],
        });
      }
    }
  }, [open, initialData, form]);
  
  const onSubmit = (values: FormValues) => {
    // Combine the date and time
    if (mealTime) {
      const combinedDate = new Date(values.mealDate);
      combinedDate.setHours(mealTime.getHours());
      combinedDate.setMinutes(mealTime.getMinutes());
      values.mealDate = combinedDate;
    }
    
    onSave(values);
  };
  
  // Handler for adding a food item
  const handleAddFoodItem = () => {
    if (newFoodItem.trim() !== "") {
      const currentFoodItems = form.getValues("foodItems") || [];
      if (!currentFoodItems.includes(newFoodItem.trim())) {
        form.setValue("foodItems", [...currentFoodItems, newFoodItem.trim()]);
      }
      setNewFoodItem("");
    }
  };
  
  // Handler for removing a food item
  const handleRemoveFoodItem = (item: string) => {
    const currentFoodItems = form.getValues("foodItems") || [];
    form.setValue("foodItems", currentFoodItems.filter(food => food !== item));
  };
  
  // Handler for handling time selection
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [hours, minutes] = e.target.value.split(':').map(Number);
      const newTime = new Date();
      newTime.setHours(hours);
      newTime.setMinutes(minutes);
      setMealTime(newTime);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Meal Entry" : "New Meal Entry"}</DialogTitle>
          <DialogDescription>
            Record what you ate, nutritional information, and notes about how the meal made you feel.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Field */}
              <FormField
                control={form.control}
                name="mealDate"
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
              
              {/* Time Input */}
              <FormItem>
                <FormLabel>Time</FormLabel>
                <div className="flex">
                  <div className="relative w-full">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="time"
                      className="pl-9"
                      value={mealTime ? `${mealTime.getHours().toString().padStart(2, '0')}:${mealTime.getMinutes().toString().padStart(2, '0')}` : ""}
                      onChange={handleTimeChange}
                    />
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            </div>
            
            {/* Meal Type */}
            <FormField
              control={form.control}
              name="mealType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a meal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mealTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Food Items */}
            <FormField
              control={form.control}
              name="foodItems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Items</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {field.value?.map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveFoodItem(item)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newFoodItem}
                      onChange={(e) => setNewFoodItem(e.target.value)}
                      placeholder="Add a food item"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddFoodItem();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddFoodItem}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription>
                    Add each food item you ate during this meal.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Quick Add Categories */}
            <div>
              <p className="text-sm font-medium mb-1">Categories:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {foodCategories.map((category) => (
                  <Badge 
                    key={category} 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => {
                      setNewFoodItem(category);
                    }}
                  >
                    {category}
                    <Plus className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Nutrition Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Calories */}
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Carbs */}
              <FormField
                control={form.control}
                name="carbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbs (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Protein */}
              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Fat */}
              <FormField
                control={form.control}
                name="fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fat (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="How did this meal make you feel? Any digestive issues?" 
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
