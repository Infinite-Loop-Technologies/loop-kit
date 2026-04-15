import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { BrowserRuntimeConfig } from "../../.volt/generated/browser-config";
import {
  defineArtifact,
  type VoltArtifactDefinition,
} from "volt";
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

export interface DemoGameRuntimeServices {
  demoGame: {
    healthUrl: string;
    mode: "development" | "production";
    port: number;
    websocketUrl: string;
  };
}

export interface DemoWebRuntimeServices {
  demoWeb: {
    browserConfig: BrowserRuntimeConfig;
    mode: "development" | "production";
    port: number;
  };
}

const asWsUrl = (url: string) => `${url.replace(/^http/u, "ws")}/ws`;

export const writeBrowserConfig = (rootDir: string, config: BrowserRuntimeConfig) => {
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
  shareProvider,
}: DemoSessionOptions): Promise<DemoRuntimeSession> => {
  const webPort = command === "dev" ? await getOpenPort() : 6101;
  const gamePort = command === "dev" ? await getOpenPort() : 6202;
  const webLocalUrl = `http://127.0.0.1:${webPort}`;
  const gameLocalHttpUrl = `http://127.0.0.1:${gamePort}`;
  const gameLocalWsUrl = `ws://127.0.0.1:${gamePort}/ws`;

  const webPublicUrl =
    enableShare && shareProvider
      ? await shareProvider.publish("volt-web", webPort)
      : null;
  const gamePublicHttpUrl =
    enableShare && shareProvider
      ? await shareProvider.publish("volt-game", gamePort)
      : null;
  const gamePublicWsUrl = gamePublicHttpUrl ? asWsUrl(gamePublicHttpUrl) : null;

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

export const createDemoSessionArtifact = (
  options: DemoSessionOptions,
): VoltArtifactDefinition<DemoRuntimeSession> =>
  defineArtifact({
    async build() {
      const session = await createDemoRuntimeSession(options);
      writeBrowserConfig(options.rootDir, session.browserConfig);
      return {
        generatedModulePath: resolve(
          options.rootDir,
          ".volt",
          "generated",
          "browser-config.ts",
        ),
        metadata: {
          provider: session.share.provider,
          shareEnabled: session.share.enabled,
        },
        value: session,
      };
    },
    async dev() {
      const session = await createDemoRuntimeSession(options);
      writeBrowserConfig(options.rootDir, session.browserConfig);
      return {
        generatedModulePath: resolve(
          options.rootDir,
          ".volt",
          "generated",
          "browser-config.ts",
        ),
        metadata: {
          provider: session.share.provider,
          shareEnabled: session.share.enabled,
        },
        value: session,
      };
    },
    kind: "runtime-session",
  });
