import { serve } from "bun";

import index from "../client/index.html";

const server = serve({
  port: Number(process.env.PORT ?? 3010),
  routes: {
    "/*": index,
    "/api/health": () => Response.json({ ok: true, example: "workbench" }),
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`Workbench running at ${server.url}`);
