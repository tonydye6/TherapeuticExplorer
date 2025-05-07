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
      "relative mb-6 sm:mb-8 pb-3 sm:pb-4 border-b-3 sm:border-b-4 border-sophera-text-heading",
      className
    )}>
      {/* Decorative elements */}
      <div className={`absolute top-[-0.4rem] sm:top-[-0.5rem] right-[-0.4rem] sm:right-[-0.5rem] w-3 sm:w-4 h-3 sm:h-4 ${decorationColor} transform rotate-45 border-2 border-sophera-text-heading z-0`}></div>
      <div className={`absolute bottom-[0.4rem] sm:bottom-[0.5rem] left-[-0.4rem] sm:left-[-0.5rem] w-2.5 sm:w-3 h-2.5 sm:h-3 ${decorationColor} transform rotate-12 border-2 border-sophera-text-heading z-0`}></div>
      
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-center">
          {icon && (
            <div className="mr-2 sm:mr-3 h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg bg-white border-2 sm:border-3 border-sophera-text-heading shadow-[0.15rem_0.15rem_0_#000000] sm:shadow-[0.2rem_0.2rem_0_#000000]">
              {icon}
            </div>
          )}
          <div>
            <h1 className={cn(
              "font-extrabold text-sophera-text-heading leading-tight",
              {
                'text-lg sm:text-xl': titleSize === 'sm',
                'text-xl sm:text-2xl': titleSize === 'md',
                'text-2xl sm:text-3xl': titleSize === 'lg',
                'text-3xl sm:text-4xl': titleSize === 'xl',
              }
            )}>
              {title}
            </h1>
            {description && (
              <p className="text-sm sm:text-base text-sophera-text-subtle mt-0.5 sm:mt-1">{description}</p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center space-x-2 self-start">
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
    <div className={cn("mb-6 sm:mb-8", className)}>
      {(title || description) && (
        <div className="mb-3 sm:mb-4">
          {title && (
            <div className="flex items-center mb-1">
              {icon && <span className="mr-1.5 sm:mr-2">{icon}</span>}
              <h2 className="text-lg sm:text-xl font-bold text-sophera-text-heading">{title}</h2>
            </div>
          )}
          {description && (
            <p className="text-sm sm:text-base text-sophera-text-subtle">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}