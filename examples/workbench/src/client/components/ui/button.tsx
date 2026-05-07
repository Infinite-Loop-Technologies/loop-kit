import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react"

import { cn } from "@/lib/utils"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "default" | "secondary" | "outline" | "ghost"
  readonly size?: "default" | "sm" | "icon"
  readonly children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        variant === "default" &&
          "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" &&
          "border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "outline" &&
          "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        variant === "ghost" &&
          "border-transparent bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        size === "default" && "h-9 px-3",
        size === "sm" && "h-8 px-2.5 text-xs",
        size === "icon" && "h-9 w-9",
        className
      )}
      type={props.type ?? "button"}
      {...props}
    >
      {children}
    </button>
  )
)

Button.displayName = "Button"
