import { type IntentSnapshotReader, type ValidatorResult } from '@loop-kit/graphite-core';
export type DockingSystemSlice = {
    rootIds: readonly string[];
    groupCount: number;
};
export declare function validateDockingSystem(snapshot: IntentSnapshotReader): ValidatorResult<DockingSystemSlice>;
//# sourceMappingURL=validate.d.ts.map