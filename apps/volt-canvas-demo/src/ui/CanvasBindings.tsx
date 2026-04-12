import * as React from "react";
import type { DockStore } from "@loop-kit/dock";
import {
  ScopedRegion,
  useRegisterActionHandler,
  useScopedShortcutMap,
} from "@loop-kit/interaction-react";
import { canvasActionIds } from "../actions/canvas-actions";
import { useCanvasDemoDeps } from "../providers/app-deps";
import {
  closePanelContextMenu,
  closeFocusedGroup,
  deleteFocusedPanel,
  redoBrowserState,
  resetViewport,
  runAutoTile,
  runOpenBrowserPanel,
  runToggleCommandPalette,
  runToggleHelpPeek,
  setBrowserMode,
  toggleBrowserDiagnostics,
  toggleBrowserPassthroughDebug,
  undoBrowserState,
} from "../commands/canvas-commands";

export function CanvasBindings({
  children,
  dockStore,
}: {
  children: React.ReactNode;
  dockStore: DockStore;
}) {
  const deps = useCanvasDemoDeps();

  useScopedShortcutMap([
    { actionId: canvasActionIds.toggleCommandPalette, gesture: "Mod+K" },
    { actionId: canvasActionIds.toggleHelpPeek, gesture: "Mod+/" },
    { actionId: canvasActionIds.autoTileWindows, gesture: "Mod+Shift+T" },
    { actionId: canvasActionIds.openBrowserPanel, gesture: "Mod+Shift+B" },
    { actionId: canvasActionIds.toggleBrowserPassthrough, gesture: "Mod+Shift+P" },
    { actionId: canvasActionIds.toggleBrowserDiagnostics, gesture: "Mod+Shift+D" },
    { actionId: canvasActionIds.browserUndo, gesture: "Mod+Z" },
    { actionId: canvasActionIds.browserRedo, gesture: "Mod+Shift+Z" },
    { actionId: canvasActionIds.deleteFocusedPanel, gesture: "Delete" },
  ]);

  useRegisterActionHandler(canvasActionIds.toggleCommandPalette, () => {
    closePanelContextMenu(deps);
    runToggleCommandPalette(dockStore, deps);
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.toggleHelpPeek, () => {
    runToggleHelpPeek(dockStore);
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.autoTileWindows, () => {
    runAutoTile(dockStore);
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.openBrowserPanel, () => {
    runOpenBrowserPanel(dockStore, deps);
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.deleteFocusedPanel, () => {
    deleteFocusedPanel(dockStore);
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.closeFocusedGroup, () => {
    closeFocusedGroup(dockStore);
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.setBrowserModeTabs, () => {
    setBrowserMode(dockStore, "tabs");
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.setBrowserModeSingle, () => {
    setBrowserMode(dockStore, "single");
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.setBrowserModeStack, () => {
    setBrowserMode(dockStore, "stack");
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.setBrowserModeSwap, () => {
    setBrowserMode(dockStore, "swap");
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.setBrowserModeQueue, () => {
    setBrowserMode(dockStore, "queue");
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.resetViewport, () => {
    resetViewport(deps);
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.browserUndo, () => {
    undoBrowserState(deps);
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.browserRedo, () => {
    redoBrowserState(deps);
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.toggleBrowserPassthrough, () => {
    toggleBrowserPassthroughDebug(deps);
    return { handled: true };
  });
  useRegisterActionHandler(canvasActionIds.toggleBrowserDiagnostics, () => {
    toggleBrowserDiagnostics(deps);
    return { handled: true };
  });

  return (
    <ScopedRegion
      scopeId="canvas-demo-root"
      scopeKind="canvas-demo-root"
      style={{ display: "contents" }}
    >
      {children}
    </ScopedRegion>
  );
}
