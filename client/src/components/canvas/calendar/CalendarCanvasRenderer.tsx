import React, { useState, useEffect, useCallback } from 'react';
import { CanvasTab, CanvasNode, CanvasEdge } from '@shared/canvas-types';
import CalendarView from './CalendarView';

interface CalendarCanvasRendererProps {
  activeTab: CanvasTab;
  onNodeClick: (nodeId: string) => void;
  onNodeCreate: (node: Partial<CanvasNode>) => Promise<string>;
  onNodeUpdate: (nodeId: string, updates: Partial<CanvasNode>) => Promise<void>;
  onNodeDelete: (nodeId: string) => Promise<void>;
  onEdgeCreate: (edge: Partial<CanvasEdge>) => Promise<string>;
  onEdgeUpdate: (edgeId: string, updates: Partial<CanvasEdge>) => Promise<void>;
  onEdgeDelete: (edgeId: string) => Promise<void>;
  scale?: number;
  offset?: [number, number];
  onScaleChange?: (scale: number) => void;
  onOffsetChange?: (offset: [number, number]) => void;
  className?: string;
}

/**
 * CalendarCanvasRenderer - Renders a calendar view for the canvas
 * Acts as a bridge between CanvasContainer and the actual CalendarView
 */
const CalendarCanvasRenderer: React.FC<CalendarCanvasRendererProps> = ({
  activeTab,
  onNodeClick,
  onNodeCreate,
  onNodeUpdate,
  onNodeDelete,
  onEdgeCreate,
  onEdgeUpdate,
  onEdgeDelete,
  scale,
  offset,
  onScaleChange,
  onOffsetChange,
  className = '',
}) => {
  // Ensure that the tab has a dateRange config
  useEffect(() => {
    if (!activeTab?.config?.dateRange) {
      // Set default date range to current month
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      onNodeUpdate(activeTab.id, {
        config: {
          ...activeTab.config,
          dateRange: {
            start: startDate,
            end: endDate,
          },
        },
      });
    }
  }, [activeTab, onNodeUpdate]);

  // Handle node interactions through the calendar interface
  const handleNodeCreate = async (node: Partial<CanvasNode>) => {
    return onNodeCreate({
      ...node,
      position: node.position || { x: 0, y: 0 },
      size: node.size || { width: 180, height: 100 },
    });
  };

  return (
    <div className={`w-full h-full bg-gray-50 ${className}`}>
      <CalendarView
        activeTab={activeTab}
        onNodeClick={onNodeClick}
        onNodeCreate={handleNodeCreate}
        onNodeUpdate={onNodeUpdate}
        onNodeDelete={onNodeDelete}
      />
    </div>
  );
};

export default CalendarCanvasRenderer;