"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded
   text-sm font-medium transition-all duration-150 focus-visible:outline-none
   focus-visible:ring-2 focus-visible:ring-forge-accent focus-visible:ring-offset-1
   focus-visible:ring-offset-forge-base disabled:pointer-events-none
   disabled:opacity-40 select-none`,
  {
    variants: {
      variant: {
        default:     `bg-forge-accent text-forge-base font-semibold
                      hover:bg-forge-accent-bright hover:shadow-forge-glow
                      active:scale-[0.97] active:brightness-95`,
        secondary:   `bg-forge-overlay text-forge-text-primary border border-forge-border
                      hover:bg-forge-muted hover:border-forge-muted active:scale-[0.97]`,
        outline:     `border border-forge-border bg-transparent text-forge-text-primary
                      hover:bg-forge-overlay hover:border-forge-muted active:scale-[0.97]`,
        ghost:       `bg-transparent text-forge-text-secondary
                      hover:bg-forge-overlay hover:text-forge-text-primary active:scale-[0.97]`,
        destructive: `bg-forge-error/10 text-forge-error border border-forge-error/30
                      hover:bg-forge-error/20 hover:border-forge-error/50 active:scale-[0.97]`,
        glow:        `bg-forge-accent text-forge-base font-bold shadow-forge-glow
                      hover:shadow-forge-glow-strong hover:bg-forge-accent-bright
                      hover:scale-[1.02] active:scale-[0.97]`,
        link:        `bg-transparent text-forge-accent underline-offset-4
                      hover:underline hover:text-forge-accent-bright p-0 h-auto`,
      },
      size: {
        sm:       'h-8 px-3 text-xs rounded-md',
        default:  'h-9 px-4 py-2',
        lg:       'h-11 px-6 text-base rounded-lg',
        xl:       'h-12 px-8 text-base rounded-lg',
        icon:     'h-9 w-9',
        'icon-sm':'h-7 w-7',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
