import { useMemo } from 'react';
import { useScope } from './useScope.js';
export function useDispatch() {
    const { scope } = useScope();
    return useMemo(() => ({
        dispatchAction: (actionId, payload) => {
            scope.dispatchAction(actionId, payload);
        },
        commitIntentPatch: (patch, meta) => {
            scope.commitIntentPatch(patch, meta);
        },
        overlay: {
            pushOverlayPatch: (patch) => {
                scope.pushOverlayPatch(patch);
            },
            clearOverlay: () => {
                scope.clearOverlay();
            },
        },
    }), [scope]);
}
//# sourceMappingURL=useDispatch.js.map