import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlanItems } from "@/hooks/use-plan-items";
import { PlusCircle } from "lucide-react";

type AddPlanItemDialogProps = {
  /** Optional trigger element to override the default button */
  trigger?: React.ReactNode;
};

export function AddPlanItemDialog({ trigger }: AddPlanItemDialogProps) {
  const [open, setOpen] = useState(false);
  const { createPlanItem, isPending } = usePlanItems();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "appointment",
    startDate: formatDate(new Date()),
    endDate: "",
    isRecurring: false,
    isCompleted: false,
    reminder: false,
    reminderTime: "",
    priority: "medium",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert form data to the correct format
    const planItem = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : null,
      reminderTime: formData.reminderTime ? new Date(formData.reminderTime) : null,
      tags: [],
    };
    
    createPlanItem(planItem, {
      onSuccess: () => {
        setOpen(false);
        resetForm();
      },
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "appointment",
      startDate: formatDate(new Date()),
      endDate: "",
      isRecurring: false,
      isCompleted: false,
      reminder: false,
      reminderTime: "",
      priority: "medium",
      notes: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <PlusCircle className="h-5 w-5" /> Add New Plan Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Plan Item</DialogTitle>
          <DialogDescription>
            Create a new item for your treatment plan or personal care schedule.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger id="category" className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger id="priority" className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isRecurring" className="text-right">
                Recurring
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => handleSwitchChange("isRecurring", checked)}
                />
                <Label htmlFor="isRecurring">This is a recurring activity</Label>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reminder" className="text-right">
                Set Reminder
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="reminder"
                  checked={formData.reminder}
                  onCheckedChange={(checked) => handleSwitchChange("reminder", checked)}
                />
                <Label htmlFor="reminder">Enable reminder</Label>
              </div>
            </div>

            {formData.reminder && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reminderTime" className="text-right">
                  Reminder Time
                </Label>
                <Input
                  id="reminderTime"
                  name="reminderTime"
                  type="datetime-local"
                  value={formData.reminderTime}
                  onChange={handleChange}
                  className="col-span-3"
                  required={formData.reminder}
                />
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending.create}>
              {isPending.create ? "Adding..." : "Add to Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper to format date for datetime-local input
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
