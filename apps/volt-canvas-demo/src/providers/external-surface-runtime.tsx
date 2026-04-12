import * as React from "react";
import type { DockState, DockStore } from "@loop-kit/dock";
import { useCanvasDemoSelector } from "../app/store";
import { layerIds } from "../features/dock/schema";
import {
  listBrowserPanelIds,
  listVisibleBrowserPanelIds,
} from "../features/browser/surface-policy";
import { useCanvasDemoDeps } from "./app-deps";

function useDockState(store: DockStore) {
  return React.useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  );
}

function hasModalOverlay(state: DockState) {
  return (
    (state.layers[layerIds.command]?.groupIds.length ?? 0) > 0
  );
}

/**
 * Keeps native overlay surfaces in sync with Dock state. This lives above leaf
 * UI so browser panels do not need to hand-roll visibility, passthrough, or
 * modal-overlay policy each time they render.
 */
export function ExternalSurfaceRuntime({
  dockStore,
}: {
  dockStore: DockStore;
}) {
  const dockState = useDockState(dockStore);
  const contextMenu = useCanvasDemoSelector((state) => state.workspace.contextMenu);
  const { externalSurfaces } = useCanvasDemoDeps();

  React.useLayoutEffect(() => {
    const allBrowserPanels = listBrowserPanelIds(dockState);
    const visibleBrowserPanels = listVisibleBrowserPanelIds(dockState);
    const overlaysWantPassthrough = contextMenu != null || hasModalOverlay(dockState);

    for (const panelId of allBrowserPanels) {
      externalSurfaces.setPresentation(panelId, {
        active: visibleBrowserPanels.has(panelId),
        hidden: !visibleBrowserPanels.has(panelId),
        passthrough: overlaysWantPassthrough,
      });
    }

    externalSurfaces.syncAll();
  }, [contextMenu, dockState, externalSurfaces]);

  return null;
}
