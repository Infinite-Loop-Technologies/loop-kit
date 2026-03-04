import { type IntentSnapshotReader, type ValidatorResult } from '@loop-kit/graphite-core';
export type EditingStateSlice = {
    deletableNodeIds: string[];
};
export declare function validateEditing(snapshot: IntentSnapshotReader): ValidatorResult<EditingStateSlice>;
//# sourceMappingURL=validate.d.ts.map