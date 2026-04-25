/**
 * Selective React bridge for `Store`.
 *
 * The selector result is memoized across store updates with a caller-provided
 * equality function so consumers do not rerender on unrelated state changes.
 */

import type { Eq, ReadonlyStore } from "@loop-kit/common";
import { eqStrict } from "@loop-kit/common";
import { useRef, useSyncExternalStore } from "react";

interface SelectorCache<T> {
  readonly value: T;
}

export const useStoreSelector = <TState, TSelected>(
  store: ReadonlyStore<TState>,
  select: (state: TState) => TSelected,
  eq: Eq<TSelected> = eqStrict,
): TSelected => {
  const cacheRef = useRef<SelectorCache<TSelected> | null>(null);

  return useSyncExternalStore(
    store.subscribe,
    () => {
      const nextValue = select(store.get());
      const cached = cacheRef.current;
      if (!cached || !eq(cached.value, nextValue)) {
        cacheRef.current = { value: nextValue };
      }
      return (cacheRef.current ?? { value: nextValue }).value;
    },
    () => select(store.get()),
  );
};
