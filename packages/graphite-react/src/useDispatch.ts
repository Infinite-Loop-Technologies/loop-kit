import { useMemo } from 'react';
import type { CommitMeta, Patch } from '@loop-kit/graphite-core';
import { useScope } from './useScope.js';
import type { UseDispatchApi } from './types.js';

export function useDispatch(): UseDispatchApi {
    const { scope } = useScope();

    return useMemo(
        () => ({
            dispatchAction: (actionId: string, payload?: unknown) => {
                scope.dispatchAction(actionId, payload);
            },
            commitIntentPatch: (patch: Patch, meta?: CommitMeta) => {
                scope.commitIntentPatch(patch, meta);
            },
            overlay: {
                pushOverlayPatch: (patch: Patch) => {
                    scope.pushOverlayPatch(patch);
                },
                clearOverlay: () => {
                    scope.clearOverlay();
                },
            },
        }),
        [scope],
    );
}
