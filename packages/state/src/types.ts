export type Update<T = unknown> =
    | T
    | { $set: T }
    | { $merge: Merge<T> }
    | { $apply: (value: T) => T }
    | { $patch: (value: T) => Update<T> }
    | { $nop: true }
    | { $delete: true }
    | DeepUpdate<T>
    | undefined;

export type Merge<T = unknown> = T | DeepUpdate<T> | undefined;

export type DeepUpdate<T = unknown> = T extends readonly (infer E)[]
    ? { [index: number]: Update<E> }
    : T extends (infer E)[]
      ? { [index: number]: Update<E> }
      : T extends object
        ? { [P in keyof T]?: Update<T[P]> }
        : T;

export type UpdateKey = string | number;

export type Pair<T> = [T, Updater<T>];
export type Updater<T> = (update: Update<T>) => void;

export type Cursor<T> = (() => Pair<T>) & DeepCursor<T>;
export type DeepCursor<T = unknown> = T extends readonly (infer E)[]
    ? { [index: number]: Cursor<E> }
    : T extends (infer E)[]
      ? { [index: number]: Cursor<E> }
      : T extends object
        ? { [P in keyof T]-?: Cursor<T[P]> }
        : Record<string, never>;

export type Initial<T> = T | (() => T);
export type Setter<T> = (value: T | ((value: T) => T)) => void;

type ArrowFunction = (...args: any[]) => any;
export type UseCallback = <F extends ArrowFunction>(callback: F, deps: readonly unknown[]) => F;
export type UseMemo = <T>(memoValue: () => T, deps: readonly unknown[]) => T;
export type UseRef = <T>(value: T) => { current: T | null };
export type UseState = <T>(initialState: Initial<T>) => [T, Setter<T>];
