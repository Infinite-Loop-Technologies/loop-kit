import { PageIntro, PageLayout, PagePanel, PageSection } from "@/components/site/page-layout"
import { RegistryCard } from "@/components/site/registry-card"
import { getRegistryCategories, getRegistryItemsByCategory } from "@/lib/registry"
import { notFound } from "next/navigation"

export default async function RegistryCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const [categories, items] = await Promise.all([
    getRegistryCategories(),
    getRegistryItemsByCategory(category),
  ])

  const categoryInfo = categories.find((entry) => entry.slug === category)

  if (!categoryInfo) {
    notFound()
  }

  return (
    <PageLayout>
      <PageIntro
        eyebrow="Registry category"
        title={categoryInfo.name}
        description={categoryInfo.description}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <PageSection
          title="Installable items"
          description="Each item here is real editable source from the local registry tree, grouped by intent rather than by package."
          className="min-w-0"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((item) => (
              <RegistryCard key={item.id} item={item} />
            ))}
          </div>
        </PageSection>
        <PagePanel className="flex h-fit flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">Category summary</h2>
            <p className="text-sm text-muted-foreground">Use categories to place app-facing source without muddying package boundaries.</p>
          </div>
          <div className="rounded-3xl bg-secondary/80 px-4 py-4">
            <div className="text-3xl font-semibold">{items.length}</div>
            <div className="text-sm text-muted-foreground">item{items.length === 1 ? "" : "s"} in this category</div>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            If an item starts becoming stable, generic, and boundary-worthy, it can graduate into a package later.
          </p>
        </PagePanel>
      </div>
    </PageLayout>
  )
}
