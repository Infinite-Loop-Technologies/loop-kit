import type {
  VoltJsonValue,
  VoltTargetContext,
} from "./contracts";

export interface VoltServiceProvider<
  TServices extends Record<string, VoltJsonValue> = Record<string, VoltJsonValue>,
> {
  resolve: (
    context: VoltTargetContext,
  ) => Promise<TServices> | TServices;
}

export const defineServices = <
  TServices extends Record<string, VoltJsonValue>,
>(
  resolve: VoltServiceProvider<TServices>["resolve"],
): VoltServiceProvider<TServices> => ({
  resolve,
});

type ServicesFromProviders<TProviders extends readonly VoltServiceProvider[]> =
  TProviders extends readonly [infer TFirst, ...infer TRest]
    ? TFirst extends VoltServiceProvider<infer TFirstServices>
      ? TRest extends readonly VoltServiceProvider[]
        ? TFirstServices & ServicesFromProviders<TRest>
        : TFirstServices
      : {}
    : {};

export const mergeServices = <
  const TProviders extends readonly VoltServiceProvider[],
>(
  ...providers: TProviders
): VoltServiceProvider<ServicesFromProviders<TProviders>> =>
  defineServices(async (context) => {
    const resolved = await Promise.all(
      providers.map((provider) => provider.resolve(context)),
    );

    return Object.assign({}, ...resolved) as ServicesFromProviders<TProviders>;
  });
