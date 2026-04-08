import { feature } from "bun:bundle";

export type VoltMode = "development" | "production";
export type VoltRuntime = "browser" | "bun-fullstack" | "bun-server" | "electrobun" | "unknown";
export type VoltTarget = "browser" | "bun";

const hasDomGlobals =
  typeof window === "object" && typeof document === "object";

export const voltMode: VoltMode = feature("VOLT_MODE_PRODUCTION")
  ? "production"
  : "development";

export const voltRuntime: VoltRuntime = hasDomGlobals
  ? "browser"
  : feature("VOLT_RUNTIME_BUN_FULLSTACK")
    ? "bun-fullstack"
    : feature("VOLT_RUNTIME_BUN_SERVER")
      ? "bun-server"
      : feature("VOLT_RUNTIME_ELECTROBUN")
        ? "electrobun"
        : "unknown";

export const voltTarget: VoltTarget = hasDomGlobals
  ? "browser"
  : feature("VOLT_TARGET_BROWSER")
    ? "browser"
    : "bun";

export const isVoltMode = (mode: VoltMode) => voltMode === mode;
export const isVoltRuntime = (runtime: Exclude<VoltRuntime, "unknown">) =>
  voltRuntime === runtime;
export const isVoltTarget = (target: VoltTarget) => voltTarget === target;

export const assertVoltTarget = (target: VoltTarget) => {
  if (voltTarget !== target) {
    throw new Error(`Volt target mismatch. Expected ${target}, received ${voltTarget}.`);
  }
};
