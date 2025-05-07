"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const NeoSelect = SelectPrimitive.Root

const NeoSelectGroup = SelectPrimitive.Group

const NeoSelectValue = SelectPrimitive.Value

const NeoSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-12 w-full items-center justify-between rounded-lg border-3 border-sophera-text-heading bg-white px-4 py-3 text-base font-medium text-sophera-text-heading shadow-[0.2rem_0.2rem_0_#05060f] transition-all duration-300",
      "data-[placeholder]:text-sophera-text-subtle",
      "focus:outline-none focus:border-sophera-brand-primary focus:translate-x-[-0.1rem] focus:translate-y-[-0.1rem] focus:shadow-[0.3rem_0.3rem_0_#05060f]",
      "hover:border-sophera-brand-primary-dark hover:shadow-[0.25rem_0.25rem_0_#05060f]",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:border-sophera-border-subtle disabled:shadow-none",
      "[&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-5 w-5 text-sophera-brand-primary transition-transform duration-300 group-hover:scale-110" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
NeoSelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const NeoSelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-2",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-5 w-5 text-sophera-brand-primary" />
  </SelectPrimitive.ScrollUpButton>
))
NeoSelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const NeoSelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-2",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-5 w-5 text-sophera-brand-primary" />
  </SelectPrimitive.ScrollDownButton>
))
NeoSelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const NeoSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border-3 border-sophera-text-heading bg-white text-sophera-text-heading shadow-[0.3rem_0.3rem_0_#05060f] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <NeoSelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-2",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <NeoSelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
NeoSelectContent.displayName = SelectPrimitive.Content.displayName

const NeoSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "py-2 px-3 text-sm font-bold uppercase text-sophera-text-heading tracking-wide",
      className
    )}
    {...props}
  />
))
NeoSelectLabel.displayName = SelectPrimitive.Label.displayName

const NeoSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 px-3 text-base font-medium outline-none focus:bg-sophera-brand-primary-light focus:text-sophera-brand-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-all hover:translate-x-1 hover:bg-sophera-brand-primary-light/50",
      className
    )}
    {...props}
  >
    <span className="absolute left-3 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-5 w-5 text-sophera-brand-primary" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText className="pl-6">{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
NeoSelectItem.displayName = SelectPrimitive.Item.displayName

const NeoSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("mx-1 my-1.5 h-px bg-sophera-border-primary", className)}
    {...props}
  />
))
NeoSelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  NeoSelect,
  NeoSelectGroup,
  NeoSelectValue,
  NeoSelectTrigger,
  NeoSelectContent,
  NeoSelectLabel,
  NeoSelectItem,
  NeoSelectSeparator,
  NeoSelectScrollUpButton,
  NeoSelectScrollDownButton,
}