import type {
  VoltEntrypoint,
  VoltEntrypointHandler,
} from "./contracts";
import { defineEntrypoint } from "./contracts";
import type { VoltInterfaceContract, VoltResourceContract } from "./schema";

type InferResourceValue<TResource> = TResource extends VoltResourceDefinition<infer TValue>
  ? TValue
  : TResource extends VoltResourceContract
    ? unknown
  : never;

type InferInterfaceValue<TInterface> = TInterface extends VoltInterfaceDefinition<infer TValue>
  ? TValue
  : TInterface extends VoltInterfaceContract
    ? unknown
  : never;

type InferRecordValues<TRecord extends Record<string, unknown>> = {
  [TKey in keyof TRecord]: TRecord[TKey] extends VoltResourceDefinition<any>
    ? InferResourceValue<TRecord[TKey]>
    : TRecord[TKey] extends VoltInterfaceDefinition<any>
      ? InferInterfaceValue<TRecord[TKey]>
      : never;
};

export interface VoltInterfaceTypeDefinition<TValue = unknown> {
  kind: "interface";
  name: string;
  schema: TValue;
}

export interface VoltResourceTypeDefinition<TValue = unknown> {
  kind: "resource";
  name: string;
  schema: TValue;
}

export type VoltInterfaceDefinition<TValue = unknown> =
  | VoltInterfaceContract
  | VoltInterfaceTypeDefinition<TValue>;

export type VoltResourceDefinition<TValue = unknown> =
  | VoltResourceContract
  | VoltResourceTypeDefinition<TValue>;

export interface VoltEntrypointSpecDefinition<
  TRequires extends Record<string, VoltResourceDefinition | VoltInterfaceDefinition> = {},
  TProvides extends Record<string, VoltInterfaceDefinition> = {},
> {
  kind: "entrypoint-spec";
  name: string;
  provides: TProvides;
  requires: TRequires;
}

export type VoltEntrypointServicesFromSpec<
  TSpec extends VoltEntrypointSpecDefinition<any, any>,
> = InferRecordValues<TSpec["requires"]>;

export type VoltEntrypointResultFromSpec<
  TSpec extends VoltEntrypointSpecDefinition<any, any>,
> = InferRecordValues<TSpec["provides"]>;

export interface VoltSpecifiedEntrypoint<
  TSpec extends VoltEntrypointSpecDefinition<any, any>,
> extends VoltEntrypoint<
    VoltEntrypointServicesFromSpec<TSpec>,
    VoltEntrypointResultFromSpec<TSpec>
  > {
  spec: TSpec;
}

export const defineEntrypointSpec = <
  const TRequires extends Record<string, VoltResourceDefinition | VoltInterfaceDefinition>,
  const TProvides extends Record<string, VoltInterfaceDefinition>,
>(
  name: string,
  definition: {
    provides?: TProvides;
    requires?: TRequires;
  },
): VoltEntrypointSpecDefinition<TRequires, TProvides> => ({
  kind: "entrypoint-spec",
  name,
  provides: (definition.provides ?? {}) as TProvides,
  requires: (definition.requires ?? {}) as TRequires,
});

export const implementEntrypoint = <
  const TSpec extends VoltEntrypointSpecDefinition<any, any>,
  TServices = VoltEntrypointServicesFromSpec<TSpec>,
  TResult = VoltEntrypointResultFromSpec<TSpec>,
>(
  spec: TSpec,
  handler: VoltEntrypointHandler<TServices, TResult>,
  meta?: Pick<ImportMeta, "url"> | string,
): VoltEntrypoint<TServices, TResult> & { spec: TSpec } => ({
  ...defineEntrypoint(meta ?? import.meta.url, handler),
  spec,
});
