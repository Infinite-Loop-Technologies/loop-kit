import type { DockGroupNode, DockLayoutNode } from "@loop-kit/dock"
import { useDockRuntimeState, useDockService, useDockState } from "@loop-kit/dock-react"
import { CircleDot, Plus } from "lucide-react"
import { useMemo, useState } from "react"

import {
  WorkbenchDockDropzoneOverlay,
  WorkbenchDockEventLog,
  WorkbenchDockLayout,
  WorkbenchDockPreviewOverlay,
  WorkbenchDockProvider,
  collectDockGroups,
} from "@/bridges/dock/WorkbenchDockBridge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InspectorRow } from "@/components/workbench/InspectorRow"

export const DockLab = () => {
  return (
    <WorkbenchDockProvider className="grid min-h-[720px] grid-cols-[1fr_320px] gap-4">
      <DockWorkbenchSurface />
      <Card className="min-h-[720px] overflow-hidden">
        <CardHeader>
          <CardTitle>Runtime inspector</CardTitle>
          <CardDescription>Live committed state and transient dock runtime state.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <InspectorRows />
        </CardContent>
      </Card>
    </WorkbenchDockProvider>
  )
}

const DockWorkbenchSurface = () => {
  const service = useDockService()
  const state = useDockState()
  const modal = state.layout.modals[0]
  const groups = useMemo(
    () => collectDockGroups(state.layout.roots.main),
    [state.layout.roots.main]
  )

  return (
    <Card className="grid min-h-[720px] grid-rows-[auto_1fr] overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Dock surface</CardTitle>
          <CardDescription>
            Workbench-owned Dock UI composed from headless service state and bridge target hooks.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => modal && service.openModal(modal.id)}>
            <Plus className="h-4 w-4" />
            Open modal
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => state.selectedPanelId && service.focusPanel(state.selectedPanelId)}
          >
            <CircleDot className="h-4 w-4" />
            Refocus
          </Button>
        </div>
      </CardHeader>
      <CardContent className="workbench-muted-surface min-h-0 p-3">
        <div className="workbench-dock-surface relative h-full min-h-[560px] rounded-md border p-2">
          <WorkbenchDockLayout />
          <WorkbenchDockDropzoneOverlay groups={groups} />
          <WorkbenchDockPreviewOverlay />
        </div>
      </CardContent>
    </Card>
  )
}

const InspectorRows = () => {
  const state = useDockState()
  const runtimeState = useDockRuntimeState()
  const service = useDockService()
  const [view, setView] = useState<
    "summary" | "panels" | "surfaces" | "windows" | "groups" | "policy"
  >("summary")
  const activeWindow = state.layout.floatingWindows.find((window) => window.active)
  const groups = collectAllDockGroups(state.layout)

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {(["summary", "panels", "surfaces", "windows", "groups", "policy"] as const).map((item) => (
          <Button
            key={item}
            size="sm"
            variant={view === item ? "secondary" : "outline"}
            onClick={() => setView(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      {view === "summary" ? (
        <>
          <InspectorRow label="Focused panel" value={state.focusedPanelId ?? "none"} />
          <InspectorRow label="Selected panel" value={state.selectedPanelId ?? "none"} />
          <InspectorRow
            label="Modal queue"
            value={state.modalQueue.length ? state.modalQueue.join(", ") : "none"}
          />
          <InspectorRow label="Active window" value={activeWindow?.title ?? "none"} />
          <InspectorRow
            label="Drag preview"
            value={
              runtimeState.dragPreview?.placement?.side ??
              (runtimeState.dragPreview ? "active" : "none")
            }
          />
          <InspectorRow
            label="Resize preview"
            value={
              runtimeState.resizePreview ? runtimeState.resizePreview.ratio.toFixed(2) : "none"
            }
          />
          <InspectorRow
            label="Window move"
            value={
              runtimeState.windowMovePreview
                ? `${Math.round(runtimeState.windowMovePreview.frame.x)}, ${Math.round(runtimeState.windowMovePreview.frame.y)}`
                : "none"
            }
          />
          <InspectorRow
            label="Window resize"
            value={
              runtimeState.windowResizePreview
                ? `${Math.round(runtimeState.windowResizePreview.frame.width)}x${Math.round(runtimeState.windowResizePreview.frame.height)}`
                : "none"
            }
          />
        </>
      ) : null}
      {view === "panels"
        ? state.panels.map((panel) => (
            <InspectorRow
              key={panel.id}
              label={panel.title}
              value={`kind=${panel.kind}; closable=${panel.closable ?? "default"}; surface=${panel.surfaceId ?? "none"}; metadata=${formatMetadata(panel.metadata)}`}
            />
          ))
        : null}
      {view === "surfaces" ? (
        <>
          {state.surfaces.map((surface) => (
            <InspectorRow
              key={surface.id}
              label={surface.title ?? surface.id}
              value={`kind=${surface.kind}; panel=${surface.panelId ?? "none"}; layer=${surface.layerId ?? "none"}; metadata=${formatMetadata(surface.metadata)}`}
            />
          ))}
          {state.layout.floatingWindows.map((window) => (
            <InspectorRow
              key={window.surfaceId}
              label={window.title}
              value={`kind=window; surface=${window.surfaceId}; window=${window.id}`}
            />
          ))}
          {state.layout.modals.map((modal) => (
            <InspectorRow
              key={modal.surfaceId}
              label={modal.title}
              value={`kind=modal; surface=${modal.surfaceId}; modal=${modal.id}; open=${modal.open}`}
            />
          ))}
        </>
      ) : null}
      {view === "windows"
        ? state.layout.floatingWindows.map((window) => (
            <InspectorRow
              key={window.id}
              label={window.title}
              value={`active=${window.active}; resizable=${window.resizable}; draggable=${window.draggable}; surface=${window.surfaceId}; frame=${Math.round(window.frame.x)},${Math.round(window.frame.y)} ${Math.round(window.frame.width)}x${Math.round(window.frame.height)}`}
            />
          ))
        : null}
      {view === "groups"
        ? groups.map((group) => (
            <InspectorRow
              key={group.id}
              label={group.id}
              value={`stack=${group.stackMode}; active=${group.activePanelId ?? "none"}; fixed=${group.fixed ?? false}; panels=${group.panelIds.join(", ") || "none"}`}
            />
          ))
        : null}
      {view === "policy" ? (
        <PlacementDebugger
          groups={groups}
          service={service}
          selectedPanelId={state.selectedPanelId}
        />
      ) : null}
      <WorkbenchDockEventLog />
    </>
  )
}

const PlacementDebugger = ({
  groups,
  selectedPanelId,
  service,
}: {
  readonly groups: ReadonlyArray<DockGroupNode>
  readonly selectedPanelId: ReturnType<typeof useDockState>["selectedPanelId"]
  readonly service: ReturnType<typeof useDockService>
}) => {
  if (!selectedPanelId) return <InspectorRow label="Placement debugger" value="No selected panel" />

  return (
    <>
      {groups.flatMap((group) =>
        (["center", "left", "right", "top", "bottom"] as const).map((side) => {
          const result = service.canApplyPlacement(selectedPanelId, {
            targetGroupId: group.id,
            side,
          })
          const value = result.ok
            ? `${result.value.allowed ? "allowed" : "blocked"}${result.value.reason ? `: ${result.value.reason}` : ""}`
            : `error: ${result.error.type}`
          return (
            <InspectorRow key={`${group.id}:${side}`} label={`${group.id} ${side}`} value={value} />
          )
        })
      )}
    </>
  )
}

const collectAllDockGroups = (layout: ReturnType<typeof useDockState>["layout"]) => [
  ...collectFromNode(layout.roots.main),
  ...collectFromNode(layout.roots.left ?? null),
  ...collectFromNode(layout.roots.right ?? null),
  ...collectFromNode(layout.roots.top ?? null),
  ...collectFromNode(layout.roots.bottom ?? null),
  ...layout.floatingWindows.flatMap((window) => collectFromNode(window.root)),
  ...layout.modals.flatMap((modal) => collectFromNode(modal.root)),
  ...layout.overlays.flatMap((modal) => collectFromNode(modal.root)),
]

const collectFromNode = (node: DockLayoutNode | null): ReadonlyArray<DockGroupNode> => {
  if (!node) return []
  if (node.type === "group") return [node]
  return [...collectFromNode(node.leading), ...collectFromNode(node.trailing)]
}

const formatMetadata = (metadata: Readonly<Record<string, unknown>> | undefined): string =>
  metadata ? JSON.stringify(metadata) : "none"
