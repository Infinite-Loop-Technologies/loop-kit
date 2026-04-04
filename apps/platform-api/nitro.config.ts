import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  modules: ["workflow/nitro"],
  serverDir: "src",
  vercel: { entryFormat: "node" },
  routes: {
    "/**": { handler: "./src/index.ts", format: "node" },
  },
});
