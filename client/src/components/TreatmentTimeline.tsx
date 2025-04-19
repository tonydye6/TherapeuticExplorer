import React, { useState } from 'react';
import { 
  VerticalTimeline, 
  VerticalTimelineElement 
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Calendar, 
  CalendarCheck, 
  AlertCircle, 
  Syringe, 
  Stethoscope, 
  Activity, 
  Heart,
  CalendarDays, 
  Clipboard, 
  Hospital, 
  Clock, 
  ThermometerSun,
  Milestone,
  AlertTriangle
} from 'lucide-react';

// Import timeline phase and milestone types
export interface TimelineMilestone {
  id: string;
  name: string;
  description: string;
  day: number;
  category: 'treatment' | 'assessment' | 'recovery' | 'follow-up';
  important: boolean;
}

export interface TimelinePhase {
  id: string;
  name: string;
  description: string;
  startDay: number;
  endDay: number;
  category: 'neoadjuvant' | 'surgery' | 'adjuvant' | 'monitoring' | 'recovery';
  milestones: TimelineMilestone[];
  sideEffects?: {
    common: string[];
    severe: string[];
    timing: string;
  };
}

export interface TreatmentTimeline {
  treatmentName: string;
  treatmentType: string;
  duration: number;
  phases: TimelinePhase[];
  disclaimer: string;
}

interface TreatmentTimelineProps {
  timeline: TreatmentTimeline;
  className?: string;
}

// Helper function to format days into weeks and months
const formatDuration = (days: number): string => {
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'}`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    return `${weeks} week${weeks === 1 ? '' : 's'}${remainingDays > 0 ? ` ${remainingDays} day${remainingDays === 1 ? '' : 's'}` : ''}`;
  } else {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    const weeks = Math.floor(remainingDays / 7);
    const days2 = remainingDays % 7;
    
    let result = `${months} month${months === 1 ? '' : 's'}`;
    if (weeks > 0) {
      result += ` ${weeks} week${weeks === 1 ? '' : 's'}`;
    }
    if (days2 > 0) {
      result += ` ${days2} day${days2 === 1 ? '' : 's'}`;
    }
    return result;
  }
};

// Get icon for category
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'neoadjuvant':
      return <Syringe className="h-7 w-7" />;
    case 'surgery':
      return <Hospital className="h-7 w-7" />;
    case 'adjuvant':
      return <Stethoscope className="h-7 w-7" />;
    case 'monitoring':
      return <Activity className="h-7 w-7" />;
    case 'recovery':
      return <Heart className="h-7 w-7" />;
    case 'treatment':
      return <Syringe className="h-7 w-7" />;
    case 'assessment':
      return <Clipboard className="h-7 w-7" />;
    case 'follow-up':
      return <CalendarCheck className="h-7 w-7" />;
    default:
      return <Calendar className="h-7 w-7" />;
  }
};

// Get color for category
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'neoadjuvant':
      return '#4dabf7'; // blue
    case 'surgery':
      return '#f783ac'; // pink
    case 'adjuvant':
      return '#82c91e'; // lime
    case 'monitoring':
      return '#be4bdb'; // purple
    case 'recovery':
      return '#74c0fc'; // light blue
    case 'treatment':
      return '#ff922b'; // orange
    case 'assessment':
      return '#20c997'; // teal
    case 'follow-up':
      return '#9775fa'; // violet
    default:
      return '#868e96'; // gray
  }
};

// Get background class for category
const getCategoryClass = (category: string): string => {
  switch (category) {
    case 'neoadjuvant':
      return 'bg-blue-100 text-blue-800';
    case 'surgery':
      return 'bg-pink-100 text-pink-800';
    case 'adjuvant':
      return 'bg-lime-100 text-lime-800';
    case 'monitoring':
      return 'bg-purple-100 text-purple-800';
    case 'recovery':
      return 'bg-sky-100 text-sky-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const TreatmentTimeline: React.FC<TreatmentTimelineProps> = ({ 
  timeline,
  className = '' 
}) => {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(
    timeline.phases.length > 0 ? timeline.phases[0].id : null
  );

  const selectedPhase = timeline.phases.find(phase => phase.id === selectedPhaseId);

  // Calculate the current phase's position in the timeline (percentage)
  const getPhasePosition = (phase: TimelinePhase): number => {
    return Math.floor((phase.startDay / timeline.duration) * 100);
  };

  // Calculate the phase's width in the timeline (percentage)
  const getPhaseWidth = (phase: TimelinePhase): number => {
    const phaseDuration = phase.endDay - phase.startDay;
    return Math.floor((phaseDuration / timeline.duration) * 100);
  };

  // Sort phases by start day
  const sortedPhases = [...timeline.phases].sort((a, b) => a.startDay - b.startDay);

  return (
    <div className={`treatment-timeline ${className}`}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Treatment Timeline: {timeline.treatmentName}</span>
            <Badge variant="outline" className="px-3 py-1">
              {timeline.treatmentType}
            </Badge>
          </CardTitle>
          <CardDescription>
            Total duration: {formatDuration(timeline.duration)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Timeline overview (visual representation) */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Timeline Overview</h3>
            
            <div className="relative h-10 bg-gray-100 rounded-lg mb-1">
              {sortedPhases.map(phase => (
                <TooltipProvider key={phase.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`absolute h-full rounded-md cursor-pointer hover:opacity-90 transition-opacity`}
                        style={{ 
                          left: `${getPhasePosition(phase)}%`,
                          width: `${getPhaseWidth(phase)}%`,
                          backgroundColor: getCategoryColor(phase.category),
                          top: 0
                        }}
                        onClick={() => setSelectedPhaseId(phase.id)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p><strong>{phase.name}</strong></p>
                      <p>Days {phase.startDay} - {phase.endDay}</p>
                      <p>{formatDuration(phase.endDay - phase.startDay)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Day 0</span>
              <span>Day {timeline.duration}</span>
            </div>
          </div>

          {/* Detailed phase information */}
          <Tabs defaultValue="phases" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phases">Treatment Phases</TabsTrigger>
              <TabsTrigger value="milestones">Key Milestones</TabsTrigger>
            </TabsList>
            
            <TabsContent value="phases" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {sortedPhases.map(phase => (
                  <div 
                    key={phase.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedPhaseId === phase.id ? 'border-primary shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setSelectedPhaseId(phase.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: getCategoryColor(phase.category) }}
                      >
                        {getCategoryIcon(phase.category)}
                      </div>
                      <div>
                        <h4 className="font-medium">{phase.name}</h4>
                        <p className="text-sm text-gray-500">
                          Days {phase.startDay}-{phase.endDay} ({formatDuration(phase.endDay - phase.startDay)})
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getCategoryClass(phase.category)} text-xs mb-2`}>
                      {phase.category.charAt(0).toUpperCase() + phase.category.slice(1)}
                    </Badge>
                    <p className="text-sm text-gray-600 line-clamp-2">{phase.description}</p>
                  </div>
                ))}
              </div>

              {selectedPhase && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div 
                        className="h-6 w-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: getCategoryColor(selectedPhase.category) }}
                      >
                        {getCategoryIcon(selectedPhase.category)}
                      </div>
                      {selectedPhase.name}
                    </CardTitle>
                    <CardDescription>
                      Days {selectedPhase.startDay}-{selectedPhase.endDay} ({formatDuration(selectedPhase.endDay - selectedPhase.startDay)})
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-gray-700 mb-4">{selectedPhase.description}</p>
                    
                    {/* Milestones */}
                    {selectedPhase.milestones.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Milestone className="h-4 w-4" />
                          Milestones
                        </h4>
                        <ul className="space-y-2">
                          {selectedPhase.milestones
                            .sort((a, b) => a.day - b.day)
                            .map(milestone => (
                              <li key={milestone.id} className="flex items-start gap-2">
                                <div 
                                  className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${milestone.important ? 'bg-orange-500' : 'bg-gray-300'}`}
                                />
                                <div>
                                  <p className="font-medium">
                                    Day {milestone.day}: {milestone.name}
                                    {milestone.important && (
                                      <Badge variant="outline" className="ml-2 text-xs bg-orange-50 text-orange-800 border-orange-200">
                                        Important
                                      </Badge>
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-600">{milestone.description}</p>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Side Effects */}
                    {selectedPhase.sideEffects && (
                      <div className="mt-4">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="side-effects">
                            <AccordionTrigger className="text-sm font-medium">
                              <div className="flex items-center gap-1 text-amber-700">
                                <AlertTriangle className="h-4 w-4" />
                                Potential Side Effects
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pl-5 space-y-3">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Timing: </span> 
                                  {selectedPhase.sideEffects.timing}
                                </p>
                                
                                <div>
                                  <p className="text-sm font-medium mb-1">Common:</p>
                                  <ul className="list-disc list-inside text-sm text-gray-600">
                                    {selectedPhase.sideEffects.common.map((effect, index) => (
                                      <li key={index}>{effect}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                {selectedPhase.sideEffects.severe.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-red-700 mb-1">Severe (seek medical attention):</p>
                                    <ul className="list-disc list-inside text-sm text-red-600">
                                      {selectedPhase.sideEffects.severe.map((effect, index) => (
                                        <li key={index}>{effect}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="milestones">
              <div className="mt-2">
                <VerticalTimeline layout="1-column" lineColor="#e5e7eb">
                  {sortedPhases.flatMap(phase => 
                    phase.milestones
                      .filter(milestone => milestone.important)
                      .map(milestone => (
                        <VerticalTimelineElement
                          key={milestone.id}
                          className="vertical-timeline-element"
                          contentStyle={{
                            background: '#fff',
                            color: '#333',
                            boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
                            padding: '1.5rem',
                            borderRadius: '0.5rem',
                          }}
                          contentArrowStyle={{ borderRight: '7px solid #fff' }}
                          date={`Day ${milestone.day}`}
                          iconStyle={{
                            background: getCategoryColor(milestone.category),
                            color: '#fff',
                          }}
                          icon={getCategoryIcon(milestone.category)}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <h3 className="text-lg font-medium">{milestone.name}</h3>
                            <Badge className={getCategoryClass(phase.category)}>
                              {phase.name}
                            </Badge>
                          </div>
                          <p className="text-gray-700">{milestone.description}</p>
                        </VerticalTimelineElement>
                      ))
                  )}
                </VerticalTimeline>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <div className="flex items-start gap-2 text-sm text-gray-500">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{timeline.disclaimer}</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TreatmentTimeline;