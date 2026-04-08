import {
  forgeCapabilityPolicies,
  forgeControlPlanes,
  forgeLocalServices,
} from "../lib/forge-stack";
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
  const port = Number(services.env.read("PORT") ?? "3000");
  const mode =
    services.env.read("VOLT_MODE") === "production" ? "production" : "development";

  const server = Bun.serve({
    development: mode === "development"
      ? {
          console: false,
          hmr: false,
        }
      : false,
    fetch: async (request) => {
      const url = new URL(request.url);

      if (request.method === "GET" && url.pathname === "/api/blueprint") {
        return json({
          controlPlanes: forgeControlPlanes,
          localServices: forgeLocalServices,
          policies: forgeCapabilityPolicies,
        });
      }

      if (request.method === "GET" && url.pathname === "/forge-icon.svg") {
        return new Response(Bun.file(services.paths.fromRoot("public", "forge-icon.svg")));
      }

      if (request.method === "GET" && url.pathname === "/manifest.webmanifest") {
        return json({
          background_color: "#111318",
          description:
            "Policy-aware Forge prototype built on Volt, Jazz, and an OCI-first local lab.",
          display: "standalone",
          icons: [
            {
              purpose: "any",
              sizes: "any",
              src: "/forge-icon.svg",
              type: "image/svg+xml",
            },
          ],
          name: "Forge Prototype",
          short_name: "Forge",
          start_url: "/",
          theme_color: "#111318",
        });
      }

      return new Response("Not found", { status: 404 });
    },
    port,
    routes: {
      "/": html,
    },
  });

  services.logger.info("forge server listening", {
    mode,
    port,
    url: server.url.toString(),
  });

  return server;
};
