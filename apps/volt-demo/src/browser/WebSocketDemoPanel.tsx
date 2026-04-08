import { useEffect, useRef, useState } from "react";
import type { GameClientMessage } from "../shared/demo-contract";
import type { BrowserServices } from "./services/createBrowserServices";

export interface WebSocketDemoPanelProps {
  services: BrowserServices;
}

const formatMessage = (message: unknown) => JSON.stringify(message, null, 2);

export function WebSocketDemoPanel({ services }: WebSocketDemoPanelProps) {
  const { logger, runtime, websocket } = services;
  const connectionRef = useRef<ReturnType<typeof websocket.connect> | null>(null);
  const [draft, setDraft] = useState("hello from volt");
  const [status, setStatus] = useState("connecting");
  const [lastMessage, setLastMessage] = useState("No messages yet.");
  const [log, setLog] = useState<string[]>([]);
  const [sendCount, setSendCount] = useState(0);

  useEffect(() => {
    const append = (line: string) =>
      setLog((current) => [line, ...current].slice(0, 10));

    const connection = websocket.connect({
      onClose: () => {
        setStatus("closed");
        append("socket closed");
      },
      onError: () => {
        setStatus("error");
        append("socket error");
      },
      onMessage: (payload) => {
        setLastMessage(payload);
        append(`recv ${payload}`);
      },
      onOpen: () => {
        setStatus("open");
        append("socket open");
      },
      url: runtime.config.gameWsUrl,
    });

    connectionRef.current = connection;
    return () => {
      connection.close();
      connectionRef.current = null;
    };
  }, [runtime.config.gameWsUrl, websocket]);

  const send = (message: GameClientMessage) => {
    try {
      const payload = JSON.stringify(message);
      connectionRef.current?.send(payload);
      setSendCount((count) => count + 1);
      setLog((current) => [`sent ${payload}`, ...current].slice(0, 10));
    } catch (error) {
      logger.warn("websocket send failed", error);
      setStatus("send-failed");
    }
  };

  const sendChat = () =>
    send({
      sentAt: Date.now(),
      text: draft,
      type: "say",
    });

  const sendPing = () =>
    send({
      sentAt: Date.now(),
      type: "ping",
    });

  return (
    <section className="panel">
      <header className="panel-header">
        <p className="eyebrow">WebSocket / Game Server</p>
        <h2>Dedicated Bun server</h2>
        <div className="status-grid">
          <span>status: {status}</span>
          <span>sends: {sendCount}</span>
        </div>
        <p>
          Local websocket: <code>{runtime.config.gameWsUrl}</code>
        </p>
        <p>
          Public websocket:{" "}
          <code>{runtime.config.gamePublicWsUrl ?? "not shared"}</code>
        </p>
      </header>

      <label className="field">
        <span>Message payload</span>
        <input onChange={(event) => setDraft(event.target.value)} value={draft} />
      </label>

      <div className="button-row">
        <button onClick={sendChat} type="button">
          Send chat event
        </button>
        <button className="secondary" onClick={sendPing} type="button">
          Send ping
        </button>
      </div>

      <section className="card">
        <h3>Last message</h3>
        <pre className="log">{lastMessage}</pre>
      </section>

      <section className="card">
        <h3>Event log</h3>
        <pre className="log">{log.join("\n") || "No events yet."}</pre>
      </section>
    </section>
  );
}
