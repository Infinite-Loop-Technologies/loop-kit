export interface BrowserRuntimeConfig {
  gameHttpUrl: string;
  gamePublicHttpUrl: string | null;
  gamePublicWsUrl: string | null;
  gameWsUrl: string;
  mode: "development" | "production";
  shareEnabled: boolean;
  webPublicUrl: string | null;
  webUrl: string;
}

export const browserRuntimeConfig: BrowserRuntimeConfig = {
  "gameHttpUrl": "http://127.0.0.1:55477",
  "gamePublicHttpUrl": null,
  "gamePublicWsUrl": null,
  "gameWsUrl": "ws://127.0.0.1:55477/ws",
  "mode": "development",
  "shareEnabled": false,
  "webPublicUrl": null,
  "webUrl": "http://127.0.0.1:55476"
};
