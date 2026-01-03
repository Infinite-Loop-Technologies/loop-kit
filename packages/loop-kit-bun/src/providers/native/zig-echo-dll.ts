import { dlopen, FFIType } from 'bun:ffi';
import path from 'node:path';

import type {
    Provider,
    CapabilityRequest,
    CapabilityResponse,
} from '../../runtime/provider';
import { ProviderTier } from '../../runtime/tiers';
import { capId } from '../../runtime/ids';

export const CAP_LOG = capId('loop', 'core', '0.1.0', 'log');
export const CAP_ECHO_BYTES = capId('loop', 'debug', '0.1.0', 'echo-bytes');

type EchoLib = {
    echo_bytes: (
        inPtr: Uint8Array,
        inLen: number,
        outPtr: Uint8Array,
        outCap: number
    ) => number;
    native_log: (level: number, msgPtr: Uint8Array, msgLen: number) => void;
};

function dllPath(): string {
    // this file is: src/providers/native/zig-echo-dll.ts
    // dll is: native/echo/echo.dll at package root
    return path.resolve(import.meta.dir, './echo/echo.dll');
}

function loadLib(): EchoLib {
    const lib = dlopen(dllPath(), {
        echo_bytes: {
            args: [FFIType.ptr, FFIType.u32, FFIType.ptr, FFIType.u32],
            returns: FFIType.u32,
        },
        native_log: {
            args: [FFIType.u32, FFIType.ptr, FFIType.u32],
            returns: FFIType.void,
        },
    });

    return lib.symbols as unknown as EchoLib;
}

export class ZigEchoDllProvider implements Provider {
    readonly tier = ProviderTier.Native;
    readonly capabilities = [CAP_LOG, CAP_ECHO_BYTES] as const;

    private lib!: EchoLib;

    constructor(public readonly id: string = 'zig-echo-dll') {}

    async init(): Promise<void> {
        this.lib = loadLib();
    }

    async handle(req: CapabilityRequest): Promise<CapabilityResponse> {
        if (req.capability === CAP_LOG) {
            const p = req.payload as any;
            const levelStr = String(p?.level ?? 'info');
            const level =
                levelStr === 'error' ? 2 : levelStr === 'warn' ? 1 : 0;

            const msg = String(p?.message ?? '');
            const msgBytes = new TextEncoder().encode(msg);
            this.lib.native_log(level, msgBytes, msgBytes.length);

            return { ok: true, value: null };
        }

        if (req.capability === CAP_ECHO_BYTES) {
            const p = req.payload as any;
            const input: Uint8Array =
                p?.bytes instanceof Uint8Array ? p.bytes : new Uint8Array();
            const out = new Uint8Array(input.length);

            const written = this.lib.echo_bytes(
                input,
                input.length,
                out,
                out.length
            );
            if (written !== input.length) {
                return {
                    ok: false,
                    error: `echo_bytes failed (${written}/${input.length})`,
                };
            }

            return { ok: true, value: { bytes: out } };
        }

        return {
            ok: false,
            error: `Unsupported capability: ${req.capability}`,
        };
    }

    async dispose(): Promise<void> {}
}
