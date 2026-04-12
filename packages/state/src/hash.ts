// Adapted from use.gpu/packages/state/src/hash.ts. See ../UPSTREAM.md.

let objectKeyCounter = 0;
const objectKeys = new WeakMap<object, number>();

export const makeKey = (): number => ++objectKeyCounter;

export const getObjectKey = (value: unknown): number => {
    if (value && (typeof value === 'object' || typeof value === 'function')) {
        const existing = objectKeys.get(value as object);
        if (existing != null) {
            return existing;
        }
        const next = makeKey();
        objectKeys.set(value as object, next);
        return next;
    }
    return 0;
};

const DEFAULT_HASH_KEY = 0xf1c3a587;
let globalHashKey = DEFAULT_HASH_KEY;

export const setGlobalHashKey = (key?: number) => {
    globalHashKey = key ?? DEFAULT_HASH_KEY;
};

const C1 = 0xcc9e2d51;
const C2 = 0x1b873593;
const C3 = 0xe6546b64;
const C4 = 0x85ebca6b;
const C5 = 0xc2b2ae35;

const add = (left: number, right: number) => ((left | 0) + (right | 0)) >>> 0;
const rotate = (value: number, bits: number) => ((value << bits) | (value >>> (32 - bits))) >>> 0;
const multiply = Math.imul;

export const toUint53 = (left: number, right: number) =>
    (left >>> 0) + ((right & 0x1fffff) * 0x100000000);

export const formatMurmur53 = (value: number) => value.toString(36).slice(-10);
export const toHash = <T>(value: T) => formatMurmur53(toMurmur53(value));

const float64 = new Float64Array(1);
const uint32 = new Uint32Array(float64.buffer);

const isTypedArray = (() => {
    const TypedArray = Object.getPrototypeOf(Uint8Array);
    return (value: unknown): value is ArrayBufferView => value instanceof TypedArray;
})();

export type TypedArray =
    | Int8Array
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Uint8ClampedArray
    | Float32Array
    | Float64Array;

export const toMurmur53 = (value: unknown): number => {
    if (typeof value === 'string') return stringToMurmur53(value, globalHashKey + 15);
    if (typeof value === 'number') return scrambleBits53(numberHash(value));
    if (typeof value === 'boolean') return scrambleBits53(mixBits53(globalHashKey + 255, Number(value)));
    if (value === undefined) return scrambleBits53(mixBits53(globalHashKey, 1));
    if (value === null) return scrambleBits53(mixBits53(globalHashKey, 2));
    if (Array.isArray(value)) return arrayHash(value);
    if (isTypedArray(value)) return typedArrayHash(value as TypedArray);
    if (value && typeof value === 'object') return objectHash(value as Record<string, unknown>);
    return scrambleBits53(mixBits53(globalHashKey, -1));
};

const numberHash = (value: number) => {
    float64[0] = value;
    let hash = globalHashKey + 63;
    hash = mixBits53(hash, uint32[0] ?? 0);
    hash = mixBits53(hash, uint32[1] ?? 0);
    return hash;
};

const arrayHash = (value: readonly unknown[]) => {
    let hash = mixBits53(globalHashKey + 1023, 0);
    for (const entry of value) {
        hash = mixBits53(hash, toMurmur53(entry));
    }
    return scrambleBits53(hash, value.length);
};

const objectHash = (value: Record<string, unknown>) => {
    let count = 0;
    let hash = mixBits53(globalHashKey + 4095, 0);
    for (const key in value) {
        hash = mixBits53(hash, toMurmur53(key));
        hash = mixBits53(hash, toMurmur53(value[key]));
        count += 1;
    }
    return scrambleBits53(hash, count);
};

const typedArrayHash = (value: TypedArray) => {
    let hash = mixBits53(globalHashKey + 16383, 0);
    if (
        value instanceof Int8Array ||
        value instanceof Uint8Array ||
        value instanceof Int16Array ||
        value instanceof Uint16Array ||
        value instanceof Int32Array ||
        value instanceof Uint32Array ||
        value instanceof Uint8ClampedArray
    ) {
        hash = integerArrayToMurmur53(value as unknown as number[], hash);
    } else {
        for (let index = 0; index < value.length; index += 1) {
            hash = mixBits53(hash, numberHash(value[index] ?? 0));
        }
    }
    return scrambleBits53(hash);
};

const integerArrayToMurmur53 = (values: number[] | TypedArray, seed = 0) => {
    const length = values.length;
    let left = seed;
    let right = seed ^ C4;

    for (let index = 0; index < length; index += 1) {
        const data = values[index] ?? 0;
        let dataLeft = add(rotate(data, 16), add(left, right));
        let dataRight = add(data, left);

        dataLeft = multiply(dataLeft, C1);
        dataLeft = rotate(dataLeft, 15);
        dataLeft = multiply(dataLeft, C2);
        left ^= dataLeft;
        left = rotate(left, 13);
        left = add(multiply(left, 5), C3);

        dataRight = multiply(dataRight, C1);
        dataRight = rotate(dataRight, 15);
        dataRight = multiply(dataRight, C2);
        right ^= dataRight;
        right = rotate(right, 13);
        right = add(multiply(right, 5), C3);
    }

    left ^= length;
    right ^= length;
    left = scrambleBits(left);
    right = scrambleBits(right);
    return toUint53(left, right);
};

const stringToMurmur53 = (value: string, seed = 0) => {
    const length = value.length;
    let left = seed;
    let right = seed ^ C4;

    for (let index = 0; index < length; index += 1) {
        const data = value.charCodeAt(index);
        let dataLeft = add(rotate(data, 16), add(left, right));
        let dataRight = add(data, left);

        dataLeft = multiply(dataLeft, C1);
        dataLeft = rotate(dataLeft, 15);
        dataLeft = multiply(dataLeft, C2);
        left ^= dataLeft;
        left = rotate(left, 13);
        left = add(multiply(left, 5), C3);

        dataRight = multiply(dataRight, C1);
        dataRight = rotate(dataRight, 15);
        dataRight = multiply(dataRight, C2);
        right ^= dataRight;
        right = rotate(right, 13);
        right = add(multiply(right, 5), C3);
    }

    left ^= length;
    right ^= length;
    left = scrambleBits(left);
    right = scrambleBits(right);
    return toUint53(left, right);
};

export const hashBits53 = (value: number) => scrambleBits53(mixBits53(globalHashKey + 65535, value));

export const mixBits = (value: number, data: number) => {
    data = multiply(data, C1);
    data = rotate(data, 15);
    data = multiply(data, C2);
    value ^= data;
    value = rotate(value, 13);
    value = add(multiply(value, 5), C3);
    return value;
};

export const scrambleBits = (value: number, count = 0) => {
    value ^= count;
    value ^= value >>> 16;
    value = multiply(value, C4);
    value ^= value >>> 13;
    value = multiply(value, C5);
    value ^= value >>> 16;
    return value;
};

export const mixBits53 = (value: number, data: number) => {
    let left = value >>> 0;
    let right = Math.floor(value / 0x100000000);

    let dataLeft = add(rotate(data, 16), add(left, right));
    let dataRight = add(data, left);

    dataLeft = multiply(dataLeft, C1);
    dataLeft = rotate(dataLeft, 15);
    dataLeft = multiply(dataLeft, C2);
    left ^= dataLeft;
    left = rotate(left, 13);
    left = add(multiply(left, 5), C3);

    dataRight = multiply(dataRight, C1);
    dataRight = rotate(dataRight, 15);
    dataRight = multiply(dataRight, C2);
    right ^= dataRight;
    right = rotate(right, 13);
    right = add(multiply(right, 5), C3);

    return toUint53(left, right);
};

export const scrambleBits53 = (value: number, count = 0) => {
    let left = value >>> 0;
    let right = Math.floor(value / 0x100000000);
    left ^= count;
    right ^= count;
    left = scrambleBits(left);
    right = scrambleBits(right);
    return toUint53(left, right);
};
