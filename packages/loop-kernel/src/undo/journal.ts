import path from 'node:path';
import { createPatch } from 'diff';
import {
    UndoJournalEntrySchema,
    UndoJournalIndexSchema,
    err,
    ok,
    type Diagnostic,
    type PatchPlan,
    type Result,
    type UndoFileState,
    type UndoJournalEntry,
    type UndoJournalIndex,
} from '@loop-kit/loop-contracts';
import { nodeFsGateway, type FsGateway } from '../io/fsGateway.js';
import type { PatchExecutionResult } from '../types.js';

const UNDO_ROOT = path.join('loop', 'undo');
const UNDO_INDEX = path.join(UNDO_ROOT, 'index.json');

function compactTimestamp(value: Date): string {
    return value
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\./g, '')
        .replace('Z', 'Z');
}

function sanitizePlanId(planId: string): string {
    return planId.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function emptyUndoIndex(): UndoJournalIndex {
    return {
        schemaVersion: '1',
        entries: [],
    };
}

export function createUndoId(planId: string, now: Date = new Date()): string {
    return `${compactTimestamp(now)}-${sanitizePlanId(planId)}`;
}

async function readUndoIndex(
    workspaceRoot: string,
    fs: FsGateway,
): Promise<UndoJournalIndex> {
    const absolutePath = path.resolve(workspaceRoot, UNDO_INDEX);
    if (!(await fs.exists(absolutePath))) {
        return emptyUndoIndex();
    }

    const raw = await fs.readJson<unknown>(absolutePath);
    const parsed = UndoJournalIndexSchema.safeParse(raw);
    if (!parsed.success) {
        return emptyUndoIndex();
    }

    return parsed.data;
}

async function writeUndoIndex(
    workspaceRoot: string,
    index: UndoJournalIndex,
    fs: FsGateway,
): Promise<void> {
    const absolutePath = path.resolve(workspaceRoot, UNDO_INDEX);
    await fs.writeJson(absolutePath, index);
}

export async function persistUndoJournal(
    workspaceRoot: string,
    payload: {
        plan: PatchPlan;
        source: string;
        touchedFiles: string[];
        diffByFile: Record<string, string>;
        before: UndoFileState[];
        after: UndoFileState[];
    },
    fs: FsGateway = nodeFsGateway,
): Promise<Result<{ undoId: string; journalPath: string }>> {
    const undoId = createUndoId(payload.plan.id);
    const journalPath = path.join(UNDO_ROOT, undoId, 'journal.json');
    const absoluteJournalPath = path.resolve(workspaceRoot, journalPath);
    const createdAt = new Date().toISOString();

    const entry: UndoJournalEntry = {
        schemaVersion: '1',
        undoId,
        planId: payload.plan.id,
        title: payload.plan.title,
        createdAt,
        source: payload.source,
        workspaceRoot,
        plan: payload.plan,
        touchedFiles: payload.touchedFiles,
        diffByFile: payload.diffByFile,
        before: payload.before,
        after: payload.after,
    };

    await fs.writeJson(absoluteJournalPath, entry);

    const index = await readUndoIndex(workspaceRoot, fs);
    const withoutExisting = index.entries.filter((candidate) => candidate.undoId !== undoId);
    withoutExisting.push({
        undoId,
        planId: payload.plan.id,
        title: payload.plan.title,
        createdAt,
        source: payload.source,
        journalPath: journalPath.replace(/\\/g, '/'),
    });
    withoutExisting.sort((left, right) => right.createdAt.localeCompare(left.createdAt));

    await writeUndoIndex(workspaceRoot, {
        schemaVersion: '1',
        entries: withoutExisting,
    }, fs);

    return ok({
        undoId,
        journalPath: journalPath.replace(/\\/g, '/'),
    });
}

export async function loadUndoJournal(
    workspaceRoot: string,
    undoId: string,
    fs: FsGateway = nodeFsGateway,
): Promise<Result<UndoJournalEntry>> {
    const index = await readUndoIndex(workspaceRoot, fs);
    const fromIndex = index.entries.find((entry) => entry.undoId === undoId);
    const journalPath = fromIndex
        ? path.resolve(workspaceRoot, fromIndex.journalPath)
        : path.resolve(workspaceRoot, UNDO_ROOT, undoId, 'journal.json');

    if (!(await fs.exists(journalPath))) {
        return err({
            code: 'undo.not_found',
            message: `Undo entry not found: ${undoId}`,
        });
    }

    const raw = await fs.readJson<unknown>(journalPath);
    const parsed = UndoJournalEntrySchema.safeParse(raw);
    if (!parsed.success) {
        return err({
            code: 'undo.invalid_journal',
            message: `Undo journal is invalid: ${undoId}`,
            details: {
                issues: parsed.error.issues,
            },
        });
    }

    return ok(parsed.data);
}

function diffPatch(
    relativePath: string,
    fromContent: string,
    toContent: string,
): string {
    return createPatch(relativePath, fromContent, toContent);
}

export async function executeUndoJournal(
    workspaceRoot: string,
    entry: UndoJournalEntry,
    options: {
        dryRun?: boolean;
        fs?: FsGateway;
    } = {},
): Promise<PatchExecutionResult> {
    const fs = options.fs ?? nodeFsGateway;
    const dryRun = options.dryRun ?? false;
    const operationResults: PatchExecutionResult['operationResults'] = [];
    const diagnostics: Diagnostic[] = [];
    const changedFiles: string[] = [];
    const diffByFile: Record<string, string> = {};
    let failed = false;

    for (const beforeState of entry.before) {
        const absolutePath = path.resolve(workspaceRoot, beforeState.path);
        try {
            const exists = await fs.exists(absolutePath);
            const currentContent = exists ? await fs.readText(absolutePath) : '';

            if (!beforeState.existed) {
                if (!exists) {
                    operationResults.push({
                        opId: `undo.${beforeState.path}`,
                        status: 'noop',
                        changedFiles: [],
                        diagnostics: [],
                    });
                    continue;
                }

                changedFiles.push(beforeState.path);
                diffByFile[beforeState.path] = diffPatch(beforeState.path, currentContent, '');
                if (!dryRun) {
                    await fs.remove(absolutePath);
                }
                operationResults.push({
                    opId: `undo.${beforeState.path}`,
                    status: 'applied',
                    changedFiles: [beforeState.path],
                    diagnostics: [],
                });
                continue;
            }

            const desiredContent = beforeState.content ?? '';
            if (exists && currentContent === desiredContent) {
                operationResults.push({
                    opId: `undo.${beforeState.path}`,
                    status: 'noop',
                    changedFiles: [],
                    diagnostics: [],
                });
                continue;
            }

            changedFiles.push(beforeState.path);
            diffByFile[beforeState.path] = diffPatch(beforeState.path, currentContent, desiredContent);
            if (!dryRun) {
                await fs.writeText(absolutePath, desiredContent);
            }

            operationResults.push({
                opId: `undo.${beforeState.path}`,
                status: 'applied',
                changedFiles: [beforeState.path],
                diagnostics: [],
            });
        } catch (undoError) {
            failed = true;
            const diagnostic: Diagnostic = {
                id: 'undo.apply_failed',
                severity: 'error',
                message: `Failed to apply undo for ${beforeState.path}`,
                evidence: {
                    error: String(undoError),
                },
            };
            diagnostics.push(diagnostic);
            operationResults.push({
                opId: `undo.${beforeState.path}`,
                status: 'failed',
                changedFiles: [],
                diagnostics: [diagnostic],
            });
            break;
        }
    }

    return {
        applied: !dryRun && !failed,
        operationResults,
        changedFiles,
        diffByFile,
        diagnostics,
    };
}
