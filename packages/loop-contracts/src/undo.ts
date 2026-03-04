import { z } from 'zod';
import { PatchPlanSchema } from './patch-plan.js';

export const UndoFileStateSchema = z.object({
    path: z.string().min(1),
    existed: z.boolean(),
    content: z.string().optional(),
});

export const UndoJournalEntrySchema = z.object({
    schemaVersion: z.literal('1'),
    undoId: z.string().min(1),
    planId: z.string().min(1),
    title: z.string().min(1),
    createdAt: z.string().min(1),
    source: z.string().min(1),
    workspaceRoot: z.string().min(1),
    plan: PatchPlanSchema,
    touchedFiles: z.array(z.string().min(1)).default([]),
    diffByFile: z.record(z.string(), z.string()).default({}),
    before: z.array(UndoFileStateSchema).default([]),
    after: z.array(UndoFileStateSchema).default([]),
});

export const UndoJournalIndexEntrySchema = z.object({
    undoId: z.string().min(1),
    planId: z.string().min(1),
    title: z.string().min(1),
    createdAt: z.string().min(1),
    source: z.string().min(1),
    journalPath: z.string().min(1),
});

export const UndoJournalIndexSchema = z.object({
    schemaVersion: z.literal('1'),
    entries: z.array(UndoJournalIndexEntrySchema).default([]),
});

export type UndoFileState = z.infer<typeof UndoFileStateSchema>;
export type UndoJournalEntry = z.infer<typeof UndoJournalEntrySchema>;
export type UndoJournalIndexEntry = z.infer<typeof UndoJournalIndexEntrySchema>;
export type UndoJournalIndex = z.infer<typeof UndoJournalIndexSchema>;
