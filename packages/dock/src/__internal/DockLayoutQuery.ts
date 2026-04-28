/**
 * Internal layout tree queries.
 *
 * Query helpers are kept separate from service code so domain commands can stay
 * readable. They do not mutate layout nodes.
 *
 * @module
 */

import type { DockGroupId, DockPanelId, DockSplitId } from "../DockIds.js"
import type { DockGroupNode, DockLayout, DockLayoutNode, DockSplitNode } from "../DockNode.js"

export const getLayoutRoots = (layout: DockLayout): ReadonlyArray<DockLayoutNode | null> => [
  layout.roots.main,
  layout.roots.left ?? null,
  layout.roots.right ?? null,
  layout.roots.top ?? null,
  layout.roots.bottom ?? null,
  ...layout.floatingWindows.map((window) => window.root),
  ...layout.modals.map((modal) => modal.root),
  ...layout.overlays.map((overlay) => overlay.root),
]

export const findGroupByIdInNode = (
  node: DockLayoutNode | null,
  groupId: DockGroupId
): DockGroupNode | null => {
  if (!node) return null
  if (node.type === "group") return node.id === groupId ? node : null
  return findGroupByIdInNode(node.leading, groupId) ?? findGroupByIdInNode(node.trailing, groupId)
}

export const findGroupForPanelInNode = (
  node: DockLayoutNode | null,
  panelId: DockPanelId
): DockGroupNode | null => {
  if (!node) return null
  if (node.type === "group") return node.panelIds.includes(panelId) ? node : null
  return (
    findGroupForPanelInNode(node.leading, panelId) ??
    findGroupForPanelInNode(node.trailing, panelId)
  )
}

export const findSplitByIdInNode = (
  node: DockLayoutNode | null,
  splitId: DockSplitId
): DockSplitNode | null => {
  if (!node) return null
  if (node.type === "split") {
    if (node.id === splitId) return node
    return findSplitByIdInNode(node.leading, splitId) ?? findSplitByIdInNode(node.trailing, splitId)
  }
  return null
}

export const getLayoutDepth = (node: DockLayoutNode | null): number => {
  if (!node) return 0
  if (node.type === "group") return 1
  return 1 + Math.max(getLayoutDepth(node.leading), getLayoutDepth(node.trailing))
}
