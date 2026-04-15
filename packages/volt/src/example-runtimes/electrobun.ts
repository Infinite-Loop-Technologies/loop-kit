import { existsSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { readonly } from "@loop-kit/common";
import type { VoltReadinessProbe, VoltTargetContext } from "../contracts";
import { createOxlintFormatter, runCodegen } from "../codegen";
import { loadVoltEnv } from "../env";
import { defineAdapter, defineTargetTask, type VoltAdapterDefinition } from "../task";
import { sanitizeForPath } from "../utils";

type VoltModuleThunk<TModule> = () => Promise<TModule>;

interface ElectrobunWindowOptions {
  readonly height: number;
  readonly title: string;
  readonly url: string;
  readonly width: number;
}

export interface ElectrobunTargetOptions {
  readonly app?: VoltModuleThunk<{ default?: (runtime: ElectrobunRuntimeContext) => unknown }>;
  readonly artifacts?: string[];
  readonly build?: (context: VoltTargetContext) => Promise<void>;
  readonly buildArgs?: string[];
  readonly configPath?: string;
  readonly cwd?: string;
  readonly dependsOn?: string[];
  readonly dev?: (context: VoltTargetContext) => Promise<import("../contracts").ManagedVoltProcess | void>;
  readonly devArgs?: string[];
  readonly env?: Record<string, string>;
  readonly identifier?: string;
  readonly inputs?: string[];
  readonly needs?: ReadonlyArray<VoltAdapterDefinition<any>>;
  readonly outputs?: string[];
  readonly readiness?: VoltReadinessProbe | VoltReadinessProbe[];
  readonly uses?: string[];
  readonly watch?: string[];
  readonly watchElectrobun?: boolean;
  readonly window?: ElectrobunWindowOptions;
}

interface ElectrobunRuntimeContext {
  readonly mode: "development" | "production";
  readonly window: ElectrobunWindowOptions;
}

const createElectrobunEnv = (
  context: VoltTargetContext,
  env?: Record<string, string>,
) => ({
  ...loadVoltEnv({
    mode: context.mode,
    rootDir: context.rootDir,
    workspaceRoot: context.workspaceRoot,
  }),
  ...env,
  VOLT_ROOT_DIR: context.rootDir,
  VOLT_TARGET_NAME: context.currentTarget.name,
  VOLT_WORKSPACE_ROOT: context.workspaceRoot,
});

const extractImportSpecifierFromThunk = <TModule>(
  thunk: VoltModuleThunk<TModule>,
) => {
  const source = thunk.toString();
  const match = source.match(/import\((["'`])([^"'`]+)\1\)/u);
  if (!match) {
    throw new Error(
      "Electrobun app thunks must look like () => import('./path/to/module').",
    );
  }

  return match[2];
};

const createGeneratedElectrobunFiles = async (
  context: VoltTargetContext,
  options: ElectrobunTargetOptions,
) => {
  const rootDir = context.rootDir;
  const targetSlug = sanitizeForPath(context.currentTarget.name);
  const generatedDir = resolve(
    rootDir,
    ".volt",
    "generated",
    "electrobun",
    targetSlug,
  );
  const mainPath = resolve(generatedDir, "src", "bun", "index.ts");
  const configPath = resolve(generatedDir, "electrobun.config.ts");
  const appImportPath = options.app
    ? relative(generatedDir, resolve(rootDir, extractImportSpecifierFromThunk(options.app)))
        .replace(/\\/g, "/")
        .replace(/\.(?:[cm]?[jt]sx?)$/u, "")
    : undefined;
  const windowOptions =
    options.window ??
    ({
      height: 800,
      title: context.currentTarget.name,
      url: "about:blank",
      width: 1280,
    } satisfies ElectrobunWindowOptions);

  await runCodegen(
    ({ emit }) => {
      emit({
        content: [
          `import { BrowserWindow } from 'electrobun/bun';`,
          ...(appImportPath
            ? [`import appModule from ${JSON.stringify(appImportPath.startsWith(".") ? appImportPath : `./${appImportPath}`)};`]
            : []),
          ``,
          `const runtime = ${JSON.stringify({
            mode: context.mode,
            window: windowOptions,
          }, null, 2)} as const;`,
          ``,
          `const mainWindow = new BrowserWindow({`,
          `  frame: {`,
          `    height: runtime.window.height,`,
          `    width: runtime.window.width,`,
          `    x: 120,`,
          `    y: 80,`,
          `  },`,
          `  renderer: 'native',`,
          `  title: runtime.window.title,`,
          `  titleBarStyle: 'default',`,
          `  url: runtime.window.url,`,
          `});`,
          ``,
          ...(appImportPath
            ? [
                `const start = typeof appModule === 'function' ? appModule : appModule?.default;`,
                `if (typeof start === 'function') {`,
                `  await start({ ...runtime, window: runtime.window });`,
                `}`,
                ``,
              ]
            : []),
          `mainWindow.webview.on('dom-ready', () => {`,
          `  console.log('${context.currentTarget.name} desktop ready');`,
          `  if (runtime.mode !== 'production') {`,
          `    mainWindow.webview.openDevTools();`,
          `  }`,
          `});`,
          ``,
        ].join("\n"),
        path: relative(rootDir, mainPath),
      });
      emit({
        content: [
          `import type { ElectrobunConfig } from 'electrobun';`,
          ``,
          `export default {`,
          `  app: {`,
          `    identifier: ${JSON.stringify(options.identifier ?? `dev.loopkit.${targetSlug}`)},`,
          `    name: ${JSON.stringify(targetSlug)},`,
          `    version: '0.0.0',`,
          `  },`,
          `  runtime: {`,
          `    exitOnLastWindowClosed: false,`,
          `  },`,
          `} satisfies ElectrobunConfig;`,
          ``,
        ].join("\n"),
        path: relative(rootDir, configPath),
      });
    },
    {
      formatters: [createOxlintFormatter(undefined, { optional: true })],
      logger: context.logger,
      rootDir,
    },
  );

  return {
    configPath,
    cwd: generatedDir,
    mainPath,
  };
};

export const ElectrobunRuntime = (options: ElectrobunTargetOptions = {}) => ({
  artifacts: options.artifacts,
  async build(context: VoltTargetContext) {
    if (options.build) {
      await options.build(context);
      return;
    }

    const generated = await createGeneratedElectrobunFiles(context, options);
    const cwd = resolve(context.rootDir, options.cwd ?? generated.cwd);
    const configPath = resolve(cwd, options.configPath ?? generated.configPath);
    if (!existsSync(configPath)) {
      throw new Error(
        `Electrobun target requires ${configPath}.`,
      );
    }

    const child = context.spawn(context.currentTarget.name, [
      "bunx",
      "electrobun",
      "build",
      "--env",
      context.mode,
      ...(options.buildArgs ?? []),
    ], {
      cwd,
      env: {
        ...createElectrobunEnv(context, options.env),
        VOLT_ELECTROBUN_MAIN_PATH: generated.mainPath,
      },
    });

    const exitCode = await child.process.exited;
    if (exitCode !== 0) {
      throw new Error(`Electrobun build exited with code ${exitCode}.`);
    }
  },
  dependsOn: options.dependsOn,
  async dev(context: VoltTargetContext) {
    if (options.dev) {
      return options.dev(context);
    }

    const generated = await createGeneratedElectrobunFiles(context, options);
    const cwd = resolve(context.rootDir, options.cwd ?? generated.cwd);
    const configPath = resolve(cwd, options.configPath ?? generated.configPath);
    if (!existsSync(configPath)) {
      throw new Error(
        `Electrobun target requires ${configPath}.`,
      );
    }

    return context.spawn(
      context.currentTarget.name,
      [
        "bunx",
        "electrobun",
        "dev",
        ...(options.watchElectrobun ? ["--watch"] : []),
        ...(options.devArgs ?? []),
      ],
      {
        cwd,
        env: {
          ...createElectrobunEnv(context, options.env),
          VOLT_ELECTROBUN_MAIN_PATH: generated.mainPath,
        },
        readiness: options.readiness,
      },
    );
  },
  runtime: "electrobun",
  target: "bun",
  uses: options.uses,
});

export const electrobun = (
  options: ElectrobunTargetOptions = {},
) =>
  defineAdapter({
    exports: readonly({}),
    needs: options.needs,
    tasks: (name: string) => ({
      [`build:${name}`]: defineTargetTask({
        artifacts: options.artifacts,
        command: "build",
        dependsOn: options.dependsOn,
        inputs: options.inputs,
        outputs: options.outputs,
        target: ElectrobunRuntime(options),
        uses: options.uses,
        watch: options.watch,
      }),
      [`dev:${name}`]: defineTargetTask({
        artifacts: options.artifacts,
        command: "dev",
        dependsOn: options.dependsOn,
        inputs: options.inputs,
        outputs: options.outputs,
        target: ElectrobunRuntime(options),
        uses: options.uses,
        watch: options.watch,
      }),
    }),
  }) satisfies VoltAdapterDefinition<Record<string, never>>;

export const electrobunTask = (
  options: ElectrobunTargetOptions & { command: "build" | "dev" },
) =>
  defineTargetTask({
    artifacts: options.artifacts,
    command: options.command,
    dependsOn: options.dependsOn,
    inputs: options.inputs,
    outputs: options.outputs,
    target: ElectrobunRuntime(options),
    uses: options.uses,
    watch: options.watch,
  });
