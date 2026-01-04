import { test, expect } from 'bun:test';

test('loop cli: echo roundtrip', async () => {
    const proc = Bun.spawn(['bun', 'run', './src/cli/loop.ts', 'echo', 'hi'], {
        stdout: 'pipe',
        stderr: 'pipe',
    });

    const out = await new Response(proc.stdout).text();
    const err = await new Response(proc.stderr).text();
    const code = await proc.exited;

    expect(code).toBe(0);
    expect(err.trim()).toBe('');
    expect(out.trim()).toBe('hi');
});
