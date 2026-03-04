import { z } from 'zod';
import { ComponentManifestSchema } from './manifests/component.js';
import { ModuleManifestSchema } from './manifests/module.js';
import { LoopRefSchema } from './refs.js';
import { PatchPlanSchema } from './patch-plan.js';
import { DiagnosticSchema } from './result.js';
import { TaskDefinitionSchema } from './workspace.js';

export const ProviderCapabilitySchema = z.enum(['lane-provider', 'patch-adapter', 'toolchain-adapter']);
export type ProviderCapability = z.infer<typeof ProviderCapabilitySchema>;

export const LaneResolveComponentRequestSchema = z.object({
    laneId: z.string().min(1),
    ref: LoopRefSchema,
    workspaceRoot: z.string().min(1),
});

export const LaneResolveComponentResponseSchema = z.object({
    manifest: ComponentManifestSchema,
    baseDir: z.string().min(1),
    snapshotId: z.string().min(1),
});

export const LaneResolveModuleRequestSchema = z.object({
    laneId: z.string().min(1),
    ref: LoopRefSchema,
    workspaceRoot: z.string().min(1),
});

export const LaneResolveModuleResponseSchema = z.object({
    manifest: ModuleManifestSchema,
    baseDir: z.string().min(1),
    snapshotId: z.string().min(1),
});

export const LaneAuthStatusSchema = z.object({
    laneId: z.string(),
    authenticated: z.boolean(),
    message: z.string().optional(),
});

export const PatchAdapterRequestSchema = z.object({
    workspaceRoot: z.string().min(1),
    plan: PatchPlanSchema,
    dryRun: z.boolean().default(false),
});

export const PatchAdapterResponseSchema = z.object({
    applied: z.boolean(),
    diagnostics: z.array(DiagnosticSchema).default([]),
});

export const ToolchainDetectRequestSchema = z.object({
    workspaceRoot: z.string().min(1),
});

export const ToolchainDetectResponseSchema = z.object({
    id: z.string(),
    status: z.enum(['ok', 'warning', 'error']),
    diagnostics: z.array(DiagnosticSchema).default([]),
    details: z.record(z.string(), z.unknown()).default({}),
});

export const ToolchainPlanFixRequestSchema = z.object({
    workspaceRoot: z.string().min(1),
});

export const ToolchainPlanFixResponseSchema = z.object({
    plans: z.array(PatchPlanSchema),
});

export const ToolchainRunRequestSchema = z.object({
    workspaceRoot: z.string().min(1),
    task: z.string().min(1),
});

export const ToolchainRunResponseSchema = z.object({
    success: z.boolean(),
    code: z.number().int(),
    stdout: z.string(),
    stderr: z.string(),
});

export const ToolchainDiagnoseRequestSchema = z.object({
    workspaceRoot: z.string().min(1),
});

export const ToolchainDiagnoseResponseSchema = z.object({
    id: z.string().min(1),
    diagnostics: z.array(DiagnosticSchema).default([]),
    details: z.record(z.string(), z.unknown()).default({}),
});

export const ToolchainTasksRequestSchema = z.object({
    workspaceRoot: z.string().min(1),
});

export const ToolchainTasksResponseSchema = z.object({
    id: z.string().min(1),
    tasks: z.record(z.string(), TaskDefinitionSchema).default({}),
});

export type LaneResolveComponentRequest = z.infer<typeof LaneResolveComponentRequestSchema>;
export type LaneResolveComponentResponse = z.infer<typeof LaneResolveComponentResponseSchema>;
export type LaneResolveModuleRequest = z.infer<typeof LaneResolveModuleRequestSchema>;
export type LaneResolveModuleResponse = z.infer<typeof LaneResolveModuleResponseSchema>;
export type LaneAuthStatus = z.infer<typeof LaneAuthStatusSchema>;
export type PatchAdapterRequest = z.infer<typeof PatchAdapterRequestSchema>;
export type PatchAdapterResponse = z.infer<typeof PatchAdapterResponseSchema>;
export type ToolchainDetectRequest = z.infer<typeof ToolchainDetectRequestSchema>;
export type ToolchainDetectResponse = z.infer<typeof ToolchainDetectResponseSchema>;
export type ToolchainPlanFixRequest = z.infer<typeof ToolchainPlanFixRequestSchema>;
export type ToolchainPlanFixResponse = z.infer<typeof ToolchainPlanFixResponseSchema>;
export type ToolchainRunRequest = z.infer<typeof ToolchainRunRequestSchema>;
export type ToolchainRunResponse = z.infer<typeof ToolchainRunResponseSchema>;
export type ToolchainDiagnoseRequest = z.infer<typeof ToolchainDiagnoseRequestSchema>;
export type ToolchainDiagnoseResponse = z.infer<typeof ToolchainDiagnoseResponseSchema>;
export type ToolchainTasksRequest = z.infer<typeof ToolchainTasksRequestSchema>;
export type ToolchainTasksResponse = z.infer<typeof ToolchainTasksResponseSchema>;
