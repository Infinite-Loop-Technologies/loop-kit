import { z } from 'zod';

export const ModuleCapabilitySchema = z.object({
    kind: z.enum(['lane-provider', 'patch-adapter', 'toolchain-adapter']),
    id: z.string().min(1),
    description: z.string().optional(),
});

export const ModuleManifestSchema = z.object({
    schemaVersion: z.literal('1'),
    kind: z.literal('module'),
    id: z.string().min(1),
    name: z.string().min(1),
    version: z.string().min(1),
    entry: z.string().min(1),
    provides: z.array(ModuleCapabilitySchema).default([]),
    configSchema: z.union([z.string().url(), z.record(z.string(), z.unknown())]).optional(),
    permissions: z.array(z.string()).default([]),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ModuleCapability = z.infer<typeof ModuleCapabilitySchema>;
export type ModuleManifest = z.infer<typeof ModuleManifestSchema>;
