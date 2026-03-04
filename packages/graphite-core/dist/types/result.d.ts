export type Result<T, E> = Ok<T> | Err<E>;
export type Ok<T> = {
    ok: true;
    value: T;
};
export type Err<E> = {
    ok: false;
    error: E;
};
export declare function ok<T>(value: T): Ok<T>;
export declare function err<E>(error: E): Err<E>;
export declare function unwrap<T, E>(result: Result<T, E>): T;
//# sourceMappingURL=result.d.ts.map