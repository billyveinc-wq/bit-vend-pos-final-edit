import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value, defaultValue, ...props }, ref) => {
    // Preserve controlled vs uncontrolled behavior: only set value prop if it was provided
    const hasValueProp = Object.prototype.hasOwnProperty.call(props, 'value') || typeof value !== 'undefined';
    const controlledValue = hasValueProp ? (value ?? '') : undefined;

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input-border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:[color-scheme:dark] dark:[&::-webkit-calendar-picker-indicator]:invert dark:[&::-webkit-calendar-picker-indicator]:brightness-150 dark:[&::-webkit-calendar-picker-indicator]:opacity-100",
          className
        )}
        ref={ref}
        value={controlledValue}
        defaultValue={defaultValue}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
