export type Result<T, E> = Ok<T> | Err<E>;

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

export function ok(): Ok<void>;
export function ok<T>(value: T): Ok<T>;
export function ok<T>(value = undefined): Ok<T> {
  return { ok: true, value: value as T };
}

export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export const getOrThrow = <T, E>(result: Result<T, E>): T => {
  if (result.ok) {
    return result.value;
  }

  throw new Error("getOrThrow", { cause: result.error });
};

export const getOrNull = <T, E>(result: Result<T, E>): T | null =>
  result.ok ? result.value : null;

export const trySync = <T, E>(
  run: () => T,
  mapError: (error: unknown) => E,
): Result<T, E> => {
  try {
    return ok(run());
  } catch (error) {
    return err(mapError(error));
  }
};

export const tryAsync = async <T, E>(
  run: () => Promise<T>,
  mapError: (error: unknown) => E,
): Promise<Result<T, E>> =>
  run().then(
    (value) => ok(value),
    (error) => err(mapError(error)),
  );
