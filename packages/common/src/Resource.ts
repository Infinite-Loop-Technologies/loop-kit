import type { MaybeAsync } from "./Task.js";

export interface Resource<T> {
  readonly acquire: () => Promise<T>;
  readonly dispose: (value: T) => Promise<void>;
}

export interface DisposableHandle<T> {
  readonly dispose: () => Promise<void>;
  readonly value: T;
}

export const readonly = <T>(value: T): Readonly<T> => Object.freeze(value);

export const createResource = <T>(
  acquire: () => MaybeAsync<T>,
  dispose: (value: T) => MaybeAsync<void>,
): Resource<T> => ({
  acquire: async () => await acquire(),
  dispose: async (value) => {
    await dispose(value);
  },
});

export const acquireResource = async <T>(
  resource: Resource<T>,
): Promise<DisposableHandle<T>> => {
  const value = await resource.acquire();
  return {
    dispose: async () => {
      await resource.dispose(value);
    },
    value,
  };
};

export const disposeAll = async (
  handles: ReadonlyArray<{ dispose: () => Promise<void> }>,
) => {
  for (const handle of [...handles].reverse()) {
    await handle.dispose();
  }
};
