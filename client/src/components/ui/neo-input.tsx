import * as React from "react"
import { cn } from "@/lib/utils"

const NeoInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border-3 border-sophera-text-heading bg-white px-4 py-3 text-base font-medium text-sophera-text-heading shadow-[0.2rem_0.2rem_0_#05060f] transition-all duration-300",
          "placeholder:text-sophera-text-subtle placeholder:font-normal",
          "focus:outline-none focus:border-sophera-brand-primary focus:translate-x-[-0.1rem] focus:translate-y-[-0.1rem] focus:shadow-[0.3rem_0.3rem_0_#05060f]",
          "hover:border-sophera-brand-primary-dark hover:shadow-[0.25rem_0.25rem_0_#05060f]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:border-sophera-border-subtle disabled:shadow-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
NeoInput.displayName = "NeoInput"

// Wrapper component with label and optional decorative elements
interface NeoInputWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  htmlFor?: string
  error?: string
  corner?: "star" | "dot" | "triangle" | "none"
}

const NeoInputWrapper = React.forwardRef<HTMLDivElement, NeoInputWrapperProps>(
  ({ className, children, label, htmlFor, error, corner = "none", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative space-y-2", className)}
        {...props}
      >
        {label && (
          <label 
            htmlFor={htmlFor}
            className="font-bold text-sophera-text-heading mb-1 inline-block uppercase text-sm tracking-wide"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {children}
          
          {corner === "star" && (
            <div className="absolute top-[-0.5rem] right-[-0.5rem] text-sophera-brand-primary text-lg z-10">★</div>
          )}
          {corner === "dot" && (
            <div className="absolute top-[-0.5rem] right-[-0.5rem] w-4 h-4 bg-sophera-accent-secondary rounded-full border-2 border-sophera-text-heading z-10"></div>
          )}
          {corner === "triangle" && (
            <div className="absolute top-[-0.75rem] right-[-0.75rem] w-5 h-5 bg-sophera-accent-tertiary transform rotate-45 border-2 border-sophera-text-heading z-10"></div>
          )}
        </div>
        
        {error && (
          <p className="text-sophera-error text-sm font-medium">{error}</p>
        )}
      </div>
    )
  }
)
NeoInputWrapper.displayName = "NeoInputWrapper"

export { NeoInput, NeoInputWrapper }