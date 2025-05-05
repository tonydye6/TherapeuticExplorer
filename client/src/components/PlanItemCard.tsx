import { useState } from "react";
import { PlanItem } from "@shared/schema";
import { usePlanItems } from "@/hooks/use-plan-items";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, TrashIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { EditPlanItemDialog } from "./EditPlanItemDialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PlanItemCardProps = {
  planItem: PlanItem;
};

export function PlanItemCard({ planItem }: PlanItemCardProps) {
  const { toggleCompletion, deletePlanItem } = usePlanItems();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleToggleCompletion = () => {
    toggleCompletion({
      id: planItem.id,
      isCompleted: !planItem.isCompleted,
    });
  };

  const handleDeleteConfirm = () => {
    deletePlanItem(planItem.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      },
    });
  };

  // Get category color based on the category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "medication":
        return "bg-blue-100 text-blue-800";
      case "appointment":
        return "bg-green-100 text-green-800";
      case "exercise":
        return "bg-orange-100 text-orange-800";
      case "nutrition":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority color and label
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Medium Priority</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Low Priority</Badge>;
      default:
        return null;
    }
  };

  // Format date for display
  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className={`shadow-sm ${planItem.isCompleted ? 'bg-gray-50 opacity-60' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <Checkbox 
              id={`complete-${planItem.id}`}
              checked={planItem.isCompleted}
              onCheckedChange={handleToggleCompletion}
              className="mt-1"
            />
            <div>
              <CardTitle className={`text-lg ${planItem.isCompleted ? 'line-through text-gray-500' : ''}`}>
                {planItem.title}
              </CardTitle>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge className={getCategoryColor(planItem.category)}>
                  {planItem.category.charAt(0).toUpperCase() + planItem.category.slice(1)}
                </Badge>
                {planItem.isRecurring && (
                  <Badge variant="outline">Recurring</Badge>
                )}
                {planItem.priority && getPriorityBadge(planItem.priority)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        {planItem.description && <p className="mb-3">{planItem.description}</p>}
        
        <div className="flex items-center text-gray-600 mb-1">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <span>Starts: {formatDate(planItem.startDate)}</span>
        </div>
        
        {planItem.endDate && (
          <div className="flex items-center text-gray-600 mb-1">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>Ends: {formatDate(planItem.endDate)}</span>
          </div>
        )}
        
        {planItem.reminder && planItem.reminderTime && (
          <div className="flex items-center text-gray-600 mb-1">
            <ClockIcon className="h-4 w-4 mr-2" />
            <span>Reminder: {formatDate(planItem.reminderTime)}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-1">
        <div className="flex justify-between w-full">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-gray-600">
                <PencilIcon className="h-4 w-4 mr-1" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <EditPlanItemDialog planItem={planItem} onClose={() => setIsEditDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <TrashIcon className="h-4 w-4 mr-1" /> Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
              </DialogHeader>
              <p className="py-4">This action cannot be undone. This will permanently delete the plan item.</p>
              
              {planItem.notes && (
                <div className="mb-4">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={planItem.notes} readOnly className="mt-1" />
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
}
