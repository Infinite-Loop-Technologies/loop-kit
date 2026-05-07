/**
 * Dock-specific interaction target contracts.
 *
 * These target builders and matchers are shared by React and non-React
 * bridges. They describe semantic dock hit targets without owning behavior.
 *
 * @module
 */

import type { InteractionTarget, InteractionTargetId } from "@loop-kit/interaction"

import type {
  DockGroupId,
  DockModalId,
  DockPanelId,
  DockSplitId,
  DockSurfaceId,
  DockWindowId,
} from "./DockIds.js"
import type { DockPlacementSide } from "./DockNode.js"

export type DockTargetKind =
  | "dock-panel"
  | "dock-tab"
  | "dock-group"
  | "dock-dropzone"
  | "dock-resize-handle"
  | "dock-window-titlebar"
  | "dock-window-resize-handle"
  | "dock-modal-surface"
  | "dock-overlay-backdrop"
  | "dock-sidebar"
  | "dock-inspector"

export interface DockTargetDataBase {
  readonly kind: DockTargetKind
}

export interface DockPanelTargetData extends DockTargetDataBase {
  readonly kind: "dock-panel"
  readonly panelId: DockPanelId
}

export interface DockTabTargetData extends DockTargetDataBase {
  readonly kind: "dock-tab"
  readonly panelId: DockPanelId
  readonly groupId: DockGroupId
}

export interface DockGroupTargetData extends DockTargetDataBase {
  readonly kind: "dock-group"
  readonly groupId: DockGroupId
}

export interface DockDropzoneTargetData extends DockTargetDataBase {
  readonly kind: "dock-dropzone"
  readonly groupId: DockGroupId
  readonly side: DockPlacementSide
}

export interface DockResizeHandleTargetData extends DockTargetDataBase {
  readonly kind: "dock-resize-handle"
  readonly splitId: DockSplitId
  readonly axis: "horizontal" | "vertical"
}

export interface DockWindowTitlebarTargetData extends DockTargetDataBase {
  readonly kind: "dock-window-titlebar"
  readonly windowId: DockWindowId
}

export interface DockWindowResizeHandleTargetData extends DockTargetDataBase {
  readonly kind: "dock-window-resize-handle"
  readonly windowId: DockWindowId
}

export interface DockModalSurfaceTargetData extends DockTargetDataBase {
  readonly kind: "dock-modal-surface"
  readonly modalId: DockModalId
}

export interface DockOverlayBackdropTargetData extends DockTargetDataBase {
  readonly kind: "dock-overlay-backdrop"
  readonly modalId?: DockModalId | undefined
}

export interface DockSidebarTargetData extends DockTargetDataBase {
  readonly kind: "dock-sidebar"
  readonly side: "left" | "right" | "top" | "bottom"
}

export interface DockInspectorTargetData extends DockTargetDataBase {
  readonly kind: "dock-inspector"
  readonly surfaceId?: DockSurfaceId | undefined
}

export type DockTargetData =
  | DockPanelTargetData
  | DockTabTargetData
  | DockGroupTargetData
  | DockDropzoneTargetData
  | DockResizeHandleTargetData
  | DockWindowTitlebarTargetData
  | DockWindowResizeHandleTargetData
  | DockModalSurfaceTargetData
  | DockOverlayBackdropTargetData
  | DockSidebarTargetData
  | DockInspectorTargetData

export const createDockInteractionTargetId = (
  kind: DockTargetKind,
  id: string
): InteractionTargetId => `${kind}:${id}` as InteractionTargetId

export const DockPanelTarget = createTargetMatcher<DockPanelTargetData>("dock-panel")
export const DockTabTarget = createTargetMatcher<DockTabTargetData>("dock-tab")
export const DockGroupTarget = createTargetMatcher<DockGroupTargetData>("dock-group")
export const DockDropzoneTarget = createTargetMatcher<DockDropzoneTargetData>("dock-dropzone")
export const DockResizeHandleTarget =
  createTargetMatcher<DockResizeHandleTargetData>("dock-resize-handle")
export const DockWindowTitlebarTarget =
  createTargetMatcher<DockWindowTitlebarTargetData>("dock-window-titlebar")
export const DockWindowResizeHandleTarget = createTargetMatcher<DockWindowResizeHandleTargetData>(
  "dock-window-resize-handle"
)
export const DockModalSurfaceTarget =
  createTargetMatcher<DockModalSurfaceTargetData>("dock-modal-surface")
export const DockOverlayBackdropTarget =
  createTargetMatcher<DockOverlayBackdropTargetData>("dock-overlay-backdrop")
export const DockSidebarTarget = createTargetMatcher<DockSidebarTargetData>("dock-sidebar")
export const DockInspectorTarget = createTargetMatcher<DockInspectorTargetData>("dock-inspector")

function createTargetMatcher<TData extends DockTargetData>(kind: TData["kind"]) {
  return {
    make: (data: Omit<TData, "kind">): TData => ({ kind, ...data }) as TData,
    match: (target: InteractionTarget | undefined): TData | undefined => {
      if (isDockTargetData(target?.data) && target.data.kind === kind) return target.data as TData
      return undefined
    },
  }
}

export const isDockTargetData = (value: unknown): value is DockTargetData =>
  typeof value === "object" &&
  value !== null &&
  "kind" in value &&
  typeof (value as { readonly kind: unknown }).kind === "string" &&
  (value as { readonly kind: string }).kind.startsWith("dock-")
