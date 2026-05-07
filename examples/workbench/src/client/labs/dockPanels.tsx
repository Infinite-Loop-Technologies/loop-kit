import type { DockPanelComponentProps } from "@loop-kit/dock-react"
import { Activity, CircleDot, Maximize2, PanelLeft } from "lucide-react"
import type { ReactNode } from "react"

import { InspectorRow } from "@/components/workbench/InspectorRow"

export function DockExplorerPanel({ panel }: DockPanelComponentProps) {
  return (
    <PanelShell title={panel.title} icon={<PanelLeft className="h-4 w-4" />}>
      <div className="grid gap-2">
        {["Source", "Packages", "Examples", "Prompts"].map((item) => (
          <div
            key={item}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm text-card-foreground"
          >
            {item}
          </div>
        ))}
      </div>
    </PanelShell>
  )
}

export function DockEditorPanel({ panel }: DockPanelComponentProps) {
  return (
    <PanelShell title={panel.title} icon={<CircleDot className="h-4 w-4" />}>
      <div className="grid gap-2 font-mono text-xs">
        <div className="rounded-md border border-border bg-muted p-3 text-foreground">
          <span>const</span> runtime = createInteractionRuntime()
        </div>
        <div className="rounded-md border border-border bg-muted p-3 text-foreground">
          <span>dock</span>.commitDrop(panelId, placement)
        </div>
      </div>
    </PanelShell>
  )
}

export function DockInspectorPanel({ panel }: DockPanelComponentProps) {
  return (
    <PanelShell title={panel.title} icon={<Maximize2 className="h-4 w-4" />}>
      <div className="grid gap-2 text-sm">
        <InspectorRow label="Kind" value={panel.kind} />
        <InspectorRow label="Closable" value={panel.closable ? "yes" : "no"} />
      </div>
    </PanelShell>
  )
}

export function DockAlertPanel({ panel }: DockPanelComponentProps) {
  return (
    <PanelShell title={panel.title} icon={<Activity className="h-4 w-4" />}>
      <p className="text-sm leading-6 text-muted-foreground">
        This panel lives inside a dock modal. Escape and registered backdrop clicks should close it.
      </p>
    </PanelShell>
  )
}

const PanelShell = ({
  title,
  icon,
  children,
}: {
  readonly title: string
  readonly icon: ReactNode
  readonly children: ReactNode
}) => (
  <div className="h-full p-3 text-card-foreground">
    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
      {icon}
      {title}
    </div>
    {children}
  </div>
)
