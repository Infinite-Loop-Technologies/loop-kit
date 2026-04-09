import type { BunServerServices } from "volt";
import type { DemoGameRuntimeServices } from "../dev/demoSession";
import type { GameClientMessage, GameServerMessage } from "../shared/demo-contract";

interface ClientData {
  id: string;
}

const toJson = (payload: unknown) => JSON.stringify(payload);

const healthResponse = (clients: number) =>
  new Response(
    JSON.stringify(
      {
        clients,
        status: "ok",
        target: "game",
        time: new Date().toISOString(),
      },
      null,
      2,
    ),
    {
      headers: {
        "content-type": "application/json",
      },
    },
  );

export const startGameServer = (services: BunServerServices & DemoGameRuntimeServices) => {
  const port = services.demoGame.port;
  const sockets = new Set<Bun.ServerWebSocket<ClientData>>();

  const broadcast = (message: GameServerMessage) => {
    const payload = toJson(message);
    for (const socket of sockets) {
      socket.send(payload);
    }
  };

  const heartbeat = setInterval(() => {
    broadcast({
      body: `clients:${sockets.size}`,
      sentAt: Date.now(),
      type: "heartbeat",
    });
  }, 5_000);

  const server = Bun.serve<ClientData>({
    fetch(request, serverRef) {
      const url = new URL(request.url);

      if (url.pathname === "/health") {
        return healthResponse(sockets.size);
      }

      if (url.pathname === "/ws") {
        const upgraded = serverRef.upgrade(request, {
          data: {
            id: crypto.randomUUID().slice(0, 8),
          },
        });

        if (upgraded) {
          return undefined;
        }
      }

      return new Response("Not found", { status: 404 });
    },
    port,
    websocket: {
      close(socket) {
        sockets.delete(socket);
      },
      message(socket, rawMessage) {
        try {
          const payload = JSON.parse(String(rawMessage)) as GameClientMessage;

          if (payload.type === "ping") {
            socket.send(
              toJson({
                sentAt: Date.now(),
                type: "pong",
              } satisfies GameServerMessage),
            );
            return;
          }

          if (payload.type === "say") {
            broadcast({
              body: payload.text ?? "",
              sentAt: Date.now(),
              type: "echo",
            });
            return;
          }
        } catch (error) {
          services.logger.warn("invalid game payload", {
            error: String(error),
          });
        }
      },
      open(socket) {
        sockets.add(socket);
        socket.send(
          toJson({
            body: `connected:${socket.data?.id ?? "unknown"}`,
            sentAt: Date.now(),
            type: "welcome",
          } satisfies GameServerMessage),
        );
      },
    },
  });

  services.logger.info("game server listening", {
    health: `http://127.0.0.1:${port}/health`,
    websocket: `ws://127.0.0.1:${port}/ws`,
  });

  const dispose = () => clearInterval(heartbeat);
  process.on("exit", dispose);
  return server;
};
