import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { BrowserRuntimeConfig } from "../../.volt/generated/browser-config";
import { getOpenPort } from "./ports";
import type { ShareProvider } from "./share-provider";

interface DemoSessionOptions {
  command: "build" | "dev";
  enableShare: boolean;
  mode: "development" | "production";
  rootDir: string;
  shareProvider?: ShareProvider;
}

export interface DemoRuntimeSession {
  browserConfig: BrowserRuntimeConfig;
  game: {
    localHttpUrl: string;
    localWsUrl: string;
    port: number;
    publicHttpUrl: string | null;
    publicWsUrl: string | null;
  };
  mode: "development" | "production";
  share: {
    enabled: boolean;
    provider: string | null;
  };
  web: {
    localUrl: string;
    port: number;
    publicUrl: string | null;
  };
}

const asWsUrl = (url: string) => `${url.replace(/^http/u, "ws")}/ws`;

const writeBrowserConfig = (rootDir: string, config: BrowserRuntimeConfig) => {
  const filePath = resolve(rootDir, ".volt", "generated", "browser-config.ts");
  mkdirSync(resolve(rootDir, ".volt", "generated"), { recursive: true });
  writeFileSync(
    filePath,
    [
      "export interface BrowserRuntimeConfig {",
      '  gameHttpUrl: string;',
      '  gamePublicHttpUrl: string | null;',
      '  gamePublicWsUrl: string | null;',
      '  gameWsUrl: string;',
      '  mode: "development" | "production";',
      '  shareEnabled: boolean;',
      '  webPublicUrl: string | null;',
      '  webUrl: string;',
      "}",
      "",
      `export const browserRuntimeConfig: BrowserRuntimeConfig = ${JSON.stringify(config, null, 2)};`,
      "",
    ].join("\n"),
    "utf8",
  );
};

export const createDemoRuntimeSession = async ({
  command,
  enableShare,
  mode,
  rootDir,
  shareProvider,
}: DemoSessionOptions): Promise<DemoRuntimeSession> => {
  const webPort = command === "dev" ? await getOpenPort() : 6101;
  const gamePort = command === "dev" ? await getOpenPort() : 6202;
  const webLocalUrl = `http://127.0.0.1:${webPort}`;
  const gameLocalHttpUrl = `http://127.0.0.1:${gamePort}`;
  const gameLocalWsUrl = `ws://127.0.0.1:${gamePort}/ws`;

  let webPublicUrl: string | null = null;
  let gamePublicHttpUrl: string | null = null;
  let gamePublicWsUrl: string | null = null;

  if (enableShare && shareProvider) {
    webPublicUrl = await shareProvider.publish("volt-web", webPort);
    gamePublicHttpUrl = await shareProvider.publish("volt-game", gamePort);
    gamePublicWsUrl = gamePublicHttpUrl ? asWsUrl(gamePublicHttpUrl) : null;
  }

  const browserConfig: BrowserRuntimeConfig = {
    gameHttpUrl: gameLocalHttpUrl,
    gamePublicHttpUrl,
    gamePublicWsUrl,
    gameWsUrl: gameLocalWsUrl,
    mode,
    shareEnabled: enableShare && Boolean(shareProvider),
    webPublicUrl,
    webUrl: webLocalUrl,
  };

  writeBrowserConfig(rootDir, browserConfig);

  return {
    browserConfig,
    game: {
      localHttpUrl: gameLocalHttpUrl,
      localWsUrl: gameLocalWsUrl,
      port: gamePort,
      publicHttpUrl: gamePublicHttpUrl,
      publicWsUrl: gamePublicWsUrl,
    },
    mode,
    share: {
      enabled: browserConfig.shareEnabled,
      provider: browserConfig.shareEnabled ? shareProvider?.name ?? null : null,
    },
    web: {
      localUrl: webLocalUrl,
      port: webPort,
      publicUrl: webPublicUrl,
    },
  };
};
