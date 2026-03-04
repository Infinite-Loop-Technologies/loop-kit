export type Result<T, E> = Ok<T> | Err<E>;

export type Ok<T> = {
    ok: true;
    value: T;
};

export type Err<E> = {
    ok: false;
    error: E;
};

export function ok<T>(value: T): Ok<T> {
    return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
    return { ok: false, error };
}

export function unwrap<T, E>(result: Result<T, E>): T {
    if (result.ok) {
        return result.value;
    }

    throw new Error(`Tried to unwrap Err result: ${String(result.error)}`);
}
