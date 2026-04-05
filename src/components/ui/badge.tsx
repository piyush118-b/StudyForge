import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium tracking-wide transition-all",
  {
    variants: {
      variant: {
        default:     "bg-forge-accent-glow text-forge-accent border border-forge-accent/25",
        secondary:   "bg-forge-overlay text-forge-text-secondary border border-forge-border",
        destructive: "bg-red-500/10 text-red-400 border border-red-500/25",
        warning:     "bg-amber-500/10 text-amber-400 border border-amber-500/25",
        outline:     "border border-forge-border text-forge-text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
