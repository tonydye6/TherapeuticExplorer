import * as React from "react"
import { cn } from "@/lib/utils"
import { Link } from "wouter"

export interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  buttonText: string
  rounded?: "none" | "md" | "full"
  size?: "sm" | "md" | "lg"
  color?: "primary" | "violet" | "pink" | "red" | "orange" | "yellow" | "lime" | "cyan"
  active?: boolean
  href?: string
  icon?: React.ReactNode
  fullWidth?: boolean
}

const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ 
    className, 
    buttonText, 
    children, 
    active, 
    rounded = "md", 
    size = "md", 
    color = "cyan", 
    disabled, 
    href, 
    icon, 
    fullWidth,
    ...props 
  }, ref) => {
    
    const buttonClasses = cn(
      "relative border-sophera-text-heading border-2 font-bold flex items-center justify-center transition-all duration-300",
      "hover:translate-y-[-2px] active:translate-y-[1px]",
      {
        "bg-sophera-brand-primary text-white hover:bg-sophera-brand-primary-hover active:bg-sophera-brand-primary-dark": 
          (color === "primary" || active) && !disabled,
        "bg-violet-200 hover:bg-violet-300 active:bg-violet-400":
          color === "violet" && !disabled && !active,
        "bg-pink-200 hover:bg-pink-300 active:bg-pink-400":
          color === "pink" && !disabled && !active,
        "bg-red-200 hover:bg-red-300 active:bg-red-400":
          color === "red" && !disabled && !active,
        "bg-orange-200 hover:bg-orange-300 active:bg-orange-400":
          color === "orange" && !disabled && !active,
        "bg-yellow-200 hover:bg-yellow-300 active:bg-yellow-400":
          color === "yellow" && !disabled && !active,
        "bg-lime-200 hover:bg-lime-300 active:bg-lime-400":
          color === "lime" && !disabled && !active,
        "bg-cyan-200 hover:bg-cyan-300 active:bg-cyan-400":
          color === "cyan" && !disabled && !active,
      },
      { "rounded-none": rounded === "none" },
      { "rounded-md": rounded === "md" },
      { "rounded-full": rounded === "full" },
      { "h-10 px-4 shadow-[0.2rem_0.2rem_0_#05060f] hover:shadow-[0.25rem_0.25rem_0_#05060f]": size === "sm" },
      { "h-12 px-5 shadow-[0.25rem_0.25rem_0_#05060f] hover:shadow-[0.3rem_0.3rem_0_#05060f]": size === "md" },
      { "h-14 px-5 shadow-[0.3rem_0.3rem_0_#05060f] hover:shadow-[0.35rem_0.35rem_0_#05060f]": size === "lg" },
      { "border-[#727272] bg-[#D4D4D4] text-[#676767] hover:bg-[#D4D4D4] hover:shadow-none active:bg-[#D4D4D4]": disabled },
      { "w-full": fullWidth },
      className
    )

    const content = (
      <>
        {icon && <span className="mr-2">{icon}</span>}
        {buttonText || children}
      </>
    )
    
    if (href) {
      return (
        <Link href={href}>
          <button
            className={buttonClasses}
            disabled={disabled}
            ref={ref}
            {...props}
          >
            {content}
          </button>
        </Link>
      )
    }
    
    return (
      <button
        className={buttonClasses}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        {content}
      </button>
    )
  }
)

NeoButton.displayName = "NeoButton"

export { NeoButton }