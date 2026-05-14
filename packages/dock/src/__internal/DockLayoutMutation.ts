/**
 * Internal immutable layout tree mutations.
 *
 * These helpers transform layout nodes after callers have validated policy and
 * existence. They intentionally return new node objects for store change
 * detection.
 *
 * @module
 */

import { clampRatio } from "../DockGeometry.js"
import type { DockPanelId, DockSplitId } from "../DockIds.js"
import { createDockGroup, createDockSplit } from "../DockLayout.js"
import type { DockLayoutNode, DockPlacement } from "../DockNode.js"

export const removePanelFromNode = (
  node: DockLayoutNode | null,
  panelId: DockPanelId
): DockLayoutNode | null => {
  if (!node) return null
  if (node.type === "group") {
    const panelIds = node.panelIds.filter((id) => id !== panelId)
    if (panelIds.length === 0) return null
    return {
      ...node,
      panelIds,
      activePanelId:
        node.activePanelId === panelId
          ? (panelIds[0] as DockPanelId | undefined)
          : node.activePanelId,
    }
  }

  const leading = removePanelFromNode(node.leading, panelId)
  const trailing = removePanelFromNode(node.trailing, panelId)
  if (!leading) return trailing
  if (!trailing) return leading
  return { ...node, leading, trailing }
}

export const insertPanelByPlacement = (
  node: DockLayoutNode | null,
  placement: DockPlacement,
  panelId: DockPanelId
): DockLayoutNode => {
  if (!node) return createDockGroup({ panelIds: [panelId], activePanelId: panelId })

  if (node.type === "group" && node.id === placement.targetGroupId) {
    if (placement.side === "center") {
      const panelIds = insertPanelIntoGroup(node.panelIds, panelId, placement.beforePanelId)
      return { ...node, panelIds, activePanelId: panelId }
    }

    const newGroup = createDockGroup({ panelIds: [panelId], activePanelId: panelId })
    const axis = placement.side === "left" || placement.side === "right" ? "horizontal" : "vertical"
    const newPanelFirst = placement.side === "left" || placement.side === "top"
    return createDockSplit({
      axis,
      leading: newPanelFirst ? newGroup : node,
      trailing: newPanelFirst ? node : newGroup,
      ratio: 0.5,
    })
  }

  if (node.type === "split") {
    return {
      ...node,
      leading: insertPanelByPlacement(node.leading, placement, panelId),
      trailing: containsGroup(node.leading, placement.targetGroupId)
        ? node.trailing
        : insertPanelByPlacement(node.trailing, placement, panelId),
    }
  }

  return node
}

export const updateSplitInNode = (
  node: DockLayoutNode | null,
  splitId: DockSplitId,
  ratio: number
): DockLayoutNode | null => {
  if (!node) return null
  if (node.type === "group") return node
  if (node.id === splitId) {
    return {
      ...node,
      ratio: clampRatio(ratio, node.minRatio, node.maxRatio),
    }
  }
  return {
    ...node,
    leading: updateSplitInNode(node.leading, splitId, ratio) ?? node.leading,
    trailing: updateSplitInNode(node.trailing, splitId, ratio) ?? node.trailing,
  }
}

const containsGroup = (
  node: DockLayoutNode | null,
  groupId: DockPlacement["targetGroupId"]
): boolean => {
  if (!node) return false
  if (node.type === "group") return node.id === groupId
  return containsGroup(node.leading, groupId) || containsGroup(node.trailing, groupId)
}

const insertPanelIntoGroup = (
  currentPanelIds: ReadonlyArray<DockPanelId>,
  panelId: DockPanelId,
  beforePanelId: DockPanelId | undefined
): ReadonlyArray<DockPanelId> => {
  const withoutPanel = currentPanelIds.filter((id) => id !== panelId)
  if (!beforePanelId || beforePanelId === panelId) return [...withoutPanel, panelId]

  const beforeIndex = withoutPanel.findIndex((id) => id === beforePanelId)
  if (beforeIndex < 0) return [...withoutPanel, panelId]

  const next = [...withoutPanel]
  next.splice(beforeIndex, 0, panelId)
  return next
}
