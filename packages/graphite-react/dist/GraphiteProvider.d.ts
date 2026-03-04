import { type GraphiteRuntime, type ScopeId } from '@loop-kit/graphite-core';
import { type PropsWithChildren } from 'react';
import type { GraphiteProviderValue } from './types.js';
export type GraphiteProviderProps = PropsWithChildren<{
    runtime: GraphiteRuntime;
    scopeId?: ScopeId | string;
}>;
export declare function GraphiteProvider({ runtime, scopeId, children, }: GraphiteProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useGraphiteContext(): GraphiteProviderValue;
//# sourceMappingURL=GraphiteProvider.d.ts.map