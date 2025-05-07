import React from 'react';
import { cn } from '@/lib/utils';

interface NeoPageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  decorationColor?: string;
  titleSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export function NeoPageHeader({
  title,
  description,
  icon,
  actions,
  className,
  decorationColor = 'bg-sophera-accent-tertiary',
  titleSize = 'lg',
}: NeoPageHeaderProps) {
  const titleSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className={cn(
      "relative mb-8 pb-4 border-b-4 border-sophera-text-heading",
      className
    )}>
      {/* Decorative elements */}
      <div className={`absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 ${decorationColor} transform rotate-45 border-2 border-sophera-text-heading z-0`}></div>
      <div className={`absolute bottom-[0.5rem] left-[-0.5rem] w-3 h-3 ${decorationColor} transform rotate-12 border-2 border-sophera-text-heading z-0`}></div>
      
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {icon && (
            <div className="mr-3 h-10 w-10 flex items-center justify-center rounded-lg bg-white border-3 border-sophera-text-heading shadow-[0.2rem_0.2rem_0_#000000]">
              {icon}
            </div>
          )}
          <div>
            <h1 className={cn(
              "font-extrabold text-sophera-text-heading leading-tight",
              titleSizeClasses[titleSize]
            )}>
              {title}
            </h1>
            {description && (
              <p className="text-sophera-text-subtle mt-1">{description}</p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

interface NeoPageSectionProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function NeoPageSection({
  title,
  description,
  icon,
  children,
  className,
}: NeoPageSectionProps) {
  return (
    <div className={cn("mb-8", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <div className="flex items-center mb-1">
              {icon && <span className="mr-2">{icon}</span>}
              <h2 className="text-xl font-bold text-sophera-text-heading">{title}</h2>
            </div>
          )}
          {description && (
            <p className="text-sophera-text-subtle">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}