import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, extname, relative, resolve } from "node:path";

const DEFAULT_INCLUDE_PATTERNS = ["**/*.md", "**/*.mdx", "**/*.markdown"] as const;
const DEFAULT_EXCLUDE_PATTERNS = [".git/**", "node_modules/**"] as const;
const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx", ".markdown"]);
const BACKLINKS_HEADING = "## Backlinks";
const GENERATED_START = "<!-- markdown-backlinks:start -->";
const GENERATED_END = "<!-- markdown-backlinks:end -->";
const MARKDOWN_LINK_PATTERN = /\[[^\]]+\]\(([^)\n]+)\)/gu;
const WINDOWS = process.platform === "win32";

export interface MarkdownFile {
  readonly absolutePath: string;
  readonly relativePath: string;
  readonly content: string;
}

export interface BrokenMarkdownLink {
  readonly sourcePath: string;
  readonly rawTarget: string;
  readonly resolvedTarget: string;
}

export interface SyncResult {
  readonly filesScanned: number;
  readonly filesChanged: readonly string[];
  readonly brokenLinks: readonly BrokenMarkdownLink[];
}

export interface SyncOptions {
  readonly rootDir: string;
  readonly include: readonly string[];
  readonly exclude: readonly string[];
  readonly write: boolean;
}

interface ParsedArgs {
  readonly options: SyncOptions;
  readonly check: boolean;
}

function normalizePath(value: string): string {
  const normalized = value.replace(/\\/gu, "/");
  return WINDOWS ? normalized.toLowerCase() : normalized;
}

function splitLines(content: string): readonly string[] {
  return content.match(/^.*(?:\r?\n|$)/gmu) ?? [content];
}

function stripFencedCodeBlocks(content: string): string {
  return content.replace(/^```[\s\S]*?^```[ \t]*\r?\n?/gmu, (match) =>
    match.replace(/[^\r\n]/gu, " "),
  );
}

function findBacklinksSectionRanges(content: string): readonly [number, number][] {
  const lines = splitLines(content);
  const ranges: [number, number][] = [];
  let offset = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const trimmed = line.replace(/\r?\n$/u, "").trim();
    const lineStart = offset;
    offset += line.length;

    if (trimmed !== BACKLINKS_HEADING) {
      continue;
    }

    let end = content.length;
    let innerOffset = offset;
    for (let probe = index + 1; probe < lines.length; probe += 1) {
      const probeLine = lines[probe] ?? "";
      const probeTrimmed = probeLine.replace(/\r?\n$/u, "").trim();
      if (/^##\s+/u.test(probeTrimmed)) {
        end = innerOffset;
        break;
      }
      innerOffset += probeLine.length;
    }

    ranges.push([lineStart, end]);
  }

  return ranges;
}

function stripManagedBacklinks(content: string): string {
  const ranges = findBacklinksSectionRanges(content);
  if (ranges.length === 0) {
    return content;
  }

  let cursor = 0;
  let output = "";
  for (const [start, end] of ranges) {
    output += content.slice(cursor, start);
    cursor = end;
  }
  output += content.slice(cursor);
  return output;
}

function removeBacklinksSections(content: string): string {
  return stripManagedBacklinks(content).trimEnd();
}

function globToRegExp(pattern: string): RegExp {
  let source = "^";
  const normalized = normalizePath(pattern);

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];

    if (char === "*" && next === "*") {
      const afterNext = normalized[index + 2];
      if (afterNext === "/") {
        source += "(?:.*/)?";
        index += 2;
      } else {
        source += ".*";
        index += 1;
      }
      continue;
    }

    if (char === "*") {
      source += "[^/]*";
      continue;
    }

    if (char === "?") {
      source += "[^/]";
      continue;
    }

    if ("/.+^${}()|[]\\".includes(char ?? "")) {
      source += `\\${char}`;
      continue;
    }

    source += char;
  }

  source += "$";
  return new RegExp(source, "u");
}

function compilePatterns(patterns: readonly string[]): readonly RegExp[] {
  return patterns.map((pattern) => globToRegExp(pattern));
}

function matchesAny(pathname: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(pathname));
}

async function walkDirectory(
  rootDir: string,
  currentDir: string,
  includePatterns: readonly RegExp[],
  excludePatterns: readonly RegExp[],
  files: MarkdownFile[],
): Promise<void> {
  const entries = await readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = resolve(currentDir, entry.name);
    const relativePath = normalizePath(relative(rootDir, absolutePath));

    if (excludePatterns.length > 0 && matchesAny(relativePath, excludePatterns)) {
      continue;
    }

    if (entry.isDirectory()) {
      await walkDirectory(rootDir, absolutePath, includePatterns, excludePatterns, files);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!MARKDOWN_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      continue;
    }

    if (!matchesAny(relativePath, includePatterns)) {
      continue;
    }

    files.push({
      absolutePath,
      relativePath,
      content: await readFile(absolutePath, "utf8"),
    });
  }
}

export async function discoverMarkdownFiles(
  rootDir: string,
  include: readonly string[],
  exclude: readonly string[],
): Promise<readonly MarkdownFile[]> {
  const includePatterns = compilePatterns(include);
  const excludePatterns = compilePatterns(exclude);
  const rootStats = await stat(rootDir);

  if (!rootStats.isDirectory()) {
    throw new Error(`Root directory does not exist or is not a directory: ${rootDir}`);
  }

  const files: MarkdownFile[] = [];
  await walkDirectory(resolve(rootDir), resolve(rootDir), includePatterns, excludePatterns, files);
  return files.toSorted((left, right) => left.relativePath.localeCompare(right.relativePath));
}

function parseMarkdownDestination(rawTarget: string): string {
  const trimmed = rawTarget.trim();
  if (trimmed.startsWith("<")) {
    const closing = trimmed.indexOf(">");
    if (closing !== -1) {
      return trimmed.slice(1, closing);
    }
  }

  const match = /^[^\s]+/u.exec(trimmed);
  return match?.[0] ?? trimmed;
}

function isLocalMarkdownDestination(destination: string): boolean {
  if (destination.startsWith("#")) {
    return false;
  }

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/u.test(destination)) {
    return false;
  }

  const [pathPart] = destination.split("#");
  if (!pathPart) {
    return false;
  }

  return MARKDOWN_EXTENSIONS.has(extname(pathPart).toLowerCase());
}

function resolveTargetPath(rootDir: string, sourceAbsolutePath: string, destination: string): string {
  const [pathPart] = destination.split("#");
  const resolved = pathPart.startsWith("/")
    ? resolve(rootDir, `.${pathPart}`)
    : resolve(dirname(sourceAbsolutePath), pathPart);
  return normalizePath(resolved);
}

function collectOutgoingLinks(
  rootDir: string,
  files: readonly MarkdownFile[],
): {
  readonly incoming: ReadonlyMap<string, readonly MarkdownFile[]>;
  readonly brokenLinks: readonly BrokenMarkdownLink[];
} {
  const existing = new Set(files.map((file) => normalizePath(file.absolutePath)));
  const incoming = new Map<string, MarkdownFile[]>();
  const brokenLinks: BrokenMarkdownLink[] = [];

  for (const file of files) {
    const searchContent = stripFencedCodeBlocks(stripManagedBacklinks(file.content));
    const targetsForFile = new Set<string>();

    for (const match of searchContent.matchAll(MARKDOWN_LINK_PATTERN)) {
      const index = match.index ?? 0;
      if (index > 0 && searchContent[index - 1] === "!") {
        continue;
      }

      const rawTarget = match[1];
      if (!rawTarget) {
        continue;
      }

      const destination = parseMarkdownDestination(rawTarget);
      if (!isLocalMarkdownDestination(destination)) {
        continue;
      }

      const resolvedTarget = resolveTargetPath(rootDir, file.absolutePath, destination);
      if (!existing.has(resolvedTarget)) {
        brokenLinks.push({
          sourcePath: file.relativePath,
          rawTarget: destination,
          resolvedTarget: relative(rootDir, resolvedTarget),
        });
        continue;
      }

      if (targetsForFile.has(resolvedTarget)) {
        continue;
      }
      targetsForFile.add(resolvedTarget);

      const sources = incoming.get(resolvedTarget) ?? [];
      sources.push(file);
      incoming.set(resolvedTarget, sources);
    }
  }

  return { incoming, brokenLinks };
}

function toRelativeMarkdownLink(fromAbsolutePath: string, toAbsolutePath: string): string {
  const relativePath = normalizePath(relative(dirname(fromAbsolutePath), toAbsolutePath));
  return relativePath === "" ? "./" : relativePath;
}

function renderBacklinksSection(file: MarkdownFile, backlinks: readonly MarkdownFile[]): string {
  const lines = [BACKLINKS_HEADING, "", GENERATED_START];
  if (backlinks.length === 0) {
    lines.push("- None.");
  } else {
    for (const backlink of backlinks) {
      lines.push(`- [${backlink.relativePath}](${toRelativeMarkdownLink(file.absolutePath, backlink.absolutePath)})`);
    }
  }
  lines.push(GENERATED_END);
  return `${lines.join("\n")}\n`;
}

function applyBacklinksSection(content: string, nextSection: string): string {
  const withoutBacklinks = removeBacklinksSections(content);
  if (withoutBacklinks === "") {
    return nextSection;
  }
  return `${withoutBacklinks}\n\n${nextSection}`;
}

export async function syncMarkdownBacklinks(options: SyncOptions): Promise<SyncResult> {
  const rootDir = resolve(options.rootDir);
  const files = await discoverMarkdownFiles(rootDir, options.include, options.exclude);
  const { incoming, brokenLinks } = collectOutgoingLinks(rootDir, files);
  const filesChanged: string[] = [];

  if (options.write) {
    for (const file of files) {
      const backlinks = [...(incoming.get(normalizePath(file.absolutePath)) ?? [])].toSorted((left, right) =>
        left.relativePath.localeCompare(right.relativePath),
      );
      const nextContent = applyBacklinksSection(file.content, renderBacklinksSection(file, backlinks));
      if (nextContent === file.content) {
        continue;
      }
      await writeFile(file.absolutePath, nextContent, "utf8");
      filesChanged.push(file.relativePath);
    }
  } else {
    for (const file of files) {
      const backlinks = [...(incoming.get(normalizePath(file.absolutePath)) ?? [])].toSorted((left, right) =>
        left.relativePath.localeCompare(right.relativePath),
      );
      const nextContent = applyBacklinksSection(file.content, renderBacklinksSection(file, backlinks));
      if (nextContent !== file.content) {
        filesChanged.push(file.relativePath);
      }
    }
  }

  return {
    filesScanned: files.length,
    filesChanged: filesChanged.toSorted((left, right) => left.localeCompare(right)),
    brokenLinks: brokenLinks.toSorted((left, right) =>
      `${left.sourcePath}:${left.rawTarget}`.localeCompare(`${right.sourcePath}:${right.rawTarget}`),
    ),
  };
}

function formatBrokenLinks(brokenLinks: readonly BrokenMarkdownLink[]): string {
  if (brokenLinks.length === 0) {
    return "";
  }

  const lines = ["Broken markdown links:"];
  for (const brokenLink of brokenLinks) {
    lines.push(`- ${brokenLink.sourcePath} -> ${brokenLink.rawTarget} (${brokenLink.resolvedTarget})`);
  }
  return lines.join("\n");
}

function formatChangeSummary(result: SyncResult, mode: "write" | "check"): string {
  const lines = [
    `Scanned ${result.filesScanned} markdown file(s).`,
    mode === "write"
      ? `Updated ${result.filesChanged.length} file(s).`
      : `Detected ${result.filesChanged.length} file(s) that need backlink updates.`,
  ];

  if (result.filesChanged.length > 0) {
    lines.push("Changed files:");
    for (const path of result.filesChanged) {
      lines.push(`- ${path}`);
    }
  }

  const broken = formatBrokenLinks(result.brokenLinks);
  if (broken) {
    lines.push("", broken);
  }

  return lines.join("\n");
}

function parseArgs(argv: readonly string[]): ParsedArgs {
  const include: string[] = [];
  const exclude: string[] = [];
  let rootDir = process.cwd();
  let write = false;
  let check = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--write") {
      write = true;
      continue;
    }
    if (arg === "--check") {
      check = true;
      continue;
    }
    if (arg === "--cwd") {
      rootDir = argv[index + 1] ?? rootDir;
      index += 1;
      continue;
    }
    if (arg === "--include") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--include requires a pattern.");
      }
      include.push(value);
      index += 1;
      continue;
    }
    if (arg === "--exclude") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--exclude requires a pattern.");
      }
      exclude.push(value);
      index += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(`Usage: tsx sync-markdown-backlinks.ts [--write] [--check] [--cwd <path>] [--include <glob>] [--exclude <glob>]

Examples:
  tsx sync-markdown-backlinks.ts --write
  tsx sync-markdown-backlinks.ts --check --exclude ".codex/**"
  tsx sync-markdown-backlinks.ts --write --include "docs/**/*.md"
`);
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (write && check) {
    throw new Error("Use either --write or --check, not both.");
  }

  return {
    check,
    options: {
      rootDir,
      include: include.length > 0 ? include : [...DEFAULT_INCLUDE_PATTERNS],
      exclude: [...DEFAULT_EXCLUDE_PATTERNS, ...exclude],
      write,
    },
  };
}

async function main(): Promise<void> {
  const { options, check } = parseArgs(process.argv.slice(2));
  const result = await syncMarkdownBacklinks(options);
  const mode = options.write ? "write" : "check";

  console.log(formatChangeSummary(result, mode));

  if (result.brokenLinks.length > 0) {
    process.exitCode = 1;
    return;
  }

  if (check && result.filesChanged.length > 0) {
    process.exitCode = 1;
  }
}

const isMainModule =
  process.argv[1] != null && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMainModule) {
  void main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
