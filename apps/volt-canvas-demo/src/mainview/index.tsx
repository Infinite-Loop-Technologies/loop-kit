import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "../ui/App";

type RendererBoundaryState = {
  error: Error | null;
};

class RendererBoundary extends React.Component<
  React.PropsWithChildren,
  RendererBoundaryState
> {
  state: RendererBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): RendererBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[volt-canvas-demo] renderer error", error, errorInfo);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div
        style={{
          color: "#f7fbff",
          fontFamily: "\"Segoe UI\", system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            background: "rgba(92, 12, 18, 0.78)",
            border: "1px solid rgba(255, 162, 162, 0.42)",
            borderRadius: "16px",
            maxWidth: "56rem",
            padding: "1rem 1.1rem",
          }}
        >
          <strong>Volt Canvas Demo renderer crashed</strong>
          <pre
            style={{
              margin: "0.75rem 0 0",
              overflow: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {this.state.error.stack ?? this.state.error.message}
          </pre>
        </div>
      </div>
    );
  }
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Missing #root element for Volt Canvas Demo.");
}

window.addEventListener("error", (event) => {
  console.error("[volt-canvas-demo] window error", event.error ?? event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("[volt-canvas-demo] unhandled rejection", event.reason);
});

createRoot(container).render(
  <RendererBoundary>
    <App />
  </RendererBoundary>,
);
