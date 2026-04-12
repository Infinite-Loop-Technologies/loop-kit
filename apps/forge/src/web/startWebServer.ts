import {
  forgeCapabilityPolicies,
  forgeControlPlanes,
  forgeLocalServices,
} from "../lib/forge-stack";
import { id, init as initAdmin } from "@instantdb/admin";
import type { BunFullstackServices } from "volt";
import schema from "../../instant.schema";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "workspace";

const json = (payload: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(payload, null, 2), {
    ...init,
    headers: {
      "content-type": "application/json",
    },
  });

export const startWebServer = (
  services: BunFullstackServices,
  html: Bun.HTMLBundle,
) => {
  const port = Number(services.env.read("PORT") ?? "3000");
  const instantAppId = services.env.read("INSTANT_APP_ID") ?? null;
  const instantAdminToken = services.env.read("INSTANT_ADMIN_TOKEN") ?? null;
  const mode =
    services.env.read("VOLT_MODE") === "production" ? "production" : "development";
  const adminDb =
    instantAppId && instantAdminToken
      ? initAdmin({
          adminToken: instantAdminToken,
          appId: instantAppId,
          schema,
        })
      : null;
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

      if (request.method === "GET" && url.pathname === "/api/config") {
        return json({
          appId: instantAppId,
          authMode: "magic-code",
          configured: Boolean(instantAppId && instantAdminToken),
        });
      }

      if (request.method === "POST" && url.pathname === "/api/workspaces/bootstrap") {
        if (!adminDb) {
          return json({
            error: "Instant admin credentials are missing on the Forge server.",
          }, { status: 503 });
        }

        const token = request.headers.get("token");
        if (!token) {
          return json({ error: "Missing Instant auth token." }, { status: 401 });
        }

        const user = await adminDb.auth.verifyToken(token);
        if (!user) {
          return json({ error: "Invalid Instant auth token." }, { status: 401 });
        }

        const userDb = adminDb.asUser({ token });
        const query = {
          workspaces: {
            nodes: {
              $: {
                order: {
                  updatedAt: "desc" as const,
                },
              },
            },
          },
        };
        const existing = await userDb.query(query);

        if (!existing.workspaces.length) {
          const workspaceId = id();
          const slugBase = slugify(user.email?.split("@")[0] ?? "forge");
          const timestamp = Date.now();

          await adminDb.transact([
            adminDb.tx.workspaces[workspaceId]
              .create({
                colorMode: "dark",
                commandPaletteDefaultOpen: true,
                createdAt: timestamp,
                description: "Default Forge workspace",
                inspectorDock: "right",
                name: "Forge Workspace",
                sidePeekDefaultOpen: true,
                slug: `${slugBase}-${workspaceId.slice(0, 6)}`,
              })
              .link({ owner: user.id }),
            adminDb.tx.nodes[id()]
              .create({
                icon: "fileText",
                kind: "document",
                lane: "favorites",
                pinned: true,
                subtitle: "Default outline surface",
                title: "Forge Redesign",
                updatedAt: timestamp,
                view: "outline",
              })
              .link({ workspace: workspaceId }),
            adminDb.tx.nodes[id()]
              .create({
                icon: "github",
                kind: "issue",
                lane: "workspace",
                pinned: false,
                subtitle: "Live issue sync surface",
                title: "Connected Issue",
                updatedAt: timestamp - 1,
                view: "sync",
              })
              .link({ workspace: workspaceId }),
            adminDb.tx.nodes[id()]
              .create({
                icon: "globe",
                kind: "browser",
                lane: "workspace",
                pinned: true,
                subtitle: "Reference browser",
                title: "Design Reference",
                updatedAt: timestamp - 2,
                view: "browser",
              })
              .link({ workspace: workspaceId }),
          ]);
        }

        const hydrated = await userDb.query(query);
        return json({
          ok: true,
          workspaces: hydrated.workspaces,
        });
      }

      if (request.method === "GET" && url.pathname === "/forge-icon.svg") {
        return new Response(Bun.file(services.paths.fromRoot("public", "forge-icon.svg")));
      }

      if (
        request.method === "GET" &&
        (url.pathname === "/manifest.webmanifest" || url.pathname === "/manifest.json")
      ) {
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

      if (request.method === "GET" && url.pathname === "/favicon.ico") {
        return new Response(Bun.file(services.paths.fromRoot("public", "forge-icon.svg")), {
          headers: {
            "content-type": "image/svg+xml",
          },
        });
      }

      return new Response("Not found", { status: 404 });
    },
    port,
    routes: {
      "/": html,
      "/workspaces/*": html,
    },
  });

  services.logger.info("forge server listening", {
    mode,
    port,
    url: server.url.toString(),
  });

  return server;
};
