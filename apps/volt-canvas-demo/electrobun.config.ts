import type { ElectrobunConfig } from "electrobun";
import packageJson from "./package.json" with { type: "json" };

export default {
  app: {
    identifier: "dev.loopkit.volt-canvas-demo",
    name: "volt-canvas-demo",
    "version": packageJson.version
  },
  build: {
    copy: {
      "src/mainview/index.css": "views/mainview/index.css",
      "src/mainview/index.html": "views/mainview/index.html",
    },
    views: {
      mainview: {
        entrypoint: "src/mainview/index.tsx",
      },
    },
    win: {
      bundleCEF: false,
    }
  },
  "runtime": {
    exitOnLastWindowClosed: false
  },
} satisfies ElectrobunConfig;
