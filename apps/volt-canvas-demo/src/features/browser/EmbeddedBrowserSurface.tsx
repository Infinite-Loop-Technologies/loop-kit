import * as React from "react";
import { Panel, Stack, Text, Heading } from "@loop-kit/loom-react";
import { useCanvasDemoDeps } from "../../providers/app-deps";

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
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const surfaceRef = React.useRef<ElectrobunWebviewElement | null>(null);

  React.useEffect(() => {
    const host = hostRef.current;
    const surface = surfaceRef.current;
    if (!host || !surface || !isElectrobunContext()) {
      return;
    }

    const result = externalSurfaces.attach({
      host,
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

    return () => {
      externalSurfaces.detach(panelId);
    };
  }, [externalSurfaces, panelId, url]);

  React.useEffect(() => {
    if (!isElectrobunContext()) {
      return;
    }
    externalSurfaces.navigate(panelId, url);
  }, [externalSurfaces, panelId, url]);

  React.useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || !isElectrobunContext()) {
      return;
    }

    // Geometry changes still originate in the renderer. We coalesce them here
    // and ask the service to resync the native surface on the next frame.
    let frame = 0;
    const requestSync = (force = false) => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        externalSurfaces.sync(panelId, force);
      });
    };

    requestSync(true);

    const observer = new ResizeObserver(() => {
      requestSync();
    });
    const handleWindowResize = () => requestSync();
    const handleWindowScroll = () => requestSync();

    observer.observe(host);
    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("scroll", handleWindowScroll, true);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      observer.disconnect();
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("scroll", handleWindowScroll, true);
    };
  }, [externalSurfaces, panelId]);

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
      ref={hostRef}
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
      {React.createElement("electrobun-webview", {
        ref: surfaceRef,
        sandbox: true,
        style: {
          background: "#05080d",
          borderRadius: "17px",
          inset: 0,
          overflow: "hidden",
          position: "absolute",
        },
      })}
    </div>
  );
}
