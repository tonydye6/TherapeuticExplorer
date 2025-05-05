import { DietLog } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";

interface DietLogCardProps {
  dietLog: DietLog;
  onEdit: (dietLog: DietLog) => void;
  onDelete: (id: number) => void;
}

export function DietLogCard({ dietLog, onEdit, onDelete }: DietLogCardProps) {
  const {
    id,
    mealDate,
    mealType,
    foodItems,
    calories,
    carbs,
    protein,
    fat,
    notes,
  } = dietLog;

  const formattedDate = format(new Date(mealDate), "MMMM d, yyyy - h:mm a");

  // Determine background color based on meal type
  const getMealTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "breakfast":
        return "bg-blue-100 text-blue-800";
      case "lunch":
        return "bg-green-100 text-green-800";
      case "dinner":
        return "bg-purple-100 text-purple-800";
      case "snack":
      case "morning snack":
      case "afternoon snack":
      case "evening snack":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium">{formattedDate}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Meal #{id}
            </CardDescription>
          </div>
          <Badge className={`${getMealTypeColor(mealType)} uppercase`}>
            {mealType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Nutrition Information */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="p-2 bg-gray-50 rounded text-center">
            <p className="text-xs text-gray-500">Calories</p>
            <p className="font-medium">{calories}</p>
          </div>
          <div className="p-2 bg-blue-50 rounded text-center">
            <p className="text-xs text-gray-500">Carbs (g)</p>
            <p className="font-medium">{carbs}</p>
          </div>
          <div className="p-2 bg-red-50 rounded text-center">
            <p className="text-xs text-gray-500">Protein (g)</p>
            <p className="font-medium">{protein}</p>
          </div>
          <div className="p-2 bg-yellow-50 rounded text-center">
            <p className="text-xs text-gray-500">Fat (g)</p>
            <p className="font-medium">{fat}</p>
          </div>
        </div>

        {/* Food Items */}
        {foodItems && foodItems.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Food Items:</p>
            <div className="flex flex-wrap gap-1">
              {foodItems.map((item, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="mt-3">
            <p className="text-sm font-medium mb-1">Notes:</p>
            <p className="text-sm text-gray-600">{notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(dietLog)}>
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(id)}>
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
