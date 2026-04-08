export interface ScopedTargetValue<TAllowed extends string, TValue> {
  allowedTargets: readonly TAllowed[];
  value: TValue;
}

export const useTarget = <const TAllowed extends string, TValue>(
  target: TAllowed,
  value: TValue,
): ScopedTargetValue<TAllowed, TValue> => ({
  allowedTargets: [target],
  value,
});

export const useTargets = <const TAllowed extends readonly string[], TValue>(
  targets: TAllowed,
  value: TValue,
): ScopedTargetValue<TAllowed[number], TValue> => ({
  allowedTargets: targets,
  value,
});

export const resolveScopedTargetValue = <
  TAllowed extends string,
  TTarget extends TAllowed,
  TValue,
>(
  _target: TTarget,
  scoped: ScopedTargetValue<TAllowed, TValue> | TValue | undefined,
): TValue | undefined =>
  (scoped && typeof scoped === "object" && "allowedTargets" in scoped
    ? scoped.value
    : scoped) as TValue | undefined;
