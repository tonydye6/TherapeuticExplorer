declare module 'react-vertical-timeline-component' {
  import * as React from 'react';

  export interface VerticalTimelineProps extends React.ComponentProps<'div'> {
    className?: string;
    layout?: '1-column' | '2-columns';
    lineColor?: string;
    animate?: boolean;
    children?: React.ReactNode;
  }

  export interface VerticalTimelineElementProps extends React.ComponentProps<'div'> {
    id?: string;
    className?: string;
    date?: string;
    dateClassName?: string;
    iconClassName?: string;
    iconStyle?: React.CSSProperties;
    icon?: React.ReactNode;
    position?: string;
    style?: React.CSSProperties;
    textClassName?: string;
    contentStyle?: React.CSSProperties;
    contentArrowStyle?: React.CSSProperties;
    intersectionObserverProps?: any;
    visible?: boolean;
    children?: React.ReactNode;
  }

  export const VerticalTimeline: React.FC<VerticalTimelineProps>;
  export const VerticalTimelineElement: React.FC<VerticalTimelineElementProps>;
}