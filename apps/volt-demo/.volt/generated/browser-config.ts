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
  "gameHttpUrl": "http://127.0.0.1:6202",
  "gamePublicHttpUrl": null,
  "gamePublicWsUrl": null,
  "gameWsUrl": "ws://127.0.0.1:6202/ws",
  "mode": "production",
  "shareEnabled": false,
  "webPublicUrl": null,
  "webUrl": "http://127.0.0.1:6101"
};
