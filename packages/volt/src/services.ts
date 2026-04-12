import type {
  VoltJsonValue,
  VoltTargetContext,
} from "./contracts";

export interface VoltRuntimeInputProvider<
  TValues extends Record<string, VoltJsonValue> = Record<string, VoltJsonValue>,
> {
  resolve: (
    context: VoltTargetContext,
  ) => Promise<TValues> | TValues;
}

export const defineRuntimeInputs = <
  TValues extends Record<string, VoltJsonValue>,
>(
  resolve: VoltRuntimeInputProvider<TValues>["resolve"],
): VoltRuntimeInputProvider<TValues> => ({
  resolve,
});

type RuntimeInputsFromProviders<TProviders extends readonly VoltRuntimeInputProvider[]> =
  TProviders extends readonly [infer TFirst, ...infer TRest]
    ? TFirst extends VoltRuntimeInputProvider<infer TFirstValues>
      ? TRest extends readonly VoltRuntimeInputProvider[]
        ? TFirstValues & RuntimeInputsFromProviders<TRest>
        : TFirstValues
      : {}
    : {};

export const mergeRuntimeInputs = <
  const TProviders extends readonly VoltRuntimeInputProvider[],
>(
  ...providers: TProviders
): VoltRuntimeInputProvider<RuntimeInputsFromProviders<TProviders>> =>
  defineRuntimeInputs(async (context) => {
    const resolved = await Promise.all(
      providers.map((provider) => provider.resolve(context)),
    );

    return Object.assign({}, ...resolved) as RuntimeInputsFromProviders<TProviders>;
  });

export type VoltServiceProvider<
  TServices extends Record<string, VoltJsonValue> = Record<string, VoltJsonValue>,
> = VoltRuntimeInputProvider<TServices>;

export const defineServices = defineRuntimeInputs;
export const mergeServices = mergeRuntimeInputs;
