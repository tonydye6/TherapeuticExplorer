import * as React from "react"
import { cn } from "@/lib/utils"

const NeoCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative bg-sophera-bg-card border-4 border-sophera-text-heading rounded-xl shadow-[0.5rem_0.5rem_0_#05060f] transition-all duration-300 hover:translate-x-[-0.3rem] hover:translate-y-[-0.3rem] hover:shadow-[0.8rem_0.8rem_0_#05060f] overflow-hidden",
      className
    )}
    {...props}
  />
))
NeoCard.displayName = "NeoCard"

const NeoCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative px-6 py-5 bg-sophera-brand-primary text-white font-extrabold flex justify-between items-center border-b-4 border-sophera-text-heading uppercase tracking-wide z-10",
      className
    )}
    {...props}
  />
))
NeoCardHeader.displayName = "NeoCardHeader"

const NeoCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-extrabold leading-none tracking-wide",
      className
    )}
    {...props}
  />
))
NeoCardTitle.displayName = "NeoCardTitle"

const NeoCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base font-medium text-sophera-text-heading leading-relaxed", className)}
    {...props}
  />
))
NeoCardDescription.displayName = "NeoCardDescription"

const NeoCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("relative p-6 z-10", className)} 
    {...props} 
  />
))
NeoCardContent.displayName = "NeoCardContent"

const NeoCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between mt-4 pt-4 border-t-2 border-dashed border-sophera-border-primary relative",
      className
    )}
    {...props}
  />
))
NeoCardFooter.displayName = "NeoCardFooter"

const NeoCardBadge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "bg-white text-sophera-text-heading text-xs font-extrabold py-1.5 px-3 border-2 border-sophera-text-heading rounded-md shadow-[0.2rem_0.2rem_0_#05060f] uppercase tracking-wider transform rotate-3 transition-transform hover:rotate-[-2deg] hover:scale-110",
      className
    )}
    {...props}
  />
))
NeoCardBadge.displayName = "NeoCardBadge"

const NeoCardDecoration = () => {
  return (
    <>
      {/* Corner accent */}
      <div className="absolute top-[-1rem] right-[-1rem] w-16 h-16 bg-sophera-accent-secondary transform rotate-45 z-10"></div>
      <div className="absolute top-2 right-2 text-sophera-text-heading text-xl font-bold z-20">★</div>
      
      {/* Card pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:0.5rem_0.5rem] opacity-50 pointer-events-none"></div>
      
      {/* Bottom decoration */}
      <div className="absolute bottom-[-1.2rem] right-8 w-10 h-10 bg-sophera-accent-secondary border-2 border-sophera-text-heading rounded-md transform rotate-45 transition-transform hover:rotate-[55deg] hover:scale-110"></div>
    </>
  )
}

export { 
  NeoCard, 
  NeoCardHeader, 
  NeoCardFooter, 
  NeoCardTitle, 
  NeoCardDescription, 
  NeoCardContent,
  NeoCardBadge,
  NeoCardDecoration
}