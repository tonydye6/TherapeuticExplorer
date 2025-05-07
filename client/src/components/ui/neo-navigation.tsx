import * as React from "react"
import { Link } from "wouter"
import { cn } from "@/lib/utils"

export interface NeoNavigationItemProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  icon?: React.ReactNode
  href?: string
  badge?: string | number
}

export const NeoNavigationItem = React.forwardRef<HTMLDivElement, NeoNavigationItemProps>(
  ({ className, active, icon, href, badge, children, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (onClick) onClick(e);
    };

    // If there's an href, render with Link
    if (href) {
      return (
        <div
          ref={ref}
          className={cn(
            "relative group flex items-center gap-3 px-4 py-3 my-2 text-lg font-bold rounded-lg border-3 transition-all duration-300",
            "hover:translate-x-1 hover:translate-y-[-0.2rem] hover:rotate-[0.5deg]",
            "after:absolute after:inset-0 after:rounded-lg after:border-3 after:border-dashed after:border-black/0 after:transition-all after:duration-300 after:z-[-1]",
            "hover:after:border-black/10 hover:after:translate-x-[-0.15rem] hover:after:translate-y-[0.15rem]",
            "overflow-hidden", 
            "before:absolute before:inset-0 before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] before:opacity-0 before:group-hover:opacity-100 before:group-hover:translate-x-[100%] before:transition-all before:duration-1000 before:z-10 before:pointer-events-none",
            active
              ? "bg-sophera-brand-primary text-white border-sophera-text-heading shadow-[0.35rem_0.35rem_0_#05060f]"
              : "bg-white text-sophera-text-heading border-sophera-text-heading/70 shadow-[0.2rem_0.2rem_0_#05060f] hover:border-sophera-text-heading hover:shadow-[0.35rem_0.35rem_0_#05060f]",
            className
          )}
          {...props}
        >
          <Link href={href}>
            <div className="flex items-center gap-3 w-full">
              {icon && (
                <span className="transition-all duration-300 group-hover:rotate-[-5deg] group-hover:scale-110 relative">
                  {icon}
                  <span className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/80 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></span>
                </span>
              )}
              <span className="transition-all duration-300 group-hover:translate-x-0.5 group-hover:font-extrabold relative">
                <span className="relative z-10">{children}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-sophera-accent-tertiary/30 to-transparent translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></span>
              </span>
              {badge && (
                <span 
                  className={cn(
                    "absolute right-2 top-[-0.7rem] min-w-[1.8rem] h-[1.8rem] flex items-center justify-center rounded-full text-sm border-2 border-sophera-text-heading font-bold transition-all duration-300",
                    "group-hover:rotate-[5deg] group-hover:scale-110 group-hover:animate-pulse",
                    "after:absolute after:inset-0 after:rounded-full after:border-2 after:border-dashed after:border-black/0 after:transition-all after:duration-300 after:scale-110 after:z-[-1]",
                    "group-hover:after:border-black/10 group-hover:after:scale-125",
                    active 
                      ? "bg-white text-sophera-brand-primary" 
                      : "bg-sophera-accent-secondary text-white"
                  )}
                >
                  {badge}
                </span>
              )}
            </div>
          </Link>
        </div>
      );
    }
    
    // If there's no href, render as a div
    return (
      <div
        ref={ref}
        className={cn(
          "relative group flex items-center gap-3 px-4 py-3 my-2 text-lg font-bold rounded-lg border-3 transition-all duration-300",
          "hover:translate-x-1 hover:translate-y-[-0.2rem] hover:rotate-[0.5deg]",
          "after:absolute after:inset-0 after:rounded-lg after:border-3 after:border-dashed after:border-black/0 after:transition-all after:duration-300 after:z-[-1]",
          "hover:after:border-black/10 hover:after:translate-x-[-0.15rem] hover:after:translate-y-[0.15rem]",
          "overflow-hidden", 
          "before:absolute before:inset-0 before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] before:opacity-0 before:group-hover:opacity-100 before:group-hover:translate-x-[100%] before:transition-all before:duration-1000 before:z-10 before:pointer-events-none",
          active
            ? "bg-sophera-brand-primary text-white border-sophera-text-heading shadow-[0.35rem_0.35rem_0_#05060f]"
            : "bg-white text-sophera-text-heading border-sophera-text-heading/70 shadow-[0.2rem_0.2rem_0_#05060f] hover:border-sophera-text-heading hover:shadow-[0.35rem_0.35rem_0_#05060f]",
          className
        )}
        onClick={(e) => handleClick(e)}
        {...props}
      >
        {icon && (
          <span className="transition-all duration-300 group-hover:rotate-[-5deg] group-hover:scale-110 relative">
            {icon}
            <span className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/80 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></span>
          </span>
        )}
        <span className="transition-all duration-300 group-hover:translate-x-0.5 group-hover:font-extrabold relative">
          <span className="relative z-10">{children}</span>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-sophera-accent-tertiary/30 to-transparent translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"></span>
        </span>
        {badge && (
          <span 
            className={cn(
              "absolute right-2 top-[-0.7rem] min-w-[1.8rem] h-[1.8rem] flex items-center justify-center rounded-full text-sm border-2 border-sophera-text-heading font-bold transition-all duration-300",
              "group-hover:rotate-[5deg] group-hover:scale-110 group-hover:animate-pulse",
              "after:absolute after:inset-0 after:rounded-full after:border-2 after:border-dashed after:border-black/0 after:transition-all after:duration-300 after:scale-110 after:z-[-1]",
              "group-hover:after:border-black/10 group-hover:after:scale-125",
              active 
                ? "bg-white text-sophera-brand-primary" 
                : "bg-sophera-accent-secondary text-white"
            )}
          >
            {badge}
          </span>
        )}
      </div>
    )
  }
)

NeoNavigationItem.displayName = "NeoNavigationItem"

export interface NeoNavigationSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  icon?: React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  href?: string
  active?: boolean
}

export const NeoNavigationSection = React.forwardRef<HTMLDivElement, NeoNavigationSectionProps>(
  ({ className, title, icon, children, collapsible = false, defaultCollapsed = true, href, active, ...props }, ref) => {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    
    const toggleCollapse = (e: React.MouseEvent) => {
      if (collapsible) {
        e.preventDefault();
        setIsCollapsed(!isCollapsed);
      }
    };
    
    const handleClick = (e: React.MouseEvent) => {
      toggleCollapse(e);
    };

    // Handle section with href
    let sectionContent = (
      <div
        className={cn(
          "relative flex items-center justify-between w-full cursor-pointer select-none px-3 py-2 rounded-lg mb-2 transition-all duration-300",
          collapsible && (
            active
              ? "bg-sophera-brand-primary/10 border-2 border-sophera-brand-primary/50 shadow-[0.15rem_0.15rem_0_#05060f] hover:bg-sophera-brand-primary/20" 
              : "hover:bg-slate-100 hover:shadow-[0.15rem_0.15rem_0_#05060f] border-2 border-sophera-text-heading/20 hover:border-sophera-text-heading/80"
          ),
          "hover:translate-y-[-0.1rem] hover:rotate-[0.2deg]"
        )}
        onClick={handleClick}
      >
        <div className="relative group">
          <div className="flex items-center">
            {icon && (
              <span className={cn(
                "mr-2 transition-all duration-300",
                active ? "text-sophera-brand-primary" : "text-sophera-text-subtle",
                "group-hover:scale-110 group-hover:rotate-[-5deg]"
              )}>
                {icon}
              </span>
            )}
            <h3 className={cn(
              "text-sm uppercase font-bold tracking-wider transition-all duration-300",
              active ? "text-sophera-brand-primary" : "text-sophera-text-subtle",
              "group-hover:translate-x-0.5"
            )}>
              {title}
            </h3>
          </div>
          <div className={cn(
            "absolute bottom-[-0.1rem] left-[0.2rem] h-[0.2rem] w-3/4 transition-all duration-300",
            active 
              ? "bg-sophera-brand-primary/70" 
              : "bg-sophera-accent-tertiary/40 group-hover:bg-sophera-accent-tertiary/60 group-hover:w-full"
          )}></div>
        </div>
        
        {collapsible && (
          <div className="relative flex items-center justify-center h-6 w-6 transition-all duration-300">
            <div className={cn(
              "absolute inset-0 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100",
              active 
                ? "bg-sophera-brand-primary/20" 
                : "bg-slate-200"
            )}></div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className={cn(
                "relative z-10 transition-all duration-300",
                active ? "text-sophera-brand-primary" : "text-sophera-text-subtle",
                isCollapsed 
                  ? "transform rotate-0 group-hover:scale-110" 
                  : "transform rotate-180 group-hover:scale-110"
              )}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        )}
      </div>
    );

    // If there's an href, wrap the section content in a Link
    if (href) {
      sectionContent = (
        <Link href={href}>
          {sectionContent}
        </Link>
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn("mb-6", className)}
        {...props}
      >
        {title && sectionContent}
        <div className={cn(
          "space-y-1 transition-all overflow-hidden",
          collapsible && isCollapsed 
            ? "max-h-0 opacity-0 invisible duration-300 transform translate-y-[-10px]" 
            : "max-h-[1000px] opacity-100 visible duration-500 transform translate-y-0"
        )}>
          <div className={cn(
            "transition-all duration-500",
            collapsible && !isCollapsed ? "animate-fadeIn" : ""
          )}>
            {children}
          </div>
        </div>
      </div>
    )
  }
)

NeoNavigationSection.displayName = "NeoNavigationSection"

export interface NeoMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NeoMenu = React.forwardRef<HTMLDivElement, NeoMenuProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-sophera-bg-card p-4 border-4 border-sophera-text-heading rounded-2xl shadow-[0.5rem_0.5rem_0_#05060f]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

NeoMenu.displayName = "NeoMenu"