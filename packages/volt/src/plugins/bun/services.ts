import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createVoltLogger } from "../../utils";

export interface BunBaseServices {
  env: {
    read: (name: string) => string | undefined;
  };
  fs: {
    exists: (path: string) => boolean;
    readText: (path: string) => string;
  };
  logger: ReturnType<typeof createVoltLogger>;
  paths: {
    fromRoot: (...segments: string[]) => string;
  };
  socket: (pathname: string) => string;
  target: "bun";
}

export interface BunServerServices extends BunBaseServices {
  runtime: "bun-server";
}

export interface BunFullstackServices extends BunBaseServices {
  html: (entrypoint: string) => string;
  runtime: "bun-fullstack";
}

export const createBunServerServices = (rootDir: string): BunServerServices => ({
  env: {
    read: (name) => process.env[name],
  },
  fs: {
    exists: existsSync,
    readText: (path) => readFileSync(path, "utf8"),
  },
  logger: createVoltLogger("bun-server"),
  paths: {
    fromRoot: (...segments) => resolve(rootDir, ...segments),
  },
  runtime: "bun-server",
  socket: (pathname) => pathname,
  target: "bun",
});

export const createBunFullstackServices = (
  rootDir: string,
): BunFullstackServices => ({
  env: {
    read: (name) => process.env[name],
  },
  fs: {
    exists: existsSync,
    readText: (path) => readFileSync(path, "utf8"),
  },
  html: (entrypoint) => entrypoint,
  logger: createVoltLogger("bun-fullstack"),
  paths: {
    fromRoot: (...segments) => resolve(rootDir, ...segments),
  },
  runtime: "bun-fullstack",
  socket: (pathname) => pathname,
  target: "bun",
});
