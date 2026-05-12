import { useDockRuntimeState, useDockService, useDockState } from "@loop-kit/dock-react"
import { RotateCcw } from "lucide-react"

import {
  WorkbenchDockLayout,
  WorkbenchDockPreviewOverlay,
  WorkbenchDockProvider,
} from "@/bridges/dock/WorkbenchDockBridge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChecklistItem } from "@/components/workbench/ChecklistItem"
import { InspectorRow } from "@/components/workbench/InspectorRow"
import { createWorkbenchDockState } from "@/domain/workbenchDockFixture"

export const FloatingWindowsLab = () => (
  <WorkbenchDockProvider className="grid gap-4 lg:grid-cols-[1fr_320px]">
    <Card className="min-h-[620px] overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Floating windows</CardTitle>
          <CardDescription>
            Floating windows are committed Dock layout state. Move, resize, active state, and
            z-order are driven by headless service/runtime policy and React target bridges.
          </CardDescription>
        </div>
        <ResetFloatingWindowsButton />
      </CardHeader>
      <CardContent>
        <div className="workbench-dock-surface relative h-[480px] overflow-hidden rounded-md border p-2">
          <WorkbenchDockLayout />
          <WorkbenchDockPreviewOverlay />
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Window runtime proof</CardTitle>
        <CardDescription>
          Committed frame state plus transient move and resize previews.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <FloatingWindowInspector />
        <ChecklistItem done label="Window move target registration lives in the bridge." />
        <ChecklistItem done label="Move and resize commits belong to DockService." />
        <ChecklistItem done label="Window interaction policy installs into InteractionRuntime." />
      </CardContent>
    </Card>
  </WorkbenchDockProvider>
)

const ResetFloatingWindowsButton = () => {
  const service = useDockService()

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => service.state.set(createWorkbenchDockState())}
    >
      <RotateCcw className="h-4 w-4" />
      Reset
    </Button>
  )
}

const FloatingWindowInspector = () => {
  const state = useDockState()
  const runtimeState = useDockRuntimeState()
  const service = useDockService()
  const activeWindow = state.layout.floatingWindows.find((window) => window.active)
  const topWindow = state.layout.floatingWindows.at(-1)

  return (
    <>
      <InspectorRow label="Active window" value={activeWindow?.title ?? "none"} />
      <InspectorRow label="Top z-order" value={topWindow?.title ?? "none"} />
      <InspectorRow
        label="Active frame"
        value={
          activeWindow
            ? `${Math.round(activeWindow.frame.x)}, ${Math.round(activeWindow.frame.y)} / ${Math.round(activeWindow.frame.width)}x${Math.round(activeWindow.frame.height)}`
            : "none"
        }
      />
      <InspectorRow
        label="Move preview"
        value={
          runtimeState.windowMovePreview
            ? `${Math.round(runtimeState.windowMovePreview.frame.x)}, ${Math.round(runtimeState.windowMovePreview.frame.y)}`
            : "none"
        }
      />
      <InspectorRow
        label="Resize preview"
        value={
          runtimeState.windowResizePreview
            ? `${Math.round(runtimeState.windowResizePreview.frame.width)}x${Math.round(runtimeState.windowResizePreview.frame.height)}`
            : "none"
        }
      />
      <div className="flex gap-2">
        {state.layout.floatingWindows.map((window) => (
          <Button
            key={window.id}
            size="sm"
            variant="outline"
            onClick={() => service.focusWindow(window.id)}
          >
            Focus {window.title}
          </Button>
        ))}
      </div>
    </>
  )
}
