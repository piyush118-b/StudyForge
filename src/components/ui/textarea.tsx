import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full min-h-[80px] px-3 py-2 bg-[#222222] border border-[#2A2A2A] rounded-lg text-sm text-[#F0F0F0] placeholder:text-[#606060] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/30 focus-visible:border-[#10B981]/60 hover:border-[#333333] resize-y",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
