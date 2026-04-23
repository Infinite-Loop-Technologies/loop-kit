import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { BasicDockDemo } from "../items/dock/basic/demo/BasicDockDemo"
import { FloatingWindowDockDemo } from "../items/dock/floating-window/demo/FloatingWindowDockDemo"
import { ModalShellDockDemo } from "../items/dock/modal-shell/demo/ModalShellDockDemo"
import { PanelGroupDockDemo } from "../items/dock/panel-group/demo/PanelGroupDockDemo"
import { RuntimeProviderDemo } from "../items/common/runtime-provider/demo/RuntimeProviderDemo"
import { UseStoreDemo } from "../items/common/use-store/demo/UseStoreDemo"
import { UseInteractionTargetDemo } from "../items/interaction/use-interaction-target/demo/UseInteractionTargetDemo"

export type RegistryFile = {
  path: string
  content: string
}

export type RegistryItemSummary = {
  id: string
  name: string
  title: string
  category: string
  type: string
  description: string
  dependencies: string[]
  tags: string[]
}

export type RegistryItemDetail = RegistryItemSummary & {
  readme: string
  files: RegistryFile[]
  demoFiles: RegistryFile[]
}

export type RegistryCategorySummary = {
  slug: string
  name: string
  description: string
  count: number
}

type RegistryItemFileDefinition = {
  path: string
  type: string
  target?: string
}

type RegistryItemDefinition = {
  $schema: string
  name: string
  type: string
  title: string
  description: string
  author?: string
  dependencies?: string[]
  devDependencies?: string[]
  registryDependencies?: string[]
  files: RegistryItemFileDefinition[]
  categories?: string[]
  meta?: {
    id?: string
    tags?: string[]
  }
}

const categoryDescriptions: Record<string, string> = {
  dock: "Dock-focused installable building blocks and UI source.",
}

const sourceRoot = path.dirname(fileURLToPath(import.meta.url))
const registryRoot = path.resolve(sourceRoot, "..")
const repoRoot = path.resolve(registryRoot, "..")
const itemsRoot = path.join(registryRoot, "items")

const demos: Record<string, React.ComponentType> = {
  "dock/basic": BasicDockDemo,
  "dock/panel-group": PanelGroupDockDemo,
  "dock/floating-window": FloatingWindowDockDemo,
  "dock/modal-shell": ModalShellDockDemo,
  "interaction/use-interaction-target": UseInteractionTargetDemo,
  "common/use-store": UseStoreDemo,
  "common/runtime-provider": RuntimeProviderDemo,
}

async function readText(filePath: string) {
  return fs.readFile(filePath, "utf8")
}

async function readSourceDir(dirPath: string) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile())
        .map(async (entry) => ({
          path: entry.name,
          content: await readText(path.join(dirPath, entry.name)),
        }))
    )

    return files.sort((a, b) => a.path.localeCompare(b.path))
  } catch {
    return []
  }
}

async function listCategoryFolders() {
  const entries = await fs.readdir(itemsRoot, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

async function listItemDirectories(category: string) {
  const categoryRoot = path.join(itemsRoot, category)
  const entries = await fs.readdir(categoryRoot, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

async function readItemDefinition(category: string, slug: string): Promise<RegistryItemDefinition> {
  const itemPath = path.join(itemsRoot, category, slug, "item.json")
  return JSON.parse(await readText(itemPath)) as RegistryItemDefinition
}

function toSummary(category: string, definition: RegistryItemDefinition): RegistryItemSummary {
  return {
    id: definition.meta?.id ?? `${category}/${definition.name}`,
    name: definition.name,
    title: definition.title,
    category: definition.categories?.[0] ?? category,
    type: definition.type,
    description: definition.description,
    dependencies: definition.dependencies ?? [],
    tags: definition.meta?.tags ?? [],
  }
}

export async function getRegistryCategories(): Promise<RegistryCategorySummary[]> {
  const categories = await listCategoryFolders()

  return Promise.all(
    categories.map(async (category) => ({
      slug: category,
      name: category,
      description: categoryDescriptions[category] ?? "Local installable source items.",
      count: (await listItemDirectories(category)).length,
    }))
  )
}

export async function getRegistryItems(): Promise<RegistryItemSummary[]> {
  const categories = await listCategoryFolders()
  const items: RegistryItemSummary[] = []

  for (const category of categories) {
    const slugs = await listItemDirectories(category)
    for (const slug of slugs) {
      items.push(toSummary(category, await readItemDefinition(category, slug)))
    }
  }

  return items.sort((a, b) => a.title.localeCompare(b.title))
}

export async function getRegistryItemsByCategory(category: string) {
  const items = await getRegistryItems()
  return items.filter((item) => item.category === category)
}

export async function getRegistryItem(category: string, slug: string): Promise<RegistryItemDetail | null> {
  try {
    const basePath = path.join(itemsRoot, category, slug)
    const [definition, readme, files, demoFiles] = await Promise.all([
      readItemDefinition(category, slug),
      readText(path.join(basePath, "README.md")),
      readSourceDir(path.join(basePath, "files")),
      readSourceDir(path.join(basePath, "demo")),
    ])

    return {
      ...toSummary(category, definition),
      readme,
      files,
      demoFiles,
    }
  } catch {
    return null
  }
}

export async function getRegistryManifest() {
  const items = await getRegistryItems()

  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "dockyard",
    homepage: "https://dockyard.vercel.app",
    items: await Promise.all(
      items.map(async (item) => readItemDefinition(item.category, item.name))
    ),
  }
}

export async function getRegistryItemManifest(category: string, slug: string) {
  const definition = await readItemDefinition(category, slug)

  return {
    ...definition,
    files: await Promise.all(
      definition.files.map(async (file) => ({
        ...file,
        content: await readText(path.join(repoRoot, file.path)),
      }))
    ),
  }
}

export function getRegistryDemoComponent(itemId: string) {
  return demos[itemId] ?? null
}
