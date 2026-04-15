import { dirname, resolve } from "node:path";
import { parse as parseWithOxc } from "oxc-parser";
import {
  Project,
  QuoteKind,
  ScriptKind,
  type SourceFile,
} from "ts-morph";
import type { VoltLogger } from "./contracts";
import { ensureDirectory, writeTextFile } from "./utils";

export interface VoltCodegenEmitFile {
  readonly path: string;
  readonly content:
    | string
    | ((sourceFile: SourceFile) => MaybePromise<void> | MaybePromise<string>);
}

export interface VoltCodegenFormatter {
  readonly format: (context: {
    files: ReadonlyArray<string>;
    logger?: VoltLogger;
    rootDir: string;
  }) => Promise<void>;
  readonly name: string;
}

export interface VoltCodegenContext {
  readonly emit: (file: VoltCodegenEmitFile) => void;
  readonly rootDir: string;
}

export interface VoltCodegenOptions {
  readonly formatters?: ReadonlyArray<VoltCodegenFormatter>;
  readonly logger?: VoltLogger;
  readonly rootDir: string;
}

type MaybePromise<T> = Promise<T> | T;

const toScriptKind = (path: string) =>
  path.endsWith(".tsx") ? ScriptKind.TSX : ScriptKind.TS;

const renderSourceFile = async (
  rootDir: string,
  file: VoltCodegenEmitFile,
): Promise<string> => {
  if (typeof file.content === "string") {
    return file.content;
  }

  const project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single,
    },
    useInMemoryFileSystem: true,
  });
  const sourceFile = project.createSourceFile(resolve(rootDir, file.path), "", {
    overwrite: true,
    scriptKind: toScriptKind(file.path),
  });
  const returned = await file.content(sourceFile);
  if (typeof returned === "string") {
    sourceFile.replaceWithText(returned);
  }
  return sourceFile.getFullText();
};

const validateGeneratedTypeScript = async (path: string, content: string) => {
  const parsed = await parseWithOxc(path, content, {
    lang: path.endsWith(".tsx") ? "tsx" : "ts",
    sourceType: "module",
  });

  if (parsed.errors.length > 0) {
    throw new Error(
      `Generated file ${path} is not valid TypeScript: ${parsed.errors
        .map((error) => error.message)
        .join("; ")}`,
    );
  }
};

export const createOxlintFormatter = (
  command: ReadonlyArray<string> = ["bunx", "oxlint", "--fix"],
  options: { optional?: boolean } = {},
): VoltCodegenFormatter => ({
  format: async ({ files, logger, rootDir }) => {
    if (files.length === 0) {
      return;
    }

    const processRef = Bun.spawn({
      cmd: [...command, ...files],
      cwd: rootDir,
      stderr: "pipe",
      stdin: "ignore",
      stdout: "pipe",
    });
    const exitCode = await processRef.exited;
    if (exitCode === 0 || options.optional) {
      return;
    }

    const stderr = processRef.stderr ? await new Response(processRef.stderr).text() : "";
    logger?.warn("volt codegen formatter failed", {
      exitCode,
      formatter: "oxlint",
      stderr,
    });
    throw new Error(`Volt codegen formatter oxlint failed with code ${exitCode}.`);
  },
  name: "oxlint",
});

export const runCodegen = async (
  run: (context: VoltCodegenContext) => MaybePromise<void>,
  options: VoltCodegenOptions,
) => {
  const files: VoltCodegenEmitFile[] = [];

  await run({
    emit: (file) => {
      files.push(file);
    },
    rootDir: options.rootDir,
  });

  const writtenFiles: string[] = [];
  for (const file of files) {
    const absolutePath = resolve(options.rootDir, file.path);
    const rendered = await renderSourceFile(options.rootDir, file);
    await validateGeneratedTypeScript(absolutePath, rendered);
    await ensureDirectory(dirname(absolutePath));
    await writeTextFile(absolutePath, rendered);
    writtenFiles.push(absolutePath);
  }

  for (const formatter of options.formatters ?? []) {
    await formatter.format({
      files: writtenFiles,
      logger: options.logger,
      rootDir: options.rootDir,
    });
  }

  return writtenFiles;
};
