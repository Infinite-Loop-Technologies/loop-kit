/**
 * Dock domain model.
 *
 * The model leaves room for future persistence and multiplayer work while
 * keeping this pass readable:
 *
 * - committed panels and layout nodes
 * - root split/tab-group tree
 * - floating windows and modal shells
 */

import type {
  DockModalId,
  DockPanelId,
  DockSplitId,
  DockTabGroupId,
  DockWindowId,
} from "./DockIds.js";

export type DockAxis = "horizontal" | "vertical";
export type DockDropSide = "left" | "right" | "top" | "bottom" | "center";

export interface DockPanel {
  readonly id: DockPanelId;
  readonly title: string;
  readonly kind: string;
  readonly description?: string | undefined;
}

export interface DockTabGroupNode {
  readonly type: "DockTabGroup";
  readonly id: DockTabGroupId;
  readonly panelIds: ReadonlyArray<DockPanelId>;
  readonly activePanelId: DockPanelId;
}

export interface DockSplitNode {
  readonly type: "DockSplit";
  readonly id: DockSplitId;
  readonly axis: DockAxis;
  readonly ratio: number;
  readonly leading: DockLayoutNode;
  readonly trailing: DockLayoutNode;
}

export type DockLayoutNode = DockTabGroupNode | DockSplitNode;

export interface DockWindowFrame {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface DockWindowNode {
  readonly id: DockWindowId;
  readonly title: string;
  readonly root: DockLayoutNode;
  readonly frame: DockWindowFrame;
  readonly active: boolean;
}

export interface DockModalNode {
  readonly id: DockModalId;
  readonly title: string;
  readonly root: DockLayoutNode;
  readonly open: boolean;
}

export interface DockLayout {
  readonly root: DockLayoutNode | null;
  readonly floatingWindows: ReadonlyArray<DockWindowNode>;
  readonly modals: ReadonlyArray<DockModalNode>;
}

export interface DockDropPlacement {
  readonly type: "DockDropPlacement";
  readonly groupId: DockTabGroupId;
  readonly side: DockDropSide;
}
