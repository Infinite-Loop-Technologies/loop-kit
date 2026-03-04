import type { IntentSnapshotReader } from '../intent/intentStore.js';
import type { ScopeId } from '../types/ids.js';
import type { Diagnostic } from './diagnostics.js';
export type ValidatorResult<TSlice = unknown> = {
    slice: TSlice;
    diagnostics: Diagnostic[];
};
export type ValidatorContext = {
    scopeId: ScopeId;
    facetName: string;
};
export type Validator<TSlice = unknown> = (reader: IntentSnapshotReader, context: ValidatorContext) => ValidatorResult<TSlice>;
export declare class ValidatorRegistry {
    private readonly validators;
    register<TSlice>(facetName: string, validator: Validator<TSlice>): void;
    unregister(facetName: string): void;
    get<TSlice>(facetName: string): Validator<TSlice> | undefined;
    has(facetName: string): boolean;
    listFacetNames(): string[];
    entries(): readonly [string, Validator][];
}
//# sourceMappingURL=validatorRegistry.d.ts.map