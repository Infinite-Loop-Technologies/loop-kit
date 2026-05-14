/**
 * Headless dock service.
 *
 * DockService owns committed dock truth: panels, surfaces, layout, layers,
 * focus, modal queue state, and domain events. It does not own transient drag
 * hover or resize previews.
 *
 * @module
 */

import type { Result } from "@loop-kit/common/Result"
import { err, ok } from "@loop-kit/common/Result"
import type { Signal } from "@loop-kit/common/Signal"
import { createSignal } from "@loop-kit/common/Signal"
import type { Store } from "@loop-kit/common/Store"
import { createStore } from "@loop-kit/common/Store"
import type { Typed } from "@loop-kit/common/Type"

import type { DockPoint, DockRect } from "./DockGeometry.js"
import { appendDockHistory } from "./DockHistory.js"
import type {
  DockGroupId,
  DockModalId,
  DockPanelId,
  DockSplitId,
  DockSurfaceId,
  DockWindowId,
} from "./DockIds.js"
import {
  findGroupById,
  findGroupForPanel,
  findSplitById,
  getPanelById,
  insertPanelIntoLayout,
  removePanelFromLayout,
  updateSplitRatio,
} from "./DockLayout.js"
import type {
  DockModalNode,
  DockPanel,
  DockPlacement,
  DockPlacementDecision,
  DockSurface,
} from "./DockNode.js"
import type { DockPolicy } from "./DockPolicy.js"
import { composeDockPolicies, createDefaultDockPolicy } from "./DockPolicy.js"
import type { DockState } from "./DockState.js"
import { createDockState } from "./DockState.js"

export type DockError =
  | DockPanelNotFound
  | DockPanelAlreadyRegistered
  | DockGroupNotFound
  | DockSplitNotFound
  | DockModalNotFound
  | DockSurfaceNotFound
  | DockWindowNotFound
  | DockInvalidPlacement
  | DockPolicyRejected

export interface DockPanelNotFound extends Typed<"DockPanelNotFound"> {
  readonly panelId: DockPanelId
}

export interface DockPanelAlreadyRegistered extends Typed<"DockPanelAlreadyRegistered"> {
  readonly panelId: DockPanelId
}

export interface DockGroupNotFound extends Typed<"DockGroupNotFound"> {
  readonly groupId: DockGroupId
}

export interface DockSplitNotFound extends Typed<"DockSplitNotFound"> {
  readonly splitId: DockSplitId
}

export interface DockModalNotFound extends Typed<"DockModalNotFound"> {
  readonly modalId: DockModalId
}

export interface DockSurfaceNotFound extends Typed<"DockSurfaceNotFound"> {
  readonly surfaceId: DockSurfaceId
}

export interface DockWindowNotFound extends Typed<"DockWindowNotFound"> {
  readonly windowId: DockWindowId
}

export interface DockInvalidPlacement extends Typed<"DockInvalidPlacement"> {
  readonly reason: string
}

export interface DockPolicyRejected extends Typed<"DockPolicyRejected"> {
  readonly reason: string
}

export type DockDomainEvent =
  | {
      readonly type: "DockPanelRegistered"
      readonly panel: DockPanel
      readonly state: DockState
    }
  | {
      readonly type: "DockPanelUnregistered"
      readonly panelId: DockPanelId
      readonly state: DockState
    }
  | {
      readonly type: "DockPanelFocused"
      readonly panelId: DockPanelId
      readonly state: DockState
    }
  | {
      readonly type: "DockPanelSelected"
      readonly panelId: DockPanelId
      readonly state: DockState
    }
  | {
      readonly type: "DockSurfaceOpened" | "DockSurfaceClosed"
      readonly surfaceId: DockSurfaceId
      readonly state: DockState
    }
  | {
      readonly type: "DockModalOpened" | "DockModalClosed"
      readonly modalId: DockModalId
      readonly state: DockState
    }
  | {
      readonly type: "DockDropCommitted"
      readonly panelId: DockPanelId
      readonly placement: DockPlacement
      readonly state: DockState
    }
  | {
      readonly type: "DockSplitResized"
      readonly splitId: DockSplitId
      readonly ratio: number
      readonly state: DockState
    }
  | {
      readonly type: "DockWindowFocused"
      readonly windowId: DockWindowId
      readonly state: DockState
    }
  | {
      readonly type: "DockWindowClosed"
      readonly windowId: DockWindowId
      readonly state: DockState
    }
  | {
      readonly type: "DockWindowMoved"
      readonly windowId: DockWindowId
      readonly position: DockPoint
      readonly state: DockState
    }
  | {
      readonly type: "DockWindowResized"
      readonly windowId: DockWindowId
      readonly frame: DockRect
      readonly state: DockState
    }

export interface CreateDockServiceOptions {
  readonly initialState?: DockState | undefined
  readonly policy?: DockPolicy | undefined
}

export interface DockService {
  readonly state: Store<DockState>
  readonly events: Signal<DockDomainEvent>
  readonly policy: DockPolicy
  readonly getPanel: (panelId: DockPanelId) => DockPanel | undefined
  readonly getFocusedPanel: () => DockPanel | undefined
  readonly registerPanel: (panel: DockPanel) => Result<void, DockError>
  readonly unregisterPanel: (panelId: DockPanelId) => Result<void, DockError>
  readonly focusPanel: (panelId: DockPanelId) => Result<void, DockError>
  readonly selectPanel: (panelId: DockPanelId) => Result<void, DockError>
  readonly openSurface: (surface: DockSurface) => Result<void, DockError>
  readonly closeSurface: (surfaceId: DockSurfaceId) => Result<void, DockError>
  readonly openModal: (modal: DockModalNode | DockModalId) => Result<void, DockError>
  readonly closeModal: (modalId: DockModalId) => Result<void, DockError>
  readonly focusWindow: (windowId: DockWindowId) => Result<void, DockError>
  readonly closeWindow: (windowId: DockWindowId) => Result<void, DockError>
  readonly moveWindow: (windowId: DockWindowId, position: DockPoint) => Result<void, DockError>
  readonly resizeWindow: (windowId: DockWindowId, frame: DockRect) => Result<void, DockError>
  readonly setWindowFrame: (windowId: DockWindowId, frame: DockRect) => Result<void, DockError>
  readonly canApplyPlacement: (
    panelId: DockPanelId,
    placement: DockPlacement
  ) => Result<DockPlacementDecision, DockError>
  readonly commitDrop: (panelId: DockPanelId, placement: DockPlacement) => Result<void, DockError>
  readonly resizeSplit: (splitId: DockSplitId, ratio: number) => Result<void, DockError>
}

export const createDockService = ({
  initialState = createDockState(),
  policy,
}: CreateDockServiceOptions = {}): DockService => {
  const state = createStore(initialState)
  const events = createSignal<DockDomainEvent>()
  const servicePolicy = composeDockPolicies(createDefaultDockPolicy(), policy)

  const setState = (next: DockState): void => {
    state.set(next)
  }

  const emit = (event: DockDomainEvent): void => {
    events.emit(event)
  }

  const service: DockService = {
    state,
    events,
    policy: servicePolicy,

    getPanel: (panelId) => getPanelById(state.get().panels, panelId),

    getFocusedPanel: () => {
      const focusedPanelId = state.get().focusedPanelId
      return focusedPanelId ? service.getPanel(focusedPanelId) : undefined
    },

    registerPanel: (panel) => {
      const current = state.get()
      if (getPanelById(current.panels, panel.id)) {
        return err({ type: "DockPanelAlreadyRegistered", panelId: panel.id })
      }
      const next = {
        ...current,
        panels: [...current.panels, panel],
        history: appendDockHistory(current.history, `Register panel ${panel.id}`),
      }
      setState(next)
      emit({ type: "DockPanelRegistered", panel, state: next })
      return ok()
    },

    unregisterPanel: (panelId) => {
      const current = state.get()
      if (!getPanelById(current.panels, panelId)) return err({ type: "DockPanelNotFound", panelId })
      const next = {
        ...current,
        panels: current.panels.filter((panel) => panel.id !== panelId),
        layout: removePanelFromLayout(current.layout, panelId),
        focusedPanelId: current.focusedPanelId === panelId ? undefined : current.focusedPanelId,
        selectedPanelId: current.selectedPanelId === panelId ? undefined : current.selectedPanelId,
        history: appendDockHistory(current.history, `Unregister panel ${panelId}`),
      }
      setState(next)
      emit({ type: "DockPanelUnregistered", panelId, state: next })
      return ok()
    },

    focusPanel: (panelId) => {
      const current = state.get()
      if (!getPanelById(current.panels, panelId)) return err({ type: "DockPanelNotFound", panelId })
      const decision = servicePolicy.canFocus?.({ state: current, panelId }) ?? { ok: true }
      if (!decision.ok)
        return err({ type: "DockPolicyRejected", reason: decision.reason ?? "Focus rejected." })
      const group = findGroupForPanel(current.layout, panelId)
      const next = {
        ...current,
        focusedPanelId: panelId,
        focusedSurfaceId: getPanelById(current.panels, panelId)?.surfaceId,
        layout: group ? setGroupActivePanel(current.layout, group.id, panelId) : current.layout,
        history: appendDockHistory(current.history, `Focus panel ${panelId}`),
      }
      setState(next)
      emit({ type: "DockPanelFocused", panelId, state: next })
      return ok()
    },

    selectPanel: (panelId) => {
      const result = service.focusPanel(panelId)
      if (!result.ok) return result
      const current = state.get()
      const next = {
        ...current,
        selectedPanelId: panelId,
        selectedSurfaceId: getPanelById(current.panels, panelId)?.surfaceId,
        history: appendDockHistory(current.history, `Select panel ${panelId}`),
      }
      setState(next)
      emit({ type: "DockPanelSelected", panelId, state: next })
      return ok()
    },

    openSurface: (surface) => {
      const current = state.get()
      const existing = current.surfaces.find((item) => item.id === surface.id)
      const next = {
        ...current,
        surfaces: existing
          ? current.surfaces.map((item) => (item.id === surface.id ? surface : item))
          : [...current.surfaces, surface],
        selectedSurfaceId: surface.id,
        history: appendDockHistory(current.history, `Open surface ${surface.id}`),
      }
      setState(next)
      emit({ type: "DockSurfaceOpened", surfaceId: surface.id, state: next })
      return ok()
    },

    closeSurface: (surfaceId) => {
      const current = state.get()
      if (!current.surfaces.some((surface) => surface.id === surfaceId)) {
        return err({ type: "DockSurfaceNotFound", surfaceId })
      }
      const decision = servicePolicy.canClose?.({ state: current, surfaceId }) ?? { ok: true }
      if (!decision.ok)
        return err({ type: "DockPolicyRejected", reason: decision.reason ?? "Close rejected." })
      const next = {
        ...current,
        surfaces: current.surfaces.filter((surface) => surface.id !== surfaceId),
        selectedSurfaceId:
          current.selectedSurfaceId === surfaceId ? undefined : current.selectedSurfaceId,
        focusedSurfaceId:
          current.focusedSurfaceId === surfaceId ? undefined : current.focusedSurfaceId,
        history: appendDockHistory(current.history, `Close surface ${surfaceId}`),
      }
      setState(next)
      emit({ type: "DockSurfaceClosed", surfaceId, state: next })
      return ok()
    },

    openModal: (modalOrId) => {
      const current = state.get()
      const modal =
        typeof modalOrId === "string"
          ? current.layout.modals.find((item) => item.id === modalOrId)
          : modalOrId
      if (!modal) return err({ type: "DockModalNotFound", modalId: modalOrId as DockModalId })
      const exists = current.layout.modals.some((item) => item.id === modal.id)
      const modals = exists
        ? current.layout.modals.map((item) =>
            item.id === modal.id ? { ...item, open: true } : item
          )
        : [...current.layout.modals, { ...modal, open: true }]
      const next = {
        ...current,
        layout: { ...current.layout, modals },
        modalQueue: current.modalQueue.includes(modal.id)
          ? current.modalQueue
          : [...current.modalQueue, modal.id],
        history: appendDockHistory(current.history, `Open modal ${modal.id}`),
      }
      setState(next)
      emit({ type: "DockModalOpened", modalId: modal.id, state: next })
      return ok()
    },

    closeModal: (modalId) => {
      const current = state.get()
      const modal = current.layout.modals.find((item) => item.id === modalId)
      if (!modal) return err({ type: "DockModalNotFound", modalId })
      const decision = servicePolicy.canClose?.({ state: current, modalId }) ?? { ok: true }
      if (!decision.ok)
        return err({
          type: "DockPolicyRejected",
          reason: decision.reason ?? "Modal close rejected.",
        })
      const next = {
        ...current,
        layout: {
          ...current.layout,
          modals: current.layout.modals.map((item) =>
            item.id === modalId ? { ...item, open: false } : item
          ),
        },
        modalQueue: current.modalQueue.filter((id) => id !== modalId),
        history: appendDockHistory(current.history, `Close modal ${modalId}`),
      }
      setState(next)
      emit({ type: "DockModalClosed", modalId, state: next })
      return ok()
    },

    focusWindow: (windowId) => {
      const current = state.get()
      const window = current.layout.floatingWindows.find((item) => item.id === windowId)
      if (!window) return err({ type: "DockWindowNotFound", windowId })
      const inactiveWindows = current.layout.floatingWindows
        .filter((item) => item.id !== windowId)
        .map((item) => ({ ...item, active: false }))
      const activeWindow = { ...window, active: true }
      const next = {
        ...current,
        layout: {
          ...current.layout,
          floatingWindows: [...inactiveWindows, activeWindow],
        },
        focusedSurfaceId: window.surfaceId,
        selectedSurfaceId: window.surfaceId,
        history: appendDockHistory(current.history, `Focus window ${windowId}`),
      }
      setState(next)
      emit({ type: "DockWindowFocused", windowId, state: next })
      return ok()
    },

    closeWindow: (windowId) => {
      const current = state.get()
      const window = current.layout.floatingWindows.find((item) => item.id === windowId)
      if (!window) return err({ type: "DockWindowNotFound", windowId })
      const decision = servicePolicy.canClose?.({
        state: current,
        surfaceId: window.surfaceId,
      }) ?? { ok: true }
      if (!decision.ok)
        return err({
          type: "DockPolicyRejected",
          reason: decision.reason ?? "Window close rejected.",
        })
      const next = {
        ...current,
        layout: {
          ...current.layout,
          floatingWindows: current.layout.floatingWindows.filter((item) => item.id !== windowId),
        },
        focusedSurfaceId:
          current.focusedSurfaceId === window.surfaceId ? undefined : current.focusedSurfaceId,
        selectedSurfaceId:
          current.selectedSurfaceId === window.surfaceId ? undefined : current.selectedSurfaceId,
        history: appendDockHistory(current.history, `Close window ${windowId}`),
      }
      setState(next)
      emit({ type: "DockWindowClosed", windowId, state: next })
      return ok()
    },

    moveWindow: (windowId, position) => {
      const current = state.get()
      const window = current.layout.floatingWindows.find((item) => item.id === windowId)
      if (!window) return err({ type: "DockWindowNotFound", windowId })
      const frame = normalizeDockWindowFrame({ ...window.frame, ...position })
      const next = setFloatingWindowFrame(current, windowId, frame, `Move window ${windowId}`)
      setState(next)
      emit({ type: "DockWindowMoved", windowId, position: { x: frame.x, y: frame.y }, state: next })
      return ok()
    },

    resizeWindow: (windowId, frame) => service.setWindowFrame(windowId, frame),

    setWindowFrame: (windowId, frame) => {
      const current = state.get()
      if (!current.layout.floatingWindows.some((item) => item.id === windowId)) {
        return err({ type: "DockWindowNotFound", windowId })
      }
      const nextFrame = normalizeDockWindowFrame(frame)
      const next = setFloatingWindowFrame(current, windowId, nextFrame, `Resize window ${windowId}`)
      setState(next)
      emit({ type: "DockWindowResized", windowId, frame: nextFrame, state: next })
      return ok()
    },

    canApplyPlacement: (panelId, placement) => {
      const current = state.get()
      if (!getPanelById(current.panels, panelId)) return err({ type: "DockPanelNotFound", panelId })
      const targetGroup = findGroupById(current.layout, placement.targetGroupId)
      if (!targetGroup) return err({ type: "DockGroupNotFound", groupId: placement.targetGroupId })
      if (placement.side !== "center") {
        const splitDecision = servicePolicy.canSplit?.({
          state: current,
          groupId: targetGroup.id,
          placement,
        }) ?? { ok: true }
        if (!splitDecision.ok) {
          return ok({
            placement,
            allowed: false,
            reason: splitDecision.reason ?? "Split rejected.",
          })
        }
      }
      const dropDecision = servicePolicy.canDrop?.({ state: current, panelId, placement }) ?? {
        ok: true,
      }
      return ok({
        placement,
        allowed: dropDecision.ok,
        reason: dropDecision.reason,
      })
    },

    commitDrop: (panelId, placement) => {
      const placementDecision = service.canApplyPlacement(panelId, placement)
      if (!placementDecision.ok) return placementDecision
      if (!placementDecision.value.allowed) {
        return err({
          type: "DockPolicyRejected",
          reason: placementDecision.value.reason ?? "Drop rejected.",
        })
      }
      const current = state.get()
      const sourceGroup = findGroupForPanel(current.layout, panelId)
      if (placement.side === "center" && sourceGroup?.id === placement.targetGroupId) {
        const next = {
          ...current,
          layout: setGroupPanels(current.layout, sourceGroup.id, {
            panelIds: reorderPanelIds(sourceGroup.panelIds, panelId, placement.beforePanelId),
            activePanelId: panelId,
          }),
          focusedPanelId: panelId,
          selectedPanelId: panelId,
          history: appendDockHistory(current.history, `Commit drop ${panelId}`),
        }
        setState(next)
        emit({ type: "DockDropCommitted", panelId, placement, state: next })
        return ok()
      }
      const withoutPanel = removePanelFromLayout(current.layout, panelId)
      if (!findGroupById(withoutPanel, placement.targetGroupId)) {
        return err({
          type: "DockInvalidPlacement",
          reason: "Drop target was removed before the panel could be inserted.",
        })
      }
      const next = {
        ...current,
        layout: insertPanelIntoLayout(withoutPanel, placement, panelId),
        focusedPanelId: panelId,
        selectedPanelId: panelId,
        history: appendDockHistory(current.history, `Commit drop ${panelId}`),
      }
      setState(next)
      emit({ type: "DockDropCommitted", panelId, placement, state: next })
      return ok()
    },

    resizeSplit: (splitId, ratio) => {
      const current = state.get()
      const split = findSplitById(current.layout, splitId)
      if (!split) return err({ type: "DockSplitNotFound", splitId })
      const decision = servicePolicy.canResize?.({ state: current, splitId, ratio }) ?? { ok: true }
      if (!decision.ok)
        return err({ type: "DockPolicyRejected", reason: decision.reason ?? "Resize rejected." })
      const next = {
        ...current,
        layout: updateSplitRatio(current.layout, splitId, ratio),
        history: appendDockHistory(current.history, `Resize split ${splitId}`),
      }
      setState(next)
      emit({ type: "DockSplitResized", splitId, ratio, state: next })
      return ok()
    },
  }

  return service
}

const normalizeDockWindowFrame = (frame: DockRect): DockRect => ({
  x: Number.isFinite(frame.x) ? frame.x : 80,
  y: Number.isFinite(frame.y) ? frame.y : 80,
  width: Math.max(160, Number.isFinite(frame.width) ? frame.width : 480),
  height: Math.max(120, Number.isFinite(frame.height) ? frame.height : 320),
})

const setFloatingWindowFrame = (
  state: DockState,
  windowId: DockWindowId,
  frame: DockRect,
  historyMessage: string
): DockState => ({
  ...state,
  layout: {
    ...state.layout,
    floatingWindows: state.layout.floatingWindows.map((window) =>
      window.id === windowId ? { ...window, frame } : window
    ),
  },
  history: appendDockHistory(state.history, historyMessage),
})

const setGroupActivePanel = (
  layout: DockState["layout"],
  groupId: DockGroupId,
  panelId: DockPanelId
): DockState["layout"] => ({
  ...layout,
  roots: {
    main: setGroupActivePanelInNode(layout.roots.main, groupId, panelId),
    left: setGroupActivePanelInNode(layout.roots.left ?? null, groupId, panelId) ?? undefined,
    right: setGroupActivePanelInNode(layout.roots.right ?? null, groupId, panelId) ?? undefined,
    top: setGroupActivePanelInNode(layout.roots.top ?? null, groupId, panelId) ?? undefined,
    bottom: setGroupActivePanelInNode(layout.roots.bottom ?? null, groupId, panelId) ?? undefined,
  },
})

const setGroupPanels = (
  layout: DockState["layout"],
  groupId: DockGroupId,
  update: {
    readonly panelIds: ReadonlyArray<DockPanelId>
    readonly activePanelId: DockPanelId
  }
): DockState["layout"] => ({
  ...layout,
  roots: {
    main: setGroupPanelsInNode(layout.roots.main, groupId, update),
    left: setGroupPanelsInNode(layout.roots.left ?? null, groupId, update) ?? undefined,
    right: setGroupPanelsInNode(layout.roots.right ?? null, groupId, update) ?? undefined,
    top: setGroupPanelsInNode(layout.roots.top ?? null, groupId, update) ?? undefined,
    bottom: setGroupPanelsInNode(layout.roots.bottom ?? null, groupId, update) ?? undefined,
  },
})

const setGroupActivePanelInNode = (
  node: DockState["layout"]["roots"]["main"],
  groupId: DockGroupId,
  panelId: DockPanelId
): DockState["layout"]["roots"]["main"] => {
  if (!node) return null
  if (node.type === "group") {
    return node.id === groupId ? { ...node, activePanelId: panelId } : node
  }
  return {
    ...node,
    leading: setGroupActivePanelInNode(node.leading, groupId, panelId) ?? node.leading,
    trailing: setGroupActivePanelInNode(node.trailing, groupId, panelId) ?? node.trailing,
  }
}

const setGroupPanelsInNode = (
  node: DockState["layout"]["roots"]["main"],
  groupId: DockGroupId,
  update: {
    readonly panelIds: ReadonlyArray<DockPanelId>
    readonly activePanelId: DockPanelId
  }
): DockState["layout"]["roots"]["main"] => {
  if (!node) return null
  if (node.type === "group") {
    return node.id === groupId ? { ...node, ...update } : node
  }
  return {
    ...node,
    leading: setGroupPanelsInNode(node.leading, groupId, update) ?? node.leading,
    trailing: setGroupPanelsInNode(node.trailing, groupId, update) ?? node.trailing,
  }
}

const reorderPanelIds = (
  panelIds: ReadonlyArray<DockPanelId>,
  panelId: DockPanelId,
  beforePanelId: DockPanelId | undefined
): ReadonlyArray<DockPanelId> => {
  if (!beforePanelId) return panelIds

  const withoutPanel = panelIds.filter((id) => id !== panelId)
  if (beforePanelId === panelId) return panelIds

  const beforeIndex = withoutPanel.findIndex((id) => id === beforePanelId)
  if (beforeIndex < 0) return [...withoutPanel, panelId]

  const next = [...withoutPanel]
  next.splice(beforeIndex, 0, panelId)
  return next
}
