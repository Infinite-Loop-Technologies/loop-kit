import { CategoryGrid } from "@/components/site/category-grid"
import { PageIntro, PageLayout, PagePanel, PageSection } from "@/components/site/page-layout"
import { PackageCallout } from "@/components/site/package-callout"
import { Button } from "@/components/ui/button"
import { getRegistryCategories, getRegistryItems } from "@/lib/registry"
import { ArrowRight, Boxes, FileCode2, ToyBrick } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const [categories, items] = await Promise.all([getRegistryCategories(), getRegistryItems()])

  return (
    <PageLayout className="gap-14">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] xl:items-start">
        <PagePanel className="flex flex-col gap-6 sm:p-10">
          <PageIntro
            eyebrow="Clean Bun workspace"
            title="Dockyard keeps Dock packages small and puts installable UI where it belongs."
            description="Stable engines live in packages. App-facing Dock UI, wiring, and editable source live in the registry. The result is a repo that stays understandable while still shipping real installable building blocks."
          />
          <div className="flex flex-wrap gap-3">
            <Link href="/registry">
              <Button className="gap-2">
                Browse registry
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary">Read architecture docs</Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={<Boxes className="size-5" />}
              label="Packages"
              value="6"
              note="small stable boundaries"
            />
            <StatCard
              icon={<FileCode2 className="size-5" />}
              label="Registry items"
              value={String(items.length)}
              note="installable source"
            />
            <StatCard
              icon={<ToyBrick className="size-5" />}
              label="Runtimes"
              value="3"
              note="common, interaction, dock"
            />
          </div>
        </PagePanel>
        <PackageCallout />
      </section>

      <PageSection
        title="Registry categories stay explicit."
        description="The site mirrors the local registry tree so future items remain easy to place and easy to document."
      >
        <CategoryGrid categories={categories} />
      </PageSection>

      <PageSection
        title="Stable packages"
        description="The package layer stays small and deliberate. Product-heavy UI and policy belong somewhere else."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "common",
            body: "Broadly reusable primitives only. No React, no DOM, no app glue.",
          },
          {
            title: "common-react",
            body: "React adapters for Store-backed state and required contexts.",
          },
          {
            title: "interaction-core",
            body: "Portable runtime for targets, roles, structured signals, and session tasks.",
          },
          {
            title: "dock",
            body: "Headless dock service and runtime. Panels, splits, windows, modals, history, and persistence contracts.",
          },
          {
            title: "dock-react",
            body: "Thin React bridge for rendering dock state and registering dock targets.",
          },
        ].map((entry) => (
          <PagePanel key={entry.title} className="flex flex-col gap-3 p-6">
            <h3 className="text-xl font-semibold tracking-tight">{entry.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{entry.body}</p>
          </PagePanel>
        ))}
        </div>
      </PageSection>
    </PageLayout>
  )
}

function StatCard({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode
  label: string
  value: string
  note: string
}) {
  return (
    <div className="rounded-3xl border border-border bg-secondary/60 p-5">
      <div className="mb-3 inline-flex rounded-2xl bg-white p-2 text-primary shadow-sm">{icon}</div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{note}</p>
    </div>
  )
}
