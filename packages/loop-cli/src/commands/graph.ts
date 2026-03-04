import { createKernel } from '@loop-kit/loop-kernel';
import { renderGraphSummary } from '../render/graph.js';

export async function handleGraph(options: { cwd?: string; json?: boolean; summary?: boolean }): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.graph();
    if (!result.ok) {
        throw new Error(result.error.message);
    }

    if (options.json) {
        console.log(JSON.stringify(result.value, null, 2));
        if (options.summary) {
            console.log(renderGraphSummary(result.value));
        }
        return;
    }

    console.log(renderGraphSummary(result.value));
}
