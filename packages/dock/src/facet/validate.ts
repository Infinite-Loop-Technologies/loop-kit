import type { IntentSnapshotReader, ValidatorResult } from '@loop-kit/graphite-core';
import { normalizeDockSnapshot, type DockStateSlice } from './queries.js';

export function validateDock(snapshot: IntentSnapshotReader): ValidatorResult<DockStateSlice> {
    const normalized = normalizeDockSnapshot(snapshot);
    return {
        slice: normalized.slice,
        diagnostics: normalized.diagnostics,
    };
}
