import { useState } from "react";
import type {
  FullstackEchoResponse,
  FullstackHealthResponse,
  FullstackInfoResponse,
  FullstackTimeResponse,
} from "../shared/demo-contract";
import type { BrowserServices } from "./services/createBrowserServices";

export interface HttpDemoPanelProps {
  services: BrowserServices;
}

const pretty = (value: unknown) => JSON.stringify(value, null, 2);

export function HttpDemoPanel({ services }: HttpDemoPanelProps) {
  const { browser, http, logger, runtime } = services;
  const [echoBody, setEchoBody] = useState('{"message":"hello from the browser"}');
  const [response, setResponse] = useState<string>("No request yet.");
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      const result = await action();
      setResponse(pretty(result));
    } catch (error) {
      logger.warn("http demo failed", error);
      setResponse(String(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <header className="panel-header">
        <p className="eyebrow">HTTP / Fullstack</p>
        <h2>Browser-to-Bun routes</h2>
        <p>
          Local origin: <code>{runtime.config.webUrl}</code>
        </p>
        <p>
          Public origin:{" "}
          <code>{runtime.config.webPublicUrl ?? "not shared"}</code>
        </p>
      </header>

      <div className="button-row">
        <button disabled={busy} onClick={() => run(() => http.getJson<FullstackHealthResponse>("/api/health"))} type="button">
          GET health
        </button>
        <button disabled={busy} onClick={() => run(() => http.getJson<FullstackInfoResponse>("/api/info"))} type="button">
          GET info
        </button>
        <button disabled={busy} onClick={() => run(() => http.getJson<FullstackTimeResponse>("/api/time"))} type="button">
          GET time
        </button>
        <button className="secondary" onClick={() => browser.open(runtime.config.webUrl)} type="button">
          Open origin
        </button>
      </div>

      <label className="field">
        <span>Echo request body</span>
        <textarea
          onChange={(event) => setEchoBody(event.target.value)}
          spellCheck={false}
          value={echoBody}
        />
      </label>

      <button
        disabled={busy}
        onClick={() =>
          run(() =>
            http.postJson<unknown, FullstackEchoResponse>("/api/echo", JSON.parse(echoBody)),
          )
        }
        type="button"
      >
        POST echo
      </button>

      <pre className="log">{response}</pre>
    </section>
  );
}
