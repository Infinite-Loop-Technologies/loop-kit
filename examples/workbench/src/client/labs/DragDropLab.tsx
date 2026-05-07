import type { InteractionTargetId } from "@loop-kit/interaction"
import {
  InteractionRoot,
  useInteractionState,
  useInteractionTarget,
} from "@loop-kit/interaction/react"
import { ArrowDownUp, GripVertical, RotateCcw } from "lucide-react"
import { useEffect, useMemo } from "react"

import { useAppRuntime } from "@/bridges/AppRuntimeBridge"
import {
  useDragDropLabCommands,
  useDragDropLabRuntimeState,
  useDragDropLabState,
} from "@/bridges/DragDropLabBridge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InspectorRow } from "@/components/workbench/InspectorRow"
import { LogTimeline } from "@/components/workbench/LogTimeline"
import type { DragDropLabItem } from "@/domain/dragDropLab"
import { cn } from "@/lib/utils"
import {
  createDragDropLabTargetId,
  installDragDropLabInteractionPolicy,
  makeDragDropLabTargetData,
} from "@/runtime/DragDropLabRuntime"

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
      <DragDropSurface />
      <DragDropInspector />
    </InteractionRoot>
  )
}

const DragDropSurface = () => {
  const { items, selectedItemId } = useDragDropLabState()
  const { activeItemId, overItemId } = useDragDropLabRuntimeState()
  const { reset } = useDragDropLabCommands()
  const activeItem = items.find((item) => item.id === activeItemId)
  const listId = createDragDropLabTargetId("drag-lab-list", "main")
  const listRef = useInteractionTarget<HTMLDivElement>(
    useMemo(
      () => ({
        id: listId,
        roles: ["command-boundary"] as const,
        capabilities: { keyboard: true, focus: true },
        data: makeDragDropLabTargetData({ kind: "drag-lab-list" }),
      }),
      [listId]
    )
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Interaction reorder surface</CardTitle>
          <CardDescription>
            Rows and handles register semantic interaction targets. An installable policy commits
            drops through the lab service.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div
          ref={listRef}
          className="workbench-muted-surface relative grid gap-2 rounded-md border p-3"
        >
          {items.map((item) => (
            <DragDropRow
              key={item.id}
              item={item}
              parentId={listId}
              active={activeItemId === item.id}
              over={overItemId === item.id && activeItemId !== item.id}
              selected={selectedItemId === item.id}
            />
          ))}
          {activeItem ? (
            <div className="workbench-drag-ghost pointer-events-none absolute right-3 top-3 rounded-md border px-3 py-2 text-xs font-medium">
              {`Dragging ${activeItem.title}`}
            </div>
          ) : null}
        </div>
        <EditableTarget parentId={listId} />
      </CardContent>
    </Card>
  )
}

const DragDropRow = ({
  active,
  item,
  over,
  parentId,
  selected,
}: {
  readonly active: boolean
  readonly item: DragDropLabItem
  readonly over: boolean
  readonly parentId: InteractionTargetId
  readonly selected: boolean
}) => {
  const itemTargetId = createDragDropLabTargetId("drag-lab-item", item.id)
  const handleTargetId = createDragDropLabTargetId("drag-lab-handle", item.id)
  const itemRef = useInteractionTarget<HTMLDivElement>(
    useMemo(
      () => ({
        id: itemTargetId,
        parentId,
        roles: ["draggable", "dropzone", "focusable", "selectable"] as const,
        capabilities: { pointer: true, drag: true, drop: true, keyboard: true, focus: true },
        data: makeDragDropLabTargetData({ kind: "drag-lab-item", itemId: item.id }),
      }),
      [item.id, itemTargetId, parentId]
    )
  )
  const handleRef = useInteractionTarget<HTMLButtonElement>(
    useMemo(
      () => ({
        id: handleTargetId,
        parentId: itemTargetId,
        roles: ["draggable", "pressable", "focusable"] as const,
        capabilities: { pointer: true, drag: true, keyboard: true, focus: true },
        data: makeDragDropLabTargetData({ kind: "drag-lab-handle", itemId: item.id }),
        priority: 2,
      }),
      [handleTargetId, item.id, itemTargetId]
    )
  )

  return (
    <div
      ref={itemRef}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: This row is a registered interaction target with custom focus routing.
      tabIndex={0}
      className={cn(
        "workbench-panel grid min-h-16 grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-md border px-3 py-2 outline-none transition focus:ring-2 focus:ring-ring",
        active && "border-ring bg-accent text-accent-foreground",
        over && "border-primary bg-primary/10",
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
      <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}

const EditableTarget = ({ parentId }: { readonly parentId: InteractionTargetId }) => {
  const targetId = createDragDropLabTargetId("drag-lab-text-input", "notes")
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
        placeholder="Focus here; keys are logged as text input events"
      />
    </label>
  )
}

const DragDropInspector = () => {
  const { items, selectedItemId } = useDragDropLabState()
  const { activeItemId, events, focusAncestry, focusTargetId, overItemId } =
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
        <InspectorRow label="Current drop target" value={overItemId ?? "none"} />
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
