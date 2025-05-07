import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const neoButtonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap text-sm font-bold uppercase tracking-wide rounded-lg border-2 sm:border-3 border-sophera-text-heading transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-sophera-brand-primary text-white shadow-[0.2rem_0.2rem_0_#05060f] sm:shadow-[0.3rem_0.3rem_0_#05060f] hover:translate-x-[-0.08rem] hover:translate-y-[-0.08rem] sm:hover:translate-x-[-0.1rem] sm:hover:translate-y-[-0.1rem] hover:shadow-[0.3rem_0.3rem_0_#05060f] sm:hover:shadow-[0.4rem_0.4rem_0_#05060f] active:translate-x-[0.08rem] active:translate-y-[0.08rem] sm:active:translate-x-[0.1rem] sm:active:translate-y-[0.1rem] active:shadow-[0.1rem_0.1rem_0_#05060f] sm:active:shadow-[0.15rem_0.15rem_0_#05060f]",
        secondary: "bg-sophera-accent-secondary text-white shadow-[0.2rem_0.2rem_0_#05060f] sm:shadow-[0.3rem_0.3rem_0_#05060f] hover:translate-x-[-0.08rem] hover:translate-y-[-0.08rem] sm:hover:translate-x-[-0.1rem] sm:hover:translate-y-[-0.1rem] hover:shadow-[0.3rem_0.3rem_0_#05060f] sm:hover:shadow-[0.4rem_0.4rem_0_#05060f] hover:bg-sophera-accent-secondary/90 active:translate-x-[0.08rem] active:translate-y-[0.08rem] sm:active:translate-x-[0.1rem] sm:active:translate-y-[0.1rem] active:shadow-[0.1rem_0.1rem_0_#05060f] sm:active:shadow-[0.15rem_0.15rem_0_#05060f]",
        tertiary: "bg-sophera-accent-tertiary text-sophera-text-heading shadow-[0.2rem_0.2rem_0_#05060f] sm:shadow-[0.3rem_0.3rem_0_#05060f] hover:translate-x-[-0.08rem] hover:translate-y-[-0.08rem] sm:hover:translate-x-[-0.1rem] sm:hover:translate-y-[-0.1rem] hover:shadow-[0.3rem_0.3rem_0_#05060f] sm:hover:shadow-[0.4rem_0.4rem_0_#05060f] hover:bg-sophera-accent-tertiary/90 active:translate-x-[0.08rem] active:translate-y-[0.08rem] sm:active:translate-x-[0.1rem] sm:active:translate-y-[0.1rem] active:shadow-[0.1rem_0.1rem_0_#05060f] sm:active:shadow-[0.15rem_0.15rem_0_#05060f]",
        outline: "bg-white text-sophera-text-heading shadow-[0.2rem_0.2rem_0_#05060f] sm:shadow-[0.3rem_0.3rem_0_#05060f] hover:translate-x-[-0.08rem] hover:translate-y-[-0.08rem] sm:hover:translate-x-[-0.1rem] sm:hover:translate-y-[-0.1rem] hover:shadow-[0.3rem_0.3rem_0_#05060f] sm:hover:shadow-[0.4rem_0.4rem_0_#05060f] hover:bg-sophera-bg-subtle active:translate-x-[0.08rem] active:translate-y-[0.08rem] sm:active:translate-x-[0.1rem] sm:active:translate-y-[0.1rem] active:shadow-[0.1rem_0.1rem_0_#05060f] sm:active:shadow-[0.15rem_0.15rem_0_#05060f]",
        destructive: "bg-sophera-error text-white shadow-[0.2rem_0.2rem_0_#05060f] sm:shadow-[0.3rem_0.3rem_0_#05060f] hover:translate-x-[-0.08rem] hover:translate-y-[-0.08rem] sm:hover:translate-x-[-0.1rem] sm:hover:translate-y-[-0.1rem] hover:shadow-[0.3rem_0.3rem_0_#05060f] sm:hover:shadow-[0.4rem_0.4rem_0_#05060f] hover:bg-sophera-error/90 active:translate-x-[0.08rem] active:translate-y-[0.08rem] sm:active:translate-x-[0.1rem] sm:active:translate-y-[0.1rem] active:shadow-[0.1rem_0.1rem_0_#05060f] sm:active:shadow-[0.15rem_0.15rem_0_#05060f]",
        link: "text-sophera-brand-primary underline underline-offset-4 hover:text-sophera-brand-primary-dark hover:underline-offset-8 hover:scale-105 border-0 shadow-none",
      },
      size: {
        default: "h-10 sm:h-11 px-4 sm:px-6 py-2 sm:py-2.5 gap-1.5 sm:gap-2 text-xs sm:text-sm",
        sm: "h-8 sm:h-9 px-3 sm:px-4 py-1.5 sm:py-2 gap-1 sm:gap-1.5 text-xs",
        lg: "h-12 sm:h-14 px-6 sm:px-8 py-2.5 sm:py-3 gap-2 sm:gap-3 text-sm sm:text-base",
        icon: "h-10 w-10 sm:h-11 sm:w-11 p-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface NeoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neoButtonVariants> {
  asChild?: boolean
  shine?: boolean
}

const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, variant, size, asChild = false, shine = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(neoButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        {shine && (
          <span className="absolute top-0 left-[-100%] w-full h-full bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] transition-all duration-600 group-hover:left-[100%]"></span>
        )}
      </Comp>
    )
  }
)
NeoButton.displayName = "NeoButton"

export { NeoButton, neoButtonVariants }