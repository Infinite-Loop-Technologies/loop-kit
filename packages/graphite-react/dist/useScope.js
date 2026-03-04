import { useGraphiteContext } from './GraphiteProvider.js';
export function useScope() {
    const context = useGraphiteContext();
    return {
        scopeId: context.scopeId,
        runtime: context.runtime,
        scope: context.scope,
    };
}
//# sourceMappingURL=useScope.js.map