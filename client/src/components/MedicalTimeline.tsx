import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Stethoscope,
  Pill,
  Activity,
  Calendar,
  FileText,
  Thermometer,
  Clipboard,
  AlertCircle,
  Clock,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// Define medical event types
export type MedicalEventType = 
  | "diagnosis" 
  | "treatment" 
  | "medication" 
  | "test" 
  | "scan" 
  | "symptom" 
  | "appointment" 
  | "procedure"
  | "other";

// Define lab value type
export type LabValue = {
  name: string;
  value: number | string;
  unit: string;
  normalRange?: string;
  isAbnormal?: boolean;
};

// Define medical event interface
export interface MedicalEvent {
  id: string;
  date: Date;
  eventType: MedicalEventType;
  title: string;
  description?: string;
  provider?: string;
  location?: string;
  result?: string;
  severity?: number; // 1-5 for symptoms
  labValues?: LabValue[];
  treatmentId?: string;
  followUp?: Date;
  notes?: string;
  images?: string[];
}

interface MedicalTimelineProps {
  events: MedicalEvent[];
  onEventClick?: (event: MedicalEvent) => void;
  onAddEvent?: () => void;
  showAddButton?: boolean;
  className?: string;
}

export default function MedicalTimeline({
  events,
  onEventClick,
  onAddEvent,
  showAddButton = false,
  className
}: MedicalTimelineProps) {
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Group events by month/year
  const groupedEvents = sortedEvents.reduce<Record<string, MedicalEvent[]>>((groups, event) => {
    const dateKey = format(event.date, "MMMM yyyy");
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {});
  
  // Get event icon
  const getEventIcon = (eventType: MedicalEventType) => {
    switch (eventType) {
      case "diagnosis":
        return <Stethoscope className="h-5 w-5 text-red-500" />;
      case "treatment":
        return <Activity className="h-5 w-5 text-blue-500" />;
      case "medication":
        return <Pill className="h-5 w-5 text-green-500" />;
      case "test":
        return <FileText className="h-5 w-5 text-purple-500" />;
      case "scan":
        return <Clipboard className="h-5 w-5 text-cyan-500" />;
      case "symptom":
        return <Thermometer className="h-5 w-5 text-orange-500" />;
      case "appointment":
        return <Calendar className="h-5 w-5 text-indigo-500" />;
      case "procedure":
        return <Clipboard className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Format date
  const formatEventDate = (date: Date) => {
    return format(date, "MMM d, yyyy");
  };
  
  // Get severity label
  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 1: return "Very Mild";
      case 2: return "Mild";
      case 3: return "Moderate";
      case 4: return "Severe";
      case 5: return "Very Severe";
      default: return "Unknown";
    }
  };
  
  // Get severity color
  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-emerald-100 text-emerald-800";
      case 3: return "bg-yellow-100 text-yellow-800";
      case 4: return "bg-orange-100 text-orange-800";
      case 5: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={cn("medical-timeline pb-6", className)}>
      {showAddButton && (
        <div className="flex justify-end mb-4">
          <Button onClick={onAddEvent} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Medical Event
          </Button>
        </div>
      )}
      
      <div className="space-y-8">
        {Object.entries(groupedEvents).map(([dateGroup, events]) => (
          <div key={dateGroup} className="relative">
            <div className="sticky top-0 z-10 bg-white py-2 mb-4 flex items-center">
              <h3 className="text-lg font-semibold text-gray-900">{dateGroup}</h3>
              <div className="ml-4 h-px flex-grow bg-gray-200"></div>
            </div>
            
            <div className="space-y-4">
              {events.map((event) => (
                <Card 
                  key={event.id}
                  className={cn(
                    "border-l-4 hover:shadow-md transition-shadow",
                    event.eventType === "diagnosis" && "border-l-red-500",
                    event.eventType === "treatment" && "border-l-blue-500",
                    event.eventType === "medication" && "border-l-green-500",
                    event.eventType === "test" && "border-l-purple-500",
                    event.eventType === "scan" && "border-l-cyan-500",
                    event.eventType === "symptom" && "border-l-orange-500",
                    event.eventType === "appointment" && "border-l-indigo-500",
                    event.eventType === "procedure" && "border-l-yellow-500",
                    event.eventType === "other" && "border-l-gray-500",
                    onEventClick && "cursor-pointer"
                  )}
                  onClick={() => onEventClick && onEventClick(event)}
                >
                  <div className="p-4">
                    <div className="flex justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-gray-50 p-2 mt-1">
                          {getEventIcon(event.eventType)}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-medium">{event.title}</h4>
                            <Badge variant="outline" className="capitalize">
                              {event.eventType}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-500 mt-1">
                            {formatEventDate(event.date)}
                            {event.provider && ` • ${event.provider}`}
                            {event.location && ` • ${event.location}`}
                          </div>
                          
                          {event.description && (
                            <p className="mt-2 text-gray-700">{event.description}</p>
                          )}
                          
                          {event.result && (
                            <div className="mt-2">
                              <span className="text-sm font-medium">Result:</span>
                              <span className="text-sm ml-1">{event.result}</span>
                            </div>
                          )}
                          
                          {event.severity !== undefined && (
                            <div className="mt-2 flex items-center">
                              <span className="text-sm font-medium mr-2">Severity:</span>
                              <Badge className={getSeverityColor(event.severity)}>
                                {getSeverityLabel(event.severity)}
                              </Badge>
                            </div>
                          )}
                          
                          {event.labValues && event.labValues.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-sm font-medium mb-1">Lab Values:</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {event.labValues.map((lab, index) => (
                                  <div 
                                    key={index}
                                    className={cn(
                                      "px-2 py-1 rounded text-sm flex justify-between",
                                      lab.isAbnormal ? "bg-amber-50" : "bg-gray-50"
                                    )}
                                  >
                                    <div className="flex items-center">
                                      {lab.isAbnormal && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <AlertCircle className="h-3 w-3 text-amber-500 mr-1" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Abnormal value</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                      <span className="font-medium">{lab.name}:</span>
                                    </div>
                                    <div>
                                      <span 
                                        className={cn(
                                          lab.isAbnormal && "font-medium text-amber-700"
                                        )}
                                      >
                                        {lab.value} {lab.unit}
                                      </span>
                                      {lab.normalRange && (
                                        <span className="text-xs text-gray-500 ml-1">
                                          ({lab.normalRange})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {event.followUp && (
                            <div className="mt-2 flex items-center text-sm">
                              <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                              <span>Follow-up: {formatEventDate(event.followUp)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
        
        {events.length === 0 && (
          <div className="bg-gray-50 border border-dashed rounded-lg p-8 text-center">
            <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700">No medical events found</h3>
            <p className="text-gray-500 mt-1">Add events to track your medical history</p>
            {showAddButton && onAddEvent && (
              <Button 
                onClick={onAddEvent} 
                variant="outline" 
                className="mt-4"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Your First Event
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}