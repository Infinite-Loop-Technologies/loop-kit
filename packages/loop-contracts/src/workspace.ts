import { z } from 'zod';

const REF_KINDS = ['local', 'file', 'git', 'http', 'loop', 'npm'] as const;

export const WorkspaceSettingsSchema = z.object({
    name: z.string().min(1).default('loop-workspace'),
    appsDir: z.string().default('apps'),
    packagesDir: z.string().default('packages'),
    assetsDir: z.string().default('assets'),
    toolsDir: z.string().default('tools'),
    loopDir: z.string().default('loop'),
});

export const LaneConfigSchema = z.object({
    id: z.string().min(1),
    kind: z.string().min(1),
    config: z.record(z.string(), z.unknown()).default({}),
}).strict();

export const LegacyLaneConfigSchema = z.object({
    id: z.string().min(1),
    kind: z.string().min(1),
    options: z.record(z.string(), z.unknown()).default({}),
}).strict();

export const LaneInstanceSchema = z.object({
    kind: z.string().min(1),
    config: z.record(z.string(), z.unknown()).default({}),
}).strict();

export const LoopDefaultsSchema = z.object({
    componentLane: z.string().min(1).optional(),
    moduleLane: z.string().min(1).optional(),
    refKindMap: z.record(z.string(), z.string().min(1)).optional(),
    activeToolchainId: z.string().min(1).optional(),
    ciPipeline: z.string().min(1).optional(),
});

export const EnabledModuleSchema = z.object({
    ref: z.string().min(1),
    config: z.record(z.string(), z.unknown()).optional(),
});

export const ToolchainConfigSchema = z.object({
    id: z.string().min(1),
    kind: z.string().min(1),
    config: z.record(z.string(), z.unknown()).default({}),
}).strict();

export const LegacyToolchainConfigSchema = z.object({
    id: z.string().min(1),
    kind: z.string().min(1),
    options: z.record(z.string(), z.unknown()).default({}),
}).strict();

export const TaskDefinitionSchema = z.object({
    command: z.string().min(1),
    args: z.array(z.string()).default([]),
    cwd: z.string().optional(),
    env: z.record(z.string(), z.string()).default({}),
    deps: z.array(z.string().min(1)).default([]),
    inputs: z.array(z.string()).default([]),
    outputs: z.array(z.string()).default([]),
    cacheKey: z.string().optional(),
    toolchainId: z.string().optional(),
});

export const PipelineDefinitionSchema = z.object({
    tasks: z.array(z.string().min(1)).default([]),
});

export const OverrideEntrySchema = z.object({
    laneId: z.string().min(1).optional(),
    ref: z.string().min(1).optional(),
});

export const WorkspaceOverridesSchema = z.object({
    components: z.record(z.string(), OverrideEntrySchema).default({}),
    modules: z.record(z.string(), OverrideEntrySchema).default({}),
});

const LaneMapSchema = z.record(z.string().min(1), LaneInstanceSchema);
const TaskMapSchema = z.record(z.string().min(1), TaskDefinitionSchema);
const PipelineMapSchema = z.record(z.string().min(1), PipelineDefinitionSchema);
const ToolchainInputSchema = z.union([ToolchainConfigSchema, LegacyToolchainConfigSchema]);

const DEFAULT_WORKSPACE_SETTINGS: z.infer<typeof WorkspaceSettingsSchema> = {
    name: 'loop-workspace',
    appsDir: 'apps',
    packagesDir: 'packages',
    assetsDir: 'assets',
    toolsDir: 'tools',
    loopDir: 'loop',
};

const DEFAULT_COMPONENT_SETTINGS = {
    defaultTarget: '.',
    ignoreGlobs: [],
};

const DEFAULT_TOOLCHAINS: Array<z.infer<typeof ToolchainConfigSchema>> = [
    {
        id: 'typescript',
        kind: 'typescript',
        config: {},
    },
];

const LoopWorkspaceInputSchema = z.object({
    schemaVersion: z.literal('1'),
    workspace: WorkspaceSettingsSchema.default(DEFAULT_WORKSPACE_SETTINGS),
    lanes: z.union([LaneMapSchema, z.array(LegacyLaneConfigSchema), z.array(LaneConfigSchema)]).optional(),
    defaults: LoopDefaultsSchema.optional(),
    modules: z.array(EnabledModuleSchema).default([]),
    toolchains: z.array(ToolchainInputSchema).default(DEFAULT_TOOLCHAINS),
    components: z
        .object({
            defaultTarget: z.string().default('.'),
            ignoreGlobs: z.array(z.string()).default([]),
        })
        .default(DEFAULT_COMPONENT_SETTINGS),
    tasks: TaskMapSchema.default({}),
    pipelines: PipelineMapSchema.default({}),
    overrides: WorkspaceOverridesSchema.default({
        components: {},
        modules: {},
    }),
});

function defaultLaneMap(): Record<string, z.infer<typeof LaneInstanceSchema>> {
    return {
        local: {
            kind: 'local',
            config: {},
        },
        file: {
            kind: 'file',
            config: {},
        },
    };
}

function normalizeLanes(
    raw: z.infer<typeof LoopWorkspaceInputSchema>['lanes'],
): Record<string, z.infer<typeof LaneInstanceSchema>> {
    if (!raw) {
        return defaultLaneMap();
    }

    if (Array.isArray(raw)) {
        const mapped: Record<string, z.infer<typeof LaneInstanceSchema>> = {};
        for (const lane of raw) {
            if ('options' in lane) {
                mapped[lane.id] = {
                    kind: lane.kind,
                    config: lane.options,
                };
            } else {
                mapped[lane.id] = {
                    kind: lane.kind,
                    config: lane.config,
                };
            }
        }

        if (Object.keys(mapped).length === 0) {
            return defaultLaneMap();
        }

        return mapped;
    }

    if (Object.keys(raw).length === 0) {
        return defaultLaneMap();
    }

    return raw;
}

function normalizeToolchains(
    raw: Array<z.infer<typeof ToolchainInputSchema>>,
): Array<z.infer<typeof ToolchainConfigSchema>> {
    if (raw.length === 0) {
        return [...DEFAULT_TOOLCHAINS];
    }

    return raw.map((entry) => {
        if ('options' in entry) {
            return {
                id: entry.id,
                kind: entry.kind,
                config: entry.options,
            };
        }

        return entry;
    });
}

function chooseDefaultLaneId(lanes: Record<string, z.infer<typeof LaneInstanceSchema>>): string {
    if (lanes.local) {
        return 'local';
    }

    const first = Object.keys(lanes)[0];
    return first ?? 'local';
}

function chooseDefaultToolchainId(toolchains: Array<z.infer<typeof ToolchainConfigSchema>>): string | undefined {
    const first = toolchains[0];
    return first?.id;
}

function normalizeRefKindMap(raw?: Record<string, string>): Record<string, string> {
    if (!raw) {
        return {};
    }

    return { ...raw };
}

const LoopWorkspaceCanonicalSchema = z
    .object({
        schemaVersion: z.literal('1'),
        workspace: WorkspaceSettingsSchema,
        lanes: LaneMapSchema,
        defaults: z.object({
            componentLane: z.string().min(1),
            moduleLane: z.string().min(1),
            refKindMap: z.record(z.string(), z.string().min(1)).default({}),
            activeToolchainId: z.string().min(1).optional(),
            ciPipeline: z.string().min(1).default('ci'),
        }),
        modules: z.array(EnabledModuleSchema).default([]),
        toolchains: z.array(ToolchainConfigSchema).default(DEFAULT_TOOLCHAINS),
        components: z
            .object({
                defaultTarget: z.string().default('.'),
                ignoreGlobs: z.array(z.string()).default([]),
            })
            .default(DEFAULT_COMPONENT_SETTINGS),
        tasks: TaskMapSchema.default({}),
        pipelines: PipelineMapSchema.default({}),
        overrides: WorkspaceOverridesSchema.default({
            components: {},
            modules: {},
        }),
    })
    .superRefine((value, ctx) => {
        const laneIds = new Set(Object.keys(value.lanes));
        if (!laneIds.has(value.defaults.componentLane)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['defaults', 'componentLane'],
                message: `Unknown lane instance ID: ${value.defaults.componentLane}`,
            });
        }

        if (!laneIds.has(value.defaults.moduleLane)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['defaults', 'moduleLane'],
                message: `Unknown lane instance ID: ${value.defaults.moduleLane}`,
            });
        }

        for (const [refKind, laneId] of Object.entries(value.defaults.refKindMap)) {
            if (!(REF_KINDS as readonly string[]).includes(refKind)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['defaults', 'refKindMap', refKind],
                    message: `Unsupported ref kind in defaults.refKindMap: ${refKind}`,
                });
            }

            if (!laneIds.has(laneId)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['defaults', 'refKindMap', refKind],
                    message: `Unknown lane instance ID in defaults.refKindMap: ${laneId}`,
                });
            }
        }

        for (const [refText, override] of Object.entries(value.overrides.components)) {
            if (override.laneId && !laneIds.has(override.laneId)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['overrides', 'components', refText, 'laneId'],
                    message: `Unknown lane instance ID in component override: ${override.laneId}`,
                });
            }
        }

        for (const [refText, override] of Object.entries(value.overrides.modules)) {
            if (override.laneId && !laneIds.has(override.laneId)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['overrides', 'modules', refText, 'laneId'],
                    message: `Unknown lane instance ID in module override: ${override.laneId}`,
                });
            }
        }

        const toolchainIds = new Set(value.toolchains.map((toolchain) => toolchain.id));
        if (value.defaults.activeToolchainId && !toolchainIds.has(value.defaults.activeToolchainId)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['defaults', 'activeToolchainId'],
                message: `Unknown toolchain ID: ${value.defaults.activeToolchainId}`,
            });
        }

        for (const [taskId, task] of Object.entries(value.tasks)) {
            if (task.toolchainId && !toolchainIds.has(task.toolchainId)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['tasks', taskId, 'toolchainId'],
                    message: `Unknown toolchain ID on task ${taskId}: ${task.toolchainId}`,
                });
            }

            for (const dependencyTask of task.deps) {
                if (!(dependencyTask in value.tasks)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['tasks', taskId, 'deps'],
                        message: `Task ${taskId} references unknown dependency task: ${dependencyTask}`,
                    });
                }
            }
        }

        for (const [pipelineId, pipeline] of Object.entries(value.pipelines)) {
            for (const taskId of pipeline.tasks) {
                if (!(taskId in value.tasks)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['pipelines', pipelineId, 'tasks'],
                        message: `Pipeline ${pipelineId} references unknown task: ${taskId}`,
                    });
                }
            }
        }
    });

export type LoopWorkspaceInput = z.infer<typeof LoopWorkspaceInputSchema>;

export function normalizeLoopWorkspaceConfig(input: LoopWorkspaceInput): z.infer<typeof LoopWorkspaceCanonicalSchema> {
    const lanes = normalizeLanes(input.lanes);
    const toolchains = normalizeToolchains(input.toolchains);
    const fallbackLaneId = chooseDefaultLaneId(lanes);
    const fallbackToolchainId = chooseDefaultToolchainId(toolchains);

    return {
        schemaVersion: input.schemaVersion,
        workspace: input.workspace,
        lanes,
        defaults: {
            componentLane: input.defaults?.componentLane ?? fallbackLaneId,
            moduleLane: input.defaults?.moduleLane ?? fallbackLaneId,
            refKindMap: normalizeRefKindMap(input.defaults?.refKindMap),
            activeToolchainId: input.defaults?.activeToolchainId ?? fallbackToolchainId,
            ciPipeline: input.defaults?.ciPipeline ?? 'ci',
        },
        modules: input.modules,
        toolchains,
        components: input.components,
        tasks: input.tasks,
        pipelines: input.pipelines,
        overrides: input.overrides,
    };
}

export const LoopWorkspaceConfigSchema = LoopWorkspaceInputSchema
    .transform((input, ctx): z.infer<typeof LoopWorkspaceCanonicalSchema> => {
        const normalized = normalizeLoopWorkspaceConfig(input);
        const validated = LoopWorkspaceCanonicalSchema.safeParse(normalized);
        if (!validated.success) {
            for (const issue of validated.error.issues) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: issue.path,
                    message: issue.message,
                });
            }

            return z.NEVER as z.infer<typeof LoopWorkspaceCanonicalSchema>;
        }

        return validated.data;
    });

export type LaneConfig = z.infer<typeof LaneConfigSchema>;
export type LegacyLaneConfig = z.infer<typeof LegacyLaneConfigSchema>;
export type LaneInstance = z.infer<typeof LaneInstanceSchema>;
export type LoopDefaults = z.infer<typeof LoopDefaultsSchema>;
export type WorkspaceSettings = z.infer<typeof WorkspaceSettingsSchema>;
export type EnabledModule = z.infer<typeof EnabledModuleSchema>;
export type ToolchainConfig = z.infer<typeof ToolchainConfigSchema>;
export type LegacyToolchainConfig = z.infer<typeof LegacyToolchainConfigSchema>;
export type TaskDefinition = z.infer<typeof TaskDefinitionSchema>;
export type PipelineDefinition = z.infer<typeof PipelineDefinitionSchema>;
export type OverrideEntry = z.infer<typeof OverrideEntrySchema>;
export type WorkspaceOverrides = z.infer<typeof WorkspaceOverridesSchema>;
export type LoopWorkspaceConfig = z.infer<typeof LoopWorkspaceConfigSchema>;
