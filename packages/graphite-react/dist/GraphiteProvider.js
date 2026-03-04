import { jsx as _jsx } from "react/jsx-runtime";
import { asScopeId, } from '@loop-kit/graphite-core';
import { createContext, useContext, useMemo, } from 'react';
const DEFAULT_SCOPE_ID = asScopeId('default');
const GraphiteContext = createContext(undefined);
export function GraphiteProvider({ runtime, scopeId, children, }) {
    const resolvedScopeId = useMemo(() => normalizeScopeId(scopeId), [scopeId]);
    const value = useMemo(() => {
        const scope = runtime.getScope(resolvedScopeId);
        return {
            runtime,
            scopeId: resolvedScopeId,
            scope,
        };
    }, [runtime, resolvedScopeId]);
    return _jsx(GraphiteContext.Provider, { value: value, children: children });
}
export function useGraphiteContext() {
    const value = useContext(GraphiteContext);
    if (!value) {
        throw new Error('Graphite hooks must be used within <GraphiteProvider>.');
    }
    return value;
}
function normalizeScopeId(scopeId) {
    if (!scopeId) {
        return DEFAULT_SCOPE_ID;
    }
    if (typeof scopeId === 'string') {
        return asScopeId(scopeId);
    }
    return scopeId;
}
//# sourceMappingURL=GraphiteProvider.js.map