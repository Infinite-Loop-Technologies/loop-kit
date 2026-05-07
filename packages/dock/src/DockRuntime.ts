/**
 * Dock runtime boundary.
 *
 * DockRuntime owns transient/session state and installed dock modules. It
 * orchestrates drag and resize previews while committed changes remain in
 * DockService.
 *
 * @module
 */

import type { Runtime } from "@loop-kit/common/Runtime"
import { createRuntime } from "@loop-kit/common/Runtime"
import type { Signal } from "@loop-kit/common/Signal"
import { createSignal } from "@loop-kit/common/Signal"
import type { Store } from "@loop-kit/common/Store"
import { createStore } from "@loop-kit/common/Store"

import type { DockPoint, DockRect } from "./DockGeometry.js"
import type { DockPanelId, DockSplitId, DockSurfaceId, DockWindowId } from "./DockIds.js"
import type { DockPlacement } from "./DockNode.js"
import type { DockPolicy } from "./DockPolicy.js"
import { composeDockPolicies, createDefaultDockPolicy } from "./DockPolicy.js"
import type { DockService } from "./DockService.js"

export interface DockDragPreview {
  readonly panelId?: DockPanelId | undefined
  readonly surfaceId?: DockSurfaceId | undefined
  readonly placement?: DockPlacement | undefined
  readonly position: DockPoint
  readonly rect?: DockRect | undefined
}

export interface DockResizePreview {
  readonly splitId: DockSplitId
  readonly ratio: number
  readonly rect?: DockRect | undefined
}

export interface DockWindowMovePreview {
  readonly windowId: DockWindowId
  readonly startPosition: DockPoint
  readonly currentPosition: DockPoint
  readonly originFrame: DockRect
  readonly frame: DockRect
}

export interface DockWindowResizePreview {
  readonly windowId: DockWindowId
  readonly startPosition: DockPoint
  readonly currentPosition: DockPoint
  readonly originFrame: DockRect
  readonly frame: DockRect
}

export interface DockRuntimeState {
  readonly dragPreview?: DockDragPreview | undefined
  readonly resizePreview?: DockResizePreview | undefined
  readonly windowMovePreview?: DockWindowMovePreview | undefined
  readonly windowResizePreview?: DockWindowResizePreview | undefined
  readonly hoveredDropTarget?: DockPlacement | undefined
  readonly activeModalId?: string | undefined
  readonly debug?: Readonly<Record<string, unknown>> | undefined
}

export type DockRuntimeEvent =
  | { readonly type: "DockDragStarted"; readonly preview: DockDragPreview }
  | { readonly type: "DockDragPreviewUpdated"; readonly preview: DockDragPreview }
  | { readonly type: "DockDragCleared" }
  | { readonly type: "DockResizeStarted"; readonly preview: DockResizePreview }
  | { readonly type: "DockResizePreviewUpdated"; readonly preview: DockResizePreview }
  | { readonly type: "DockResizeCleared" }
  | { readonly type: "DockWindowMoveStarted"; readonly preview: DockWindowMovePreview }
  | { readonly type: "DockWindowMovePreviewUpdated"; readonly preview: DockWindowMovePreview }
  | { readonly type: "DockWindowMoveCleared" }
  | { readonly type: "DockWindowResizeStarted"; readonly preview: DockWindowResizePreview }
  | { readonly type: "DockWindowResizePreviewUpdated"; readonly preview: DockWindowResizePreview }
  | { readonly type: "DockWindowResizeCleared" }

export interface DockRuntimeEnv {
  readonly dock: DockService
  readonly policy: DockPolicy
  readonly state: Store<DockRuntimeState>
  readonly events: Signal<DockRuntimeEvent>
}

export interface CreateDockRuntimeOptions {
  readonly dock: DockService
  readonly policy?: DockPolicy | undefined
}

export interface DockRuntime extends Runtime<DockRuntimeEnv> {
  readonly beginDrag: (preview: DockDragPreview) => void
  readonly updateDragPreview: (preview: Partial<DockDragPreview>) => void
  readonly clearDragPreview: () => void
  readonly beginResize: (preview: DockResizePreview) => void
  readonly updateResizePreview: (preview: Partial<DockResizePreview>) => void
  readonly clearResizePreview: () => void
  readonly beginWindowMove: (preview: DockWindowMovePreview) => void
  readonly updateWindowMovePreview: (preview: Partial<DockWindowMovePreview>) => void
  readonly clearWindowMovePreview: () => void
  readonly beginWindowResize: (preview: DockWindowResizePreview) => void
  readonly updateWindowResizePreview: (preview: Partial<DockWindowResizePreview>) => void
  readonly clearWindowResizePreview: () => void
}

export const createDockRuntime = ({ dock, policy }: CreateDockRuntimeOptions): DockRuntime => {
  const state = createStore<DockRuntimeState>({})
  const events = createSignal<DockRuntimeEvent>()
  const base = createRuntime<DockRuntimeEnv>({
    dock,
    policy: composeDockPolicies(createDefaultDockPolicy(), dock.policy, policy),
    state,
    events,
  })

  return {
    ...base,
    beginDrag: (preview) => {
      state.update((current) => ({ ...current, dragPreview: preview }))
      events.emit({ type: "DockDragStarted", preview })
    },
    updateDragPreview: (preview) => {
      const currentPreview = state.get().dragPreview
      if (!currentPreview) return
      const next = { ...currentPreview, ...preview }
      state.update((current) => ({
        ...current,
        dragPreview: next,
        hoveredDropTarget: next.placement,
      }))
      events.emit({ type: "DockDragPreviewUpdated", preview: next })
    },
    clearDragPreview: () => {
      state.update((current) => ({
        ...current,
        dragPreview: undefined,
        hoveredDropTarget: undefined,
      }))
      events.emit({ type: "DockDragCleared" })
    },
    beginResize: (preview) => {
      state.update((current) => ({ ...current, resizePreview: preview }))
      events.emit({ type: "DockResizeStarted", preview })
    },
    updateResizePreview: (preview) => {
      const currentPreview = state.get().resizePreview
      if (!currentPreview) return
      const next = { ...currentPreview, ...preview }
      state.update((current) => ({ ...current, resizePreview: next }))
      events.emit({ type: "DockResizePreviewUpdated", preview: next })
    },
    clearResizePreview: () => {
      state.update((current) => ({ ...current, resizePreview: undefined }))
      events.emit({ type: "DockResizeCleared" })
    },
    beginWindowMove: (preview) => {
      state.update((current) => ({ ...current, windowMovePreview: preview }))
      events.emit({ type: "DockWindowMoveStarted", preview })
    },
    updateWindowMovePreview: (preview) => {
      const currentPreview = state.get().windowMovePreview
      if (!currentPreview) return
      const next = { ...currentPreview, ...preview }
      state.update((current) => ({ ...current, windowMovePreview: next }))
      events.emit({ type: "DockWindowMovePreviewUpdated", preview: next })
    },
    clearWindowMovePreview: () => {
      state.update((current) => ({ ...current, windowMovePreview: undefined }))
      events.emit({ type: "DockWindowMoveCleared" })
    },
    beginWindowResize: (preview) => {
      state.update((current) => ({ ...current, windowResizePreview: preview }))
      events.emit({ type: "DockWindowResizeStarted", preview })
    },
    updateWindowResizePreview: (preview) => {
      const currentPreview = state.get().windowResizePreview
      if (!currentPreview) return
      const next = { ...currentPreview, ...preview }
      state.update((current) => ({ ...current, windowResizePreview: next }))
      events.emit({ type: "DockWindowResizePreviewUpdated", preview: next })
    },
    clearWindowResizePreview: () => {
      state.update((current) => ({ ...current, windowResizePreview: undefined }))
      events.emit({ type: "DockWindowResizeCleared" })
    },
  }
}
