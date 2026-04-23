import { DemoFrame } from "@/components/site/demo-frame"
import { SourceCodeBlock } from "@/components/site/source-code-block"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRegistryItem } from "@/lib/registry"
import { getRegistryDemoComponent } from "@loop-kit/registry-source"
import { notFound } from "next/navigation"

export default async function RegistryItemPage({
  params,
}: {
  params: Promise<{ category: string; item: string }>
}) {
  const { category, item } = await params
  const registryItem = await getRegistryItem(category, item)

  if (!registryItem) {
    notFound()
  }

  const DemoComponent = getRegistryDemoComponent(registryItem.id)

  return (
    <div className="space-y-10 pb-10">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5 rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {registryItem.category}
            </Badge>
            <Badge variant="outline">{registryItem.type}</Badge>
            {registryItem.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight">{registryItem.title}</h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              {registryItem.description}
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-secondary/50 p-5 text-sm leading-7 text-muted-foreground">
            <p>{registryItem.readme}</p>
          </div>
        </div>

        <Card className="border-white/60 bg-white/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Packages touched by this item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {registryItem.dependencies.map((pkg) => (
              <p key={pkg} className="rounded-2xl bg-secondary px-4 py-3 text-sm">
                {pkg}
              </p>
            ))}
          </CardContent>
        </Card>
      </section>

      <DemoFrame
        title="Demo area"
        description="Registry items can ship small demo files so the site can preview intent without treating the item like a published package."
      >
        {DemoComponent ? (
          <DemoComponent />
        ) : (
          <p className="text-sm text-muted-foreground">No demo wired yet.</p>
        )}
      </DemoFrame>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Installable source</h2>
        <div className="grid gap-4">
          {registryItem.files.map((file) => (
            <SourceCodeBlock key={file.path} title={file.path} code={file.content} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Demo source</h2>
        <div className="grid gap-4">
          {registryItem.demoFiles.map((file) => (
            <SourceCodeBlock key={file.path} title={file.path} code={file.content} />
          ))}
        </div>
      </section>
    </div>
  )
}
