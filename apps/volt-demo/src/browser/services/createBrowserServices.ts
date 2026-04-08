import { runtimeConfig } from "../runtimeConfig";
import { createBrowserService } from "./browser/BrowserService";
import { createHttpService } from "./http/HttpService";
import { createIdService } from "./ids/IdService";
import { createLoggerService } from "./logger/LoggerService";
import { createRuntimeInfoService } from "./runtime/RuntimeInfoService";
import { createWebSocketService } from "./websocket/WebSocketService";

export interface BrowserServices {
  browser: ReturnType<typeof createBrowserService>;
  http: ReturnType<typeof createHttpService>;
  ids: ReturnType<typeof createIdService>;
  logger: ReturnType<typeof createLoggerService>;
  runtime: ReturnType<typeof createRuntimeInfoService>;
  websocket: ReturnType<typeof createWebSocketService>;
}

export const createBrowserServices = (): BrowserServices => ({
  browser: createBrowserService(),
  http: createHttpService(),
  ids: createIdService(),
  logger: createLoggerService(),
  runtime: createRuntimeInfoService(runtimeConfig),
  websocket: createWebSocketService(),
});
