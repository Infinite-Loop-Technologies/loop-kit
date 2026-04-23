/**
 * Dock persistence contracts.
 */

import type { DockState } from "./DockState.js";
import type { DockSerializer } from "./DockSerializer.js";

export interface DockPersistence {
  readonly load: () => DockState | null;
  readonly save: (state: DockState) => void;
}

export const createLocalStorageDockPersistence = (
  storageKey: string,
  serializer: DockSerializer,
): DockPersistence => ({
  load: () => {
    if (typeof localStorage === "undefined") return null;
    const payload = localStorage.getItem(storageKey);
    return payload ? serializer.deserialize(payload) : null;
  },
  save: (state) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(storageKey, serializer.serialize(state));
  },
});
