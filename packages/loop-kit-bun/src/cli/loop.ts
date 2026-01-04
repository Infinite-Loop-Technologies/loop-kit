#!/usr/bin/env bun
import type { CapabilityResponse } from '../runtime/provider';

import { LoopRuntime } from '../runtime/runtime';
import { JsLogProvider } from '../providers/js/log';
import { JsClockProvider } from '../providers/js/clock';
import { JsEventsProvider } from '../providers/js/events';
import { ZigEchoDllProvider, CAP_LOG } from '../providers/native/zig-echo-dll';
import { capId } from '../runtime/ids';

const CAP_CLI_PRINT = capId('loop', 'cli', '0.1.0', 'print');

class CliPrintProvider {
    readonly id = 'cli-print';
    readonly tier = 'js' as const;
    readonly capabilities = [CAP_CLI_PRINT] as const;

    async init() {}

    async handle(req: any): Promise<CapabilityResponse> {
        if (req.capability !== CAP_CLI_PRINT)
            return { ok: false, error: 'Unsupported' };
        const p = req.payload as any;
        const text = String(p?.text ?? '');
        const stream = String(p?.stream ?? 'stdout');
        if (stream === 'stderr') console.error(text);
        else console.log(text);
        return { ok: true, value: null };
    }

    async dispose() {}
}

async function main() {
    const rt = new LoopRuntime();

    // “Built-ins” (for now)
    await rt.addProvider(new JsLogProvider());
    await rt.addProvider(new JsClockProvider());
    await rt.addProvider(new JsEventsProvider());
    await rt.addProvider(new CliPrintProvider() as any); // (optional) make a tiny Provider type for this, later

    // Native DLL provider
    await rt.addProvider(new ZigEchoDllProvider());

    const [, , cmd, ...rest] = Bun.argv;

    if (!cmd || cmd === 'help') {
        await rt.call({
            capability: CAP_CLI_PRINT,
            payload: { text: 'loop: commands: ping | echo | tui' },
        });
        await rt.shutdown();
        return;
    }

    if (cmd === 'ping') {
        // Prove native log provider works from CLI:
        await rt.call({
            capability: CAP_LOG,
            payload: { level: 'warn', message: 'hello from loop ping' },
        });
        await rt.shutdown();
        return;
    }

    if (cmd === 'echo') {
        const text = rest.join(' ');
        const bytes = new TextEncoder().encode(text);
        const res = await rt.call({
            capability: capId('loop', 'debug', '0.1.0', 'echo-bytes'),
            payload: { bytes },
        });
        if (res.ok) {
            const out = (res.value as any).bytes as Uint8Array;
            await rt.call({
                capability: CAP_CLI_PRINT,
                payload: { text: new TextDecoder().decode(out) },
            });
        } else {
            await rt.call({
                capability: CAP_CLI_PRINT,
                payload: { stream: 'stderr', text: res.error },
            });
            process.exitCode = 1;
        }
        await rt.shutdown();
        return;
    }

    if (cmd === 'tui') {
        // Later: invoke your opentui-react entry here (or as a provider).
        await rt.call({
            capability: CAP_CLI_PRINT,
            payload: { text: 'tui mode not wired yet' },
        });
        await rt.shutdown();
        return;
    }

    await rt.call({
        capability: CAP_CLI_PRINT,
        payload: { stream: 'stderr', text: `Unknown command: ${cmd}` },
    });
    process.exitCode = 1;
    await rt.shutdown();
}

await main();
