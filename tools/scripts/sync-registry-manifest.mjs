import { promises as fs } from "node:fs"
import path from "node:path"

const repoRoot = process.cwd()
const itemsRoot = path.join(repoRoot, "registry", "items")
const manifestPath = path.join(repoRoot, "registry", "manifests", "registry.json")

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const results = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...(await walk(fullPath)))
      continue
    }

    if (entry.name === "item.json") {
      results.push(fullPath)
    }
  }

  return results
}

const itemFiles = await walk(itemsRoot)
const items = []

for (const itemFile of itemFiles) {
  const raw = await fs.readFile(itemFile, "utf8")
  const item = JSON.parse(raw)
  items.push({
    name: item.slug,
    type: "registry:block",
    title: item.name,
    description: item.summary,
    category: item.category,
    path: path.relative(repoRoot, itemFile).replaceAll("\\", "/"),
  })
}

const manifest = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "dockyard",
  homepage: "https://dockyard.vercel.app",
  items,
}

await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8")
