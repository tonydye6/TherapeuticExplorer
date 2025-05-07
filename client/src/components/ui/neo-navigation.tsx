import * as React from "react"
import { cn } from "@/lib/utils"
import { Link } from "wouter";

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

    const NavElement = href ? 
      ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => 
        <Link href={href} onClick={handleClick}><div className={className} {...props} /></Link> : 
      ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => 
        <div className={className} onClick={handleClick} {...props} />;
    
    return (
      <NavElement
        ref={ref}
        className={cn(
          "relative group flex items-center gap-3 px-4 py-3 my-2 text-lg font-bold rounded-lg border-3 transition-all duration-300",
          "hover:translate-x-1 hover:translate-y-[-0.1rem]",
          active
            ? "bg-sophera-brand-primary text-white border-sophera-text-heading shadow-[0.3rem_0.3rem_0_#05060f]"
            : "bg-white text-sophera-text-heading border-sophera-text-heading/70 shadow-[0.2rem_0.2rem_0_#05060f] hover:border-sophera-text-heading hover:shadow-[0.3rem_0.3rem_0_#05060f]",
          className
        )}
        {...props}
      >
        {icon && <span className="transition-transform duration-300 group-hover:rotate-[-5deg] group-hover:scale-110">{icon}</span>}
        <span className="transition-all duration-300 group-hover:translate-x-0.5">{children}</span>
        {badge && (
          <span 
            className={cn(
              "absolute right-2 top-[-0.5rem] min-w-[1.75rem] h-[1.75rem] flex items-center justify-center rounded-full text-sm border-2 border-sophera-text-heading font-bold transition-all duration-300 group-hover:rotate-[5deg] group-hover:scale-110",
              active 
                ? "bg-white text-sophera-brand-primary" 
                : "bg-sophera-accent-secondary text-white"
            )}
          >
            {badge}
          </span>
        )}
      </NavElement>
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

    const MainElement = href ? 
      ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => 
        <Link href={href}><div {...props}>{children}</div></Link> : 
      ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => 
        <div {...props}>{children}</div>;
    
    return (
      <div
        ref={ref}
        className={cn("mb-6", className)}
        {...props}
      >
        {title && (
          <>
            <MainElement
              className={cn(
                "relative flex items-center justify-between w-full cursor-pointer select-none px-3 py-2 rounded-lg mb-2 transition-all duration-300",
                collapsible && "hover:bg-slate-100 hover:shadow-[0.15rem_0.15rem_0_#05060f] border-2 border-sophera-text-heading/20 hover:border-sophera-text-heading/80"
              )}
              onClick={handleClick}
            >
              <div className="relative">
                <div className="flex items-center">
                  {icon && <span className="mr-2 text-sophera-text-subtle">{icon}</span>}
                  <h3 className={cn(
                    "text-xs uppercase font-bold tracking-wider",
                    active ? "text-sophera-brand-primary" : "text-sophera-text-subtle"
                  )}>
                    {title}
                  </h3>
                </div>
                <div className={cn(
                  "absolute bottom-[-0.1rem] left-[0.2rem] h-[0.2rem] w-3/4 transition-all duration-300",
                  active ? "bg-sophera-brand-primary/60" : "bg-sophera-accent-tertiary/40"
                )}></div>
              </div>
              
              {collapsible && (
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
                    "transition-transform duration-300 text-sophera-text-subtle",
                    isCollapsed ? "transform rotate-0" : "transform rotate-180"
                  )}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </MainElement>
          </>
        )}
        <div className={cn(
          "space-y-1 transition-all overflow-hidden duration-300",
          collapsible && isCollapsed ? "max-h-0 opacity-0 invisible" : "max-h-[1000px] opacity-100 visible"
        )}>
          {children}
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