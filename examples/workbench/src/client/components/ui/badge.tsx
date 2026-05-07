import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  readonly variant?: "default" | "muted" | "warning"
  readonly children?: ReactNode
}

export const Badge = ({ className, variant = "default", children, ...props }: BadgeProps) => (
  <div
    className={cn(
      "inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium",
      variant === "default" && "border-primary/20 bg-primary text-primary-foreground",
      variant === "muted" && "border-border bg-muted text-muted-foreground",
      variant === "warning" && "border-accent bg-accent text-accent-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
)
