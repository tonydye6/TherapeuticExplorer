import { JournalLog } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { moodColors } from "@/lib/healthMetrics";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface RecentLogsCardProps {
  logs: JournalLog[];
  title: string;
  emptyMessage: string;
  maxItems?: number;
  linkTo: string;
}

export function RecentLogsCard({ 
  logs, 
  title, 
  emptyMessage, 
  maxItems = 3,
  linkTo 
}: RecentLogsCardProps) {
  const displayLogs = logs.slice(0, maxItems);

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
                    {format(new Date(log.entryDate), "MMM d, yyyy")}
                  </h4>
                  {log.mood && (
                    <Badge className={`${moodColors[log.mood.toLowerCase()] || "bg-gray-200"}`}>
                      {log.mood}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{log.content}</p>
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
