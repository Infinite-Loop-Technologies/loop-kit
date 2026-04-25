import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { RegistryItemSummary } from "@/lib/registry"
import { ArrowRight, Hammer, Layers3 } from "lucide-react"
import Link from "next/link"

export function RegistryCard({ item }: { item: RegistryItemSummary }) {
  return (
    <Card className="border-white/60 bg-white/80 shadow-sm backdrop-blur">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-xs capitalize">
            {item.category}
          </Badge>
          <Badge variant="outline" className="rounded-full px-2.5 py-1 text-xs">
            {item.type}
          </Badge>
        </div>
        <CardTitle className="text-xl">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
            <Layers3 className="size-3.5" />
            Installable source
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1">
            <Hammer className="size-3.5" />
            Editable downstream
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Link
          href={`/registry/${item.category}/${item.name}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
        >
          Open item
          <ArrowRight className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  )
}
