export type NonEmptyArray<T> = [T, ...Array<T>];

export type NonEmptyReadonlyArray<T> = readonly [T, ...ReadonlyArray<T>];

export const isNonEmptyArray = <T>(
  value: ReadonlyArray<T>,
): value is NonEmptyReadonlyArray<T> => value.length > 0;

export const appendToArray = <T>(
  value: ReadonlyArray<T>,
  item: T,
): NonEmptyReadonlyArray<T> => [...value, item] as unknown as NonEmptyReadonlyArray<T>;

export const firstInArray = <T>(value: NonEmptyReadonlyArray<T>): T => value[0];

export const lastInArray = <T>(value: NonEmptyReadonlyArray<T>): T =>
  value[value.length - 1];
