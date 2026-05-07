import { serve } from "bun"

import index from "../client/index.html"

const server = serve({
  port: Number(process.env.PORT ?? 3011),
  routes: {
    "/*": index,
    "/api/health": () => Response.json({ ok: true, example: "simple" }),
  },
  development: {
    hmr: true,
    console: true,
  },
})

console.log(`Simple example running at ${server.url}`)
