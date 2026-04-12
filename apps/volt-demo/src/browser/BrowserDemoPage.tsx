import type { BrowserServices } from "./services/createBrowserServices";
import { HttpDemoPanel } from "./HttpDemoPanel";
import { WebSocketDemoPanel } from "./WebSocketDemoPanel";

export interface BrowserDemoPageProps {
  services: BrowserServices;
}

const shareLabel = (enabled: boolean) => (enabled ? "Portless enabled" : "Local only");

export function BrowserDemoPage({ services }: BrowserDemoPageProps) {
  const { config } = services.runtime;

  return (
    <main className="demo-shell">
      <section className="hero">
        <p className="eyebrow">Volt</p>
        <h1>One browser app. Two Bun targets. No guesswork.</h1>
        <p className="hero-copy">
          The fullstack Bun server exposes HTTP routes, and a separate Bun server
          hosts a websocket game surface. The browser reads injected runtime config
          instead of inferring ports.
        </p>
        <div className="meta-row">
          <span className="meta-pill">mode: {config.mode}</span>
          <span className="meta-pill">web: {config.webUrl}</span>
          <span className="meta-pill">game: {config.gameWsUrl}</span>
          <span className="meta-pill">{shareLabel(config.shareEnabled)}</span>
        </div>
      </section>

      <section className="demo-grid">
        <HttpDemoPanel services={services} />
        <WebSocketDemoPanel services={services} />
      </section>
    </main>
  );
}
