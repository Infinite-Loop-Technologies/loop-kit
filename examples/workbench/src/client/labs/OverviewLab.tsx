import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChecklistItem } from "@/components/workbench/ChecklistItem"

export const OverviewLab = () => (
  <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
    <Card>
      <CardHeader>
        <CardTitle>Examples-first validation surface</CardTitle>
        <CardDescription>
          Focused examples make package behavior easy to inspect before higher-level product work
          resumes.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <ChecklistItem done label="examples/simple proves workspace package consumption." />
        <ChecklistItem
          done
          label="examples/workbench keeps client, server, and shared boundaries."
        />
        <ChecklistItem done label="Dock behavior stays in dock service, runtime, and policies." />
        <ChecklistItem
          done
          label="dnd-kit is shown as app-level drag/drop, separate from dock policy."
        />
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Packages under test</CardTitle>
        <CardDescription>Use this app when changing public interaction surfaces.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        {[
          "@loop-kit/common",
          "@loop-kit/interaction",
          "@loop-kit/dock",
          "@loop-kit/dock-react",
        ].map((name) => (
          <div
            key={name}
            className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-card-foreground"
          >
            <span className="font-medium">{name}</span>
            <Badge variant="muted">workspace</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
)
