import { createKernel } from '@loop-kit/loop-kernel';
import { renderExecution } from '../render/plans.js';

export async function handleInit(options: { cwd?: string; dir?: string; template?: string }): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.init({ dir: options.dir, template: options.template });
    if (!result.ok) {
        throw new Error(result.error.message);
    }

    console.log(renderExecution(result.value));
}
