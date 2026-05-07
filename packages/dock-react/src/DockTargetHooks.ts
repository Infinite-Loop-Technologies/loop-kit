/**
 * React hooks for registering dock semantic targets.
 *
 * These hooks wrap `@loop-kit/interaction/react` target registration with dock
 * target data. They do not attach behavior; dock interaction installers do.
 *
 * @module
 */

import { useMemo } from "react"

import {
  DockDropzoneTarget,
  type DockGroupId,
  type DockModalId,
  DockModalSurfaceTarget,
  DockOverlayBackdropTarget,
  type DockPanelId,
  DockPanelTarget,
  type DockPlacementSide,
  DockResizeHandleTarget,
  type DockSplitId,
  DockTabTarget,
  type DockWindowId,
  DockWindowResizeHandleTarget,
  DockWindowTitlebarTarget,
  createDockInteractionTargetId,
} from "@loop-kit/dock"
import type { InteractionTargetId } from "@loop-kit/interaction"
import { useInteractionTarget } from "@loop-kit/interaction/react"

export const useDockPanelTarget = <TElement extends Element = HTMLElement>(
  panelId: DockPanelId
): ((element: TElement | null) => void) => {
  const options = useMemo(
    () => ({
      id: createDockInteractionTargetId("dock-panel", panelId),
      roles: ["focusable", "pressable"] as const,
      data: DockPanelTarget.make({ panelId }),
    }),
    [panelId]
  )
  return useInteractionTarget<TElement>(options)
}

export const useDockTabTarget = <TElement extends Element = HTMLElement>(
  panelId: DockPanelId,
  groupId: DockGroupId
): ((element: TElement | null) => void) => {
  const options = useMemo(
    () => ({
      id: createDockInteractionTargetId("dock-tab", `${groupId}:${panelId}`),
      roles: ["pressable", "selectable", "draggable"] as const,
      capabilities: { pointer: true, drag: true },
      data: DockTabTarget.make({ panelId, groupId }),
    }),
    [groupId, panelId]
  )
  return useInteractionTarget<TElement>(options)
}

export const useDockDropzoneTarget = <TElement extends Element = HTMLElement>(
  groupId: DockGroupId,
  side: DockPlacementSide
): ((element: TElement | null) => void) => {
  const options = useMemo(
    () => ({
      id: createDockInteractionTargetId("dock-dropzone", `${groupId}:${side}`),
      roles: ["dropzone"] as const,
      capabilities: { drop: true },
      data: DockDropzoneTarget.make({ groupId, side }),
    }),
    [groupId, side]
  )
  return useInteractionTarget<TElement>(options)
}

export const useDockResizeHandleTarget = <TElement extends Element = HTMLElement>(
  splitId: DockSplitId,
  axis: "horizontal" | "vertical"
): ((element: TElement | null) => void) => {
  const options = useMemo(
    () => ({
      id: createDockInteractionTargetId("dock-resize-handle", splitId),
      roles: ["resize-handle", "draggable"] as const,
      capabilities: { pointer: true, drag: true },
      data: DockResizeHandleTarget.make({ splitId, axis }),
    }),
    [axis, splitId]
  )
  return useInteractionTarget<TElement>(options)
}

export const useDockWindowTitlebarTarget = <TElement extends Element = HTMLElement>(
  windowId: DockWindowId
): ((element: TElement | null) => void) => {
  const options = useMemo(
    () => ({
      id: createDockInteractionTargetId("dock-window-titlebar", windowId),
      roles: ["focusable", "pressable", "draggable"] as const,
      capabilities: { pointer: true, drag: true },
      data: DockWindowTitlebarTarget.make({ windowId }),
    }),
    [windowId]
  )
  return useInteractionTarget<TElement>(options)
}

export const useDockWindowResizeHandleTarget = <TElement extends Element = HTMLElement>(
  windowId: DockWindowId
): ((element: TElement | null) => void) => {
  const options = useMemo(
    () => ({
      id: createDockInteractionTargetId("dock-window-resize-handle", windowId),
      roles: ["resize-handle", "draggable"] as const,
      capabilities: { pointer: true, drag: true },
      data: DockWindowResizeHandleTarget.make({ windowId }),
    }),
    [windowId]
  )
  return useInteractionTarget<TElement>(options)
}

export const useDockModalSurfaceTarget = <TElement extends Element = HTMLElement>(
  modalId: DockModalId
): ((element: TElement | null) => void) => {
  const options = useMemo(
    () => ({
      id: createDockInteractionTargetId("dock-modal-surface", modalId),
      roles: ["command-boundary"] as const,
      data: DockModalSurfaceTarget.make({ modalId }),
    }),
    [modalId]
  )
  return useInteractionTarget<TElement>(options)
}

export const useDockOverlayBackdropTarget = <TElement extends Element = HTMLElement>(
  modalId?: DockModalId
): ((element: TElement | null) => void) => {
  const id = (modalId ?? "global") as InteractionTargetId
  const options = useMemo(
    () => ({
      id: createDockInteractionTargetId("dock-overlay-backdrop", id),
      roles: ["pressable"] as const,
      data: DockOverlayBackdropTarget.make({ modalId }),
    }),
    [id, modalId]
  )
  return useInteractionTarget<TElement>(options)
}
