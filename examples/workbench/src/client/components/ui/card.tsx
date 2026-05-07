import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

export const Card = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { readonly children?: ReactNode }) => (
  <section className={cn("workbench-card rounded-lg border", className)} {...props}>
    {children}
  </section>
)

export const CardHeader = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { readonly children?: ReactNode }) => (
  <div className={cn("border-b border-border p-4", className)} {...props}>
    {children}
  </div>
)

export const CardTitle = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { readonly children?: ReactNode }) => (
  <h2 className={cn("text-base font-semibold text-card-foreground", className)} {...props}>
    {children}
  </h2>
)

export const CardDescription = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { readonly children?: ReactNode }) => (
  <p className={cn("mt-1 text-sm leading-6 text-muted-foreground", className)} {...props}>
    {children}
  </p>
)

export const CardContent = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { readonly children?: ReactNode }) => (
  <div className={cn("p-4", className)} {...props}>
    {children}
  </div>
)
