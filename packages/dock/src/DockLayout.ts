/**
 * Dock layout factories and tree helpers.
 */

import {
  createDockModalId,
  createDockSplitId,
  createDockTabGroupId,
  createDockWindowId,
  type DockPanelId,
  type DockSplitId,
  type DockTabGroupId,
} from "./DockIds.js";
import type {
  DockAxis,
  DockDropPlacement,
  DockDropSide,
  DockLayout,
  DockLayoutNode,
  DockModalNode,
  DockPanel,
  DockSplitNode,
  DockTabGroupNode,
  DockWindowNode,
} from "./DockNode.js";

export const createDockTabGroup = (
  panelIds: ReadonlyArray<DockPanelId>,
  activePanelId = panelIds[0],
  id = createDockTabGroupId(),
): DockTabGroupNode => ({
  type: "DockTabGroup",
  id,
  panelIds,
  activePanelId:
    activePanelId ??
    panelIds[0] ??
    (() => {
      throw new Error("Dock tab groups require at least one panel.");
    })(),
});

export const createDockSplit = (
  axis: DockAxis,
  leading: DockLayoutNode,
  trailing: DockLayoutNode,
  ratio = 0.5,
  id = createDockSplitId(),
): DockSplitNode => ({
  type: "DockSplit",
  id,
  axis,
  ratio,
  leading,
  trailing,
});

export const createDockWindow = (
  title: string,
  root: DockLayoutNode,
  overrides: Partial<DockWindowNode> = {},
): DockWindowNode => ({
  id: overrides.id ?? createDockWindowId(),
  title,
  root,
  frame: overrides.frame ?? { x: 72, y: 72, width: 360, height: 240 },
  active: overrides.active ?? false,
});

export const createDockModal = (
  title: string,
  root: DockLayoutNode,
  overrides: Partial<DockModalNode> = {},
): DockModalNode => ({
  id: overrides.id ?? createDockModalId(),
  title,
  root,
  open: overrides.open ?? false,
});

export const createDockLayout = ({
  root,
  floatingWindows = [],
  modals = [],
}: {
  readonly root: DockLayoutNode | null;
  readonly floatingWindows?: ReadonlyArray<DockWindowNode>;
  readonly modals?: ReadonlyArray<DockModalNode>;
}): DockLayout => ({
  root,
  floatingWindows,
  modals,
});

export const findGroupById = (
  node: DockLayoutNode | null,
  groupId: DockTabGroupId,
): DockTabGroupNode | null => {
  if (!node) return null;
  if (node.type === "DockTabGroup") return node.id === groupId ? node : null;
  return findGroupById(node.leading, groupId) ?? findGroupById(node.trailing, groupId);
};

export const findGroupForPanel = (
  node: DockLayoutNode | null,
  panelId: DockPanelId,
): DockTabGroupNode | null => {
  if (!node) return null;
  if (node.type === "DockTabGroup") {
    return node.panelIds.includes(panelId) ? node : null;
  }
  return findGroupForPanel(node.leading, panelId) ?? findGroupForPanel(node.trailing, panelId);
};

export const findSplitById = (
  node: DockLayoutNode | null,
  splitId: DockSplitId,
): DockSplitNode | null => {
  if (!node) return null;
  if (node.type === "DockSplit" && node.id === splitId) return node;
  if (node.type === "DockTabGroup") return null;
  return findSplitById(node.leading, splitId) ?? findSplitById(node.trailing, splitId);
};

const normalizeLayoutNode = (node: DockLayoutNode | null): DockLayoutNode | null => {
  if (!node) return null;
  if (node.type === "DockTabGroup") {
    return node.panelIds.length > 0 ? node : null;
  }

  const leading = normalizeLayoutNode(node.leading);
  const trailing = normalizeLayoutNode(node.trailing);

  if (!leading && !trailing) return null;
  if (!leading) return trailing;
  if (!trailing) return leading;

  return {
    ...node,
    leading,
    trailing,
  };
};

export const removePanelFromLayout = (
  node: DockLayoutNode | null,
  panelId: DockPanelId,
): DockLayoutNode | null =>
  normalizeLayoutNode(
    !node
      ? null
      : node.type === "DockTabGroup"
        ? node.panelIds.includes(panelId)
          ? {
              ...node,
              panelIds: node.panelIds.filter((value) => value !== panelId),
              activePanelId:
                node.activePanelId === panelId
                  ? node.panelIds.find((value) => value !== panelId) ?? panelId
                  : node.activePanelId,
            }
          : node
        : {
            ...node,
            leading: removePanelFromLayout(node.leading, panelId) ?? node.leading,
            trailing: removePanelFromLayout(node.trailing, panelId) ?? node.trailing,
          },
  );

export const insertPanelIntoGroup = (
  node: DockLayoutNode,
  groupId: DockTabGroupId,
  panelId: DockPanelId,
): DockLayoutNode =>
  node.type === "DockTabGroup"
    ? node.id === groupId
      ? {
          ...node,
          panelIds: node.panelIds.includes(panelId)
            ? node.panelIds
            : [...node.panelIds, panelId],
          activePanelId: panelId,
        }
      : node
    : {
        ...node,
        leading: insertPanelIntoGroup(node.leading, groupId, panelId),
        trailing: insertPanelIntoGroup(node.trailing, groupId, panelId),
      };

const splitForSide = (side: DockDropSide): DockAxis =>
  side === "left" || side === "right" ? "horizontal" : "vertical";

export const wrapGroupWithPanelSplit = (
  node: DockLayoutNode,
  placement: DockDropPlacement,
  panelId: DockPanelId,
): DockLayoutNode => {
  if (node.type === "DockTabGroup") {
    if (node.id !== placement.groupId) return node;
    if (placement.side === "center") {
      return {
        ...node,
        panelIds: node.panelIds.includes(panelId)
          ? node.panelIds
          : [...node.panelIds, panelId],
        activePanelId: panelId,
      };
    }
    const panelGroup = createDockTabGroup([panelId], panelId);
    const axis = splitForSide(placement.side);
    return placement.side === "left" || placement.side === "top"
      ? createDockSplit(axis, panelGroup, node)
      : createDockSplit(axis, node, panelGroup);
  }

  return {
    ...node,
    leading: wrapGroupWithPanelSplit(node.leading, placement, panelId),
    trailing: wrapGroupWithPanelSplit(node.trailing, placement, panelId),
  };
};

export const updateSplitRatio = (
  node: DockLayoutNode,
  splitId: DockSplitId,
  ratio: number,
): DockLayoutNode =>
  node.type === "DockTabGroup"
    ? node
    : node.id === splitId
      ? { ...node, ratio: Math.max(0.15, Math.min(0.85, ratio)) }
      : {
          ...node,
          leading: updateSplitRatio(node.leading, splitId, ratio),
          trailing: updateSplitRatio(node.trailing, splitId, ratio),
        };

export const getPanelById = (
  panels: ReadonlyArray<DockPanel>,
  panelId: DockPanelId,
): DockPanel | undefined => panels.find((panel) => panel.id === panelId);
