import { describe, test, expect } from 'bun:test';

import { LoopRuntime } from '../src/runtime/runtime';
import {
    ZigEchoDllProvider,
    CAP_ECHO_BYTES,
    CAP_LOG,
} from '../src/providers/native/zig-echo-dll';

// Pretty-print a small byte preview for debugging.
function hexPreview(bytes: Uint8Array, max = 32): string {
    const n = Math.min(bytes.length, max);
    const head = Array.from(bytes.slice(0, n))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ');
    const suffix = bytes.length > n ? ` …(+${bytes.length - n} bytes)` : '';
    return `${head}${suffix}`;
}

// Stronger equality check than Array.from compare (still simple).
function expectSameBytes(a: Uint8Array, b: Uint8Array) {
    expect(b.length).toBe(a.length);
    // Bun/Node supports Buffer.compare; but keep it pure Uint8Array.
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            throw new Error(`Byte mismatch at index ${i}: ${a[i]} != ${b[i]}`);
        }
    }
}

function fnv1a32(bytes: Uint8Array): number {
    let h = 0x811c9dc5;
    for (const b of bytes) {
        h ^= b;
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

describe('loop runtime + native zig dll provider', () => {
    test('Native log provider works (smoke)', async () => {
        const rt = new LoopRuntime();
        await rt.addProvider(new ZigEchoDllProvider());

        const res = await rt.call({
            capability: CAP_LOG,
            payload: { level: 'warn', message: 'native hello' },
        });

        expect(res.ok).toBe(true);
        await rt.shutdown();
    });

    test('Native echo-bytes roundtrip (robust)', async () => {
        const rt = new LoopRuntime();
        await rt.addProvider(new ZigEchoDllProvider());

        const cases: Uint8Array[] = [
            new Uint8Array([]),
            new TextEncoder().encode('hello loop-kit'),
            (() => {
                const bytes = new Uint8Array(256);
                for (let i = 0; i < bytes.length; i++) bytes[i] = i & 0xff;
                return bytes;
            })(),
            (() => {
                // Non power-of-two, with some pattern
                const bytes = new Uint8Array(313);
                for (let i = 0; i < bytes.length; i++)
                    bytes[i] = (i * 17 + 3) & 0xff;
                return bytes;
            })(),
        ];

        for (const input of cases) {
            const res = await rt.call({
                capability: CAP_ECHO_BYTES,
                payload: { bytes: input },
            });

            expect(res.ok).toBe(true);
            if (!res.ok) continue;

            const out = (res.value as any).bytes as Uint8Array;

            // Debug logs you can keep or remove later.
            console.log(
                `[echo] in=${input.length} out=${out.length} inHex=${hexPreview(
                    input
                )} outHex=${hexPreview(out)}`
            );

            expect(out).toBeInstanceOf(Uint8Array);
            expectSameBytes(input, out);

            // A little extra santiy
            console.log(
                `[echo-hash] len=${input.length} in=${fnv1a32(input).toString(
                    16
                )} out=${fnv1a32(out).toString(16)}`
            );
        }

        await rt.shutdown();
    });
});
