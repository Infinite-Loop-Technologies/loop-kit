import type { DockStore } from "@loop-kit/dock";
import type { CanvasDemoAppDeps } from "../providers/app-deps";
import type { ViewportState } from "../app/store";
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

export function runToggleCommandPalette(dock: DockStore, deps: CanvasDemoAppDeps) {
  toggleCommandPalette(dock);
  deps.state.workspace.setState(
    (current) => ({
      ...current,
      commandQuery: "",
    }),
    { history: false },
  );
}

export function runToggleHelpPeek(dock: DockStore) {
  toggleHelpPeek(dock);
}

export function runOpenBrowserPanel(dock: DockStore, deps: CanvasDemoAppDeps) {
  const panelId = openBrowserPanel(dock);
  deps.state.browser.setState((current) => ({
    ...current,
    panels: {
      ...current.panels,
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

export function setCommandQuery(deps: CanvasDemoAppDeps, commandQuery: string) {
  deps.state.workspace.setState(
    (current) => ({
      ...current,
      commandQuery,
    }),
    { history: false },
  );
}

export function openPanelContextMenu(
  deps: CanvasDemoAppDeps,
  panelId: string,
  x: number,
  y: number,
) {
  deps.state.workspace.setState(
    (current) => ({
      ...current,
      contextMenu: {
        panelId,
        x,
        y,
      },
    }),
    { history: false },
  );
}

export function closePanelContextMenu(deps: CanvasDemoAppDeps) {
  deps.state.workspace.setState(
    (current) => ({
      ...current,
      contextMenu: null,
    }),
    { history: false },
  );
}

export function setViewport(
  deps: CanvasDemoAppDeps,
  update: (viewport: ViewportState) => ViewportState,
  history = false,
) {
  deps.state.workspace.setState(
    (current) => ({
      ...current,
      viewport: update(current.viewport),
    }),
    { history },
  );
}

export function resetViewport(deps: CanvasDemoAppDeps) {
  deps.state.workspace.setState(
    (current) => ({
      ...current,
      viewport: {
        scale: 1,
        x: 260,
        y: 180,
      },
    }),
    { history: false },
  );
}

export function toggleBrowserPassthroughDebug(deps: CanvasDemoAppDeps) {
  deps.state.workspace.setState(
    (current) => ({
      ...current,
      diagnostics: {
        ...current.diagnostics,
        browserForcePassthrough: !current.diagnostics.browserForcePassthrough,
      },
    }),
    { history: false },
  );
}

export function toggleBrowserDiagnostics(deps: CanvasDemoAppDeps) {
  deps.state.workspace.setState(
    (current) => ({
      ...current,
      diagnostics: {
        ...current.diagnostics,
        browserLogVisible: !current.diagnostics.browserLogVisible,
      },
    }),
    { history: false },
  );
}

export function cycleTheme(deps: CanvasDemoAppDeps) {
  deps.state.appearance.setState((current) => ({
    ...current,
    themeId:
      current.themeId === "base"
        ? "aquatic"
        : current.themeId === "aquatic"
          ? "foundry"
          : "base",
  }));
}

export function toggleColorMode(deps: CanvasDemoAppDeps) {
  deps.state.appearance.setState((current) => ({
    ...current,
    colorMode: current.colorMode === "dark" ? "light" : "dark",
  }));
}

export function setBrowserDraftUrl(
  deps: CanvasDemoAppDeps,
  panelId: string,
  draftUrl: string,
) {
  deps.state.browser.setState(
    (current) => ({
      ...current,
      panels: {
        ...current.panels,
        [panelId]: {
          draftUrl,
          url: current.panels[panelId]?.url ?? draftUrl,
        },
      },
    }),
    { history: false },
  );
}

export function navigateBrowserPanel(
  deps: CanvasDemoAppDeps,
  panelId: string,
  nextUrl: string,
) {
  deps.state.browser.setState((current) => ({
    ...current,
    panels: {
      ...current.panels,
      [panelId]: {
        draftUrl: nextUrl,
        url: nextUrl,
      },
    },
  }));
}

export function undoBrowserState(deps: CanvasDemoAppDeps) {
  deps.state.browser.undo();
}

export function redoBrowserState(deps: CanvasDemoAppDeps) {
  deps.state.browser.redo();
}

export function setBrowserDragging(
  deps: CanvasDemoAppDeps,
  panelIds: readonly string[],
  dragging: boolean,
) {
  for (const panelId of panelIds) {
    deps.externalSurfaces.setInteractionState(panelId, { dragging });
  }
}
