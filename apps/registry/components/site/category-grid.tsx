import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RegistryCategorySummary } from "@/lib/registry"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CategoryGrid({ categories }: { categories: RegistryCategorySummary[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <Link key={category.slug} href={`/registry/${category.slug}`}>
          <Card className="h-full border-white/60 bg-white/80 transition hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl capitalize">
                {category.name}
                <ArrowRight className="size-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{category.description}</p>
              <p className="text-sm font-medium">{category.count} item(s)</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
