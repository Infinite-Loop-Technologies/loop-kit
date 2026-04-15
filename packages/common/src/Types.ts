export type Predicate<T> = (value: T) => boolean;

export type PredicateWithIndex<T> = (value: T, index: number) => boolean;

export type Refinement<A, B extends A> = (value: A) => value is B;

export type RefinementWithIndex<A, B extends A> = (
  value: A,
  index: number,
) => value is B;

export type Simplify<T> = { [K in keyof T]: T[K] } & {};
