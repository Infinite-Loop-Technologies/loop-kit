import { createKernel } from '@loop-kit/loop-kernel';
import type { ListedComponent } from '@loop-kit/loop-kernel';
import type { ComponentManifest } from '@loop-kit/loop-contracts';

type CommandHints = {
    addDev: string;
    addDist: string;
    showDev: string;
};

function readMetadataString(
    metadata: Record<string, unknown> | undefined,
    key: string,
): string | null {
    const value = metadata?.[key];
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function readMetadataStringArray(
    metadata: Record<string, unknown> | undefined,
    key: string,
): string[] {
    const raw = metadata?.[key];
    if (!Array.isArray(raw)) {
        return [];
    }
    return raw.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

function readLocalCommandHints(metadata: Record<string, unknown> | undefined): Partial<CommandHints> {
    const raw = metadata?.localCommands;
    if (!raw || typeof raw !== 'object') {
        return {};
    }
    const obj = raw as Record<string, unknown>;
    const hints: Partial<CommandHints> = {};
    if (typeof obj.addDev === 'string' && obj.addDev.trim().length > 0) {
        hints.addDev = obj.addDev.trim();
    }
    if (typeof obj.addDist === 'string' && obj.addDist.trim().length > 0) {
        hints.addDist = obj.addDist.trim();
    }
    if (typeof obj.show === 'string' && obj.show.trim().length > 0) {
        hints.showDev = obj.show.trim();
    }
    return hints;
}

function defaultTargetHint(targets: readonly ('app' | 'pkg')[]): string {
    if (targets.length === 1 && targets[0] === 'pkg') {
        return 'packages/my-package';
    }
    return 'apps/ui-demo';
}

export function buildLocalCommandHints(
    componentId: string,
    targets: readonly ('app' | 'pkg')[],
    metadata: Record<string, unknown> | undefined,
): CommandHints {
    const local = readLocalCommandHints(metadata);
    const targetHint = readMetadataString(metadata, 'targetHint') ?? defaultTargetHint(targets);

    return {
        addDev:
            local.addDev ??
            `pnpm run loop:dev add local:${componentId} --to ${targetHint} --cwd .`,
        addDist:
            local.addDist ??
            `node packages/loop-cli/dist/cli.js add local:${componentId} --to ${targetHint} --cwd .`,
        showDev:
            local.showDev ??
            `pnpm run loop:dev component show ${componentId} --cwd .`,
    };
}

function printListComponent(component: ListedComponent): void {
    const targets = component.targets.join(',');
    console.log(`${component.id}@${component.version} [${targets}]`);
    if (component.description) {
        console.log(`  ${component.description}`);
    }
    if (component.tags && component.tags.length > 0) {
        console.log(`  tags: ${component.tags.join(', ')}`);
    }

    const source = readMetadataString(component.metadata, 'source');
    if (source) {
        console.log(`  source: ${source}`);
    }

    console.log(`  files: ${component.fileCount} | deps: ${component.dependencyCount}`);
    const hints = buildLocalCommandHints(component.id, component.targets, component.metadata);
    console.log(`  add (loop:dev): ${hints.addDev}`);
    console.log(`  add (local dist): ${hints.addDist}`);
}

function printShowComponent(manifestPath: string, manifest: ComponentManifest): void {
    const metadata = manifest.metadata as Record<string, unknown> | undefined;
    console.log(`${manifest.id}@${manifest.version}`);
    console.log(`manifest=${manifestPath}`);
    console.log(`targets=${manifest.targets.join(',')}`);
    if (manifest.description) {
        console.log(manifest.description);
    }

    const tags = readMetadataStringArray(metadata, 'tags');
    if (tags.length > 0) {
        console.log(`tags=${tags.join(',')}`);
    }

    const source = readMetadataString(metadata, 'source');
    if (source) {
        console.log(`source=${source}`);
    }

    console.log(`files=${manifest.files.length}`);
    console.log(`dependencies=${manifest.dependencies.length}`);
    const hints = buildLocalCommandHints(manifest.id, manifest.targets, metadata);
    console.log(`hint.add.loopDev=${hints.addDev}`);
    console.log(`hint.add.localDist=${hints.addDist}`);
    console.log(`hint.show.loopDev=${hints.showDev}`);
}

export async function handleComponentList(options: {
    cwd?: string;
    query?: string;
    json?: boolean;
}): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.listComponents({
        query: options.query,
    });
    if (!result.ok) {
        throw new Error(result.error.message);
    }

    if (options.json) {
        console.log(JSON.stringify(result.value, null, 2));
        return;
    }

    if (result.value.length === 0) {
        console.log('No components found.');
        return;
    }

    for (const component of result.value) {
        printListComponent(component);
    }
}

export async function handleComponentShow(
    componentId: string,
    options: {
        cwd?: string;
        json?: boolean;
    },
): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.showComponent(componentId);
    if (!result.ok) {
        throw new Error(result.error.message);
    }

    if (options.json) {
        console.log(JSON.stringify(result.value, null, 2));
        return;
    }

    printShowComponent(result.value.manifestPath, result.value.manifest);
}
