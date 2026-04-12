import * as React from "react";
import {
  createCanvasDemoStateSlices,
  type CanvasDemoStateSlices,
  type CanvasDemoStore,
} from "../app/store";
import {
  createElectrobunWebviewSurfaceService,
} from "../services/electrobun-webview-surface";
import type { ExternalSurfaceService } from "../services/external-surface";

export type CanvasDemoAppDeps = {
  externalSurfaces: ExternalSurfaceService;
  state: CanvasDemoStateSlices;
};

const CanvasDemoDepsContext = React.createContext<CanvasDemoAppDeps | null>(null);

export function createCanvasDemoAppDeps(store: CanvasDemoStore): CanvasDemoAppDeps {
  return {
    externalSurfaces: createElectrobunWebviewSurfaceService(),
    state: createCanvasDemoStateSlices(store),
  };
}

export function CanvasDemoDepsProvider({
  children,
  deps,
}: {
  children: React.ReactNode;
  deps: CanvasDemoAppDeps;
}) {
  return React.createElement(CanvasDemoDepsContext.Provider, { value: deps }, children);
}

export function useCanvasDemoDeps() {
  const deps = React.useContext(CanvasDemoDepsContext);
  if (!deps) {
    throw new Error("CanvasDemoDepsProvider is required before using app dependencies.");
  }
  return deps;
}
