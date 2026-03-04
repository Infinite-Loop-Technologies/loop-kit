import {
    asScopeId,
    type GraphiteRuntime,
    type ScopeId,
} from '@loop-kit/graphite-core';
import {
    createContext,
    type PropsWithChildren,
    useContext,
    useMemo,
} from 'react';
import type { GraphiteProviderValue } from './types.js';

const DEFAULT_SCOPE_ID = asScopeId('default');

const GraphiteContext = createContext<GraphiteProviderValue | undefined>(undefined);

export type GraphiteProviderProps = PropsWithChildren<{
    runtime: GraphiteRuntime;
    scopeId?: ScopeId | string;
}>;

export function GraphiteProvider({
    runtime,
    scopeId,
    children,
}: GraphiteProviderProps) {
    const resolvedScopeId = useMemo(
        () => normalizeScopeId(scopeId),
        [scopeId],
    );

    const value = useMemo<GraphiteProviderValue>(() => {
        const scope = runtime.getScope(resolvedScopeId);
        return {
            runtime,
            scopeId: resolvedScopeId,
            scope,
        };
    }, [runtime, resolvedScopeId]);

    return <GraphiteContext.Provider value={value}>{children}</GraphiteContext.Provider>;
}

export function useGraphiteContext(): GraphiteProviderValue {
    const value = useContext(GraphiteContext);
    if (!value) {
        throw new Error('Graphite hooks must be used within <GraphiteProvider>.');
    }

    return value;
}

function normalizeScopeId(scopeId: ScopeId | string | undefined): ScopeId {
    if (!scopeId) {
        return DEFAULT_SCOPE_ID;
    }

    if (typeof scopeId === 'string') {
        return asScopeId(scopeId);
    }

    return scopeId;
}
