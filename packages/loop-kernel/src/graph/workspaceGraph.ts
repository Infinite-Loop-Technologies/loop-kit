import path from 'node:path';
import fg from 'fast-glob';
import type { WorkspaceGraph } from '../types.js';
import { nodeFsGateway } from '../io/fsGateway.js';

export async function buildWorkspaceGraph(workspaceRoot: string): Promise<WorkspaceGraph> {
    const packageJsonFiles = await fg(['apps/*/package.json', 'packages/*/package.json'], {
        cwd: workspaceRoot,
        onlyFiles: true,
    });

    const nodes: WorkspaceGraph['nodes'] = [];
    const edges: WorkspaceGraph['edges'] = [];
    const nameToNodeId = new Map<string, string>();

    const packageJsonByNode = new Map<string, Record<string, unknown>>();

    for (const relativePath of packageJsonFiles) {
        const absolutePath = path.join(workspaceRoot, relativePath);
        const packageJson = await nodeFsGateway.readJson<Record<string, unknown>>(absolutePath);
        const name = String(packageJson.name ?? path.basename(path.dirname(relativePath)));
        const version = String(packageJson.version ?? '0.0.0');
        const kind = relativePath.startsWith('apps/') ? 'app' : 'pkg';

        nodes.push({
            id: relativePath,
            name,
            path: relativePath,
            version,
            kind,
        });

        nameToNodeId.set(name, relativePath);
        packageJsonByNode.set(relativePath, packageJson);
    }

    for (const node of nodes) {
        const packageJson = packageJsonByNode.get(node.id) ?? {};
        const sections: Array<WorkspaceGraph['edges'][number]['dependencyType']> = [
            'dependencies',
            'devDependencies',
            'peerDependencies',
            'optionalDependencies',
        ];

        for (const section of sections) {
            const deps = packageJson[section] as Record<string, string> | undefined;
            if (!deps) {
                continue;
            }

            for (const depName of Object.keys(deps)) {
                const targetId = nameToNodeId.get(depName);
                if (!targetId) {
                    continue;
                }

                edges.push({
                    from: node.id,
                    to: targetId,
                    dependencyType: section,
                });
            }
        }
    }

    return {
        nodes,
        edges,
    };
}
