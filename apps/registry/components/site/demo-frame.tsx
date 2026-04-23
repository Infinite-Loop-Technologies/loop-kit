import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

export function DemoFrame({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card className="border-white/60 bg-white/85 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-6">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
