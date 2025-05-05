import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { differenceInDays } from 'date-fns';

interface Treatment {
  id: number;
  name: string;
  type: string;
  startDate: Date | null;
  endDate: Date | null;
  effectiveness?: unknown;
  sideEffects?: unknown;
  active: boolean;
}

interface ActiveTreatmentsCardProps {
  treatments: Treatment[];
  title: string;
  emptyMessage: string;
  maxItems?: number;
}

export function ActiveTreatmentsCard({ 
  treatments, 
  title, 
  emptyMessage, 
  maxItems = 3 
}: ActiveTreatmentsCardProps) {
  const displayTreatments = treatments.slice(0, maxItems);

  // Calculate progress percentage for treatments with start and end dates
  const calculateProgress = (treatment: Treatment): number => {
    if (!treatment.startDate || !treatment.endDate) return 0;
    
    const startDate = new Date(treatment.startDate);
    const endDate = new Date(treatment.endDate);
    const today = new Date();
    
    if (today < startDate) return 0;
    if (today > endDate) return 100;
    
    const totalDays = differenceInDays(endDate, startDate);
    const daysCompleted = differenceInDays(today, startDate);
    
    if (totalDays === 0) return 100; // Same day start and end
    return Math.round((daysCompleted / totalDays) * 100);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Link href="/treatment-tracker">
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {displayTreatments.length > 0 ? (
          <div className="space-y-5">
            {displayTreatments.map((treatment) => {
              const progress = calculateProgress(treatment);
              
              return (
                <div key={treatment.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{treatment.name}</h4>
                    <span className="text-sm text-gray-500">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Type: {treatment.type}</span>
                    {treatment.startDate && treatment.endDate && (
                      <span>
                        {new Date(treatment.startDate).toLocaleDateString()} - {new Date(treatment.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
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
