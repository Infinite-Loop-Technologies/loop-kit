import type {
  DockGroupId,
  DockGroupNode,
  DockLayoutNode,
  DockModalNode,
  DockPanel,
  DockPlacementSide,
  DockRuntimeEvent,
  DockWindowNode,
} from "@loop-kit/dock"
import {
  DockProvider,
  DockRoot,
  createDockRegistry,
  useDockDropzoneTarget,
  useDockModalSurfaceTarget,
  useDockOverlayBackdropTarget,
  useDockRegistry,
  useDockResizeHandleTarget,
  useDockRuntimeState,
  useDockService,
  useDockState,
  useDockTabTarget,
  useDockWindowResizeHandleTarget,
  useDockWindowTitlebarTarget,
} from "@loop-kit/dock-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRef } from "react"
import type { ReactNode } from "react"

import {
  DockEmptyUi,
  DockFloatingWindowUi,
  DockGroupUi,
  DockModalUi,
  DockSplitUi,
  DockTabUi,
} from "@/components/dock/DockUi"
import { type LogEntry, LogTimeline, createLogEntry } from "@/components/workbench/LogTimeline"
import { cn } from "@/lib/utils"

import {
  DockAlertPanel,
  DockEditorPanel,
  DockExplorerPanel,
  DockInspectorPanel,
} from "../../labs/dockPanels"
import { useAppRuntime } from "../AppRuntimeBridge"

export const WorkbenchDockProvider = ({
  children,
  className,
}: {
  readonly children: ReactNode
  readonly className?: string | undefined
}) => {
  const runtime = useAppRuntime()
  const registry = useMemo(
    () =>
      createDockRegistry({
        panels: {
          "debug.explorer": DockExplorerPanel,
          "debug.editor": DockEditorPanel,
          "debug.inspector": DockInspectorPanel,
          "debug.alert": DockAlertPanel,
        },
      }),
    []
  )

  return (
    <DockProvider
      dock={runtime.env.dock}
      runtime={runtime.env.dockRuntime}
      interaction={runtime.env.interaction}
      registry={registry}
    >
      <DockRoot className={className} installDefaultInteraction>
        {children}
      </DockRoot>
    </DockProvider>
  )
}

export const WorkbenchDockLayout = () => {
  const state = useDockState()

  return (
    <>
      <WorkbenchDockNode node={state.layout.roots.main} />
      <WorkbenchFloatingWindows />
      <WorkbenchDockModalLayer />
    </>
  )
}

export const WorkbenchDockEventLog = () => {
  const service = useDockService()
  const [events, setEvents] = useState<ReadonlyArray<LogEntry>>([])

  useEffect(() => {
    const cleanup = service.events.subscribe((event) => {
      setEvents((current) => [createLogEntry(formatDockEvent(event)), ...current].slice(0, 8))
    })
    return cleanup
  }, [service])

  return <LogTimeline title="Dock events" entries={events} />
}

export const WorkbenchDockPreviewOverlay = () => {
  const runtimeState = useDockRuntimeState()
  const drag = runtimeState.dragPreview
  const resize = runtimeState.resizePreview
  const move = runtimeState.windowMovePreview
  const windowResize = runtimeState.windowResizePreview

  if (!drag && !resize && !move && !windowResize) return null

  return (
    <>
      {drag ? (
        <div
          className="workbench-drag-ghost pointer-events-none absolute z-30 rounded-md border px-3 py-2 text-xs font-medium"
          style={{
            left: drag.position.x + 12,
            top: drag.position.y + 12,
            position: "fixed",
          }}
        >
          {`Dragging ${drag.panelId}`}
        </div>
      ) : null}
      {move || windowResize ? (
        <div
          className="workbench-preview-frame pointer-events-none absolute z-20 rounded-md border border-dashed"
          style={{
            left: (move ?? windowResize)?.frame.x,
            top: (move ?? windowResize)?.frame.y,
            width: (move ?? windowResize)?.frame.width,
            height: (move ?? windowResize)?.frame.height,
          }}
        />
      ) : null}
      <div className="workbench-floating-status pointer-events-none absolute bottom-3 left-3 z-20 rounded-md border px-3 py-2 text-xs font-medium shadow-sm">
        {drag
          ? `Dragging ${drag.panelId} to ${drag.placement?.side ?? "unresolved dropzone"}`
          : null}
        {resize ? `Resizing ${resize.splitId} to ${resize.ratio.toFixed(2)}` : null}
        {move
          ? `Moving ${move.windowId} to ${Math.round(move.frame.x)}, ${Math.round(move.frame.y)}`
          : null}
        {windowResize
          ? `Resizing ${windowResize.windowId} to ${Math.round(windowResize.frame.width)}x${Math.round(windowResize.frame.height)}`
          : null}
      </div>
    </>
  )
}

export const WorkbenchDockDropzoneOverlay = ({
  groups,
}: {
  readonly groups: ReadonlyArray<DockGroupNode>
}) => {
  const runtimeState = useDockRuntimeState()
  if (!runtimeState.dragPreview) return null

  return (
    <div className="pointer-events-none absolute inset-2 grid gap-2">
      {groups.map((group) => (
        <div
          key={group.id}
          className="relative min-h-28 rounded-md border border-dashed border-transparent"
        >
          {(["left", "right", "top", "bottom"] as const).map((side) => (
            <DockSideDropzone key={`${group.id}:${side}`} groupId={group.id} side={side} />
          ))}
        </div>
      ))}
    </div>
  )
}

export const collectDockGroups = (node: DockLayoutNode | null): ReadonlyArray<DockGroupNode> => {
  if (!node) return []
  if (node.type === "group") return [node]
  return [...collectDockGroups(node.leading), ...collectDockGroups(node.trailing)]
}

const WorkbenchDockNode = ({ node }: { readonly node: DockLayoutNode | null }) => {
  if (!node) return <DockEmptyUi label="Empty dock" />
  if (node.type === "split") return <WorkbenchDockSplit node={node} />
  return <WorkbenchDockGroup node={node} />
}

const WorkbenchDockSplit = ({
  node,
}: { readonly node: Extract<DockLayoutNode, { type: "split" }> }) => {
  const runtimeState = useDockRuntimeState()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const handleRef = useDockResizeHandleTarget<HTMLDivElement>(node.id, node.axis, {
    getRect: () => {
      const rect = containerRef.current?.getBoundingClientRect()
      return rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null
    },
  })
  const previewRatio =
    runtimeState.resizePreview?.splitId === node.id ? runtimeState.resizePreview.ratio : node.ratio

  return (
    <DockSplitUi
      containerRef={containerRef}
      axis={node.axis}
      ratio={previewRatio}
      handleRef={handleRef}
      leading={<WorkbenchDockNode node={node.leading} />}
      trailing={<WorkbenchDockNode node={node.trailing} />}
    />
  )
}

const WorkbenchDockGroup = ({ node }: { readonly node: DockGroupNode }) => {
  const state = useDockState()
  const runtimeState = useDockRuntimeState()
  const registry = useDockRegistry()
  const dropRef = useDockDropzoneTarget<HTMLElement>(node.id, "center")
  const activePanelId = node.activePanelId ?? node.panelIds[0]
  const activePanel = state.panels.find((panel) => panel.id === activePanelId)

  return (
    <DockGroupUi
      dropRef={dropRef}
      header={
        node.stackMode === "tabs" ? (
          node.panelIds.map((panelId) => {
            const panel = state.panels.find((item) => item.id === panelId)
            if (!panel) return null
            return (
              <WorkbenchDockTab
                key={panelId}
                groupId={node.id}
                panelId={panelId}
                title={panel.title}
                active={panelId === activePanelId}
              />
            )
          })
        ) : (
          <DockGroupMetadata node={node} activePanel={activePanel} />
        )
      }
    >
      {activePanel ? (
        registry.renderPanel({ panel: activePanel, state, runtimeState })
      ) : (
        <DockEmptyUi label="No active panel" />
      )}
    </DockGroupUi>
  )
}

const DockGroupMetadata = ({
  activePanel,
  node,
}: {
  readonly activePanel: DockPanel | undefined
  readonly node: DockGroupNode
}) => (
  <div className="flex min-w-0 flex-1 items-center gap-2 px-3 text-xs text-muted-foreground">
    <span className="font-medium text-card-foreground">{activePanel?.title ?? "No panel"}</span>
    <span>{`Stack: ${node.stackMode}`}</span>
    <span>{`Panels: ${node.panelIds.length}`}</span>
    {node.fixed ? <span>Fixed</span> : null}
  </div>
)

const WorkbenchDockTab = ({
  panelId,
  groupId,
  title,
  active,
}: {
  readonly panelId: DockGroupNode["panelIds"][number]
  readonly groupId: DockGroupId
  readonly title: string
  readonly active: boolean
}) => {
  const ref = useDockTabTarget<HTMLButtonElement>(panelId, groupId)
  return <DockTabUi refCallback={ref} active={active} title={title} />
}

const DockSideDropzone = ({
  groupId,
  side,
}: {
  readonly groupId: DockGroupId
  readonly side: Exclude<DockPlacementSide, "center">
}) => {
  const runtimeState = useDockRuntimeState()
  const ref = useDockDropzoneTarget<HTMLDivElement>(groupId, side)
  const active =
    runtimeState.dragPreview?.placement?.targetGroupId === groupId &&
    runtimeState.dragPreview.placement.side === side

  return (
    <div
      ref={ref}
      className={cn(
        "workbench-dropzone pointer-events-auto absolute rounded-md border opacity-45 transition",
        active && "workbench-dropzone-active opacity-100",
        side === "left" && "bottom-8 left-1 top-8 w-8",
        side === "right" && "bottom-8 right-1 top-8 w-8",
        side === "top" && "left-10 right-10 top-1 h-8",
        side === "bottom" && "bottom-1 left-10 right-10 h-8"
      )}
      aria-label={`Drop ${side}`}
    />
  )
}

const WorkbenchFloatingWindows = () => {
  const state = useDockState()

  return (
    <>
      {state.layout.floatingWindows.map((window, index) => (
        <WorkbenchFloatingWindow key={window.id} window={window} index={index} />
      ))}
    </>
  )
}

const WorkbenchFloatingWindow = ({
  window,
  index,
}: {
  readonly window: DockWindowNode
  readonly index: number
}) => {
  const state = useDockState()
  const runtimeState = useDockRuntimeState()
  const service = useDockService()
  const registry = useDockRegistry()
  const titlebarRef = useDockWindowTitlebarTarget<HTMLDivElement>(window.id)
  const resizeRef = useDockWindowResizeHandleTarget<HTMLDivElement>(window.id)
  const preview =
    runtimeState.windowMovePreview?.windowId === window.id
      ? runtimeState.windowMovePreview.frame
      : runtimeState.windowResizePreview?.windowId === window.id
        ? runtimeState.windowResizePreview.frame
        : window.frame

  return (
    <DockFloatingWindowUi
      titlebarRef={titlebarRef}
      resizeRef={resizeRef}
      title={window.title}
      active={window.active}
      onClose={() => service.closeWindow(window.id)}
      frame={{
        left: preview.x,
        top: preview.y,
        width: preview.width,
        height: preview.height,
        zIndex: 20 + index,
      }}
    >
      <WorkbenchDockNode node={window.root} />
      <span className="sr-only">
        {registry && state.focusedSurfaceId === window.surfaceId ? "Focused window" : "Window"}
      </span>
    </DockFloatingWindowUi>
  )
}

const WorkbenchDockModalLayer = () => {
  const state = useDockState()

  return (
    <>
      {state.layout.modals
        .filter((modal) => modal.open)
        .map((modal) => (
          <WorkbenchDockModal key={modal.id} modal={modal} />
        ))}
    </>
  )
}

const WorkbenchDockModal = ({ modal }: { readonly modal: DockModalNode }) => {
  const service = useDockService()
  const backdropRef = useDockOverlayBackdropTarget<HTMLDivElement>(modal.id)
  const surfaceRef = useDockModalSurfaceTarget<HTMLDivElement>(modal.id)
  const [surfaceElement, setSurfaceElement] = useState<HTMLDivElement | null>(null)
  const setSurfaceRef = useCallback(
    (element: HTMLDivElement | null) => {
      surfaceRef(element)
      setSurfaceElement(element)
    },
    [surfaceRef]
  )

  useEffect(() => {
    surfaceElement?.focus()
  }, [surfaceElement])

  return (
    <DockModalUi
      backdropRef={backdropRef}
      surfaceRef={setSurfaceRef}
      title={modal.title}
      onClose={() => service.closeModal(modal.id)}
    >
      <WorkbenchDockNode node={modal.root} />
    </DockModalUi>
  )
}

const formatDockEvent = (event: DockRuntimeEvent | { readonly type: string }): string => event.type
