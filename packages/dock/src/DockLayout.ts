/**
 * Public factories and layout helpers.
 *
 * These helpers keep dock state mutations small and testable. They do not
 * decide whether a placement is legal; policy and validation do that before
 * the service commits state.
 *
 * @module
 */

import type { DockAxis, DockRect } from "./DockGeometry.js"
import { clampRatio } from "./DockGeometry.js"
import {
  type DockGroupId,
  type DockPanelId,
  type DockSplitId,
  createDockGroupId,
  createDockLayerId,
  createDockModalId,
  createDockNodeId,
  createDockSplitId,
  createDockSurfaceId,
  createDockWindowId,
} from "./DockIds.js"
import type {
  DockGroupNode,
  DockLayer,
  DockLayout,
  DockLayoutNode,
  DockModalNode,
  DockPanel,
  DockPlacement,
  DockSplitNode,
  DockStackMode,
  DockWindowNode,
} from "./DockNode.js"
import {
  insertPanelByPlacement,
  removePanelFromNode,
  updateSplitInNode,
} from "./__internal/DockLayoutMutation.js"
import {
  findGroupByIdInNode,
  findGroupForPanelInNode,
  findSplitByIdInNode,
  getLayoutRoots,
} from "./__internal/DockLayoutQuery.js"

export const createDockGroup = ({
  id = createDockGroupId(),
  panelIds = [],
  activePanelId = panelIds[0],
  stackMode = "tabs",
  fixed,
}: {
  readonly id?: DockGroupId | undefined
  readonly panelIds?: ReadonlyArray<DockPanelId> | undefined
  readonly activePanelId?: DockPanelId | undefined
  readonly stackMode?: DockStackMode | undefined
  readonly fixed?: boolean | undefined
} = {}): DockGroupNode => ({
  type: "group",
  id,
  nodeId: createDockNodeId(),
  stackMode,
  panelIds,
  activePanelId,
  fixed,
})

export const createDockSplit = ({
  id = createDockSplitId(),
  axis,
  leading,
  trailing,
  ratio = 0.5,
  minRatio,
  maxRatio,
}: {
  readonly id?: DockSplitId | undefined
  readonly axis: DockAxis
  readonly leading: DockLayoutNode
  readonly trailing: DockLayoutNode
  readonly ratio?: number | undefined
  readonly minRatio?: number | undefined
  readonly maxRatio?: number | undefined
}): DockSplitNode => ({
  type: "split",
  id,
  nodeId: createDockNodeId(),
  axis,
  ratio: clampRatio(ratio, minRatio, maxRatio),
  leading,
  trailing,
  minRatio,
  maxRatio,
})

export const createDockWindow = ({
  title,
  root,
  frame,
  active = false,
  resizable = true,
  draggable = true,
}: {
  readonly title: string
  readonly root: DockLayoutNode
  readonly frame?: DockRect | undefined
  readonly active?: boolean | undefined
  readonly resizable?: boolean | undefined
  readonly draggable?: boolean | undefined
}): DockWindowNode => {
  const surfaceId = createDockSurfaceId()
  return {
    id: createDockWindowId(),
    surfaceId,
    title,
    root,
    frame: frame ?? { x: 80, y: 80, width: 480, height: 320 },
    active,
    resizable,
    draggable,
  }
}

export const createDockModal = ({
  title,
  root,
  open = false,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  queueKey,
}: {
  readonly title: string
  readonly root: DockLayoutNode
  readonly open?: boolean | undefined
  readonly closeOnEscape?: boolean | undefined
  readonly closeOnOutsideClick?: boolean | undefined
  readonly queueKey?: string | undefined
}): DockModalNode => ({
  id: createDockModalId(),
  surfaceId: createDockSurfaceId(),
  title,
  root,
  open,
  closeOnEscape,
  closeOnOutsideClick,
  queueKey,
})

export const createDockLayer = ({
  surfaceIds = [],
  zIndex = 0,
  visible = true,
}: {
  readonly surfaceIds?: ReadonlyArray<DockLayer["surfaceIds"][number]> | undefined
  readonly zIndex?: number | undefined
  readonly visible?: boolean | undefined
} = {}): DockLayer => ({
  id: createDockLayerId(),
  surfaceIds,
  zIndex,
  visible,
})

export const createDockLayout = ({
  main = null,
  left,
  right,
  top,
  bottom,
  floatingWindows = [],
  modals = [],
  overlays = [],
  layers = [],
}: {
  readonly main?: DockLayoutNode | null | undefined
  readonly left?: DockLayoutNode | undefined
  readonly right?: DockLayoutNode | undefined
  readonly top?: DockLayoutNode | undefined
  readonly bottom?: DockLayoutNode | undefined
  readonly floatingWindows?: ReadonlyArray<DockWindowNode> | undefined
  readonly modals?: ReadonlyArray<DockModalNode> | undefined
  readonly overlays?: ReadonlyArray<DockModalNode> | undefined
  readonly layers?: ReadonlyArray<DockLayer> | undefined
} = {}): DockLayout => ({
  roots: { main, left, right, top, bottom },
  floatingWindows,
  modals,
  overlays,
  layers,
})

export const findGroupById = (layout: DockLayout, groupId: DockGroupId): DockGroupNode | null => {
  for (const root of getLayoutRoots(layout)) {
    const group = findGroupByIdInNode(root, groupId)
    if (group) return group
  }
  return null
}

export const findGroupForPanel = (
  layout: DockLayout,
  panelId: DockPanelId
): DockGroupNode | null => {
  for (const root of getLayoutRoots(layout)) {
    const group = findGroupForPanelInNode(root, panelId)
    if (group) return group
  }
  return null
}

export const findSplitById = (layout: DockLayout, splitId: DockSplitId): DockSplitNode | null => {
  for (const root of getLayoutRoots(layout)) {
    const split = findSplitByIdInNode(root, splitId)
    if (split) return split
  }
  return null
}

export const getPanelById = (
  panels: ReadonlyArray<DockPanel>,
  panelId: DockPanelId
): DockPanel | undefined => panels.find((panel) => panel.id === panelId)

export const removePanelFromLayout = (layout: DockLayout, panelId: DockPanelId): DockLayout => ({
  ...layout,
  roots: {
    main: removePanelFromNode(layout.roots.main, panelId),
    left: removePanelFromNode(layout.roots.left ?? null, panelId) ?? undefined,
    right: removePanelFromNode(layout.roots.right ?? null, panelId) ?? undefined,
    top: removePanelFromNode(layout.roots.top ?? null, panelId) ?? undefined,
    bottom: removePanelFromNode(layout.roots.bottom ?? null, panelId) ?? undefined,
  },
})

export const insertPanelIntoLayout = (
  layout: DockLayout,
  placement: DockPlacement,
  panelId: DockPanelId
): DockLayout => ({
  ...layout,
  roots: {
    ...layout.roots,
    [placement.region ?? "main"]: insertPanelByPlacement(
      layout.roots[placement.region ?? "main"] ?? null,
      placement,
      panelId
    ),
  },
})

export const updateSplitRatio = (
  layout: DockLayout,
  splitId: DockSplitId,
  ratio: number
): DockLayout => ({
  ...layout,
  roots: {
    main: updateSplitInNode(layout.roots.main, splitId, ratio),
    left: updateSplitInNode(layout.roots.left ?? null, splitId, ratio) ?? undefined,
    right: updateSplitInNode(layout.roots.right ?? null, splitId, ratio) ?? undefined,
    top: updateSplitInNode(layout.roots.top ?? null, splitId, ratio) ?? undefined,
    bottom: updateSplitInNode(layout.roots.bottom ?? null, splitId, ratio) ?? undefined,
  },
})
