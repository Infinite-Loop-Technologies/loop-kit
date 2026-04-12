import type { BunFullstackServices } from "volt";

const json = (payload: unknown) =>
  new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json",
    },
  });

const roadmap = [
  "Ship publishable packages instead of an in-repo private core.",
  "Treat multi-process dev like a first-class framework concern.",
  "Make templates good enough that `bun create volt` feels obvious.",
];

export const startSiteServer = (
  services: BunFullstackServices,
  html: Bun.HTMLBundle,
) => {
  const port = Number(services.env.read("PORT") ?? "6401");
  const mode = (services.env.read("VOLT_MODE") === "production"
    ? "production"
    : "development") as "development" | "production";

  const server = Bun.serve({
    development: mode === "development"
      ? {
          console: false,
          hmr: false,
        }
      : false,
    fetch(request) {
      const url = new URL(request.url);

      if (request.method === "GET" && url.pathname === "/api/roadmap") {
        return json({
          generatedAt: new Date().toISOString(),
          items: roadmap,
          project: "volt",
          status: "active",
        });
      }

      return new Response("Not found", { status: 404 });
    },
    port,
    routes: {
      "/": html,
    },
  });

  services.logger.info("site server listening", {
    port,
    url: server.url.toString(),
  });

  return server;
};
