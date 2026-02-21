import { GRAPHITE_MUTATION_SYMBOL, } from './types';
/**
 * Creates a typed mutation command object.
 */
export function mutation(kind, payload) {
    return {
        [GRAPHITE_MUTATION_SYMBOL]: true,
        kind,
        payload,
    };
}
/**
 * Type guard for mutation command objects.
 */
export function isMutationCommand(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    return (GRAPHITE_MUTATION_SYMBOL in value &&
        value[GRAPHITE_MUTATION_SYMBOL] === true);
}
/**
 * Built-in mutation helpers.
 */
export const $set = (value) => mutation('set', value);
export const $merge = (value) => mutation('merge', value);
export const $delete = () => mutation('delete', undefined);
export const $move = (payload) => mutation('move', payload);
export const $link = (payload) => mutation('link', payload);
export const $unlink = (payload) => mutation('unlink', payload);
/**
 * Creates a strongly typed custom mutation helper.
 */
export function defineMutation(name, payloadFactory) {
    return (...args) => mutation(name, payloadFactory(...args));
}
/**
 * Marks an object as a query macro fragment.
 */
export function queryMacro(directive) {
    return directive;
}
/**
 * Built-in query macro helpers.
 */
export const $where = (predicate) => queryMacro({ $where: predicate });
export const $orderBy = (order) => queryMacro({ $orderBy: order });
export const $limit = (count) => queryMacro({ $limit: count });
export const $offset = (count) => queryMacro({ $offset: count });
export const $each = (descriptor = true) => queryMacro({ $each: descriptor });
/**
 * Creates a strongly typed custom query macro helper.
 */
export function defineQueryMacro(name, payloadFactory) {
    return (...args) => queryMacro({ [`$${name}`]: payloadFactory(...args) });
}
/**
 * Shallowly composes query macro fragments from left to right.
 */
export function composeQuery(...fragments) {
    const next = {};
    for (const fragment of fragments) {
        for (const [key, value] of Object.entries(fragment)) {
            next[key] = value;
        }
    }
    return next;
}
//# sourceMappingURL=dsl.js.map