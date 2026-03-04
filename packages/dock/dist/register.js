import { DOCK_FACET } from './facet/schema.js';
import { validateDock } from './facet/validate.js';
export function registerDockFacet(runtime) {
    runtime.registerValidator(DOCK_FACET, validateDock);
}
//# sourceMappingURL=register.js.map