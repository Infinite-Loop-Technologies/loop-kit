import { createDockRuntime, createDockService } from "@loop-kit/dock"
import { DockProvider, DockRoot, createDockRegistry, useDockState } from "@loop-kit/dock-react"
import type { InteractionTargetId } from "@loop-kit/interaction"
import { createInteractionRuntime } from "@loop-kit/interaction"
import {
  InteractionRoot,
  useInteractionState,
  useInteractionTarget,
} from "@loop-kit/interaction/react"
import { ArrowDownUp, GripVertical, MoveRight, RotateCcw } from "lucide-react"
import { useEffect, useMemo } from "react"

import { useAppRuntime } from "@/bridges/AppRuntimeBridge"
import {
  useDragDropLabCommands,
  useDragDropLabRuntimeState,
  useDragDropLabState,
} from "@/bridges/DragDropLabBridge"
import {
  WorkbenchDockDropzoneOverlay,
  WorkbenchDockLayout,
  WorkbenchDockPreviewOverlay,
  collectDockGroups,
} from "@/bridges/dock/WorkbenchDockBridge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InspectorRow } from "@/components/workbench/InspectorRow"
import { LogTimeline } from "@/components/workbench/LogTimeline"
import type { DragDropLabItem } from "@/domain/dragDropLab"
import { createWorkbenchDockTabPreset } from "@/domain/workbenchDockPresets"
import { cn } from "@/lib/utils"
import {
  createDragDropLabTargetId,
  installDragDropLabInteractionPolicy,
  makeDragDropLabTargetData,
} from "@/runtime/DragDropLabRuntime"

type DragDropDemoVariant = "physical" | "guideline" | "constrained"

export const DragDropLab = () => {
  const { dragDropLab, dragDropLabRuntime, interaction } = useAppRuntime().env

  useEffect(() => {
    let disposed = false
    let lease: { readonly dispose: () => Promise<void> } | undefined

    void interaction
      .install(
        installDragDropLabInteractionPolicy({
          service: dragDropLab,
          runtime: dragDropLabRuntime,
        })
      )
      .then((installed) => {
        if (disposed) {
          void installed.dispose()
          return
        }
        lease = installed
      })

    return () => {
      disposed = true
      if (lease) void lease.dispose()
    }
  }, [dragDropLab, dragDropLabRuntime, interaction])

  return (
    <InteractionRoot
      runtime={interaction}
      installDefaults
      pointer={{ dragThresholdPx: 4 }}
      className="grid gap-4 lg:grid-cols-[1fr_340px]"
    >
      <DragDropDockSurface />
      <DragDropInspector />
    </InteractionRoot>
  )
}

const DragDropDockSurface = () => {
  const { dragDropDock, dragDropDockRuntime, interaction } = useAppRuntime().env
  const { reset } = useDragDropLabCommands()
  const registry = useMemo(
    () =>
      createDockRegistry({
        panels: {
          "dnd.physical": () => <DragDropDemoPanel variant="physical" />,
          "dnd.guideline": () => <DragDropDemoPanel variant="guideline" />,
          "dnd.constrained": () => <DragDropDemoPanel variant="constrained" />,
          "dnd.nested-dock": () => <NestedDockDemo />,
        },
      }),
    []
  )

  return (
    <DockProvider
      dock={dragDropDock}
      runtime={dragDropDockRuntime}
      interaction={interaction}
      registry={registry}
    >
      <DockRoot
        installDefaultInteraction
        installDefaultPointerKeyboard={false}
        className="min-h-[720px]"
      >
        <Card className="grid min-h-[720px] grid-rows-[auto_1fr] overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>DnD demos</CardTitle>
              <CardDescription>
                Demo variants are Dock tabs by default. Drag tab headers to side dropzones to split
                comparisons side by side.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </CardHeader>
          <CardContent className="workbench-muted-surface min-h-0 p-3">
            <DragDropDockCanvas />
          </CardContent>
        </Card>
      </DockRoot>
    </DockProvider>
  )
}

const DragDropDockCanvas = () => {
  const state = useDockState()
  const groups = collectDockGroups(state.layout.roots.main)

  return (
    <div className="workbench-dock-surface relative h-full min-h-[560px] rounded-md border p-2">
      <WorkbenchDockLayout />
      <WorkbenchDockDropzoneOverlay groups={groups} />
      <WorkbenchDockPreviewOverlay />
    </div>
  )
}

const DragDropDemoPanel = ({ variant }: { readonly variant: DragDropDemoVariant }) => {
  const { items, selectedItemId } = useDragDropLabState()
  const { activeItemId, activeScopeId, overItemId, overScopeId, overZoneId, pointerPosition } =
    useDragDropLabRuntimeState()
  const activeInPanel = activeScopeId === variant
  const activeItem = activeInPanel ? items.find((item) => item.id === activeItemId) : undefined
  const listId = createDragDropLabTargetId("drag-lab-list", variant)
  const listRef = useInteractionTarget<HTMLDivElement>(
    useMemo(
      () => ({
        id: listId,
        roles: ["command-boundary"] as const,
        capabilities: { keyboard: true, focus: true },
        data: makeDragDropLabTargetData({ kind: "drag-lab-list", scopeId: variant }),
      }),
      [listId, variant]
    )
  )

  return (
    <div className="grid h-full min-h-0 gap-4 p-3">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{getVariantTitle(variant)}</div>
          <div className="truncate text-xs text-muted-foreground">
            {getVariantDescription(variant)}
          </div>
        </div>
        <ArrowDownUp className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      <div
        ref={listRef}
        className="workbench-muted-surface relative grid gap-2 rounded-md border p-3"
      >
        {items.map((item) => (
          <DragDropRow
            key={`${variant}:${item.id}`}
            item={item}
            variant={variant}
            parentId={listId}
            active={activeInPanel && activeItemId === item.id}
            over={
              activeInPanel &&
              overScopeId === variant &&
              overItemId === item.id &&
              activeItemId !== item.id
            }
            selected={selectedItemId === item.id}
          />
        ))}
        {variant === "constrained" ? (
          <ConstrainedDropZones
            parentId={listId}
            scopeId={variant}
            activeZoneId={activeInPanel ? overZoneId : undefined}
          />
        ) : null}
        {activeItem && pointerPosition ? (
          <DragGhost item={activeItem} x={pointerPosition.x} y={pointerPosition.y} />
        ) : null}
      </div>
      <EditableTarget parentId={listId} />
    </div>
  )
}

const DragDropRow = ({
  active,
  item,
  over,
  parentId,
  selected,
  variant,
}: {
  readonly active: boolean
  readonly item: DragDropLabItem
  readonly over: boolean
  readonly parentId: InteractionTargetId
  readonly selected: boolean
  readonly variant: DragDropDemoVariant
}) => {
  const itemTargetId = createDragDropLabTargetId("drag-lab-item", `${variant}:${item.id}`)
  const handleTargetId = createDragDropLabTargetId("drag-lab-handle", `${variant}:${item.id}`)
  const itemRef = useInteractionTarget<HTMLDivElement>(
    useMemo(
      () => ({
        id: itemTargetId,
        parentId,
        roles: ["draggable", "dropzone", "focusable", "selectable"] as const,
        capabilities: { pointer: true, drag: true, drop: true, keyboard: true, focus: true },
        data: makeDragDropLabTargetData({
          kind: "drag-lab-item",
          itemId: item.id,
          scopeId: variant,
        }),
      }),
      [item.id, itemTargetId, parentId, variant]
    )
  )
  const handleRef = useInteractionTarget<HTMLButtonElement>(
    useMemo(
      () => ({
        id: handleTargetId,
        parentId: itemTargetId,
        roles: ["draggable", "pressable", "focusable"] as const,
        capabilities: { pointer: true, drag: true, keyboard: true, focus: true },
        data: makeDragDropLabTargetData({
          kind: "drag-lab-handle",
          itemId: item.id,
          scopeId: variant,
        }),
        priority: 2,
      }),
      [handleTargetId, item.id, itemTargetId, variant]
    )
  )
  const guideline = variant === "guideline" && over

  return (
    <div className="relative">
      {guideline ? <div className="-top-1 absolute inset-x-2 h-0.5 rounded-full bg-ring" /> : null}
      <div
        ref={itemRef}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: This row is a registered interaction target with custom focus routing.
        tabIndex={0}
        className={cn(
          "workbench-panel grid min-h-16 grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-md border px-3 py-2 outline-none transition focus:ring-2 focus:ring-ring",
          active && "border-dashed opacity-45",
          over && variant === "physical" && "translate-y-1 border-primary bg-primary/10",
          selected && !active && "border-ring"
        )}
      >
        <button
          ref={handleRef}
          type="button"
          className="grid h-9 w-9 cursor-grab place-items-center rounded-md border border-input bg-background text-muted-foreground outline-none focus:ring-2 focus:ring-ring active:cursor-grabbing"
          aria-label={`Drag ${item.title}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{item.title}</div>
          <div className="truncate text-xs text-muted-foreground">{item.description}</div>
        </div>
        <MoveRight className="h-4 w-4 text-muted-foreground" />
      </div>
      {active && variant === "physical" ? (
        <div className="mt-2 min-h-12 rounded-md border border-dashed border-ring bg-accent/20" />
      ) : null}
    </div>
  )
}

const ConstrainedDropZones = ({
  activeZoneId,
  parentId,
  scopeId,
}: {
  readonly activeZoneId: string | undefined
  readonly parentId: InteractionTargetId
  readonly scopeId: string
}) => (
  <div className="grid gap-2 pt-2 md:grid-cols-2">
    <ConstrainedDropZone
      id="accepted"
      parentId={parentId}
      scopeId={scopeId}
      active={activeZoneId === "accepted"}
      title="Accepts drops"
      description="Policy event records the accepted zone."
    />
    <ConstrainedDropZone
      id="blocked"
      parentId={parentId}
      scopeId={scopeId}
      active={activeZoneId === "blocked"}
      title="Blocked zone"
      description="Drop is rejected without changing order."
    />
  </div>
)

const ConstrainedDropZone = ({
  active,
  description,
  id,
  parentId,
  scopeId,
  title,
}: {
  readonly active: boolean
  readonly description: string
  readonly id: string
  readonly parentId: InteractionTargetId
  readonly scopeId: string
  readonly title: string
}) => {
  const targetId = createDragDropLabTargetId("drag-lab-zone", id)
  const ref = useInteractionTarget<HTMLDivElement>(
    useMemo(
      () => ({
        id: targetId,
        parentId,
        roles: ["dropzone"] as const,
        capabilities: { drop: true },
        data: makeDragDropLabTargetData({ kind: "drag-lab-zone", scopeId, zoneId: id }),
      }),
      [id, parentId, scopeId, targetId]
    )
  )

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-md border border-dashed p-3 text-sm transition",
        active ? "border-ring bg-accent text-accent-foreground" : "border-border bg-background"
      )}
    >
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{description}</div>
    </div>
  )
}

const DragGhost = ({
  item,
  x,
  y,
}: {
  readonly item: DragDropLabItem
  readonly x: number
  readonly y: number
}) => (
  <div
    className="workbench-drag-ghost pointer-events-none fixed z-50 rounded-md border px-3 py-2 text-xs font-medium"
    style={{ left: x + 12, top: y + 12 }}
  >
    {item.title}
  </div>
)

const EditableTarget = ({ parentId }: { readonly parentId: InteractionTargetId }) => {
  const targetId = createDragDropLabTargetId("drag-lab-text-input", `${parentId}:notes`)
  const inputRef = useInteractionTarget<HTMLInputElement>(
    useMemo(
      () => ({
        id: targetId,
        parentId,
        roles: ["text-input", "focusable"] as const,
        capabilities: { keyboard: true, focus: true },
        data: makeDragDropLabTargetData({ kind: "drag-lab-text-input" }),
      }),
      [parentId, targetId]
    )
  )

  return (
    <label className="grid gap-2 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Editable target
      </span>
      <input
        ref={inputRef}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        placeholder="Focus here; text selection and keys stay editable"
      />
    </label>
  )
}

const NestedDockDemo = () => {
  const outer = useMemo(() => createNestedDockEnvironment("outer"), [])
  const registry = useMemo(
    () =>
      createDockRegistry({
        panels: {
          "nested.outer-proof": () => <NestedDockProof level="Outer nested Dock" env={outer} />,
          "nested.inner-host": () => <InnerNestedDockHost />,
        },
      }),
    [outer]
  )

  return <NestedDockSurface env={outer} registry={registry} title="Nested level 1 Dock" />
}

const InnerNestedDockHost = () => {
  const inner = useMemo(() => createNestedDockEnvironment("inner"), [])
  const registry = useMemo(
    () =>
      createDockRegistry({
        panels: {
          "nested.inner-proof": () => <NestedDockProof level="Inner nested Dock" env={inner} />,
          "nested.inner-details": () => <NestedDockDetails />,
        },
      }),
    [inner]
  )

  return <NestedDockSurface env={inner} registry={registry} title="Nested level 2 Dock" compact />
}

const NestedDockSurface = ({
  compact,
  env,
  registry,
  title,
}: {
  readonly compact?: boolean | undefined
  readonly env: NestedDockEnvironment
  readonly registry: ReturnType<typeof createDockRegistry>
  readonly title: string
}) => {
  return (
    <DockProvider
      dock={env.dock}
      runtime={env.runtime}
      interaction={env.interaction}
      registry={registry}
    >
      <DockRoot
        installDefaultInteraction
        className={cn("grid gap-3", compact ? "min-h-[300px]" : "min-h-[480px]")}
      >
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">
            This Dock owns a separate service, runtime, and interaction runtime.
          </div>
        </div>
        <NestedDockCanvas />
      </DockRoot>
    </DockProvider>
  )
}

const NestedDockCanvas = () => {
  const state = useDockState()
  const groups = collectDockGroups(state.layout.roots.main)

  return (
    <div className="workbench-dock-surface relative min-h-[300px] rounded-md border p-2">
      <WorkbenchDockLayout />
      <WorkbenchDockDropzoneOverlay groups={groups} />
      <WorkbenchDockPreviewOverlay />
    </div>
  )
}

const NestedDockProof = ({
  env,
  level,
}: {
  readonly env: NestedDockEnvironment
  readonly level: string
}) => {
  const focusTargetId = env.interaction.env.state.get().focusTargetId
  const selectedPanelId = env.dock.state.get().selectedPanelId

  return (
    <div className="grid gap-3 p-3 text-sm">
      <InspectorRow label="Level" value={level} />
      <InspectorRow label="Selected panel" value={selectedPanelId ?? "none"} />
      <InspectorRow label="Interaction focus" value={focusTargetId ?? "none"} />
      <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
        Drag these nested Dock tabs. Their target ids can overlap with other Docks because each
        instance resolves through its own runtime.
      </div>
    </div>
  )
}

const NestedDockDetails = () => (
  <div className="grid gap-2 p-3 text-sm">
    <div className="font-medium">Inner details</div>
    <div className="text-muted-foreground">
      This is the second nested level. It can be selected and split without changing the parent Dock
      selection.
    </div>
  </div>
)

const DragDropInspector = () => {
  const { items, selectedItemId } = useDragDropLabState()
  const { activeItemId, events, focusAncestry, focusTargetId, overItemId, overZoneId } =
    useDragDropLabRuntimeState()
  const interactionFocusTargetId = useInteractionState((state) => state.focusTargetId)
  const order = items.map((item) => item.title).join(" -> ")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Runtime proof</CardTitle>
        <CardDescription>
          Service state, transient lab runtime state, and interaction focus are visible separately.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <InspectorRow label="Committed order" value={order} />
        <InspectorRow label="Selected item" value={selectedItemId ?? "none"} />
        <InspectorRow label="Active drag source" value={activeItemId ?? "none"} />
        <InspectorRow label="Current drop target" value={overItemId ?? overZoneId ?? "none"} />
        <InspectorRow
          label="Focus target"
          value={focusTargetId ?? interactionFocusTargetId ?? "none"}
        />
        <InspectorRow label="Focus ancestry" value={focusAncestry.join(" > ") || "none"} />
        <LogTimeline title="Policy events" entries={events} />
      </CardContent>
    </Card>
  )
}

interface NestedDockEnvironment {
  readonly dock: ReturnType<typeof createDockService>
  readonly runtime: ReturnType<typeof createDockRuntime>
  readonly interaction: ReturnType<typeof createInteractionRuntime>
}

const createNestedDockEnvironment = (scope: "outer" | "inner"): NestedDockEnvironment => {
  const state = createWorkbenchDockTabPreset({
    groupId: `${scope}:tabs`,
    panels:
      scope === "outer"
        ? [
            { id: `${scope}:proof`, title: "Outer proof", kind: "nested.outer-proof" },
            { id: `${scope}:inner`, title: "Inner Dock", kind: "nested.inner-host" },
          ]
        : [
            { id: `${scope}:proof`, title: "Inner proof", kind: "nested.inner-proof" },
            { id: `${scope}:details`, title: "Details", kind: "nested.inner-details" },
          ],
    activePanelId: `${scope}:proof`,
  })
  const dock = createDockService({ initialState: state })
  return {
    dock,
    runtime: createDockRuntime({ dock }),
    interaction: createInteractionRuntime(),
  }
}

const getVariantTitle = (variant: DragDropDemoVariant): string => {
  if (variant === "guideline") return "Guide-line reorder"
  if (variant === "constrained") return "Constrained drop zones"
  return "Physical reorder"
}

const getVariantDescription = (variant: DragDropDemoVariant): string => {
  if (variant === "guideline") return "The pending insertion point is shown as a line."
  if (variant === "constrained") return "Drop zones record accepted and rejected outcomes."
  return "The source leaves a placeholder, siblings move, and the ghost follows the cursor."
}
