import { z } from 'zod';

export const PatchConditionSchema = z.object({
    kind: z.string().min(1),
    description: z.string().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
});

export const EnsureDependencyOperationSchema = z.object({
    kind: z.literal('ensureDependency'),
    opId: z.string().min(1),
    packageJsonPath: z.string().min(1),
    dependencyType: z.enum(['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']),
    name: z.string().min(1),
    version: z.string().min(1),
});

export const EnsureExportsEntryOperationSchema = z.object({
    kind: z.literal('ensureExportsEntry'),
    opId: z.string().min(1),
    packageJsonPath: z.string().min(1),
    exportPath: z.string().min(1),
    value: z.union([z.string(), z.record(z.string(), z.unknown())]),
});

export const EnsureTsconfigExtendsOperationSchema = z.object({
    kind: z.literal('ensureTsconfigExtends'),
    opId: z.string().min(1),
    tsconfigPath: z.string().min(1),
    extendsPath: z.string().min(1),
});

export const EnsureFileOperationSchema = z.object({
    kind: z.literal('ensureFile'),
    opId: z.string().min(1),
    path: z.string().min(1),
    content: z.string(),
    overwrite: z.boolean().default(false),
});

export const EnsureSentinelBlockOperationSchema = z.object({
    kind: z.literal('ensureSentinelBlock'),
    opId: z.string().min(1),
    path: z.string().min(1),
    sentinelId: z.string().min(1),
    content: z.string(),
    mode: z.enum(['append', 'replace']).default('replace'),
});

export const ApplyJsonMergePatchOperationSchema = z.object({
    kind: z.literal('applyJsonMergePatch'),
    opId: z.string().min(1),
    path: z.string().min(1),
    patch: z.record(z.string(), z.unknown()),
});

export const ApplyUnifiedDiffOperationSchema = z.object({
    kind: z.literal('applyUnifiedDiff'),
    opId: z.string().min(1),
    path: z.string().min(1),
    diff: z.string().min(1),
});

export const TsEnsureImportAndWrapReactRootOperationSchema = z.object({
    kind: z.literal('tsEnsureImportAndWrapReactRoot'),
    opId: z.string().min(1),
    path: z.string().min(1),
    importSource: z.string().min(1),
    importName: z.string().min(1),
    wrapperName: z.string().min(1),
});

export const PatchOperationSchema = z.discriminatedUnion('kind', [
    EnsureDependencyOperationSchema,
    EnsureExportsEntryOperationSchema,
    EnsureTsconfigExtendsOperationSchema,
    EnsureFileOperationSchema,
    EnsureSentinelBlockOperationSchema,
    ApplyJsonMergePatchOperationSchema,
    ApplyUnifiedDiffOperationSchema,
    TsEnsureImportAndWrapReactRootOperationSchema,
]);

export const PatchPlanSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    provenance: z.object({
        source: z.string().min(1),
        snapshotId: z.string().optional(),
        componentId: z.string().optional(),
    }),
    operations: z.array(PatchOperationSchema),
    preconditions: z.array(PatchConditionSchema).default([]),
    postconditions: z.array(PatchConditionSchema).default([]),
});

export const OperationResultSchema = z.object({
    opId: z.string(),
    status: z.enum(['applied', 'noop', 'failed']),
    changedFiles: z.array(z.string()).default([]),
    diagnostics: z.array(z.object({
        id: z.string(),
        severity: z.enum(['info', 'warning', 'error']),
        message: z.string(),
        evidence: z.record(z.string(), z.unknown()).optional(),
        suggestedFixIds: z.array(z.string()).optional(),
    })).default([]),
    diff: z.string().optional(),
});

export type PatchCondition = z.infer<typeof PatchConditionSchema>;
export type EnsureDependencyOperation = z.infer<typeof EnsureDependencyOperationSchema>;
export type EnsureExportsEntryOperation = z.infer<typeof EnsureExportsEntryOperationSchema>;
export type EnsureTsconfigExtendsOperation = z.infer<typeof EnsureTsconfigExtendsOperationSchema>;
export type EnsureFileOperation = z.infer<typeof EnsureFileOperationSchema>;
export type EnsureSentinelBlockOperation = z.infer<typeof EnsureSentinelBlockOperationSchema>;
export type ApplyJsonMergePatchOperation = z.infer<typeof ApplyJsonMergePatchOperationSchema>;
export type ApplyUnifiedDiffOperation = z.infer<typeof ApplyUnifiedDiffOperationSchema>;
export type TsEnsureImportAndWrapReactRootOperation = z.infer<typeof TsEnsureImportAndWrapReactRootOperationSchema>;
export type PatchOperation = z.infer<typeof PatchOperationSchema>;
export type PatchPlan = z.infer<typeof PatchPlanSchema>;
export type OperationResult = z.infer<typeof OperationResultSchema>;
