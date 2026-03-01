"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  animate?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, animate, ...props }, ref) => {
  const [displayValue, setDisplayValue] = React.useState(animate ? 0 : (value || 0))

  React.useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setDisplayValue(value || 0), 100)
      return () => clearTimeout(timer)
    } else {
      setDisplayValue(value || 0)
    }
  }, [value, animate])

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-primary",
          animate ? "transition-transform duration-1000 ease-out" : "transition-all"
        )}
        style={{ transform: `translateX(-${100 - displayValue}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
