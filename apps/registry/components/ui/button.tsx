import { cn } from "@/lib/utils"
import { type VariantProps, cva } from "class-variance-authority"
import type { ButtonHTMLAttributes } from "react"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary px-5 py-2.5 text-primary-foreground hover:opacity-90",
        secondary: "bg-secondary px-5 py-2.5 text-secondary-foreground hover:bg-secondary/80",
        ghost: "px-4 py-2 text-foreground hover:bg-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export function Button({
  className,
  variant,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />
}
