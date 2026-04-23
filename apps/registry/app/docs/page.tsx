import { PackageCallout } from "@/components/site/package-callout"
import { PageIntro, PageLayout, PagePanel, PageSection } from "@/components/site/page-layout"
import { Separator } from "@/components/ui/separator"

export default function DocsPage() {
  return (
    <PageLayout>
      <PageIntro
        eyebrow="Architecture"
        title="Dockyard is built around package boundaries and editable source items."
        description="The repo intentionally distinguishes stable reusable APIs from installable source. That split keeps the core small while allowing downstream apps to own their UI and policy."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <PagePanel id="architecture" className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 text-sm leading-7 text-muted-foreground sm:text-base">
            <p>
              Packages are for stable reusable engines and boundaries. Registry items are for
              installable editable source and app-facing glue.
            </p>
            <Separator />
            <p>
              `dock` stays headless. It owns committed dock state, commands, policies, history,
              and persistence contracts. `dock-react` stays thin and only bridges `dock` plus
              `interaction-*` into React.
            </p>
            <p>
              App-facing Dock UI, panel chrome, tabs, headers, and policy-heavy behavior belong in
              registry items unless they become clearly universal and stable.
            </p>
            <p>
              The foundational stack now has explicit layers: `common`, `common-react`,
              `interaction-core`, `interaction-react`, `dock`, and `dock-react`.
            </p>
            <p>
              Services may appear in either place. Put them in a package when they are foundational
              and stable. Put them in a registry item when they represent app-level wiring, policy,
              or UI glue that downstream teams are expected to edit.
            </p>
          </div>
        </PagePanel>
        <PackageCallout />
      </div>

      <PageSection
        title="Package boundaries"
        description="The stable packages each have a narrow job. The goal is to make their roles obvious from the tree."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            {
              id: "common",
              title: "common",
              body: "Small reusable primitives only. No app glue, no registry policy, no UI ownership concerns.",
            },
            {
              id: "common-react",
              title: "common-react",
              body: "Reusable React adapters for `Store` and strict runtime/service contexts.",
            },
            {
              id: "interaction-core",
              title: "interaction-core",
              body: "Headless target runtime with structured press, click, drag, hover, and focus signals.",
            },
            {
              id: "interaction-react",
              title: "interaction-react",
              body: "React bridge for the interaction runtime. Target registration and DOM event forwarding live here.",
            },
            {
              id: "dock",
              title: "dock",
              body: "The headless dock engine boundary. Keep committed state, commands, history, and persistence here.",
            },
            {
              id: "dock-react",
              title: "dock-react",
              body: "A thin React bridge over `dock` and `interaction-*`. Hooks and providers belong here, not product behavior.",
            },
          ].map((entry) => (
            <PagePanel key={entry.id} id={entry.id} className="flex flex-col gap-3">
              <h3 className="text-xl font-semibold tracking-tight">{entry.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{entry.body}</p>
            </PagePanel>
          ))}
        </div>
      </PageSection>

      <PageSection
        title="Registry contract"
        description="Registry items are meant to be copied into downstream apps and then edited. That is why they live outside the stable packages."
      >
        <PagePanel id="registry-contract" className="flex flex-col gap-4">
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            Registry items can mix UI, policy, and app-specific wiring in a way packages should not.
            They are for source ownership, not hidden abstractions.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              "App-facing Dock UI should usually stay installable and editable.",
              "Policy-heavy service wiring is allowed here when downstream teams need to own it.",
              "Move code into packages only when the boundary is stable and broadly reusable.",
            ].map((point) => (
              <div key={point} className="rounded-3xl bg-secondary/80 px-4 py-4 text-sm text-secondary-foreground">
                {point}
              </div>
            ))}
          </div>
        </PagePanel>
      </PageSection>
    </PageLayout>
  )
}
