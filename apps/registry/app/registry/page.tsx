import { CategoryGrid } from "@/components/site/category-grid"
import { PageIntro, PageLayout, PageSection } from "@/components/site/page-layout"
import { RegistryCard } from "@/components/site/registry-card"
import { getRegistryCategories, getRegistryItems } from "@/lib/registry"

export default async function RegistryPage() {
  const [categories, items] = await Promise.all([getRegistryCategories(), getRegistryItems()])

  return (
    <PageLayout>
      <PageIntro
        eyebrow="Registry"
        title="Installable source items, grouped by intent."
        description="Registry items are expected to be copied into apps and edited. They are not treated like opaque package APIs."
      />
      <PageSection
        title="Categories"
        description="The site mirrors the local registry tree so categories stay explicit as the registry grows."
      >
        <CategoryGrid categories={categories} />
      </PageSection>
      <PageSection
        title="All items"
        description="These are served from the local monorepo registry, not from a separate deployed source of truth."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <RegistryCard key={item.id} item={item} />
          ))}
        </div>
      </PageSection>
    </PageLayout>
  )
}
