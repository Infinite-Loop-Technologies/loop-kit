declare global {
  interface ReadonlySet<T> {
    difference(other: ReadonlySet<unknown>): ReadonlySet<T>;
  }

  interface Set<T> extends ReadonlySet<T> {
    difference(other: ReadonlySet<unknown>): ReadonlySet<T>;
  }

  interface Map<K, V> {
    getOrInsert(key: K, value: V): V;
    getOrInsertComputed(key: K, factory: (key: K) => V): V;
  }

  interface WeakMap<K extends WeakKey, V> {
    getOrInsert(key: K, value: V): V;
    getOrInsertComputed(key: K, factory: (key: K) => V): V;
  }

  class DisposableStack implements Disposable {
    constructor();
    readonly disposed: boolean;
    dispose(): void;
    [Symbol.dispose](): void;
    adopt<T>(value: T, onDispose: (value: T) => void): T;
    defer(onDispose: () => void): void;
    move(): DisposableStack;
    use<T extends Disposable>(value: T): T;
  }

  class AsyncDisposableStack implements AsyncDisposable {
    constructor();
    readonly disposed: boolean;
    dispose(): void;
    [Symbol.asyncDispose](): Promise<void>;
    adopt<T>(value: T, onDispose: (value: T) => void | Promise<void>): T;
    defer(onDispose: () => void | Promise<void>): void;
    disposeAsync(): Promise<void>;
    move(): AsyncDisposableStack;
    use<T extends AsyncDisposable | Disposable>(value: T): T;
  }

  interface PromiseConstructor {
    withResolvers<T>(): PromiseWithResolvers<T>;
  }

  interface PromiseWithResolvers<T> {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
  }
}

export {};
