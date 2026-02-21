import {
  GRAPHITE_MUTATION_SYMBOL,
  type LinkMutationPayload,
  type MoveMutationPayload,
  type MutationCommand,
  type QueryDirectiveObject,
  type QueryMacro,
  type UnlinkMutationPayload,
} from './types';

/**
 * Creates a typed mutation command object.
 */
export function mutation<Name extends string, Payload>(
  kind: Name,
  payload: Payload
): MutationCommand<Name, Payload> {
  return {
    [GRAPHITE_MUTATION_SYMBOL]: true,
    kind,
    payload,
  };
}

/**
 * Type guard for mutation command objects.
 */
export function isMutationCommand(value: unknown): value is MutationCommand {
  if (typeof value !== 'object' || value === null) return false;
  return (
    GRAPHITE_MUTATION_SYMBOL in value &&
    (value as Record<typeof GRAPHITE_MUTATION_SYMBOL, unknown>)[GRAPHITE_MUTATION_SYMBOL] === true
  );
}

/**
 * Built-in mutation helpers.
 */
export const $set = <T>(value: T) => mutation('set', value);
export const $merge = <T>(value: T) => mutation('merge', value);
export const $delete = () => mutation('delete', undefined);
export const $move = (payload: MoveMutationPayload) => mutation('move', payload);
export const $link = (payload: LinkMutationPayload) => mutation('link', payload);
export const $unlink = (payload: UnlinkMutationPayload) => mutation('unlink', payload);

/**
 * Creates a strongly typed custom mutation helper.
 */
export function defineMutation<
  const Name extends string,
  const Args extends readonly unknown[],
  Payload,
>(
  name: Name,
  payloadFactory: (...args: Args) => Payload
): (...args: Args) => MutationCommand<Name, Payload> {
  return (...args: Args) => mutation(name, payloadFactory(...args));
}

/**
 * Marks an object as a query macro fragment.
 */
export function queryMacro<T extends QueryDirectiveObject>(directive: T): QueryMacro<T> {
  return directive as QueryMacro<T>;
}

/**
 * Built-in query macro helpers.
 */
export const $where = (predicate: unknown) => queryMacro({ $where: predicate });
export const $orderBy = (order: unknown) => queryMacro({ $orderBy: order });
export const $limit = (count: number) => queryMacro({ $limit: count });
export const $offset = (count: number) => queryMacro({ $offset: count });
export const $each = (descriptor: unknown = true) => queryMacro({ $each: descriptor });

/**
 * Creates a strongly typed custom query macro helper.
 */
export function defineQueryMacro<
  const Name extends string,
  const Args extends readonly unknown[],
  Payload,
>(
  name: Name,
  payloadFactory: (...args: Args) => Payload
): (...args: Args) => QueryMacro<Record<`$${Name}`, Payload>> {
  return (...args: Args) => queryMacro({ [`$${name}`]: payloadFactory(...args) } as Record<
    `$${Name}`,
    Payload
  >);
}

/**
 * Shallowly composes query macro fragments from left to right.
 */
export function composeQuery(...fragments: QueryDirectiveObject[]): QueryDirectiveObject {
  const next: QueryDirectiveObject = {};
  for (const fragment of fragments) {
    for (const [key, value] of Object.entries(fragment)) {
      next[key] = value;
    }
  }
  return next;
}
