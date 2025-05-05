import { PlanItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface UpcomingPlanItemsCardProps {
  planItems: PlanItem[];
  title: string;
  emptyMessage: string;
  maxItems?: number;
}

export function UpcomingPlanItemsCard({ 
  planItems, 
  title, 
  emptyMessage, 
  maxItems = 5 
}: UpcomingPlanItemsCardProps) {
  const displayItems = planItems.slice(0, maxItems);

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "appointment":
        return "bg-blue-100 text-blue-800";
      case "medication":
        return "bg-purple-100 text-purple-800";
      case "task":
        return "bg-green-100 text-green-800";
      case "reminder":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Link href="/my-plan">
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {displayItems.length > 0 ? (
          <div className="space-y-3">
            {displayItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className="p-2 rounded-full bg-gray-100 text-gray-700 flex-shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{item.title}</h4>
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(item.startDate), "MMM d, yyyy - h:mm a")}
                  </p>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
