import { DietLog } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface RecentDietLogsCardProps {
  logs: DietLog[];
  title: string;
  emptyMessage: string;
  maxItems?: number;
  linkTo: string;
}

export function RecentDietLogsCard({ 
  logs, 
  title, 
  emptyMessage, 
  maxItems = 3,
  linkTo 
}: RecentDietLogsCardProps) {
  const displayLogs = logs.slice(0, maxItems);

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
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Link href={linkTo}>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {displayLogs.length > 0 ? (
          <div className="space-y-4">
            {displayLogs.map((log) => (
              <div key={log.id} className="border-b pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">
                    {format(new Date(log.mealDate), "MMM d, yyyy - h:mm a")}
                  </h4>
                  {log.mealType && (
                    <Badge className={getMealTypeColor(log.mealType)}>
                      {log.mealType}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {log.foods?.map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
                {log.notes && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{log.notes}</p>
                )}
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
