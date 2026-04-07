export type Option<T> =
    | {
          ok: true;
          value: T;
      }
    | {
          ok: false;
      };

export type Result<T, E> =
    | {
          ok: true;
          value: T;
      }
    | {
          ok: false;
          error: E;
      };

export function some<T>(value: T): Option<T> {
    return {
        ok: true,
        value,
    };
}

export function none<T = never>(): Option<T> {
    return {
        ok: false,
    };
}

export function success<T, E = never>(value: T): Result<T, E> {
    return {
        ok: true,
        value,
    };
}

export function failure<T = never, E = string>(error: E): Result<T, E> {
    return {
        ok: false,
        error,
    };
}
