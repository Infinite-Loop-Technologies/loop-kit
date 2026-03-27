type PackageJson = {
    name?: string;
    workspaces?: string[];
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
};

export type WorkspaceManifest = {
    dir: string;
    name: string;
    scripts: string[];
    workspaceDeps: string[];
};

function isRecord(value: unknown): value is Record<string, string> {
    return typeof value === 'object' && value !== null;
}

function collectWorkspaceDeps(pkg: PackageJson, workspaceNames: Set<string>): string[] {
    const deps = new Set<string>();

    for (const field of [pkg.dependencies, pkg.devDependencies]) {
        if (!isRecord(field)) {
            continue;
        }

        for (const name of Object.keys(field)) {
            if (workspaceNames.has(name)) {
                deps.add(name);
            }
        }
    }

    return [...deps];
}

export function orderWorkspacesForTask(manifests: WorkspaceManifest[], task: string): WorkspaceManifest[] {
    const selected = manifests.filter((manifest) => manifest.scripts.includes(task));
    const byName = new Map(selected.map((manifest) => [manifest.name, manifest]));
    const incoming = new Map<string, number>();
    const dependents = new Map<string, string[]>();

    for (const manifest of selected) {
        incoming.set(manifest.name, 0);
        dependents.set(manifest.name, []);
    }

    for (const manifest of selected) {
        for (const dep of manifest.workspaceDeps) {
            if (!byName.has(dep)) {
                continue;
            }

            incoming.set(manifest.name, (incoming.get(manifest.name) ?? 0) + 1);
            dependents.get(dep)?.push(manifest.name);
        }
    }

    const queue = selected
        .filter((manifest) => (incoming.get(manifest.name) ?? 0) === 0)
        .sort((left, right) => left.dir.localeCompare(right.dir));
    const ordered: WorkspaceManifest[] = [];

    while (queue.length > 0) {
        const next = queue.shift();
        if (!next) {
            break;
        }

        ordered.push(next);

        for (const dependentName of dependents.get(next.name) ?? []) {
            const nextCount = (incoming.get(dependentName) ?? 0) - 1;
            incoming.set(dependentName, nextCount);

            if (nextCount === 0) {
                const dependent = byName.get(dependentName);
                if (dependent) {
                    queue.push(dependent);
                    queue.sort((left, right) => left.dir.localeCompare(right.dir));
                }
            }
        }
    }

    if (ordered.length !== selected.length) {
        throw new Error(`Workspace dependency cycle detected while planning "${task}".`);
    }

    return ordered;
}

async function loadWorkspaces(cwd: string): Promise<WorkspaceManifest[]> {
    const root = (await Bun.file(`${cwd}/package.json`).json()) as PackageJson;
    const patterns = root.workspaces ?? [];
    const packagePaths = new Set<string>();

    for (const pattern of patterns) {
        const glob = new Bun.Glob(`${pattern}/package.json`);
        for await (const path of glob.scan({ cwd })) {
            packagePaths.add(path);
        }
    }

    const rawPackages = await Promise.all(
        [...packagePaths]
            .sort()
            .map(async (packagePath) => {
                const pkg = (await Bun.file(packagePath).json()) as PackageJson;
                const dir = packagePath.slice(0, -'/package.json'.length).replaceAll('\\', '/');

                return {
                    dir,
                    name: pkg.name ?? dir,
                    scripts: Object.keys(pkg.scripts ?? {}).sort(),
                    pkg,
                };
            }),
    );

    const workspaceNames = new Set(rawPackages.map((entry) => entry.name));

    return rawPackages.map(({ dir, name, scripts, pkg }) => ({
        dir,
        name,
        scripts,
        workspaceDeps: collectWorkspaceDeps(pkg, workspaceNames),
    }));
}

async function runTask(task: string, cwd: string) {
    const manifests = await loadWorkspaces(cwd);
    const ordered = orderWorkspacesForTask(manifests, task);

    if (ordered.length === 0) {
        console.log(`No workspace scripts found for "${task}".`);
        return;
    }

    for (const manifest of ordered) {
        console.log(`\n> ${manifest.name} :: ${task}`);
        const proc = Bun.spawn(['bun', 'run', task], {
            cwd: `${cwd}/${manifest.dir}`,
            stdin: 'inherit',
            stdout: 'inherit',
            stderr: 'inherit',
        });

        const exitCode = await proc.exited;
        if (exitCode !== 0) {
            throw new Error(`${manifest.name} failed running "${task}" with exit code ${exitCode}.`);
        }
    }
}

async function listWorkspaces(cwd: string) {
    const manifests = await loadWorkspaces(cwd);

    for (const manifest of manifests) {
        const scripts = manifest.scripts.length > 0 ? manifest.scripts.join(', ') : '(no scripts)';
        console.log(`${manifest.name} :: ${manifest.dir}`);
        console.log(`  scripts: ${scripts}`);
    }
}

async function main() {
    const cwd = process.cwd().replaceAll('\\', '/');
    const command = Bun.argv[2];

    if (!command) {
        throw new Error('Usage: bun tools/workspace.ts <list|build|typecheck>');
    }

    if (command === 'list') {
        await listWorkspaces(cwd);
        return;
    }

    await runTask(command, cwd);
}

if (import.meta.main) {
    await main();
}
