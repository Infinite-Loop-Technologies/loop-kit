import { z } from 'zod';

export const InstalledComponentRecordSchema = z.object({
    componentId: z.string().min(1),
    laneId: z.string().min(1),
    ref: z.string().min(1),
    snapshotId: z.string().min(1),
    targetPath: z.string().min(1),
    installedAt: z.string().min(1),
    ignoreGlobs: z.array(z.string()).default([]),
    managedFiles: z.array(z.object({
        path: z.string().min(1),
        sha256: z.string().min(1),
        mtimeMs: z.number(),
    })).default([]),
});

export const ComponentLockfileSchema = z.object({
    schemaVersion: z.literal('1'),
    installs: z.array(InstalledComponentRecordSchema).default([]),
});

export type InstalledComponentRecord = z.infer<typeof InstalledComponentRecordSchema>;
export type ComponentLockfile = z.infer<typeof ComponentLockfileSchema>;
