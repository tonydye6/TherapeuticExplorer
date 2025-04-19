import React, { useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, Activity, FileText, Pill, Syringe, FilePlus, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the types for medical events
export type MedicalEventType = 
  | "diagnosis" 
  | "test" 
  | "medication" 
  | "treatment" 
  | "scan" 
  | "appointment" 
  | "symptom";

export type MedicalEvent = {
  id: string;
  date: Date;
  eventType: MedicalEventType;
  title: string;
  description?: string;
  provider?: string;
  location?: string;
  result?: string;
  severity?: 1 | 2 | 3 | 4 | 5; // For symptoms
  labValues?: {
    name: string;
    value: number | string;
    unit?: string;
    normalRange?: string;
    isAbnormal?: boolean;
  }[];
};

type MedicalTimelineProps = {
  events: MedicalEvent[];
  onEventClick?: (event: MedicalEvent) => void;
};

export default function MedicalTimeline({ events, onEventClick }: MedicalTimelineProps) {
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // State for pagination if there are many events
  const [currentPage, setCurrentPage] = useState(0);
  const eventsPerPage = 10;
  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);
  
  // Get current events to display
  const currentEvents = sortedEvents.slice(
    currentPage * eventsPerPage,
    (currentPage + 1) * eventsPerPage
  );

  // Function to get the appropriate icon for each event type
  const getEventIcon = (eventType: MedicalEventType) => {
    switch (eventType) {
      case "diagnosis":
        return <Stethoscope className="h-6 w-6 text-red-500" />;
      case "test":
        return <FileText className="h-6 w-6 text-blue-500" />;
      case "medication":
        return <Pill className="h-6 w-6 text-green-500" />;
      case "treatment":
        return <Syringe className="h-6 w-6 text-purple-500" />;
      case "scan":
        return <FilePlus className="h-6 w-6 text-teal-500" />;
      case "appointment":
        return <CalendarClock className="h-6 w-6 text-indigo-500" />;
      case "symptom":
        return <Activity className="h-6 w-6 text-orange-500" />;
      default:
        return <CalendarClock className="h-6 w-6 text-gray-500" />;
    }
  };

  // Function to get color class based on event type
  const getEventColor = (eventType: MedicalEventType) => {
    switch (eventType) {
      case "diagnosis":
        return "border-red-500 bg-red-50";
      case "test":
        return "border-blue-500 bg-blue-50";
      case "medication":
        return "border-green-500 bg-green-50";
      case "treatment":
        return "border-purple-500 bg-purple-50";
      case "scan":
        return "border-teal-500 bg-teal-50";
      case "appointment":
        return "border-indigo-500 bg-indigo-50";
      case "symptom":
        return "border-orange-500 bg-orange-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="medical-timeline w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Medical Timeline</h2>
        {totalPages > 1 && (
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className={cn(
                "p-1 rounded hover:bg-gray-100",
                currentPage === 0 ? "text-gray-400 cursor-not-allowed" : "text-gray-700"
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className={cn(
                "p-1 rounded hover:bg-gray-100",
                currentPage === totalPages - 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700"
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {currentEvents.map((event, index) => (
          <div
            key={event.id}
            className={cn(
              "flex border-l-4 pl-4 py-2 relative transition-all",
              getEventColor(event.eventType),
              onEventClick ? "cursor-pointer hover:shadow-md" : ""
            )}
            onClick={() => onEventClick && onEventClick(event)}
          >
            {/* Timeline connector */}
            {index < currentEvents.length - 1 && (
              <div className="absolute left-[-4.5px] top-12 bottom-0 w-1 bg-gray-200"></div>
            )}
            
            {/* Event date circle */}
            <div className="absolute left-[-11px] top-2 bg-white p-1 rounded-full">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="rounded-full p-1 bg-white">
                      {getEventIcon(event.eventType)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Event content */}
            <div className="ml-2 w-full">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                <time className="text-sm text-gray-500">{format(event.date, "MMM d, yyyy")}</time>
              </div>
              
              {event.description && (
                <p className="text-sm text-gray-700 mt-1">{event.description}</p>
              )}
              
              {/* Provider and location */}
              {(event.provider || event.location) && (
                <div className="text-xs text-gray-500 mt-1">
                  {event.provider && <span className="font-medium">{event.provider}</span>}
                  {event.provider && event.location && <span> · </span>}
                  {event.location && <span>{event.location}</span>}
                </div>
              )}
              
              {/* Test result or symptom severity */}
              {event.result && (
                <div className="mt-2 px-3 py-1 bg-gray-100 rounded-md text-sm">
                  <span className="font-medium">Result:</span> {event.result}
                </div>
              )}
              
              {/* Lab values if present */}
              {event.labValues && event.labValues.length > 0 && (
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-1 text-left font-medium text-gray-500">Marker</th>
                        <th className="px-3 py-1 text-left font-medium text-gray-500">Value</th>
                        <th className="px-3 py-1 text-left font-medium text-gray-500">Normal Range</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {event.labValues.map((lab, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1 whitespace-nowrap">{lab.name}</td>
                          <td className={cn(
                            "px-3 py-1 whitespace-nowrap",
                            lab.isAbnormal ? "text-red-600 font-medium" : ""
                          )}>
                            {lab.value} {lab.unit || ""}
                          </td>
                          <td className="px-3 py-1 whitespace-nowrap text-gray-500">
                            {lab.normalRange || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Symptom severity indicator */}
              {event.eventType === "symptom" && event.severity && (
                <div className="mt-2 flex items-center">
                  <span className="text-sm font-medium mr-2">Severity:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "w-6 h-3 mx-0.5 rounded-sm",
                          level <= event.severity!
                            ? level <= 2
                              ? "bg-green-500"
                              : level <= 4
                              ? "bg-orange-500"
                              : "bg-red-500"
                            : "bg-gray-200"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {currentEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No medical events recorded.
          </div>
        )}
      </div>
    </div>
  );
}