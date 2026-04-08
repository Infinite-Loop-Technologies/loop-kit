import type { Merge, Update } from './types.js';

const DELETE_SENTINEL = { $delete: true } as const;
const NOP_SENTINEL = { $nop: true } as const;

const isTypedArray = (() => {
    const TypedArray = Object.getPrototypeOf(Uint8Array);
    return (value: unknown): value is ArrayBufferView => value instanceof TypedArray;
})();

export const $set = <T>(value: T): Update<T> => ({ $set: value });
export const $merge = <T>(value: T): Update<T> => ({ $merge: value as Merge<T> });
export const $delete = (): Update<never> => DELETE_SENTINEL as Update<never>;
export const $nop = (): Update<never> => NOP_SENTINEL as Update<never>;
export const $apply = <T>(apply: (value: T) => T): Update<T> => ({ $apply: apply });
export const $patch = <T>(apply: (value: T) => Update<T>): Update<T> => ({ $patch: apply });

const maybeSet = <T>(value: T): Update<T> => {
    if (!value || typeof value !== 'object' || Array.isArray(value) || isTypedArray(value)) {
        return value;
    }
    return $set(value) as Update<T>;
};

export const patch = <T>(value: T, update: Update<T>): T => {
    if (update && typeof update === 'object') {
        if ('$nop' in update) return value;
        if ('$set' in update) return update.$set;
        if ('$apply' in update) return update.$apply(value);
        if ('$patch' in update) return patch(value, update.$patch(value));
        if ('$merge' in update) return merge(value, update.$merge);
        if ('$delete' in update) return undefined as T;
    }

    return merge(value, update as Merge<T>);
};

const merge = <T>(value: T, update: Merge<T>): T => {
    if (typeof update === 'boolean' || typeof update === 'number' || typeof update === 'string') {
        return update as T;
    }
    if (Array.isArray(update) || isTypedArray(update) || update === null) {
        return update as T;
    }
    if (update === undefined) {
        return value;
    }

    if (typeof update === 'object') {
        if (typeof value !== 'object' || value == null) {
            value = {} as T;
        }

        if (Array.isArray(value)) {
            const output: unknown[] = [];
            const source = value as unknown[];
            const patchObject = update as Record<string, unknown>;
            for (let index = 0; index < source.length; index += 1) {
                if (Object.hasOwn(patchObject, index)) {
                    const next = patch(source[index], patchObject[String(index)] as Update<unknown>);
                    if (next !== undefined) {
                        output.push(next);
                    }
                } else {
                    output.push(source[index]);
                }
            }
            return output as T;
        }

        if (isTypedArray(value)) {
            throw new Error("Can't patch typed array with merge");
        }

        const source = value as Record<string, unknown>;
        const patchObject = update as Record<string, unknown>;
        const output: Record<string, unknown> = {};

        for (const key in source) {
            if (Object.hasOwn(patchObject, key)) {
                const next = patch(source[key], patchObject[key] as Update<unknown>);
                if (next !== undefined) {
                    output[key] = next;
                }
            } else {
                output[key] = source[key];
            }
        }

        for (const key in patchObject) {
            if (!Object.hasOwn(source, key)) {
                const next = patch(undefined, patchObject[key] as Update<unknown>);
                if (next !== undefined) {
                    output[key] = next;
                }
            }
        }

        return output as T;
    }

    return value;
};

export const revise = <T>(value: T, update: Update<T>): Update<T> => {
    if (update && typeof update === 'object') {
        if ('$nop' in update) return $nop() as Update<T>;
        if ('$set' in update) return maybeSet(value);
        if ('$apply' in update) return diff(update.$apply(value), value);
        if ('$patch' in update) return revise(value, update.$patch(value));
        if ('$merge' in update) return pick(value, update.$merge as Update<T>);
        if ('$delete' in update) return maybeSet(value);
    }

    return pick(value, update);
};

const pick = <T>(value: T, update: Update<T>): Update<T> => {
    if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
        return value;
    }
    if (value === null) {
        return value;
    }
    if (value === undefined) {
        return $delete() as Update<T>;
    }

    if (Array.isArray(update) || isTypedArray(update) || update === null) {
        return maybeSet(value) as Update<T>;
    }

    if (typeof update === 'object' && update !== null) {
        if (typeof value !== 'object' || value == null) {
            return maybeSet(value) as Update<T>;
        }

        const output: Record<string, unknown> = {};
        const patchObject = update as Record<string, unknown>;

        if (Array.isArray(value) || isTypedArray(value)) {
            const source = value as ArrayLike<unknown>;
            for (const key in patchObject) {
                const index = Number(key);
                if (Object.hasOwn(source, index)) {
                    output[key] = revise(source[index], patchObject[key] as Update<unknown>);
                } else {
                    output[key] = $delete();
                }
            }
            return output as Update<T>;
        }

        const source = value as Record<string, unknown>;
        for (const key in source) {
            if (Object.hasOwn(patchObject, key)) {
                output[key] = revise(source[key], patchObject[key] as Update<unknown>);
            }
        }

        for (const key in patchObject) {
            if (!Object.hasOwn(source, key)) {
                output[key] = $delete();
            }
        }

        return output as Update<T>;
    }

    throw new Error(`Unsupported revise "${String(value)}" vs "${String(update)}"`);
};

export const diff = <T>(left: T, right: T): Update<T> => {
    if (left === right) {
        return undefined;
    }
    if (typeof right === 'boolean' || typeof right === 'number' || typeof right === 'string') {
        return right;
    }
    if (Array.isArray(right) || isTypedArray(right) || right === null) {
        return right;
    }
    if (right === undefined) {
        return $delete() as Update<T>;
    }

    if (typeof right === 'object') {
        if (typeof left !== 'object' || left == null || Array.isArray(left) || isTypedArray(left)) {
            return maybeSet(right) as Update<T>;
        }

        const source = left as Record<string, unknown>;
        const target = right as Record<string, unknown>;
        const output: Record<string, unknown> = {};

        for (const key in source) {
            if (Object.hasOwn(target, key)) {
                const next = diff(source[key], target[key]);
                if (next !== undefined) {
                    output[key] = next;
                }
            } else {
                output[key] = $delete();
            }
        }

        for (const key in target) {
            if (!Object.hasOwn(source, key)) {
                const next = target[key];
                output[key] =
                    next && typeof next === 'object' && !Array.isArray(next) && !isTypedArray(next)
                        ? $set(next)
                        : next;
            }
        }

        return output as Update<T>;
    }

    throw new Error(`Unsupported diff "${String(left)}" vs "${String(right)}"`);
};

export const getUpdateKeys = <T>(update: Update<T>): string[] => {
    const keys: string[] = [];

    const visit = (value: Update<T>, path: string | null) => {
        if (value && typeof value === 'object') {
            if ('$nop' in value) return;
            if ('$set' in value || '$apply' in value || '$patch' in value || '$delete' in value) {
                keys.push(path ?? '');
                return;
            }
            if ('$merge' in value) {
                descend(value.$merge as Update<T>, path);
                return;
            }
        }

        descend(value, path);
    };

    const descend = (value: Update<T>, path: string | null) => {
        if (value && typeof value === 'object') {
            if (Array.isArray(value) || isTypedArray(value)) {
                keys.push(path ?? '');
                return;
            }
            for (const key in value as Record<string, unknown>) {
                visit((value as Record<string, Update<T>>)[key], path ? `${path}.${key}` : key);
            }
            return;
        }
        if (value !== undefined) {
            keys.push(path ?? '');
        }
    };

    visit(update, null);
    return keys;
};
