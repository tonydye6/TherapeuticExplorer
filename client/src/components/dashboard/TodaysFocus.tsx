import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PlusIcon, CheckCircleIcon } from 'lucide-react';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

type PlanItem = {
  id: number;
  title: string;
  description?: string | null;
  startDate: Date | string;
  category: string;
  isCompleted: boolean;
};

interface TodaysFocusProps {
  planItems: PlanItem[];
  isLoading: boolean;
}

export function TodaysFocus({ planItems, isLoading }: TodaysFocusProps) {
  // Only show up to 3 items
  const displayItems = planItems.slice(0, 3);
  
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'h:mm a');
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Today's Focus
          </CardTitle>
          <Link href="/my-plan">
            <Button variant="ghost" size="sm" className="gap-1">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>No focus items for today.</p>
            <Link href="/my-plan">
              <Button variant="link" className="mt-2">
                Add something to your plan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {displayItems.map((item) => (
              <div 
                key={item.id} 
                className={`flex items-center p-3 rounded-md border ${item.isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-primary-200'}`}
              >
                <div className="mr-3">
                  {item.isCompleted ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${item.isCompleted ? 'line-through text-gray-500' : ''}`}>
                    {item.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTime(item.startDate)}
                    {item.category && ` · ${item.category}`}
                  </div>
                </div>
              </div>
            ))}

            {displayItems.length > 0 && (
              <div className="pt-2">
                <Link href="/my-plan">
                  <Button variant="outline" size="sm" className="w-full">
                    View all plan items
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
