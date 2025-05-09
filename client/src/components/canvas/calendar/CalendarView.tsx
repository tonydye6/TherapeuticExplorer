import React, { useState, useEffect, useCallback } from 'react';
import { addDays, format, startOfWeek, addWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CanvasNode, CanvasTab, NodeType } from '@shared/canvas-types';
import { v4 as uuidv4 } from 'uuid';

interface CalendarViewProps {
  activeTab: CanvasTab;
  onNodeClick: (nodeId: string) => void;
  onNodeCreate: (node: Partial<CanvasNode>) => Promise<string>;
  onNodeUpdate: (nodeId: string, updates: Partial<CanvasNode>) => Promise<void>;
  onNodeDelete: (nodeId: string) => Promise<void>;
  className?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: string;
  color?: string;
  nodeId: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  activeTab,
  onNodeClick,
  onNodeCreate,
  onNodeUpdate,
  onNodeDelete,
  className = '',
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [displayMode, setDisplayMode] = useState<'month' | 'week'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Extract events from nodes
  useEffect(() => {
    if (!activeTab?.nodes) return;

    const calendarEvents: CalendarEvent[] = [];

    activeTab.nodes.forEach((node) => {
      // Get date from node based on its type
      let date: Date | null = null;
      let title = node.title || 'Untitled';
      let color = '';

      if (node.properties.date) {
        date = new Date(node.properties.date);
      } else if (node.properties.startDate) {
        date = new Date(node.properties.startDate);
      } else if (node.properties.dateCreated) {
        date = new Date(node.properties.dateCreated);
      }

      if (!date) return;

      // Assign color based on node type
      switch (node.type) {
        case NodeType.TREATMENT:
        case NodeType.MEDICATION:
          color = 'bg-cyan-100 border-cyan-500';
          break;
        case NodeType.DOCTOR_NOTE:
          color = 'bg-violet-100 border-violet-500';
          break;
        case NodeType.MILESTONE:
        case NodeType.VICTORY:
          color = 'bg-amber-100 border-amber-500';
          break;
        case NodeType.JOURNAL_ENTRY:
        case NodeType.SYMPTOM_LOG:
          color = 'bg-emerald-100 border-emerald-500';
          break;
        case NodeType.HOPE_SNIPPET:
        case NodeType.CAREGIVER_NOTE:
          color = 'bg-rose-100 border-rose-500';
          break;
        default:
          color = 'bg-slate-100 border-slate-500';
      }

      calendarEvents.push({
        id: uuidv4(),
        title,
        date,
        type: node.type.toString(),
        color,
        nodeId: node.id,
      });
    });

    setEvents(calendarEvents);
  }, [activeTab]);

  // Navigation functions
  const goToToday = () => setCurrentDate(new Date());
  const goToPrevious = () => {
    if (displayMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, -1));
    }
  };
  const goToNext = () => {
    if (displayMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  // Create new node for a specific date
  const createNodeForDate = async (date: Date) => {
    try {
      const newNode: Partial<CanvasNode> = {
        title: 'New Event',
        type: NodeType.NOTE,
        position: { x: Math.random() * 500, y: Math.random() * 300 },
        size: { width: 180, height: 100 },
        properties: {
          date: date,
          description: '',
          location: '',
        },
      };

      const nodeId = await onNodeCreate(newNode);
      // If successfully created, you can select it
      onNodeClick(nodeId);
    } catch (error) {
      console.error('Failed to create node:', error);
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = startOfWeek(addWeeks(monthEnd, 1));

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="bg-white rounded-md shadow-neo-sm border-4 border-black">
        <div className="grid grid-cols-7 border-b-4 border-black font-bold text-xs uppercase">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div 
              key={index} 
              className="py-2 text-center font-bold border-r border-black last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day, dayIdx) => {
            // Get events for this day
            const dayEvents = events.filter(event => isSameDay(day, event.date));
            
            return (
              <div
                key={day.toString()}
                className={`
                  min-h-[100px] p-1 border-b border-r border-black relative
                  ${!isSameMonth(day, monthStart) ? 'bg-gray-100 text-gray-400' : ''}
                  ${isToday(day) ? 'bg-cyan-50' : ''}
                  ${dayIdx % 7 === 6 ? 'border-r-0' : ''}
                  ${dayIdx > 27 && !isSameMonth(day, monthStart) ? 'border-b-0' : ''}
                  hover:bg-gray-50 transition-colors
                `}
                onClick={() => createNodeForDate(day)}
              >
                <div className="flex justify-between items-start">
                  <span 
                    className={`
                      inline-flex justify-center items-center w-6 h-6 rounded-full text-xs 
                      ${isToday(day) ? 'bg-primary text-white font-bold' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                  {isSameMonth(day, monthStart) && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        createNodeForDate(day);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                
                <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`px-2 py-1 rounded text-xs truncate border-l-2 cursor-pointer ${event.color}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNodeClick(event.nodeId);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4 border-4 border-black p-3 rounded-md bg-white shadow-neo-sm">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-black neo-brutalism-btn bg-white hover:bg-gray-100"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-black neo-brutalism-btn bg-white hover:bg-gray-100"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <h2 className="text-xl font-bold flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-2 border-black neo-brutalism-btn bg-white hover:bg-gray-100"
            onClick={goToToday}
          >
            Today
          </Button>
          <div className="flex border-2 border-black rounded-md overflow-hidden neo-brutalism-btn">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-none ${displayMode === 'month' ? 'bg-primary text-white' : 'bg-white'}`}
              onClick={() => setDisplayMode('month')}
            >
              Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-none ${displayMode === 'week' ? 'bg-primary text-white' : 'bg-white'}`}
              onClick={() => setDisplayMode('week')}
            >
              Week
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-4 h-full overflow-y-auto ${className}`}>
      {renderHeader()}
      {displayMode === 'month' ? renderMonthView() : <div>Week view coming soon!</div>}
    </div>
  );
};

export default CalendarView;