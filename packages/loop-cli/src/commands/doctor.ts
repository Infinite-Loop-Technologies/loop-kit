import { createKernel } from '@loop-kit/loop-kernel';
import { renderDiagnostics } from '../render/diagnostics.js';

export async function handleDoctor(options: { cwd?: string; json?: boolean }): Promise<void> {
    const kernel = createKernel({ workspaceRoot: options.cwd });
    const result = await kernel.doctor();
    if (!result.ok) {
        throw new Error(result.error.message);
    }

    if (options.json) {
        console.log(JSON.stringify(result.value, null, 2));
        return;
    }

    console.log(renderDiagnostics(result.value.diagnostics));
    if (result.value.fixPlans.length > 0) {
        console.log(`fixes: ${result.value.fixPlans.map((fix) => fix.id).join(', ')}`);
    }
}
