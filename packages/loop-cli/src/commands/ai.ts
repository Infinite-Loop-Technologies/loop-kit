import path from 'node:path';
import { runAiDoctor } from '@loop-kit/loop-ai';

export async function handleAiDoctor(options: {
    cwd?: string;
    apply?: boolean;
    json?: boolean;
}): Promise<void> {
    const workspaceRoot = path.resolve(options.cwd ?? process.cwd());
    const result = await runAiDoctor(workspaceRoot, {
        apply: options.apply,
    });

    if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }

    console.log(`diagnostics=${result.diagnostics.length}`);
    console.log(`safeFixes=${result.safeFixIds.join(', ') || 'none'}`);
    console.log(`applied=${result.applied} executionCount=${result.executionCount}`);
}
