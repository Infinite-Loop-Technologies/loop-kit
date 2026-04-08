import type {
  FullstackEchoResponse,
  FullstackHealthResponse,
  FullstackInfoResponse,
  FullstackTimeResponse,
} from "../shared/demo-contract";
import type { BunFullstackServices } from "volt";

const json = (payload: unknown) =>
  new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json",
    },
  });

export const startWebServer = (
  services: BunFullstackServices,
  html: Bun.HTMLBundle,
) => {
  const port = Number(services.env.read("PORT") ?? "6101");
  const mode = (services.env.read("VOLT_MODE") === "production"
    ? "production"
    : "development") as "development" | "production";
  const gameWsUrl = services.env.read("VOLT_GAME_WS_URL") ?? "ws://127.0.0.1:6202/ws";
  const gamePublicWsUrl = services.env.read("VOLT_GAME_PUBLIC_WS_URL") || null;
  const publicUrl = services.env.read("VOLT_WEB_PUBLIC_URL") || null;
  const shareEnabled = services.env.read("VOLT_SHARE_ENABLED") === "1";

  const server = Bun.serve({
    development: mode === "development"
      ? {
          console: false,
          hmr: false,
        }
      : false,
    fetch: async (request) => {
      const url = new URL(request.url);

      if (request.method === "GET" && url.pathname === "/api/health") {
        const body: FullstackHealthResponse = {
          mode,
          status: "ok",
          target: "web",
          time: new Date().toISOString(),
        };
        return json(body);
      }

      if (request.method === "GET" && url.pathname === "/api/info") {
        const body: FullstackInfoResponse = {
          gamePublicWsUrl,
          gameWsUrl,
          publicUrl,
          shareEnabled,
          target: "web",
          version: "volt-demo-v1",
        };
        return json(body);
      }

      if (request.method === "GET" && url.pathname === "/api/time") {
        const now = Date.now();
        const body: FullstackTimeResponse = {
          isoTime: new Date(now).toISOString(),
          target: "web",
          unixTime: now,
        };
        return json(body);
      }

      if (request.method === "POST" && url.pathname === "/api/echo") {
        const payload = await request.json();
        const body: FullstackEchoResponse = {
          body: payload,
          echoedAt: new Date().toISOString(),
          target: "web",
        };
        return json(body);
      }

      return new Response("Not found", { status: 404 });
    },
    port,
    routes: {
      "/": html,
    },
  });

  services.logger.info("web server listening", {
    gamePublicWsUrl,
    gameWsUrl,
    port,
    publicUrl,
    shareEnabled,
    url: server.url.toString(),
  });

  return server;
};
