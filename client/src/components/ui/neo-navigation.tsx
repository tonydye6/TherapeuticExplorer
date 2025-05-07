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
  ({ className, active, icon, href, badge, children, ...props }, ref) => {
    const NavElement = href ? 
      ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => 
        <Link href={href}><div className={className} {...props} /></Link> : 
      ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => 
        <div className={className} {...props} />;
    
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
}

export const NeoNavigationSection = React.forwardRef<HTMLDivElement, NeoNavigationSectionProps>(
  ({ className, title, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mb-6", className)}
        {...props}
      >
        {title && (
          <div className="relative inline-block mb-2">
            <h3 className="text-xs uppercase font-bold tracking-wider text-sophera-text-subtle px-3">
              {icon && <span className="mr-2">{icon}</span>}
              {title}
            </h3>
            <div className="absolute bottom-[-0.1rem] left-[0.2rem] h-[0.2rem] w-3/4 bg-sophera-accent-tertiary/40"></div>
          </div>
        )}
        <div className="space-y-1">{children}</div>
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