import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

export async function handleRequest(options: {
    cwd?: string;
    type?: string;
    from?: string;
    output?: string;
}): Promise<void> {
    const workspaceRoot = path.resolve(options.cwd ?? process.cwd());
    const outputPath = path.resolve(workspaceRoot, options.output ?? path.join('loop', 'requests', `${Date.now()}-request.json`));
    const payload = {
        schemaVersion: '1',
        kind: options.type ?? 'component-change',
        from: options.from ?? 'unknown',
        createdAt: new Date().toISOString(),
        status: 'draft',
    };
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    console.log(`request=${path.relative(workspaceRoot, outputPath).replace(/\\/g, '/')}`);
}
