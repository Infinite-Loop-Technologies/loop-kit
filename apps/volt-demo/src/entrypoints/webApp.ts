import indexHtml from "../index.html";
import type { BunFullstackServices } from "volt";
import { ClockService } from "volt/builtins";
import { defineEntrypointSpec, implementEntrypoint } from "volt/entrypoint";
import type { DemoWebRuntimeServices } from "../dev/demoSession";
import { BrowserRuntime } from "../contracts/runtimeSession";
import { loadProjectEnv } from "../shared/loadProjectEnv";
import { startWebApp } from "../runtime/webApp";

export const WebAppSpec = defineEntrypointSpec("WebApp", {
  provides: {
    browser: BrowserRuntime.value,
  },
  requires: {
    clock: ClockService,
  },
});

export const WebApp = implementEntrypoint<
  typeof WebAppSpec,
  BunFullstackServices & DemoWebRuntimeServices,
  void
>(WebAppSpec, async (services) => {
  await loadProjectEnv(import.meta.dir);
  startWebApp(services, indexHtml);
}, import.meta);

export default WebApp;
