import type {
  FullstackEchoResponse,
  FullstackHealthResponse,
  FullstackInfoResponse,
  FullstackTimeResponse,
} from "../shared/demo-contract";
import type { BunFullstackServices } from "volt";
import type { DemoWebRuntimeServices } from "../dev/demoSession";

const json = (payload: unknown) =>
  new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json",
    },
  });

export const startWebApp = (
  services: BunFullstackServices & DemoWebRuntimeServices,
  html: Bun.HTMLBundle,
) => {
  const port = services.demoWeb.port;
  const mode = services.demoWeb.mode;
  const gameWsUrl = services.demoWeb.browserConfig.gameWsUrl;
  const gamePublicWsUrl = services.demoWeb.browserConfig.gamePublicWsUrl;
  const publicUrl = services.demoWeb.browserConfig.webPublicUrl;
  const shareEnabled = services.demoWeb.browserConfig.shareEnabled;

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
          version: "volt-demo-v2",
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

  services.logger.info("web app listening", {
    gamePublicWsUrl,
    gameWsUrl,
    port,
    publicUrl,
    shareEnabled,
    url: server.url.toString(),
  });

  return server;
};
