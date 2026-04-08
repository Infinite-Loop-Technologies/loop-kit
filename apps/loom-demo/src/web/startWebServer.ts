import type { BunFullstackServices } from "volt";

export const startWebServer = (
  services: BunFullstackServices,
  html: Bun.HTMLBundle,
) => {
  const port = Number(services.env.read("PORT") ?? "3500");
  const mode =
    services.env.read("VOLT_MODE") === "production" ? "production" : "development";

  const server = Bun.serve({
    development: mode === "development"
      ? {
          console: false,
          hmr: false,
        }
      : false,
    fetch() {
      return new Response("Not found", { status: 404 });
    },
    port,
    routes: {
      "/": html,
    },
  });

  services.logger.info("loom demo server listening", {
    port,
    url: server.url.toString(),
  });

  return server;
};
