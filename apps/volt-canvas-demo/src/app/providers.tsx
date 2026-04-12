import * as React from "react";
import { type DockStore } from "@loop-kit/dock";
import {
  CanvasDemoStoreProvider,
  createCanvasDemoStore,
} from "./store";
import {
  CanvasDemoDepsProvider,
  createCanvasDemoAppDeps,
} from "../providers/app-deps";
import { ExternalSurfaceRuntime } from "../providers/external-surface-runtime";

export function CanvasDemoProviders({
  children,
  dockStore,
}: {
  children: React.ReactNode;
  dockStore: DockStore;
}) {
  const store = React.useMemo(() => createCanvasDemoStore(), []);
  const deps = React.useMemo(() => createCanvasDemoAppDeps(store), [store]);

  return (
    <CanvasDemoStoreProvider store={store}>
      <CanvasDemoDepsProvider deps={deps}>
        <ExternalSurfaceRuntime dockStore={dockStore} />
        {children}
      </CanvasDemoDepsProvider>
    </CanvasDemoStoreProvider>
  );
}
