import * as React from "react";
import { createStateStore, type StateStore, useStoreSelector } from "@loop-kit/state";
import type { ColorMode } from "@loop-kit/loom-core";

export type ThemeId = "aquatic" | "base" | "foundry";

export type BrowserPanelState = {
  draftUrl: string;
  url: string;
};

export type ContextMenuState = {
  panelId: string;
  x: number;
  y: number;
};

export type ViewportState = {
  scale: number;
  x: number;
  y: number;
};

export type CanvasDemoState = {
  browserPanels: Record<string, BrowserPanelState>;
  colorMode: ColorMode;
  commandQuery: string;
  contextMenu: ContextMenuState | null;
  themeId: ThemeId;
  viewport: ViewportState;
};

export type CanvasDemoStore = StateStore<CanvasDemoState>;

export function createCanvasDemoStore() {
  return createStateStore<CanvasDemoState>({
    browserPanels: {
      "panel-browser-docs": {
        draftUrl: "https://dockview.dev/docs/overview/introduction",
        url: "https://dockview.dev/docs/overview/introduction",
      },
      "panel-browser-main": {
        draftUrl: "https://blackboard.sh/electrobun",
        url: "https://blackboard.sh/electrobun",
      },
    },
    colorMode: "dark",
    commandQuery: "",
    contextMenu: null,
    themeId: "foundry",
    viewport: {
      scale: 1,
      x: 260,
      y: 180,
    },
  });
}

const CanvasDemoStoreContext = React.createContext<CanvasDemoStore | null>(null);

export function CanvasDemoStoreProvider({
  children,
  store,
}: {
  children: React.ReactNode;
  store: CanvasDemoStore;
}) {
  return React.createElement(
    CanvasDemoStoreContext.Provider,
    { value: store },
    children,
  );
}

export function useCanvasDemoStore() {
  const store = React.useContext(CanvasDemoStoreContext);
  if (!store) {
    throw new Error("CanvasDemoStoreProvider is required before using canvas demo state.");
  }
  return store;
}

export function useCanvasDemoSelector<TSelected>(
  selector: (state: CanvasDemoState) => TSelected,
) {
  return useStoreSelector(useCanvasDemoStore(), selector);
}
