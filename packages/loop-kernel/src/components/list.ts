import path from 'node:path';
import fg from 'fast-glob';
import {
    ComponentManifestSchema,
    err,
    ok,
    type ComponentManifest,
    type Result,
} from '@loop-kit/loop-contracts';
import { nodeFsGateway, type FsGateway } from '../io/fsGateway.js';
import type { ListedComponent } from '../types.js';

function toListedComponent(
    workspaceRoot: string,
    manifestPath: string,
    manifest: ComponentManifest,
): ListedComponent {
    const sourceDir = path.relative(
        workspaceRoot,
        path.dirname(path.resolve(workspaceRoot, manifestPath)),
    ).replace(/\\/g, '/');
    const metadata = (manifest.metadata ?? {}) as Record<string, unknown>;
    const tagsRaw = metadata.tags;
    const tags = Array.isArray(tagsRaw)
        ? tagsRaw.filter((entry): entry is string => typeof entry === 'string')
        : undefined;

    return {
        id: manifest.id,
        manifestPath: manifestPath.replace(/\\/g, '/'),
        sourceDir,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        tags,
    };
}

export async function listWorkspaceComponents(
    workspaceRoot: string,
    options: {
        query?: string;
        fs?: FsGateway;
    } = {},
): Promise<Result<ListedComponent[]>> {
    const fs = options.fs ?? nodeFsGateway;
    const loopComponentsDir = path.join(workspaceRoot, 'loop', 'components');
    if (!(await fs.exists(loopComponentsDir))) {
        return ok([]);
    }

    const manifestPaths = await fg('**/loop.component.json', {
        cwd: loopComponentsDir,
        onlyFiles: true,
    });
    const query = options.query?.trim().toLowerCase();
    const listed: ListedComponent[] = [];

    for (const relativePath of manifestPaths) {
        const manifestPath = path.join('loop', 'components', relativePath);
        const absolutePath = path.resolve(workspaceRoot, manifestPath);
        const raw = await fs.readJson<unknown>(absolutePath);
        const parsed = ComponentManifestSchema.safeParse(raw);
        if (!parsed.success) {
            continue;
        }

        const item = toListedComponent(workspaceRoot, manifestPath, parsed.data);
        if (!query) {
            listed.push(item);
            continue;
        }

        const haystack = `${item.id} ${item.name} ${item.description ?? ''} ${(item.tags ?? []).join(' ')}`.toLowerCase();
        if (haystack.includes(query)) {
            listed.push(item);
        }
    }

    listed.sort((left, right) => left.id.localeCompare(right.id));
    return ok(listed);
}

export async function showWorkspaceComponent(
    workspaceRoot: string,
    componentId: string,
    options: {
        fs?: FsGateway;
    } = {},
): Promise<Result<{ manifestPath: string; manifest: ComponentManifest }>> {
    const fs = options.fs ?? nodeFsGateway;
    const manifestPath = path.join(workspaceRoot, 'loop', 'components', componentId, 'loop.component.json');
    if (!(await fs.exists(manifestPath))) {
        return err({
            code: 'component.not_found',
            message: `Component not found: ${componentId}`,
        });
    }

    const raw = await fs.readJson<unknown>(manifestPath);
    const parsed = ComponentManifestSchema.safeParse(raw);
    if (!parsed.success) {
        return err({
            code: 'component.invalid_manifest',
            message: `Component manifest is invalid: ${componentId}`,
            details: {
                issues: parsed.error.issues,
            },
        });
    }

    return ok({
        manifestPath: path.relative(workspaceRoot, manifestPath).replace(/\\/g, '/'),
        manifest: parsed.data,
    });
}
