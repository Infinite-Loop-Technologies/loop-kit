/**
 * Persistable dock node and surface model.
 *
 * The model supports normal docked layouts, side regions, floating windows,
 * modals, overlays, and queues without committing to one final renderer. It
 * does not contain transient drag hover or resize previews.
 *
 * @module
 */

import type { DockRect } from "./DockGeometry.js"
import type {
  DockGroupId,
  DockLayerId,
  DockModalId,
  DockNodeId,
  DockPanelId,
  DockSplitId,
  DockSurfaceId,
  DockWindowId,
} from "./DockIds.js"

export type DockStackMode = "none" | "tabs" | "overlay" | "modal" | "queue"
export type DockPlacementSide = "left" | "right" | "top" | "bottom" | "center"
export type DockLayoutRegion = "main" | "left" | "right" | "top" | "bottom"
export type DockSurfaceKind =
  | "panel"
  | "group"
  | "split"
  | "window"
  | "modal"
  | "overlay"
  | "sidebar"
  | "inspector"

export interface DockPanel {
  readonly id: DockPanelId
  readonly title: string
  readonly kind: string
  readonly surfaceId?: DockSurfaceId | undefined
  readonly closable?: boolean | undefined
  readonly metadata?: Readonly<Record<string, unknown>> | undefined
}

export interface DockSurface {
  readonly id: DockSurfaceId
  readonly kind: DockSurfaceKind
  readonly title?: string | undefined
  readonly panelId?: DockPanelId | undefined
  readonly layerId?: DockLayerId | undefined
  readonly metadata?: Readonly<Record<string, unknown>> | undefined
}

export interface DockGroupNode {
  readonly type: "group"
  readonly id: DockGroupId
  readonly nodeId: DockNodeId
  readonly stackMode: DockStackMode
  readonly panelIds: ReadonlyArray<DockPanelId>
  readonly activePanelId?: DockPanelId | undefined
  readonly fixed?: boolean | undefined
}

export interface DockSplitNode {
  readonly type: "split"
  readonly id: DockSplitId
  readonly nodeId: DockNodeId
  readonly axis: "horizontal" | "vertical"
  readonly ratio: number
  readonly leading: DockLayoutNode
  readonly trailing: DockLayoutNode
  readonly minRatio?: number | undefined
  readonly maxRatio?: number | undefined
}

export type DockLayoutNode = DockGroupNode | DockSplitNode

export interface DockWindowNode {
  readonly id: DockWindowId
  readonly surfaceId: DockSurfaceId
  readonly title: string
  readonly root: DockLayoutNode
  readonly frame: DockRect
  readonly active: boolean
  readonly resizable: boolean
  readonly draggable: boolean
}

export interface DockModalNode {
  readonly id: DockModalId
  readonly surfaceId: DockSurfaceId
  readonly title: string
  readonly root: DockLayoutNode
  readonly open: boolean
  readonly queueKey?: string | undefined
  readonly closeOnEscape: boolean
  readonly closeOnOutsideClick: boolean
}

export interface DockLayer {
  readonly id: DockLayerId
  readonly surfaceIds: ReadonlyArray<DockSurfaceId>
  readonly zIndex: number
  readonly visible: boolean
}

export interface DockLayoutRoots {
  readonly main: DockLayoutNode | null
  readonly left?: DockLayoutNode | undefined
  readonly right?: DockLayoutNode | undefined
  readonly top?: DockLayoutNode | undefined
  readonly bottom?: DockLayoutNode | undefined
}

export interface DockLayout {
  readonly roots: DockLayoutRoots
  readonly floatingWindows: ReadonlyArray<DockWindowNode>
  readonly modals: ReadonlyArray<DockModalNode>
  readonly overlays: ReadonlyArray<DockModalNode>
  readonly layers: ReadonlyArray<DockLayer>
}

export interface DockPlacement {
  readonly targetGroupId: DockGroupId
  readonly side: DockPlacementSide
  readonly beforePanelId?: DockPanelId | undefined
  readonly region?: DockLayoutRegion | undefined
}

export interface DockPlacementDecision {
  readonly placement: DockPlacement
  readonly allowed: boolean
  readonly reason?: string | undefined
}
