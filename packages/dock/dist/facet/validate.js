import { normalizeDockSnapshot } from './queries.js';
export function validateDock(snapshot) {
    const normalized = normalizeDockSnapshot(snapshot);
    return {
        slice: normalized.slice,
        diagnostics: normalized.diagnostics,
    };
}
//# sourceMappingURL=validate.js.map