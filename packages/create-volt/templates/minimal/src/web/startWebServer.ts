import type { BunFullstackServices } from "volt";

export const startWebServer = (
  services: BunFullstackServices,
  html: Bun.HTMLBundle,
) => {
  const port = Number(services.env.read("PORT") ?? "3000");

  const server = Bun.serve({
    fetch() {
      return new Response("Not found", { status: 404 });
    },
    port,
    routes: {
      "/": html,
    },
  });

  services.logger.info("template server listening", {
    port,
    url: server.url.toString(),
  });

  return server;
};
