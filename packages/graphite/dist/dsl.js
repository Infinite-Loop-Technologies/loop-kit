import { GRAPHITE_MUTATION_SYMBOL, } from './types';
export function mutation(kind, payload) {
    return {
        [GRAPHITE_MUTATION_SYMBOL]: true,
        kind,
        payload,
    };
}
export function isMutationCommand(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    return (GRAPHITE_MUTATION_SYMBOL in value &&
        value[GRAPHITE_MUTATION_SYMBOL] === true);
}
export const $set = (value) => mutation('set', value);
export const $merge = (value) => mutation('merge', value);
export const $delete = () => mutation('delete', undefined);
export const $move = (payload) => mutation('move', payload);
export const $link = (payload) => mutation('link', payload);
export const $unlink = (payload) => mutation('unlink', payload);
export function defineMutation(name, payloadFactory) {
    return (...args) => mutation(name, payloadFactory(...args));
}
export function queryMacro(directive) {
    return directive;
}
export const $where = (predicate) => queryMacro({ $where: predicate });
export const $orderBy = (order) => queryMacro({ $orderBy: order });
export const $limit = (count) => queryMacro({ $limit: count });
export const $offset = (count) => queryMacro({ $offset: count });
export const $each = (descriptor = true) => queryMacro({ $each: descriptor });
export function defineQueryMacro(name, payloadFactory) {
    return (...args) => queryMacro({ [`$${name}`]: payloadFactory(...args) });
}
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