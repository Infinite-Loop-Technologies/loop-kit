/**
 * Lightweight discrete signal primitive.
 *
 * Signals are for occurrences, not state. Use `Store` for current values and
 * `Signal` for things like clicks, drag sessions, domain events, and structured
 * runtime notifications.
 */

import { callback, type Task } from "./Task.js";

export type SignalListener<T> = (value: T) => void;
export type SignalUnsubscribe = () => void;

export interface Signal<T> extends Disposable {
  readonly emit: (value: T) => void;
  readonly subscribe: (
    listener: SignalListener<T>,
    options?: {
      readonly once?: boolean | undefined;
      readonly signal?: AbortSignal | undefined;
    },
  ) => SignalUnsubscribe;
  readonly once: () => Promise<T>;
  readonly wait: Task<T>;
}

export const createSignal = <T>(): Signal<T> => {
  const listeners = new Set<SignalListener<T>>();

  const subscribe: Signal<T>["subscribe"] = (listener, options = {}) => {
    const wrapped: SignalListener<T> = (value) => {
      if (options.once) unsubscribe();
      listener(value);
    };

    const unsubscribe = () => {
      listeners.delete(wrapped);
    };

    listeners.add(wrapped);

    options.signal?.addEventListener("abort", unsubscribe, { once: true });
    return unsubscribe;
  };

  return {
    emit: (value) => {
      for (const listener of Array.from(listeners)) {
        listener(value);
      }
    },
    subscribe,
    once: () =>
      new Promise((resolve) => {
        const unsubscribe = subscribe((value) => {
          unsubscribe();
          resolve(value);
        });
      }),
    wait: callback(({ ok, signal }) => {
      const unsubscribe = subscribe(ok, { once: true, signal });
      return unsubscribe;
    }),
    [Symbol.dispose]: () => {
      listeners.clear();
    },
  };
};

export const filterSignal = <T>(
  signal: Signal<T>,
  predicate: (value: T) => boolean,
): Signal<T> => {
  const filtered = createSignal<T>();
  const unsubscribe = signal.subscribe((value) => {
    if (predicate(value)) filtered.emit(value);
  });

  return {
    ...filtered,
    [Symbol.dispose]: () => {
      unsubscribe();
      filtered[Symbol.dispose]();
    },
  };
};

export const mapSignal = <T, U>(
  signal: Signal<T>,
  map: (value: T) => U,
): Signal<U> => {
  const mapped = createSignal<U>();
  const unsubscribe = signal.subscribe((value) => {
    mapped.emit(map(value));
  });

  return {
    ...mapped,
    [Symbol.dispose]: () => {
      unsubscribe();
      mapped[Symbol.dispose]();
    },
  };
};
