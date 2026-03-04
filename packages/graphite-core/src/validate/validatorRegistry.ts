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

export type Validator<TSlice = unknown> = (
    reader: IntentSnapshotReader,
    context: ValidatorContext,
) => ValidatorResult<TSlice>;

export class ValidatorRegistry {
    private readonly validators = new Map<string, Validator>();

    register<TSlice>(facetName: string, validator: Validator<TSlice>): void {
        this.validators.set(facetName, validator as Validator);
    }

    unregister(facetName: string): void {
        this.validators.delete(facetName);
    }

    get<TSlice>(facetName: string): Validator<TSlice> | undefined {
        return this.validators.get(facetName) as Validator<TSlice> | undefined;
    }

    has(facetName: string): boolean {
        return this.validators.has(facetName);
    }

    listFacetNames(): string[] {
        return Array.from(this.validators.keys());
    }

    entries(): readonly [string, Validator][] {
        return Array.from(this.validators.entries());
    }
}
