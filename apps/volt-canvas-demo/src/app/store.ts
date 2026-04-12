import {
  createStateSlice,
  createStateStore,
  createStoreContext,
  type StateSlice,
  type StateStore,
} from "@loop-kit/state";
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

export type CanvasDemoAppearanceState = {
  colorMode: ColorMode;
  themeId: ThemeId;
};

export type CanvasDemoBrowserState = {
  panels: Record<string, BrowserPanelState>;
};

export type CanvasDemoWorkspaceState = {
  commandQuery: string;
  contextMenu: ContextMenuState | null;
  diagnostics: {
    browserForcePassthrough: boolean;
    browserLogVisible: boolean;
  };
  viewport: ViewportState;
};

export type CanvasDemoState = {
  appearance: CanvasDemoAppearanceState;
  browser: CanvasDemoBrowserState;
  workspace: CanvasDemoWorkspaceState;
};

export type CanvasDemoStore = StateStore<CanvasDemoState>;

export type CanvasDemoStateSlices = {
  appearance: StateSlice<CanvasDemoState, CanvasDemoAppearanceState>;
  browser: StateSlice<CanvasDemoState, CanvasDemoBrowserState>;
  workspace: StateSlice<CanvasDemoState, CanvasDemoWorkspaceState>;
};

const CanvasDemoStoreContext = createStoreContext<CanvasDemoState>("CanvasDemoStore");

export const CanvasDemoStoreProvider = CanvasDemoStoreContext.Provider;

export const useCanvasDemoStore = CanvasDemoStoreContext.useStore;

export const useCanvasDemoSelector = CanvasDemoStoreContext.useSelector;

export const useCanvasDemoState = CanvasDemoStoreContext.useState;

export function createCanvasDemoStore() {
  return createStateStore<CanvasDemoState>({
    appearance: {
      colorMode: "dark",
      themeId: "foundry",
    },
    browser: {
      panels: {
        "panel-browser-docs": {
          draftUrl: "https://dockview.dev/docs/overview/introduction",
          url: "https://dockview.dev/docs/overview/introduction",
        },
        "panel-browser-main": {
          draftUrl: "https://blackboard.sh/electrobun",
          url: "https://blackboard.sh/electrobun",
        },
      },
    },
    workspace: {
      commandQuery: "",
      contextMenu: null,
      diagnostics: {
        browserForcePassthrough: true,
        browserLogVisible: true,
      },
      viewport: {
        scale: 1,
        x: 260,
        y: 180,
      },
    },
  });
}

export function createCanvasDemoStateSlices(
  store: CanvasDemoStore,
): CanvasDemoStateSlices {
  return {
    appearance: createStateSlice(store, {
      replace: (state, appearance) => ({
        ...state,
        appearance,
      }),
      select: (state) => state.appearance,
    }),
    browser: createStateSlice(store, {
      replace: (state, browser) => ({
        ...state,
        browser,
      }),
      select: (state) => state.browser,
    }),
    workspace: createStateSlice(store, {
      replace: (state, workspace) => ({
        ...state,
        workspace,
      }),
      select: (state) => state.workspace,
    }),
  };
}
