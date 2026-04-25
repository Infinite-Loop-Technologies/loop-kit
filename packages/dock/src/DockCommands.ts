/**
 * Dock command contracts and pure command application.
 */

import { err, ok, type Result } from "@loop-kit/common";
import type {
  DockModalId,
  DockPanelId,
  DockSplitId,
  DockWindowId,
} from "./DockIds.js";
import {
  findGroupForPanel,
  findGroupById,
  getPanelById,
  insertPanelIntoGroup,
  removePanelFromLayout,
  updateSplitRatio,
  wrapGroupWithPanelSplit,
} from "./DockLayout.js";
import type { DockDropPlacement } from "./DockNode.js";
import type { DockState } from "./DockState.js";

export type DockCommand =
  | { readonly type: "SelectPanel"; readonly panelId: DockPanelId }
  | { readonly type: "FocusPanel"; readonly panelId: DockPanelId }
  | {
      readonly type: "CommitDrop";
      readonly panelId: DockPanelId;
      readonly placement: DockDropPlacement;
    }
  | { readonly type: "ResizeSplit"; readonly splitId: DockSplitId; readonly ratio: number }
  | { readonly type: "OpenModal"; readonly modalId: DockModalId }
  | { readonly type: "CloseModal"; readonly modalId: DockModalId }
  | { readonly type: "FocusWindow"; readonly windowId: DockWindowId };

export type DockCommandError =
  | { readonly type: "DockPanelNotFound"; readonly panelId: DockPanelId }
  | { readonly type: "DockGroupNotFound"; readonly groupId: DockDropPlacement["groupId"] }
  | { readonly type: "DockSplitNotFound"; readonly splitId: DockSplitId }
  | { readonly type: "DockWindowNotFound"; readonly windowId: DockWindowId }
  | { readonly type: "DockModalNotFound"; readonly modalId: DockModalId }
  | { readonly type: "DockRootMissing" };

export const applyDockCommand = (
  state: DockState,
  command: DockCommand,
): Result<DockState, DockCommandError> => {
  switch (command.type) {
    case "SelectPanel":
      return getPanelById(state.panels, command.panelId)
        ? ok({
            ...state,
            selectedPanelId: command.panelId,
          })
        : err({ type: "DockPanelNotFound", panelId: command.panelId });

    case "FocusPanel":
      return getPanelById(state.panels, command.panelId)
        ? ok({
            ...state,
            focusedPanelId: command.panelId,
            selectedPanelId: command.panelId,
          })
        : err({ type: "DockPanelNotFound", panelId: command.panelId });

    case "CommitDrop": {
      if (!state.layout.root) return err({ type: "DockRootMissing" });
      if (!getPanelById(state.panels, command.panelId)) {
        return err({ type: "DockPanelNotFound", panelId: command.panelId });
      }
      if (!findGroupById(state.layout.root, command.placement.groupId)) {
        return err({ type: "DockGroupNotFound", groupId: command.placement.groupId });
      }

      const sourceGroup = findGroupForPanel(state.layout.root, command.panelId);
      let nextRoot = removePanelFromLayout(state.layout.root, command.panelId);
      if (!nextRoot) nextRoot = sourceGroup ?? state.layout.root;

      nextRoot =
        command.placement.side === "center"
          ? insertPanelIntoGroup(nextRoot, command.placement.groupId, command.panelId)
          : wrapGroupWithPanelSplit(nextRoot, command.placement, command.panelId);

      return ok({
        ...state,
        layout: {
          ...state.layout,
          root: nextRoot,
        },
        selectedPanelId: command.panelId,
        focusedPanelId: command.panelId,
      });
    }

    case "ResizeSplit":
      if (!state.layout.root) return err({ type: "DockRootMissing" });
      return ok({
        ...state,
        layout: {
          ...state.layout,
          root: updateSplitRatio(state.layout.root, command.splitId, command.ratio),
        },
      });

    case "OpenModal": {
      const modal = state.layout.modals.find((value) => value.id === command.modalId);
      if (!modal) return err({ type: "DockModalNotFound", modalId: command.modalId });
      return ok({
        ...state,
        layout: {
          ...state.layout,
          modals: state.layout.modals.map((value) =>
            value.id === command.modalId ? { ...value, open: true } : value,
          ),
        },
      });
    }

    case "CloseModal": {
      const modal = state.layout.modals.find((value) => value.id === command.modalId);
      if (!modal) return err({ type: "DockModalNotFound", modalId: command.modalId });
      return ok({
        ...state,
        layout: {
          ...state.layout,
          modals: state.layout.modals.map((value) =>
            value.id === command.modalId ? { ...value, open: false } : value,
          ),
        },
      });
    }

    case "FocusWindow": {
      const windowNode = state.layout.floatingWindows.find(
        (value) => value.id === command.windowId,
      );
      if (!windowNode) {
        return err({ type: "DockWindowNotFound", windowId: command.windowId });
      }
      return ok({
        ...state,
        layout: {
          ...state.layout,
          floatingWindows: state.layout.floatingWindows.map((value) => ({
            ...value,
            active: value.id === command.windowId,
          })),
        },
      });
    }
  }
};
