import * as React from "react";
import { Panel, Stack, Text, Heading } from "@loop-kit/loom-react";
import { useCanvasDemoDeps } from "../../providers/app-deps";
import { useCanvasDemoSelector } from "../../app/store";

function isElectrobunContext() {
  return typeof window !== "undefined" && typeof window.__electrobunWindowId === "number";
}

/**
 * The native browser surface is not normal DOM. This host component owns the
 * DOM anchor and asks the surface service to attach/sync against it; the
 * service owns passthrough, visibility, and other host-specific policy.
 */
export function EmbeddedBrowserSurface({
  panelId,
  url,
}: {
  panelId: string;
  url: string;
}) {
  const { externalSurfaces } = useCanvasDemoDeps();
  const diagnosticsVisible = useCanvasDemoSelector(
    (state) => state.workspace.diagnostics.browserLogVisible,
  );
  const forcePassthrough = useCanvasDemoSelector(
    (state) => state.workspace.diagnostics.browserForcePassthrough,
  );
  const surfaceRef = React.useRef<ElectrobunWebviewElement | null>(null);
  const [status, setStatus] = React.useState<"idle" | "ready" | "timeout">("idle");
  const [rectText, setRectText] = React.useState("pending");
  const [lastEvent, setLastEvent] = React.useState("attach:pending");

  React.useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || !isElectrobunContext()) {
      return;
    }

    const result = externalSurfaces.attach({
      host: surface,
      spec: {
        id: panelId,
        kind: "browser",
        panelId,
        url,
      },
      surface,
    });

    if (!result.ok && result.error.code !== "already-attached") {
      throw new Error(result.error.message);
    }
    console.log("[volt-canvas-demo] browser attach", { panelId, url });
    setLastEvent("attach:ok");

    let timeout = window.setTimeout(() => {
      setStatus((current) => {
        if (current === "ready") {
          return current;
        }
        return "timeout";
      });
      setLastEvent("timeout");
      console.warn("[volt-canvas-demo] browser timeout", { panelId, url });
    }, 2500);

    const handleReady = () => {
      setStatus("ready");
      setLastEvent("dom-ready");
      console.log("[volt-canvas-demo] browser dom-ready", { panelId, url });
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = 0;
      }
    };

    const handleNavigate = (event: CustomEvent<{ url?: string }>) => {
      const nextUrl = event.detail?.url ?? "unknown";
      setLastEvent(`did-navigate:${nextUrl}`);
      console.log("[volt-canvas-demo] browser did-navigate", { panelId, url: nextUrl });
    };

    surface.on?.("dom-ready", handleReady);
    surface.on?.("did-navigate", handleNavigate);

    const updateRect = () => {
      const rect = surface.getBoundingClientRect();
      const text = `${Math.round(rect.left)},${Math.round(rect.top)} ${Math.round(rect.width)}x${Math.round(rect.height)}`;
      setRectText(text);
    };

    updateRect();
    const rectInterval = window.setInterval(updateRect, 500);

    return () => {
      if (timeout) {
        window.clearTimeout(timeout);
      }
      window.clearInterval(rectInterval);
      surface.off?.("dom-ready", handleReady);
      surface.off?.("did-navigate", handleNavigate);
      externalSurfaces.detach(panelId);
    };
  }, [externalSurfaces, panelId, url]);

  React.useEffect(() => {
    if (!isElectrobunContext()) {
      return;
    }
    externalSurfaces.navigate(panelId, url);
  }, [externalSurfaces, panelId, url]);

  if (!isElectrobunContext()) {
    return (
      <Panel emphasis="subtle">
        <Stack gap="2">
          <Heading level={3} size="sm">
            Electrobun-only panel
          </Heading>
          <Text tone="muted">
            This embedded browser uses the custom <code>electrobun-webview</code> element.
            Run the app through the Electrobun desktop target to see the real browser surface.
          </Text>
        </Stack>
      </Panel>
    );
  }

  return (
    <div
      style={{
        background: "#05080d",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "18px",
        display: "flex",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        padding: "1px",
        position: "relative",
      }}
    >
      {status === "timeout" ? (
        <div
          style={{
            inset: 0,
            padding: "1rem",
            pointerEvents: "none",
            position: "absolute",
            zIndex: 1,
          }}
        >
          <Panel emphasis="strong">
            <Stack gap="2">
              <Heading level={3} size="sm">
                Browser Surface Unavailable
              </Heading>
              <Text tone="muted">
                The Electrobun browser surface did not signal <code>dom-ready</code>.
                This usually means the native webview failed to initialize or is out of
                sync with its anchor.
              </Text>
              <Text tone="muted">URL: {url}</Text>
            </Stack>
          </Panel>
        </div>
      ) : null}
      {diagnosticsVisible ? (
        <div
          style={{
            bottom: 12,
            left: 12,
            maxWidth: "22rem",
            pointerEvents: "none",
            position: "absolute",
            zIndex: 1,
          }}
        >
          <Panel emphasis="subtle">
            <Stack gap="1">
              <Text size="sm" tone="muted">
                panel: {panelId}
              </Text>
              <Text size="sm" tone="muted">
                status: {status}
              </Text>
              <Text size="sm" tone="muted">
                event: {lastEvent}
              </Text>
              <Text size="sm" tone="muted">
                rect: {rectText}
              </Text>
              <Text size="sm" tone="muted">
                passthrough-debug: {forcePassthrough ? "on" : "off"}
              </Text>
            </Stack>
          </Panel>
        </div>
      ) : null}
      {React.createElement("electrobun-webview", {
        ref: surfaceRef,
        sandbox: true,
        src: url,
        style: {
          background: "#05080d",
          borderRadius: "17px",
          display: "block",
          flex: 1,
          height: "100%",
          opacity: status === "timeout" ? 0 : 1,
          minHeight: 0,
          overflow: "hidden",
          width: "100%",
        },
      })}
    </div>
  );
}
