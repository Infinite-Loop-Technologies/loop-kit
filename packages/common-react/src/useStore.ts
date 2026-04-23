/**
 * React bridge for `Store`.
 *
 * `Store` remains the source of truth. This hook simply exposes it through
 * `useSyncExternalStore`.
 */

import type { ReadonlyStore } from "@loop-kit/common";
import { useSyncExternalStore } from "react";

export const useStore = <T>(store: ReadonlyStore<T>): T =>
  useSyncExternalStore(store.subscribe, store.get, store.get);
