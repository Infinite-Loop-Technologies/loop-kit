import { z } from 'zod';

export const TaskEventTaskStartSchema = z.object({
    type: z.literal('task.start'),
    taskId: z.string().min(1),
    command: z.string().min(1),
    args: z.array(z.string()).default([]),
    cwd: z.string().min(1),
    startedAt: z.string().min(1),
});

export const TaskEventTaskStdoutSchema = z.object({
    type: z.literal('task.stdout'),
    taskId: z.string().min(1),
    chunk: z.string(),
    at: z.string().min(1),
});

export const TaskEventTaskStderrSchema = z.object({
    type: z.literal('task.stderr'),
    taskId: z.string().min(1),
    chunk: z.string(),
    at: z.string().min(1),
});

export const TaskEventTaskFinishSchema = z.object({
    type: z.literal('task.finish'),
    taskId: z.string().min(1),
    command: z.string().min(1),
    args: z.array(z.string()).default([]),
    cwd: z.string().min(1),
    startedAt: z.string().min(1),
    finishedAt: z.string().min(1),
    durationMs: z.number().nonnegative(),
    success: z.boolean(),
    exitCode: z.number().int(),
});

export const TaskEventPipelineStartSchema = z.object({
    type: z.literal('pipeline.start'),
    pipelineId: z.string().min(1),
    taskIds: z.array(z.string().min(1)).default([]),
    startedAt: z.string().min(1),
});

export const TaskEventPipelineFinishSchema = z.object({
    type: z.literal('pipeline.finish'),
    pipelineId: z.string().min(1),
    taskIds: z.array(z.string().min(1)).default([]),
    startedAt: z.string().min(1),
    finishedAt: z.string().min(1),
    durationMs: z.number().nonnegative(),
    success: z.boolean(),
    failedTaskId: z.string().min(1).optional(),
});

export const TaskEventSchema = z.discriminatedUnion('type', [
    TaskEventTaskStartSchema,
    TaskEventTaskStdoutSchema,
    TaskEventTaskStderrSchema,
    TaskEventTaskFinishSchema,
    TaskEventPipelineStartSchema,
    TaskEventPipelineFinishSchema,
]);

export const TaskRunSummarySchema = z.object({
    taskId: z.string().min(1),
    command: z.string().min(1),
    args: z.array(z.string()).default([]),
    cwd: z.string().min(1),
    startedAt: z.string().min(1),
    finishedAt: z.string().min(1),
    durationMs: z.number().nonnegative(),
    success: z.boolean(),
    exitCode: z.number().int(),
});

export const PipelineRunSummarySchema = z.object({
    pipelineId: z.string().min(1),
    taskIds: z.array(z.string().min(1)).default([]),
    startedAt: z.string().min(1),
    finishedAt: z.string().min(1),
    durationMs: z.number().nonnegative(),
    success: z.boolean(),
    failedTaskId: z.string().min(1).optional(),
    tasks: z.array(TaskRunSummarySchema).default([]),
});

export type TaskEvent = z.infer<typeof TaskEventSchema>;
export type TaskRunSummary = z.infer<typeof TaskRunSummarySchema>;
export type PipelineRunSummary = z.infer<typeof PipelineRunSummarySchema>;
