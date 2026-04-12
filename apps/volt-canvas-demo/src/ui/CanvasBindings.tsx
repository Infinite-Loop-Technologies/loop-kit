import * as React from "react";
import type { DockStore } from "@loop-kit/dock";
import {
  ScopedRegion,
  useRegisterActionHandler,
  useScopedShortcutMap,
} from "@loop-kit/interaction-react";
import { canvasActionIds } from "../actions/canvas-actions";
import { useCanvasDemoStore } from "../app/store";
import {
  closeFocusedGroup,
  deleteFocusedPanel,
  runAutoTile,
  runOpenBrowserPanel,
  runToggleCommandPalette,
  runToggleHelpPeek,
  setBrowserMode,
} from "../commands/canvas-commands";

export function CanvasBindings({
  children,
  dockStore,
}: {
  children: React.ReactNode;
  dockStore: DockStore;
}) {
  const store = useCanvasDemoStore();

  useScopedShortcutMap([
    { actionId: canvasActionIds.toggleCommandPalette, gesture: "Mod+K" },
    { actionId: canvasActionIds.toggleHelpPeek, gesture: "Mod+/" },
    { actionId: canvasActionIds.autoTileWindows, gesture: "Mod+Shift+T" },
    { actionId: canvasActionIds.openBrowserPanel, gesture: "Mod+Shift+B" },
    { actionId: canvasActionIds.deleteFocusedPanel, gesture: "Delete" },
  ]);

  useRegisterActionHandler(canvasActionIds.toggleCommandPalette, () => {
    runToggleCommandPalette(dockStore, store);
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
    runOpenBrowserPanel(dockStore, store);
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
    store.setState((current) => ({
      ...current,
      viewport: {
        scale: 1,
        x: 260,
        y: 180,
      },
    }));
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
