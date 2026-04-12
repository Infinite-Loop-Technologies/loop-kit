import * as React from "react";
import { createDockState, createDockStore } from "@loop-kit/dock";
import { DockProvider, DockStage } from "@loop-kit/loom-pack-dock";
import {
  LoomProvider,
  Surface,
  type LoomReactThemeLayer,
} from "@loop-kit/loom-react";
import { aquaticReactTheme } from "@loop-kit/loom-theme-aquatic-react";
import { baseReactTheme } from "@loop-kit/loom-theme-base-react";
import { foundryReactTheme } from "@loop-kit/loom-theme-foundry-react";
import {
  useCanvasDemoSelector,
} from "../app/store";
import { CanvasDemoProviders } from "../app/providers";
import { createCanvasDemoDockState } from "../features/dock/layout";
import { CanvasBindings } from "./CanvasBindings";
import { createPanelRegistry, PanelContextMenu } from "./panels";

function resolveThemes(
  themeId: "aquatic" | "base" | "foundry",
): LoomReactThemeLayer[] {
  switch (themeId) {
    case "aquatic":
      return [baseReactTheme, aquaticReactTheme];
    case "foundry":
      return [baseReactTheme, foundryReactTheme];
    default:
      return [baseReactTheme];
  }
}

function AppShell({
  dockStore,
}: {
  dockStore: ReturnType<typeof createDockStore>;
}) {
  const colorMode = useCanvasDemoSelector((current) => current.appearance.colorMode);
  const themeId = useCanvasDemoSelector((current) => current.appearance.themeId);
  const registry = React.useMemo(() => createPanelRegistry(), []);
  const initialState = React.useMemo(() => createCanvasDemoDockState(), []);

  return (
    <LoomProvider colorMode={colorMode} themes={resolveThemes(themeId)}>
      <Surface style={{ height: "100vh", overflow: "hidden" }}>
        <DockProvider initialState={initialState} registry={registry} store={dockStore}>
          <CanvasBindings dockStore={dockStore}>
            <DockStage style={{ minHeight: "100vh" }} />
            <PanelContextMenu dockStore={dockStore} />
          </CanvasBindings>
        </DockProvider>
      </Surface>
    </LoomProvider>
  );
}

export function App() {
  const initialDockState = React.useMemo(() => createCanvasDemoDockState(), []);
  const dockStore = React.useMemo(
    () => createDockStore(createDockState(initialDockState)),
    [initialDockState],
  );

  return (
    <CanvasDemoProviders dockStore={dockStore}>
      <AppShell dockStore={dockStore} />
    </CanvasDemoProviders>
  );
}
