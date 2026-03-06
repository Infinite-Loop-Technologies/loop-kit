import { api } from "@nitric/sdk";

type ArtifactKind = "component" | "module" | "bundle";

interface RegistryArtifact {
  kind: ArtifactKind;
  name: string;
  version: string;
  createdAt: string;
}

const VALID_KINDS: ArtifactKind[] = ["component", "module", "bundle"];
const registry = new Map<string, RegistryArtifact>();

const registryApi = api("loop-registry");

function isArtifactKind(value: string): value is ArtifactKind {
  return VALID_KINDS.includes(value as ArtifactKind);
}

function artifactKey(kind: ArtifactKind, name: string, version: string): string {
  return `${kind}:${name}:${version}`;
}

registryApi.get("/health", async (ctx) => {
  ctx.res.status = 200;
  ctx.res.body = {
    ok: true,
    service: "loop-registry",
  };

  return ctx;
});

registryApi.get("/registry", async (ctx) => {
  ctx.res.status = 200;
  ctx.res.body = {
    count: registry.size,
    items: Array.from(registry.values()),
  };

  return ctx;
});

registryApi.get("/registry/:kind", async (ctx) => {
  const kind = ctx.req.params.kind ?? "";

  if (!isArtifactKind(kind)) {
    ctx.res.status = 400;
    ctx.res.body = {
      error: "kind must be one of component, module, bundle",
    };
    return ctx;
  }

  const items = Array.from(registry.values()).filter((item) => item.kind === kind);

  ctx.res.status = 200;
  ctx.res.body = {
    kind,
    count: items.length,
    items,
  };

  return ctx;
});

registryApi.post("/registry/:kind/:name/:version", async (ctx) => {
  const kind = ctx.req.params.kind ?? "";
  const name = ctx.req.params.name ?? "";
  const version = ctx.req.params.version ?? "";

  if (!isArtifactKind(kind)) {
    ctx.res.status = 400;
    ctx.res.body = {
      error: "kind must be one of component, module, bundle",
    };
    return ctx;
  }

  if (!name || !version) {
    ctx.res.status = 400;
    ctx.res.body = {
      error: "name and version are required route params",
    };
    return ctx;
  }

  const artifact: RegistryArtifact = {
    kind,
    name,
    version,
    createdAt: new Date().toISOString(),
  };

  registry.set(artifactKey(kind, name, version), artifact);

  ctx.res.status = 201;
  ctx.res.body = artifact;

  return ctx;
});
