import { z } from 'zod';

export const RpcInvokeEnvelopeSchema = z.object({
    version: z.literal('1'),
    type: z.literal('invoke'),
    id: z.string().min(1),
    method: z.string().min(1),
    params: z.record(z.string(), z.unknown()).default({}),
});

export const RpcResultEnvelopeSchema = z.object({
    version: z.literal('1'),
    type: z.literal('result'),
    id: z.string().min(1),
    result: z.unknown().optional(),
    error: z.object({
        code: z.string().min(1),
        message: z.string().min(1),
        details: z.record(z.string(), z.unknown()).optional(),
    }).optional(),
});

export const RpcEventEnvelopeSchema = z.object({
    version: z.literal('1'),
    type: z.literal('event'),
    event: z.string().min(1),
    data: z.record(z.string(), z.unknown()).default({}),
});

export const RpcEnvelopeSchema = z.discriminatedUnion('type', [
    RpcInvokeEnvelopeSchema,
    RpcResultEnvelopeSchema,
    RpcEventEnvelopeSchema,
]);

export type RpcInvokeEnvelope = z.infer<typeof RpcInvokeEnvelopeSchema>;
export type RpcResultEnvelope = z.infer<typeof RpcResultEnvelopeSchema>;
export type RpcEventEnvelope = z.infer<typeof RpcEventEnvelopeSchema>;
export type RpcEnvelope = z.infer<typeof RpcEnvelopeSchema>;

export function encodeEnvelope(envelope: RpcEnvelope): string {
    return `${JSON.stringify(envelope)}\n`;
}

export function decodeEnvelope(payload: string): RpcEnvelope {
    const raw = JSON.parse(payload) as unknown;
    return RpcEnvelopeSchema.parse(raw);
}
