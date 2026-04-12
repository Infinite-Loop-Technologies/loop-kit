import type { BrowserRuntimeConfig } from "../../../../.volt/generated/browser-config";

// RuntimeInfoService exposes generated runtime config to the React shell.
export interface RuntimeInfoService {
  config: BrowserRuntimeConfig;
}

export const createRuntimeInfoService = (
  config: BrowserRuntimeConfig,
): RuntimeInfoService => ({
  config,
});
