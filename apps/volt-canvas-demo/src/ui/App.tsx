import * as React from "react";
import { createDockStore } from "@loop-kit/dock";
import { DockProvider, DockStage } from "@loop-kit/loom-pack-dock";
import {
  Heading,
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
  initialDockState,
  dockStore,
}: {
  initialDockState: ReturnType<typeof createCanvasDemoDockState>;
  dockStore: ReturnType<typeof createDockStore>;
}) {
  const colorMode = useCanvasDemoSelector((current) => current.appearance.colorMode);
  const themeId = useCanvasDemoSelector((current) => current.appearance.themeId);
  const diagnosticsVisible = useCanvasDemoSelector(
    (current) => current.workspace.diagnostics.browserLogVisible,
  );
  const registry = React.useMemo(() => createPanelRegistry(), []);
  const [lastPointer, setLastPointer] = React.useState("none");

  React.useEffect(() => {
    if (!diagnosticsVisible) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const elements = document
        .elementsFromPoint(event.clientX, event.clientY)
        .slice(0, 5)
        .map((element) => {
          const id = element.id ? `#${element.id}` : "";
          const className =
            typeof element.className === "string" && element.className.trim()
              ? `.${element.className.trim().replace(/\s+/g, ".")}`
              : "";
          return `${element.tagName.toLowerCase()}${id}${className}`;
        });
      const summary = `${event.clientX},${event.clientY} target=${target?.tagName.toLowerCase() ?? "unknown"} top=${elements.join(" > ")}`;
      setLastPointer(summary);
      console.log("[volt-canvas-demo] pointerdown", summary);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [diagnosticsVisible]);

  return (
    <LoomProvider colorMode={colorMode} themes={resolveThemes(themeId)}>
      <Surface style={{ height: "100vh", overflow: "hidden" }}>
        {/* <DockProvider initialState={initialDockState} registry={registry} store={dockStore}>
          <CanvasBindings dockStore={dockStore}>
            <DockStage style={{ minHeight: "100vh" }} />
            <PanelContextMenu dockStore={dockStore} />
            {diagnosticsVisible ? (
              <div
                style={{
                  bottom: 12,
                  left: 12,
                  maxWidth: "38rem",
                  pointerEvents: "none",
                  position: "fixed",
                  zIndex: 1000,
                }}
              >
                <Surface
                  style={{
                    backdropFilter: "blur(10px)",
                    background: "rgba(9, 13, 20, 0.82)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "14px",
                    color: "#f4f7fb",
                    fontFamily: "\"Segoe UI\", system-ui, sans-serif",
                    fontSize: "12px",
                    padding: "0.75rem 0.9rem",
                  }}
                >
                  <strong>Pointer Debug</strong>
                  <div style={{ marginTop: "0.4rem", opacity: 0.86 }}>{lastPointer}</div>
                </Surface>
              </div>
            ) : null}
          </CanvasBindings>
        </DockProvider> */}
      </Surface>
    </LoomProvider>
  );
}

export function App() {
  const initialDockState = React.useMemo(() => createCanvasDemoDockState(), []);
  const dockStore = React.useMemo(
    // `createCanvasDemoDockState()` already returns a normalized DockState.
    () => createDockStore(initialDockState),
    [initialDockState],
  );

  return (
    <CanvasDemoProviders dockStore={dockStore}>
       <AppShell dockStore={dockStore} initialDockState={initialDockState} />
    </CanvasDemoProviders>
  );
}
