import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { z } from "zod";

const remoteManifestSchema = z.object({
  templates: z.array(
    z.object({
      description: z.string().optional(),
      files: z.array(
        z.object({
          contents: z.string(),
          path: z.string().min(1),
        }),
      ),
      name: z.string().min(1),
    }),
  ),
});

const localTemplateMetaSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1),
});

export interface TemplateSummary {
  description?: string;
  name: string;
  source: "bundled" | "remote";
}

interface LocalTemplateDefinition extends TemplateSummary {
  dir: string;
}

interface RemoteTemplateDefinition extends TemplateSummary {
  files: Array<{
    contents: string;
    path: string;
  }>;
}

const applyTemplateVariables = (
  contents: string,
  variables: Record<string, string>,
) =>
  Object.entries(variables).reduce(
    (current, [key, value]) => current.replaceAll(`__${key}__`, value),
    contents,
  );

const createTemplateVariables = (targetDir: string) => ({
  APP_NAME: basename(targetDir),
});

const ensureDir = (path: string) => {
  mkdirSync(path, { recursive: true });
};

const copyDirectory = (
  fromDir: string,
  toDir: string,
  variables: Record<string, string>,
) => {
  ensureDir(toDir);

  for (const entry of readdirSync(fromDir, { withFileTypes: true })) {
    if (entry.name === "template.json") {
      continue;
    }

    const sourcePath = join(fromDir, entry.name);
    const targetPath = join(toDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath, variables);
      continue;
    }

    const fileContents = readFileSync(sourcePath, "utf8");
    writeFileSync(targetPath, applyTemplateVariables(fileContents, variables), "utf8");
  }
};

const bundledTemplatesRoot = () => resolve(import.meta.dir, "..", "templates");

const readBundledTemplates = (): LocalTemplateDefinition[] =>
  readdirSync(bundledTemplatesRoot(), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = resolve(bundledTemplatesRoot(), entry.name);
      const metaPath = resolve(dir, "template.json");
      const meta = localTemplateMetaSchema.parse(
        JSON.parse(readFileSync(metaPath, "utf8")),
      );

      return {
        ...meta,
        dir,
        source: "bundled" as const,
      };
    });

const readRemoteTemplates = async (
  manifestUrl: string,
): Promise<RemoteTemplateDefinition[]> => {
  const response = await fetch(manifestUrl);
  if (!response.ok) {
    throw new Error(`Failed to load template manifest from ${manifestUrl}.`);
  }

  const manifest = remoteManifestSchema.parse(await response.json());
  return manifest.templates.map((template) => ({
    ...template,
    source: "remote" as const,
  }));
};

export const listTemplates = async (manifestUrl?: string): Promise<TemplateSummary[]> => {
  if (manifestUrl) {
    return readRemoteTemplates(manifestUrl);
  }

  return readBundledTemplates();
};

export interface ScaffoldTemplateOptions {
  force?: boolean;
  manifestUrl?: string;
  targetDir: string;
  templateName: string;
}

const assertEmptyTarget = (targetDir: string, force = false) => {
  try {
    const entries = readdirSync(targetDir);
    if (entries.length > 0 && !force) {
      throw new Error(
        `Target directory ${targetDir} is not empty. Pass --force if you want to overwrite into an existing folder.`,
      );
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }
    throw error;
  }
};

export const scaffoldTemplate = async ({
  force,
  manifestUrl,
  targetDir,
  templateName,
}: ScaffoldTemplateOptions) => {
  assertEmptyTarget(targetDir, force);
  ensureDir(targetDir);

  const variables = createTemplateVariables(targetDir);

  if (manifestUrl) {
    const templates = await readRemoteTemplates(manifestUrl);
    const template = templates.find((entry) => entry.name === templateName);
    if (!template) {
      throw new Error(`Template "${templateName}" was not found in ${manifestUrl}.`);
    }

    for (const file of template.files) {
      const filePath = resolve(targetDir, file.path);
      ensureDir(resolve(filePath, ".."));
      writeFileSync(
        filePath,
        applyTemplateVariables(file.contents, variables),
        "utf8",
      );
    }
    return template;
  }

  const template = readBundledTemplates().find((entry) => entry.name === templateName);
  if (!template) {
    throw new Error(`Unknown bundled template "${templateName}".`);
  }

  copyDirectory(template.dir, targetDir, variables);
  return template;
};
