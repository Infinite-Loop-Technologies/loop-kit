import type { Installer } from "@loop-kit/common/Runtime"
import { type Runtime, createRuntime, installedVoid } from "@loop-kit/common/Runtime"
import { createStore } from "@loop-kit/common/Store"
import type {
  InteractionEnv,
  InteractionPoint,
  InteractionTarget,
  InteractionTargetId,
} from "@loop-kit/interaction"

import type { DragDropLabItemId, DragDropLabService } from "../domain/dragDropLab"

export type DragDropLabTargetKind =
  | "drag-lab-list"
  | "drag-lab-item"
  | "drag-lab-handle"
  | "drag-lab-zone"
  | "drag-lab-text-input"

export interface DragDropLabTargetData {
  readonly kind: DragDropLabTargetKind
  readonly itemId?: DragDropLabItemId | undefined
  readonly scopeId?: string | undefined
  readonly zoneId?: string | undefined
}

export interface DragDropLabEvent {
  readonly id: string
  readonly message: string
}

export interface DragDropLabRuntimeState {
  readonly activeItemId?: DragDropLabItemId | undefined
  readonly activeScopeId?: string | undefined
  readonly overItemId?: DragDropLabItemId | undefined
  readonly overScopeId?: string | undefined
  readonly overZoneId?: string | undefined
  readonly pointerPosition?: InteractionPoint | undefined
  readonly focusTargetId?: InteractionTargetId | undefined
  readonly focusAncestry: ReadonlyArray<InteractionTargetId>
  readonly events: ReadonlyArray<DragDropLabEvent>
}

export interface DragDropLabRuntimeEnv {
  readonly service: DragDropLabService
  readonly state: ReturnType<typeof createStore<DragDropLabRuntimeState>>
}

export interface DragDropLabRuntime extends Runtime<DragDropLabRuntimeEnv> {
  readonly pushEvent: (message: string) => void
  readonly clearDragPreview: () => void
  readonly setDragPreview: (
    preview: Pick<
      DragDropLabRuntimeState,
      | "activeItemId"
      | "activeScopeId"
      | "overItemId"
      | "overScopeId"
      | "overZoneId"
      | "pointerPosition"
    >
  ) => void
  readonly setFocus: (
    focusTargetId: InteractionTargetId | undefined,
    focusAncestry: ReadonlyArray<InteractionTargetId>
  ) => void
}

export const createDragDropLabRuntime = (service: DragDropLabService): DragDropLabRuntime => {
  const state = createStore<DragDropLabRuntimeState>({
    focusAncestry: [],
    events: [],
  })
  const runtime = createRuntime<DragDropLabRuntimeEnv>({
    service,
    state,
  })
  let eventCount = 0

  return {
    ...runtime,

    pushEvent: (message) => {
      eventCount += 1
      state.update((current) => ({
        ...current,
        events: [{ id: `drag-lab-event:${eventCount}`, message }, ...current.events].slice(0, 10),
      }))
    },

    clearDragPreview: () => {
      state.update((current) => ({
        ...current,
        activeItemId: undefined,
        activeScopeId: undefined,
        overItemId: undefined,
        overScopeId: undefined,
        overZoneId: undefined,
        pointerPosition: undefined,
      }))
    },

    setDragPreview: (preview) => {
      state.update((current) => ({
        ...current,
        activeItemId: preview.activeItemId,
        activeScopeId: preview.activeScopeId,
        overItemId: preview.overItemId,
        overScopeId: preview.overScopeId,
        overZoneId: preview.overZoneId,
        pointerPosition: preview.pointerPosition,
      }))
    },

    setFocus: (focusTargetId, focusAncestry) => {
      state.update((current) => ({
        ...current,
        focusTargetId,
        focusAncestry,
      }))
    },
  }
}

export interface InstallDragDropLabInteractionPolicyOptions {
  readonly service: DragDropLabService
  readonly runtime: DragDropLabRuntime
}

export const installDragDropLabInteractionPolicy =
  ({ service, runtime }: InstallDragDropLabInteractionPolicyOptions): Installer<InteractionEnv> =>
  (interaction) => {
    const cleanups = [
      interaction.env.signals.dragStart.subscribe((signal) => {
        const source = getItemTargetData(signal.source)
        if (!source?.itemId) return

        runtime.setDragPreview({
          activeItemId: source.itemId,
          activeScopeId: source.scopeId,
          overItemId: source.itemId,
          overScopeId: source.scopeId,
          overZoneId: undefined,
          pointerPosition: signal.position,
        })
        runtime.pushEvent(`drag start ${source.itemId}`)
      }),

      interaction.env.signals.dragMove.subscribe((signal) => {
        const source = getItemTargetData(signal.source)
        const target = getItemTargetData(signal.target)
        const zone = getZoneTargetData(signal.target)
        if (!source?.itemId) return

        runtime.setDragPreview({
          activeItemId: source.itemId,
          activeScopeId: source.scopeId,
          overItemId: target?.itemId,
          overScopeId: target?.scopeId,
          overZoneId: zone?.zoneId,
          pointerPosition: signal.position,
        })
        runtime.pushEvent(`drag over ${target?.itemId ?? zone?.zoneId ?? "none"}`)
      }),

      interaction.env.signals.dragEnd.subscribe((signal) => {
        const source = getItemTargetData(signal.source)
        const target = getItemTargetData(signal.target)
        const zone = getZoneTargetData(signal.target)

        if (source?.itemId && target?.itemId) {
          const changed = service.reorderItem(source.itemId, target.itemId)
          runtime.pushEvent(
            changed
              ? `drop ${source.itemId} before ${target.itemId}`
              : `drop ${source.itemId} on itself`
          )
        } else if (source?.itemId && zone?.zoneId) {
          runtime.pushEvent(
            zone.zoneId === "accepted"
              ? `drop ${source.itemId} in accepted zone`
              : `drop ${source.itemId} rejected by ${zone.zoneId}`
          )
        } else if (source?.itemId) {
          runtime.pushEvent(`drop ${source.itemId} outside list`)
        }

        runtime.clearDragPreview()
      }),

      interaction.env.signals.click.subscribe((signal) => {
        const target = getItemTargetData(signal.target)
        if (!target?.itemId) return

        service.selectItem(target.itemId)
        runtime.pushEvent(`select ${target.itemId}`)
      }),

      interaction.env.signals.focusChanged.subscribe((signal) => {
        const focusTargetId = signal.current?.id
        runtime.setFocus(
          focusTargetId,
          focusTargetId
            ? interaction.env.targets.getAncestry(focusTargetId).map((target) => target.id)
            : []
        )
        runtime.pushEvent(`focus ${focusTargetId ?? "none"}`)
      }),

      interaction.env.signals.keyPressed.subscribe((signal) => {
        const target = getDragDropLabTargetData(signal.target)
        if (!target) return

        runtime.pushEvent(
          target.kind === "drag-lab-text-input"
            ? `text input key ${signal.key}`
            : `key ${signal.key} on ${signal.target?.id ?? "unknown"}`
        )
      }),
    ]

    return installedVoid(() => {
      for (const cleanup of cleanups) cleanup()
    })
  }

export const createDragDropLabTargetId = (
  kind: DragDropLabTargetKind,
  id: string
): InteractionTargetId => `${kind}:${id}` as InteractionTargetId

export const makeDragDropLabTargetData = (data: DragDropLabTargetData): DragDropLabTargetData =>
  data

export const getDragDropLabTargetData = (
  target: InteractionTarget | undefined
): DragDropLabTargetData | undefined => {
  const data = target?.data
  if (!data || typeof data !== "object" || !("kind" in data)) return undefined
  const kind = (data as { readonly kind: string }).kind
  if (
    kind !== "drag-lab-list" &&
    kind !== "drag-lab-item" &&
    kind !== "drag-lab-handle" &&
    kind !== "drag-lab-zone" &&
    kind !== "drag-lab-text-input"
  ) {
    return undefined
  }

  return data as DragDropLabTargetData
}

const getItemTargetData = (
  target: InteractionTarget | undefined
): DragDropLabTargetData | undefined => {
  const data = getDragDropLabTargetData(target)
  return data?.itemId ? data : undefined
}

const getZoneTargetData = (
  target: InteractionTarget | undefined
): DragDropLabTargetData | undefined => {
  const data = getDragDropLabTargetData(target)
  return data?.zoneId ? data : undefined
}
