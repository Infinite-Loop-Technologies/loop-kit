import { z } from 'zod';
import { PatchPlanSchema } from '../patch-plan.js';

export const ComponentFileEntrySchema = z.object({
    source: z.string().min(1),
    target: z.string().min(1),
});

export const ComponentDependencySchema = z.object({
    name: z.string().min(1),
    version: z.string().min(1),
    type: z.enum(['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']).default('dependencies'),
});

export const ComponentManifestSchema = z.object({
    schemaVersion: z.literal('1'),
    kind: z.literal('component'),
    id: z.string().min(1),
    name: z.string().min(1),
    version: z.string().min(1),
    description: z.string().optional(),
    snapshot: z.string().optional(),
    files: z.array(ComponentFileEntrySchema).default([]),
    patches: z.array(PatchPlanSchema).default([]),
    dependencies: z.array(ComponentDependencySchema).default([]),
    targets: z.array(z.enum(['app', 'pkg'])).default(['app', 'pkg']),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ComponentFileEntry = z.infer<typeof ComponentFileEntrySchema>;
export type ComponentDependency = z.infer<typeof ComponentDependencySchema>;
export type ComponentManifest = z.infer<typeof ComponentManifestSchema>;
