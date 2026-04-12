import indexHtml from "./dev.html";
import { defineEntrypoint, type BunFullstackServices } from "volt";

export default defineEntrypoint<BunFullstackServices>(import.meta, async (services) => {
  const port = Number(services.env.read("PORT") ?? "3310");
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
      "/": indexHtml,
    },
  });

  services.logger.info("volt-canvas-demo web ui ready", {
    port,
    url: server.url.toString(),
  });
});
