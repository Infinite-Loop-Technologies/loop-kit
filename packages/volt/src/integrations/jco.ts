import { dirname, resolve } from "node:path";
import type { VoltIntegrationContext, VoltIntegrationDefinition } from "../contracts";
import { ensureDirectory, runSpawnedCommand } from "../utils";

export interface JcoComponentIntegrationOptions {
  componentOut?: string;
  entry: string;
  sourceDir?: string;
  transpileOut?: string;
  wit: string;
}

const defaultComponentOut = (name: string) =>
  `.volt/artifacts/${name}/component.wasm`;

const defaultTranspileOut = (name: string) =>
  `.volt/generated/integrations/${name}`;

const buildComponent = async (
  context: VoltIntegrationContext,
  options: JcoComponentIntegrationOptions,
) => {
  const sourceDir = resolve(context.rootDir, options.sourceDir ?? ".");
  const componentOut = resolve(
    context.rootDir,
    options.componentOut ?? defaultComponentOut(context.name),
  );
  const transpileOut = resolve(
    context.rootDir,
    options.transpileOut ?? defaultTranspileOut(context.name),
  );
  const entry = resolve(context.rootDir, options.entry);
  const wit = resolve(context.rootDir, options.wit);

  await ensureDirectory(dirname(componentOut));
  await ensureDirectory(transpileOut);

  await runSpawnedCommand(
    context.spawn(
      `jco:${context.name}:componentize`,
      ["bunx", "jco", "componentize", "-w", wit, "-o", componentOut, entry],
      { cwd: sourceDir },
    ),
  );

  await runSpawnedCommand(
    context.spawn(
      `jco:${context.name}:transpile`,
      ["bunx", "jco", "transpile", "-o", transpileOut, componentOut],
      { cwd: sourceDir },
    ),
  );

  return {
    artifactPath: componentOut,
    generatedModulePath: resolve(transpileOut, "component.js"),
    metadata: {
      componentOut,
      entry,
      sourceDir,
      tool: "jco",
      transpileOut,
      wit,
    },
    typesPath: resolve(transpileOut, "component.d.ts"),
  };
};

export const createJcoIntegration = () => ({
  component: (options: JcoComponentIntegrationOptions): VoltIntegrationDefinition => ({
    build: (context) => buildComponent(context, options),
    dev: (context) => buildComponent(context, options),
    kind: "jco-component",
    watchPaths: [options.sourceDir ?? ".", options.wit, options.entry],
  }),
});
