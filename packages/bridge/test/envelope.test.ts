import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    decodeEnvelope,
    encodeEnvelope,
    RpcEnvelopeSchema,
} from '../src/index.js';

test('envelope codec roundtrip', () => {
    const original = {
        version: '1' as const,
        type: 'invoke' as const,
        id: 'req-1',
        method: 'host.ping',
        params: { value: 'pong?' },
    };
    const encoded = encodeEnvelope(original);
    const decoded = decodeEnvelope(encoded.trim());
    assert.deepEqual(decoded, original);
    assert.equal(RpcEnvelopeSchema.safeParse(decoded).success, true);
});
