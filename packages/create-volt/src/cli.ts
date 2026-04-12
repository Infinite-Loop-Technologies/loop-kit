import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { listTemplates, scaffoldTemplate } from "./index";

const usage =
  "Usage: create-volt [target-dir] [--template minimal] [--manifest https://example.com/templates.json] [--list] [--force]";

const main = async () => {
  const parsed = parseArgs({
    allowPositionals: true,
    args: Bun.argv.slice(2),
    options: {
      force: { type: "boolean" },
      list: { type: "boolean" },
      manifest: { type: "string" },
      template: { type: "string" },
    },
    strict: true,
  });

  const manifestUrl = parsed.values.manifest;
  const templateName = parsed.values.template ?? "minimal";

  if (parsed.values.list) {
    const templates = await listTemplates(manifestUrl);
    for (const template of templates) {
      console.log(
        `${template.name} [${template.source}]${template.description ? ` - ${template.description}` : ""}`,
      );
    }
    return;
  }

  const targetDir = parsed.positionals[0];
  if (!targetDir) {
    throw new Error(usage);
  }

  const resolvedTargetDir = resolve(process.cwd(), targetDir);
  const template = await scaffoldTemplate({
    force: parsed.values.force,
    manifestUrl,
    targetDir: resolvedTargetDir,
    templateName,
  });

  console.log(`Scaffolded ${template.name} into ${resolvedTargetDir}`);
};

await main();
