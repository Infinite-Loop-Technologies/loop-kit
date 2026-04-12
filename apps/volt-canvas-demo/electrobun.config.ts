import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    identifier: "dev.loopkit.volt-canvas-demo",
    name: "volt-canvas-demo",
    version: "0.0.1",
  },
  build: {
    copy: {
      "src/mainview/index.css": "views/mainview/index.css",
      "src/mainview/index.html": "views/mainview/index.html",
    },
    linux: {
      bundleCEF: false,
    },
    mac: {
      bundleCEF: false,
    },
    views: {
      mainview: {
        entrypoint: "src/mainview/index.tsx",
      },
    },
    win: {
      bundleCEF: false,
    },
  },
} satisfies ElectrobunConfig;
