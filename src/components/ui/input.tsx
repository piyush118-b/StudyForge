import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-md border border-forge-border bg-forge-overlay px-3 py-1 text-sm text-forge-text-primary shadow-sm transition-all duration-150 placeholder:text-forge-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-accent/70 focus-visible:border-forge-accent/50 hover:border-forge-muted disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

export { Input }
