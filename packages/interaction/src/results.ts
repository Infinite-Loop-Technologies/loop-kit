export type Result<TValue, TError> =
    | {
          ok: true;
          value: TValue;
      }
    | {
          ok: false;
          error: TError;
      };

export type Option<TValue> =
    | {
          ok: true;
          value: TValue;
      }
    | {
          ok: false;
      };

export function success<TValue>(value: TValue): Option<TValue> {
    return {
        ok: true,
        value,
    };
}

export function none<TValue = never>(): Option<TValue> {
    return {
        ok: false,
    };
}

export function ok<TValue, TError = never>(value: TValue): Result<TValue, TError> {
    return {
        ok: true,
        value,
    };
}

export function fail<TValue = never, TError = string>(error: TError): Result<TValue, TError> {
    return {
        ok: false,
        error,
    };
}
