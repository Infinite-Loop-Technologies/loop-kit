import type { DockStore } from "@loop-kit/dock";
import type { CanvasDemoStore } from "../app/store";
import {
  autoTileFloatingGroups,
  openBrowserPanel,
  setBrowserGroupMode,
  toggleCommandPalette,
  toggleHelpPeek,
} from "../features/dock/layout";

export function deleteFocusedPanel(dock: DockStore) {
  const focusedPanelId = dock.getState().focusedPanelId;
  if (!focusedPanelId) {
    return;
  }
  dock.closePanel(focusedPanelId);
}

export function closeFocusedGroup(dock: DockStore) {
  const activeGroupId = dock.getState().activeGroupId;
  if (!activeGroupId) {
    return;
  }
  dock.closeGroup(activeGroupId);
}

export function runAutoTile(dock: DockStore) {
  autoTileFloatingGroups(dock);
}

export function runToggleCommandPalette(dock: DockStore, store: CanvasDemoStore) {
  toggleCommandPalette(dock);
  store.setState((current) => ({
    ...current,
    commandQuery: "",
  }));
}

export function runToggleHelpPeek(dock: DockStore) {
  toggleHelpPeek(dock);
}

export function runOpenBrowserPanel(dock: DockStore, store: CanvasDemoStore) {
  const panelId = openBrowserPanel(dock);
  store.setState((current) => ({
    ...current,
    browserPanels: {
      ...current.browserPanels,
      [panelId]: {
        draftUrl: "https://blackboard.sh/electrobun",
        url: "https://blackboard.sh/electrobun",
      },
    },
  }));
}

export function setBrowserMode(
  dock: DockStore,
  mode: "queue" | "single" | "stack" | "swap" | "tabs",
) {
  setBrowserGroupMode(dock, mode);
}
