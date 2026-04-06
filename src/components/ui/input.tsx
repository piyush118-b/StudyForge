import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "w-full h-9 px-3 bg-[#222222] border border-[#2A2A2A] rounded-lg text-sm text-[#F0F0F0] placeholder:text-[#606060] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/30 focus-visible:border-[#10B981]/60 hover:border-[#333333]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
