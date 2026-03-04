import type { GraphiteRuntime } from '@loop-kit/graphite-core';
import { DOCK_FACET } from './facet/schema.js';
import { validateDock } from './facet/validate.js';

export function registerDockFacet(runtime: GraphiteRuntime): void {
    runtime.registerValidator(DOCK_FACET, validateDock);
}
