import { createKernel } from '@loop-kit/loop-kernel';

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
        const description = component.description ? ` - ${component.description}` : '';
        console.log(`${component.id}@${component.version}${description}`);
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

    console.log(`${result.value.manifest.id}@${result.value.manifest.version}`);
    console.log(`manifest=${result.value.manifestPath}`);
    if (result.value.manifest.description) {
        console.log(result.value.manifest.description);
    }
}
