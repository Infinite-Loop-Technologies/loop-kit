import { $delete, $set, isMutationCommand } from './dsl';
const numericPathPattern = /^\d+$/;
const now = () => typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
const DEFAULT_HISTORY_CHANNEL = 'default';
function isObjectLike(value) {
    return typeof value === 'object' && value !== null;
}
function isPlainObject(value) {
    if (!isObjectLike(value))
        return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}
function asArrayIndex(segment) {
    if (typeof segment === 'number') {
        return Number.isInteger(segment) && segment >= 0 ? segment : null;
    }
    if (typeof segment !== 'string' || !numericPathPattern.test(segment))
        return null;
    const parsed = Number(segment);
    return Number.isInteger(parsed) ? parsed : null;
}
function isGraphPath(value) {
    return Array.isArray(value);
}
function isPathSegmentValue(value) {
    return typeof value === 'string' || (typeof value === 'number' && Number.isInteger(value));
}
function isUnknownGraphPath(value) {
    return Array.isArray(value) && value.every((segment) => isPathSegmentValue(segment));
}
function cloneValue(value) {
    if (!isObjectLike(value))
        return value;
    const structured = globalThis.structuredClone;
    if (typeof structured === 'function') {
        try {
            return structured(value);
        }
        catch {
            // Fall through.
        }
    }
    if (Array.isArray(value)) {
        return value.map((entry) => cloneValue(entry));
    }
    if (value instanceof Date) {
        return new Date(value.getTime());
    }
    if (value instanceof Map) {
        const next = new Map();
        for (const [key, mapped] of value.entries()) {
            next.set(cloneValue(key), cloneValue(mapped));
        }
        return next;
    }
    if (value instanceof Set) {
        const next = new Set();
        for (const entry of value.values()) {
            next.add(cloneValue(entry));
        }
        return next;
    }
    if (isPlainObject(value)) {
        const next = {};
        for (const [key, entry] of Object.entries(value)) {
            next[key] = cloneValue(entry);
        }
        return next;
    }
    return value;
}
function deepEqual(left, right, seen = new WeakMap()) {
    if (Object.is(left, right))
        return true;
    if (typeof left !== typeof right)
        return false;
    if (!isObjectLike(left) || !isObjectLike(right))
        return false;
    if (seen.get(left) === right)
        return true;
    seen.set(left, right);
    if (Array.isArray(left) && Array.isArray(right)) {
        if (left.length !== right.length)
            return false;
        for (let index = 0; index < left.length; index += 1) {
            if (!deepEqual(left[index], right[index], seen))
                return false;
        }
        return true;
    }
    if (left instanceof Date && right instanceof Date) {
        return left.getTime() === right.getTime();
    }
    if (left instanceof Map && right instanceof Map) {
        if (left.size !== right.size)
            return false;
        for (const [key, value] of left.entries()) {
            if (!right.has(key))
                return false;
            if (!deepEqual(value, right.get(key), seen))
                return false;
        }
        return true;
    }
    if (left instanceof Set && right instanceof Set) {
        if (left.size !== right.size)
            return false;
        const leftValues = [...left.values()];
        const rightValues = [...right.values()];
        return leftValues.every((leftEntry) => rightValues.some((rightEntry) => deepEqual(leftEntry, rightEntry, seen)));
    }
    const leftRecord = left;
    const rightRecord = right;
    const leftKeys = Object.keys(leftRecord);
    const rightKeys = Object.keys(rightRecord);
    if (leftKeys.length !== rightKeys.length)
        return false;
    for (const key of leftKeys) {
        if (!(key in rightRecord))
            return false;
        if (!deepEqual(leftRecord[key], rightRecord[key], seen))
            return false;
    }
    return true;
}
function encodePath(path) {
    if (path.length === 0)
        return '<root>';
    return path
        .map((segment) => typeof segment === 'number'
        ? `#${segment.toString(10)}`
        : `$${segment.replaceAll('\\', '\\\\').replaceAll('/', '\\/')}`)
        .join('/');
}
function appendPath(path, segment) {
    return [...path, segment];
}
function getAtPath(root, path) {
    if (path.length === 0)
        return root;
    let current = root;
    for (const segment of path) {
        if (!isObjectLike(current))
            return undefined;
        current = current[String(segment)];
    }
    return current;
}
function pathExists(root, path) {
    if (path.length === 0)
        return true;
    let current = root;
    for (const segment of path) {
        if (!isObjectLike(current))
            return false;
        const key = String(segment);
        if (!(key in current))
            return false;
        current = current[key];
    }
    return true;
}
function setAtPath(root, path, value) {
    if (path.length === 0) {
        if (!isPlainObject(value)) {
            throw new Error('Graphite root state must remain an object.');
        }
        for (const key of Object.keys(root)) {
            delete root[key];
        }
        for (const [key, entry] of Object.entries(value)) {
            root[key] = entry;
        }
        return;
    }
    let current = root;
    for (let index = 0; index < path.length - 1; index += 1) {
        const segment = path[index];
        const key = String(segment);
        const next = current[key];
        if (!isObjectLike(next)) {
            const upcoming = path[index + 1];
            current[key] = typeof upcoming === 'number' ? [] : {};
        }
        current = current[key];
    }
    const lastKey = String(path[path.length - 1]);
    current[lastKey] = value;
}
function deleteAtPath(root, path) {
    if (path.length === 0) {
        for (const key of Object.keys(root)) {
            delete root[key];
        }
        return;
    }
    const parentPath = path.slice(0, -1);
    const parent = getAtPath(root, parentPath);
    if (!isObjectLike(parent))
        return;
    const rawKey = path[path.length - 1];
    const key = String(rawKey);
    if (Array.isArray(parent)) {
        const index = asArrayIndex(typeof rawKey === 'undefined' ? key : rawKey);
        if (index !== null) {
            parent.splice(index, 1);
            return;
        }
    }
    delete parent[key];
}
function normalizeTargetPath(base, target) {
    if (typeof target === 'undefined')
        return base;
    if (isGraphPath(target))
        return target;
    return appendPath(base, target);
}
function arePathsRelated(left, right) {
    const length = Math.min(left.length, right.length);
    for (let index = 0; index < length; index += 1) {
        if (left[index] !== right[index])
            return false;
    }
    return true;
}
function normalizeOperatorName(name) {
    return name.startsWith('$') ? name.slice(1) : name;
}
function toDirection(value) {
    if (typeof value === 'string') {
        return value.toLowerCase() === 'desc' ? -1 : 1;
    }
    if (typeof value === 'number') {
        return value < 0 ? -1 : 1;
    }
    return 1;
}
function asStringArray(value) {
    if (Array.isArray(value)) {
        return value.filter((entry) => typeof entry === 'string');
    }
    if (typeof value === 'string')
        return [value];
    return [];
}
function pickBySelector(source, selector) {
    if (!selector.includes('.')) {
        if (!isObjectLike(source))
            return undefined;
        return source[selector];
    }
    let current = source;
    for (const step of selector.split('.')) {
        if (!isObjectLike(current))
            return undefined;
        current = current[step];
    }
    return current;
}
function compareValues(left, right) {
    if (Object.is(left, right))
        return 0;
    if (typeof left === 'number' && typeof right === 'number') {
        return left < right ? -1 : 1;
    }
    if (typeof left === 'bigint' && typeof right === 'bigint') {
        return left < right ? -1 : 1;
    }
    if (left instanceof Date && right instanceof Date) {
        return left.getTime() < right.getTime() ? -1 : 1;
    }
    const leftText = String(left).toLowerCase();
    const rightText = String(right).toLowerCase();
    if (leftText === rightText)
        return 0;
    return leftText < rightText ? -1 : 1;
}
function isComparisonDescriptor(value) {
    if (!isPlainObject(value))
        return false;
    return Object.keys(value).some((key) => key.startsWith('$'));
}
function evaluateComparison(actual, descriptor) {
    for (const [operator, expected] of Object.entries(descriptor)) {
        switch (operator) {
            case '$eq': {
                if (!deepEqual(actual, expected))
                    return false;
                break;
            }
            case '$ne': {
                if (deepEqual(actual, expected))
                    return false;
                break;
            }
            case '$gt': {
                if (!(compareValues(actual, expected) > 0))
                    return false;
                break;
            }
            case '$gte': {
                if (!(compareValues(actual, expected) >= 0))
                    return false;
                break;
            }
            case '$lt': {
                if (!(compareValues(actual, expected) < 0))
                    return false;
                break;
            }
            case '$lte': {
                if (!(compareValues(actual, expected) <= 0))
                    return false;
                break;
            }
            case '$in': {
                if (!Array.isArray(expected) || !expected.some((entry) => deepEqual(entry, actual))) {
                    return false;
                }
                break;
            }
            case '$nin': {
                if (Array.isArray(expected) && expected.some((entry) => deepEqual(entry, actual))) {
                    return false;
                }
                break;
            }
            case '$contains': {
                if (typeof actual === 'string') {
                    if (!actual.includes(String(expected)))
                        return false;
                    break;
                }
                if (Array.isArray(actual)) {
                    if (!actual.some((entry) => deepEqual(entry, expected)))
                        return false;
                    break;
                }
                return false;
            }
            default: {
                break;
            }
        }
    }
    return true;
}
function matchesWhereDescriptor(item, descriptor) {
    if (typeof descriptor === 'function') {
        return Boolean(descriptor(item));
    }
    if (Array.isArray(descriptor)) {
        return descriptor.every((entry) => matchesWhereDescriptor(item, entry));
    }
    if (!isPlainObject(descriptor)) {
        return deepEqual(item, descriptor);
    }
    if (!isObjectLike(item))
        return false;
    for (const [selector, expected] of Object.entries(descriptor)) {
        const actual = pickBySelector(item, selector);
        if (typeof expected === 'function') {
            if (!Boolean(expected(actual, item))) {
                return false;
            }
            continue;
        }
        if (isComparisonDescriptor(expected)) {
            if (!evaluateComparison(actual, expected))
                return false;
            continue;
        }
        if (!deepEqual(actual, expected))
            return false;
    }
    return true;
}
function normalizeOrderDescriptors(directive) {
    if (typeof directive === 'function')
        return null;
    if (typeof directive === 'string') {
        return [{ key: directive, direction: 1 }];
    }
    if (Array.isArray(directive)) {
        if (directive.length === 2 && typeof directive[0] === 'string') {
            return [{ key: directive[0], direction: toDirection(directive[1]) }];
        }
        const descriptors = [];
        for (const entry of directive) {
            if (typeof entry === 'string') {
                descriptors.push({ key: entry, direction: 1 });
                continue;
            }
            if (isPlainObject(entry) && typeof entry.key === 'string') {
                descriptors.push({ key: entry.key, direction: toDirection(entry.direction) });
            }
        }
        return descriptors.length > 0 ? descriptors : null;
    }
    if (isPlainObject(directive) && typeof directive.key === 'string') {
        return [{ key: directive.key, direction: toDirection(directive.direction) }];
    }
    return null;
}
function compareWithDescriptors(left, right, descriptors) {
    for (const descriptor of descriptors) {
        const leftValue = typeof descriptor.key === 'function' ? descriptor.key(left) : pickBySelector(left, descriptor.key);
        const rightValue = typeof descriptor.key === 'function' ? descriptor.key(right) : pickBySelector(right, descriptor.key);
        const comparison = compareValues(leftValue, rightValue) * descriptor.direction;
        if (comparison !== 0)
            return comparison;
    }
    return 0;
}
function coerceMovePayload(payload) {
    if (!isPlainObject(payload))
        return null;
    const from = payload.from;
    const to = payload.to;
    const fromValid = typeof from === 'string' || typeof from === 'number' || Array.isArray(from);
    const toValid = typeof to === 'string' || typeof to === 'number' || Array.isArray(to);
    if (!fromValid || !toValid)
        return null;
    return {
        from: from,
        to: to,
    };
}
function isLinkPayload(payload) {
    if (!isPlainObject(payload))
        return false;
    if (typeof payload.relation !== 'string')
        return false;
    const to = payload.to;
    const nodesPath = payload.nodesPath;
    const hasValidNodesPath = typeof nodesPath === 'undefined' || isUnknownGraphPath(nodesPath);
    return (typeof to === 'string' || Array.isArray(to)) && hasValidNodesPath;
}
function isUnlinkPayload(payload) {
    if (!isPlainObject(payload))
        return false;
    if (typeof payload.relation !== 'string')
        return false;
    const nodesPath = payload.nodesPath;
    return typeof nodesPath === 'undefined' || isUnknownGraphPath(nodesPath);
}
function isPathAllowed(path, scope) {
    if (!scope)
        return true;
    if (scope.deny?.some((denied) => arePathsRelated(path, denied))) {
        return false;
    }
    if (!scope.allow || scope.allow.length === 0) {
        return true;
    }
    if (path.length === 0) {
        return true;
    }
    return scope.allow.some((allowed) => arePathsRelated(path, allowed));
}
function isCompiledIntent(value) {
    return isPlainObject(value) && 'patch' in value;
}
function createMutationOperatorContext(executor, path) {
    return {
        state: executor.state,
        path,
        commitOptions: executor.commitOptions,
        get: (target) => executor.getValue(normalizeTargetPath(path, target)),
        set: (value, target) => executor.setValue(normalizeTargetPath(path, target), value, 'set'),
        merge: (value, target) => executor.mergeValue(normalizeTargetPath(path, target), value),
        del: (target) => executor.deleteValue(normalizeTargetPath(path, target)),
        move: (from, to, target) => executor.moveValue(normalizeTargetPath(path, target), from, to),
        link: (payload, target) => executor.linkValue(normalizeTargetPath(path, target), payload),
        unlink: (payload, target) => executor.unlinkValue(normalizeTargetPath(path, target), payload),
        apply: (command, target) => executor.applyCommand(normalizeTargetPath(path, target), command),
    };
}
class PatchExecutor {
    state;
    commitOptions;
    mutationOperators;
    changeByPath = new Map();
    changeOrder = [];
    constructor(state, mutationOperators, commitOptions) {
        this.state = state;
        this.mutationOperators = mutationOperators;
        this.commitOptions = commitOptions;
    }
    applyPatch(patch, path = []) {
        if (isMutationCommand(patch)) {
            this.applyCommand(path, patch);
            return;
        }
        if (!isPlainObject(patch)) {
            this.setValue(path, patch, 'set');
            return;
        }
        for (const [rawKey, childPatch] of Object.entries(patch)) {
            const key = rawKey;
            const nextPath = appendPath(path, key);
            if (isMutationCommand(childPatch)) {
                this.applyCommand(nextPath, childPatch);
                continue;
            }
            if (isPlainObject(childPatch)) {
                this.applyPatch(childPatch, nextPath);
                continue;
            }
            this.setValue(nextPath, childPatch, 'set');
        }
    }
    applyCommand(path, command) {
        const handler = this.mutationOperators.get(normalizeOperatorName(command.kind));
        if (!handler) {
            throw new Error(`Unknown Graphite mutation operator: ${command.kind}`);
        }
        const context = createMutationOperatorContext(this, path);
        handler(context, command.payload);
    }
    getValue(path) {
        return getAtPath(this.state, path);
    }
    setValue(path, value, operation) {
        this.capture(path, operation, () => {
            setAtPath(this.state, path, value);
        });
    }
    mergeValue(path, value) {
        const current = getAtPath(this.state, path);
        if (Array.isArray(current) && Array.isArray(value)) {
            this.capture(path, 'merge', () => {
                setAtPath(this.state, path, [...current, ...value]);
            });
            return;
        }
        if (isPlainObject(current) && isPlainObject(value)) {
            this.capture(path, 'merge', () => {
                for (const [key, entry] of Object.entries(value)) {
                    current[key] = entry;
                }
            });
            return;
        }
        this.setValue(path, value, 'merge');
    }
    deleteValue(path) {
        this.capture(path, 'delete', () => {
            deleteAtPath(this.state, path);
        });
    }
    moveValue(path, from, to) {
        const current = getAtPath(this.state, path);
        if (Array.isArray(current) && typeof from === 'number' && typeof to === 'number') {
            this.capture(path, 'move', () => {
                if (from < 0 || from >= current.length || to < 0 || to >= current.length)
                    return;
                const [item] = current.splice(from, 1);
                if (typeof item !== 'undefined') {
                    current.splice(to, 0, item);
                }
            });
            return;
        }
        if (isPlainObject(current) && typeof from === 'string' && typeof to === 'string') {
            this.capture(path, 'move', () => {
                if (!(from in current))
                    return;
                const next = current[from];
                delete current[from];
                current[to] = next;
            });
            return;
        }
        const sourcePath = isGraphPath(from) ? from : appendPath(path, from);
        const targetPath = isGraphPath(to) ? to : appendPath(path, to);
        if (!pathExists(this.state, sourcePath))
            return;
        const sourceBefore = this.snapshot(sourcePath);
        const targetBefore = this.snapshot(targetPath);
        const moved = getAtPath(this.state, sourcePath);
        deleteAtPath(this.state, sourcePath);
        setAtPath(this.state, targetPath, moved);
        const sourceAfter = this.snapshot(sourcePath);
        const targetAfter = this.snapshot(targetPath);
        this.recordChange(sourcePath, 'move', sourceBefore, sourceAfter);
        this.recordChange(targetPath, 'move', targetBefore, targetAfter);
    }
    linkValue(path, payload) {
        const fromId = this.resolveNodeId(path, payload.from);
        if (!fromId)
            return;
        const relation = payload.relation.trim();
        if (!relation)
            return;
        const targets = asStringArray(payload.to);
        if (targets.length === 0)
            return;
        const nodesPath = payload.nodesPath ?? ['nodes'];
        this.addLinks(nodesPath, fromId, relation, targets, 'link');
        if (payload.bidirectional || payload.inverseRelation) {
            const inverseRelation = payload.inverseRelation ?? relation;
            for (const target of targets) {
                this.addLinks(nodesPath, target, inverseRelation, [fromId], 'link');
            }
        }
    }
    unlinkValue(path, payload) {
        const fromId = this.resolveNodeId(path, payload.from);
        if (!fromId)
            return;
        const relation = payload.relation.trim();
        if (!relation)
            return;
        const targets = asStringArray(payload.to);
        const nodesPath = payload.nodesPath ?? ['nodes'];
        this.removeLinks(nodesPath, fromId, relation, targets.length > 0 ? targets : undefined, 'unlink');
        if (payload.bidirectional || payload.inverseRelation) {
            const inverseRelation = payload.inverseRelation ?? relation;
            if (targets.length > 0) {
                for (const target of targets) {
                    this.removeLinks(nodesPath, target, inverseRelation, [fromId], 'unlink');
                }
            }
        }
    }
    resolveNodeId(path, explicit) {
        if (explicit && explicit.trim().length > 0)
            return explicit.trim();
        const current = getAtPath(this.state, path);
        if (isPlainObject(current) && typeof current.id === 'string') {
            return current.id;
        }
        const maybeId = path[path.length - 1];
        return typeof maybeId === 'string' && maybeId.trim().length > 0 ? maybeId : null;
    }
    addLinks(nodesPath, nodeId, relation, targets, operation) {
        const relationPath = [...nodesPath, nodeId, 'links', relation];
        this.capture(relationPath, operation, () => {
            const existing = getAtPath(this.state, relationPath);
            const next = Array.isArray(existing) ? [...existing] : [];
            for (const target of targets) {
                if (!next.includes(target)) {
                    next.push(target);
                }
            }
            setAtPath(this.state, relationPath, next);
            const nodePath = [...nodesPath, nodeId];
            if (!pathExists(this.state, nodePath)) {
                setAtPath(this.state, nodePath, {
                    id: nodeId,
                    links: {
                        [relation]: next,
                    },
                });
            }
        });
    }
    removeLinks(nodesPath, nodeId, relation, targets, operation) {
        const relationPath = [...nodesPath, nodeId, 'links', relation];
        this.capture(relationPath, operation, () => {
            const existing = getAtPath(this.state, relationPath);
            if (!Array.isArray(existing))
                return;
            if (!targets || targets.length === 0) {
                deleteAtPath(this.state, relationPath);
                return;
            }
            const next = existing.filter((entry) => !targets.includes(entry));
            if (next.length === 0) {
                deleteAtPath(this.state, relationPath);
            }
            else {
                setAtPath(this.state, relationPath, next);
            }
        });
    }
    capture(path, operation, mutator) {
        const before = this.snapshot(path);
        mutator();
        const after = this.snapshot(path);
        this.recordChange(path, operation, before, after);
    }
    snapshot(path) {
        const exists = pathExists(this.state, path);
        return {
            exists,
            value: exists ? cloneValue(getAtPath(this.state, path)) : undefined,
        };
    }
    recordChange(path, operation, before, after) {
        if (before.exists === after.exists && deepEqual(before.value, after.value)) {
            return;
        }
        const key = encodePath(path);
        const existing = this.changeByPath.get(key);
        if (existing) {
            existing.after = after;
            existing.operation = operation;
            return;
        }
        this.changeOrder.push(key);
        this.changeByPath.set(key, {
            path: [...path],
            operation,
            before,
            after,
        });
    }
    getChanges() {
        const next = [];
        for (const key of this.changeOrder) {
            const change = this.changeByPath.get(key);
            if (!change)
                continue;
            next.push({
                path: [...change.path],
                operation: change.operation,
                before: {
                    exists: change.before.exists,
                    value: cloneValue(change.before.value),
                },
                after: {
                    exists: change.after.exists,
                    value: cloneValue(change.after.value),
                },
            });
        }
        return next;
    }
}
function createBuiltInMutationOperators() {
    const operators = new Map();
    operators.set('set', (ctx, payload) => {
        ctx.set(payload);
    });
    operators.set('merge', (ctx, payload) => {
        ctx.merge(payload);
    });
    operators.set('delete', (ctx) => {
        ctx.del();
    });
    operators.set('move', (ctx, payload) => {
        const move = coerceMovePayload(payload);
        if (!move)
            return;
        ctx.move(move.from, move.to);
    });
    operators.set('link', (ctx, payload) => {
        if (!isLinkPayload(payload))
            return;
        ctx.link(payload);
    });
    operators.set('unlink', (ctx, payload) => {
        if (!isUnlinkPayload(payload))
            return;
        ctx.unlink(payload);
    });
    return operators;
}
function createBuiltInQueryOperators() {
    const operators = new Map();
    operators.set('where', (value, directive) => {
        if (!Array.isArray(value))
            return value;
        return value.filter((entry, index, list) => {
            if (typeof directive === 'function') {
                return Boolean(directive(entry, index, list));
            }
            return matchesWhereDescriptor(entry, directive);
        });
    });
    operators.set('orderBy', (value, directive) => {
        if (!Array.isArray(value))
            return value;
        const next = [...value];
        if (typeof directive === 'function') {
            next.sort((left, right) => {
                const compared = directive(left, right);
                if (Number.isNaN(compared))
                    return 0;
                return compared;
            });
            return next;
        }
        const descriptors = normalizeOrderDescriptors(directive);
        if (!descriptors || descriptors.length === 0)
            return next;
        next.sort((left, right) => compareWithDescriptors(left, right, descriptors));
        return next;
    });
    operators.set('limit', (value, directive) => {
        if (!Array.isArray(value))
            return value;
        const limit = Number(directive);
        if (!Number.isFinite(limit))
            return value;
        return value.slice(0, Math.max(0, Math.trunc(limit)));
    });
    operators.set('offset', (value, directive) => {
        if (!Array.isArray(value))
            return value;
        const offset = Number(directive);
        if (!Number.isFinite(offset))
            return value;
        return value.slice(Math.max(0, Math.trunc(offset)));
    });
    operators.set('slice', (value, directive) => {
        if (!Array.isArray(value))
            return value;
        if (Array.isArray(directive)) {
            const [start, end] = directive;
            return value.slice(Number.isFinite(Number(start)) ? Math.trunc(Number(start)) : undefined, Number.isFinite(Number(end)) ? Math.trunc(Number(end)) : undefined);
        }
        if (!isPlainObject(directive))
            return value;
        const start = Number.isFinite(Number(directive.start))
            ? Math.trunc(Number(directive.start))
            : undefined;
        const end = Number.isFinite(Number(directive.end))
            ? Math.trunc(Number(directive.end))
            : undefined;
        return value.slice(start, end);
    });
    operators.set('map', (value, directive) => {
        if (!Array.isArray(value))
            return value;
        if (typeof directive !== 'function')
            return value;
        return value.map((entry, index) => directive(entry, index));
    });
    operators.set('select', (value, directive) => {
        if (!Array.isArray(value))
            return value;
        const keys = Array.isArray(directive)
            ? directive.filter((entry) => typeof entry === 'string')
            : [];
        if (keys.length === 0)
            return value;
        return value.map((entry) => {
            if (!isPlainObject(entry))
                return entry;
            const next = {};
            for (const key of keys) {
                next[key] = entry[key];
            }
            return next;
        });
    });
    return operators;
}
function compileQueryNode(input) {
    if (input === true) {
        return { kind: 'passthrough' };
    }
    if (typeof input === 'function') {
        return { kind: 'resolver', resolver: input };
    }
    if (!isPlainObject(input)) {
        return { kind: 'literal', value: input };
    }
    const directives = [];
    const children = [];
    let each;
    for (const [key, value] of Object.entries(input)) {
        if (key === '$each') {
            each = value === true ? true : compileQueryNode(value);
            continue;
        }
        if (key.startsWith('$')) {
            directives.push({
                name: normalizeOperatorName(key),
                arg: value,
            });
            continue;
        }
        children.push({
            key,
            node: compileQueryNode(value),
        });
    }
    return {
        kind: 'object',
        directives,
        children,
        each,
    };
}
function addDependency(dependencies, path) {
    const key = encodePath(path);
    if (!dependencies.has(key)) {
        dependencies.set(key, [...path]);
    }
}
function readScopedPath(state, path, scope, dependencies) {
    addDependency(dependencies, path);
    if (!isPathAllowed(path, scope))
        return undefined;
    return getAtPath(state, path);
}
function projectQueryChildren(source, children, path, context, preserveExisting) {
    if (!isObjectLike(source))
        return source;
    const output = preserveExisting && isPlainObject(source) ? { ...source } : {};
    for (const child of children) {
        const childPath = appendPath(path, child.key);
        const sourceRecord = source;
        const childValue = sourceRecord[child.key];
        output[child.key] = evaluateCompiledQueryNode(child.node, childValue, childPath, context);
    }
    return output;
}
function evaluateCompiledQueryNode(node, value, path, context) {
    addDependency(context.dependencies, path);
    if (!isPathAllowed(path, context.scope))
        return undefined;
    switch (node.kind) {
        case 'passthrough': {
            return value;
        }
        case 'literal': {
            return node.value;
        }
        case 'resolver': {
            const runtime = {
                state: context.state,
                scope: context.scope,
                get: (targetPath) => readScopedPath(context.state, targetPath, context.scope, context.dependencies),
            };
            return path.length === 0
                ? node.resolver(context.state, runtime)
                : node.resolver(value, runtime);
        }
        case 'object': {
            let current = value;
            for (const directive of node.directives) {
                const operator = context.operators.get(directive.name);
                if (!operator)
                    continue;
                const queryOperatorContext = {
                    state: context.state,
                    path,
                    scope: context.scope,
                    get: (targetPath) => readScopedPath(context.state, targetPath, context.scope, context.dependencies),
                };
                current = operator(current, directive.arg, queryOperatorContext);
            }
            if (node.each) {
                if (Array.isArray(current)) {
                    current =
                        node.each === true
                            ? [...current]
                            : current.map((entry, index) => evaluateCompiledQueryNode(node.each, entry, appendPath(path, index), context));
                }
            }
            if (node.children.length === 0) {
                return current;
            }
            if (Array.isArray(current)) {
                return current.map((entry, index) => projectQueryChildren(entry, node.children, appendPath(path, index), context, true));
            }
            return projectQueryChildren(current, node.children, path, context, false);
        }
        default: {
            return value;
        }
    }
}
function buildCommitDiff(changes) {
    const addedPaths = [];
    const removedPaths = [];
    const updatedPaths = [];
    for (const change of changes) {
        if (!change.before.exists && change.after.exists) {
            addedPaths.push([...change.path]);
            continue;
        }
        if (change.before.exists && !change.after.exists) {
            removedPaths.push([...change.path]);
            continue;
        }
        updatedPaths.push([...change.path]);
    }
    return {
        changes: changes.map((change) => ({
            path: [...change.path],
            operation: change.operation,
            before: {
                exists: change.before.exists,
                value: cloneValue(change.before.value),
            },
            after: {
                exists: change.after.exists,
                value: cloneValue(change.after.value),
            },
        })),
        addedPaths,
        removedPaths,
        updatedPaths,
    };
}
function assignCommandAtPath(target, path, command) {
    let cursor = target;
    for (let index = 0; index < path.length - 1; index += 1) {
        const step = String(path[index]);
        const existing = cursor[step];
        if (!isPlainObject(existing) || isMutationCommand(existing)) {
            const next = {};
            cursor[step] = next;
            cursor = next;
            continue;
        }
        cursor = existing;
    }
    const lastKey = String(path[path.length - 1]);
    cursor[lastKey] = command;
}
function buildInversePatch(changes) {
    if (changes.length === 0)
        return null;
    const rootChange = changes.find((change) => change.path.length === 0);
    if (rootChange) {
        if (!rootChange.before.exists) {
            return $delete();
        }
        return $set(cloneValue(rootChange.before.value));
    }
    const inverse = {};
    for (let index = changes.length - 1; index >= 0; index -= 1) {
        const change = changes[index];
        if (!change)
            continue;
        const command = change.before.exists
            ? $set(cloneValue(change.before.value))
            : $delete();
        assignCommandAtPath(inverse, change.path, command);
    }
    return inverse;
}
function defaultIdFactory() {
    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
function mergeMetadata(first, second) {
    if (!first && !second)
        return undefined;
    return {
        ...(first ?? {}),
        ...(second ?? {}),
    };
}
/**
 * Graphite runtime implementation: commit pipeline, intent dispatch, query reactivity, and history.
 */
export class GraphiteRuntime {
    mutationOperators = new Map();
    queryOperators = new Map();
    intentProducers = new Map();
    queryPlanCache = new WeakMap();
    commitListeners = new Set();
    eventListeners = new Set();
    queryRunListeners = new Set();
    invalidationListeners = new Set();
    stateListeners = new Set();
    activeQueries = new Map();
    maxCommits;
    eventMode;
    idFactory;
    state;
    commits = [];
    historyChannels = new Map();
    commitCounter = 0;
    idCounter = 0;
    constructor(options = {}) {
        this.state = cloneValue((options.initialState ?? {}));
        this.maxCommits = Math.max(1, Math.trunc(options.maxCommits ?? 500));
        this.eventMode = options.eventMode ?? 'manual';
        this.idFactory = options.idFactory ?? defaultIdFactory;
        const builtInMutations = createBuiltInMutationOperators();
        for (const [name, handler] of builtInMutations.entries()) {
            this.mutationOperators.set(name, handler);
        }
        if (options.mutationOperators) {
            for (const [name, handler] of Object.entries(options.mutationOperators)) {
                this.mutationOperators.set(normalizeOperatorName(name), handler);
            }
        }
        const builtInQueries = createBuiltInQueryOperators();
        for (const [name, handler] of builtInQueries.entries()) {
            this.queryOperators.set(name, handler);
        }
        if (options.queryOperators) {
            for (const [name, handler] of Object.entries(options.queryOperators)) {
                this.queryOperators.set(normalizeOperatorName(name), handler);
            }
        }
    }
    /**
     * Returns the current immutable state snapshot.
     */
    getState() {
        return this.state;
    }
    /**
     * Applies a mutation patch and records a commit/diff.
     */
    commit(patch, options = {}) {
        const executor = new PatchExecutor(this.state, this.mutationOperators, options);
        executor.applyPatch(patch);
        const changes = executor.getChanges();
        const diff = buildCommitDiff(changes);
        const inversePatch = buildInversePatch(changes);
        const changedPaths = changes.map((change) => [...change.path]);
        this.commitCounter += 1;
        const at = Date.now();
        const source = options.source ?? 'patch';
        const historyChannel = this.resolveHistoryChannel(options);
        const nextRecord = {
            id: this.nextId('commit'),
            index: this.commitCounter,
            at,
            source,
            patch,
            inversePatch,
            diff,
            changedPaths,
            metadata: options.metadata ? cloneValue(options.metadata) : undefined,
            intent: options.intent ? cloneValue(options.intent) : undefined,
            historyChannel,
            event: undefined,
            state: cloneValue(this.state),
        };
        const event = this.resolveEvent(nextRecord, options);
        if (event) {
            nextRecord.event = event;
        }
        this.commits.push(nextRecord);
        if (this.commits.length > this.maxCommits) {
            this.commits = this.commits.slice(this.commits.length - this.maxCommits);
        }
        this.updateHistoryStacks(nextRecord, options);
        for (const listener of this.commitListeners) {
            listener(nextRecord);
        }
        for (const listener of this.stateListeners) {
            listener(nextRecord.state, nextRecord);
        }
        if (event) {
            for (const listener of this.eventListeners) {
                listener(event, nextRecord);
            }
        }
        if (changedPaths.length > 0 && this.activeQueries.size > 0) {
            this.invalidateQueries(nextRecord);
        }
        return nextRecord;
    }
    /**
     * Applies an external patch source (filesystem, websocket, polling) with source metadata.
     */
    materializeExternalPatch(patch, metadata) {
        return this.commit(patch, {
            source: 'external',
            metadata,
            emitEvent: false,
        });
    }
    /**
     * Executes a one-off query against current state.
     */
    query(query, scope) {
        const execution = this.executeQuery(query, scope, 'manual', undefined, 'manual');
        return execution.result;
    }
    /**
     * Registers a reactive query subscription.
     */
    watchQuery(query, listener, options = {}) {
        const id = this.nextId('query');
        const active = {
            id,
            query,
            listener,
            equalityFn: options.equalityFn ?? Object.is,
            scope: options.scope,
            dependencies: [],
            lastResult: undefined,
            hasValue: false,
        };
        this.activeQueries.set(id, active);
        const initial = this.runActiveQuery(active, 'initial');
        if (options.fireImmediately ?? true) {
            active.listener(initial.event.result, initial.event);
        }
        return {
            id,
            getCurrent: () => active.lastResult,
            update: (nextQuery) => {
                active.query = nextQuery;
                const run = this.runActiveQuery(active, 'query-updated');
                if (run.changed) {
                    active.listener(run.event.result, run.event);
                }
                return run.event.result;
            },
            run: () => {
                const run = this.runActiveQuery(active, 'manual');
                if (run.changed) {
                    active.listener(run.event.result, run.event);
                }
                return run.event.result;
            },
            unsubscribe: () => {
                this.activeQueries.delete(id);
            },
        };
    }
    /**
     * Registers a custom mutation operator.
     */
    registerMutationOperator(name, handler) {
        const normalized = normalizeOperatorName(name);
        this.mutationOperators.set(normalized, handler);
        return () => {
            this.mutationOperators.delete(normalized);
        };
    }
    /**
     * Registers a custom query operator.
     */
    registerQueryOperator(name, handler) {
        const normalized = normalizeOperatorName(name);
        this.queryOperators.set(normalized, handler);
        return () => {
            this.queryOperators.delete(normalized);
        };
    }
    /**
     * Registers an intent producer by name.
     */
    registerIntent(name, producer) {
        this.intentProducers.set(name, producer);
        return () => {
            this.intentProducers.delete(name);
        };
    }
    /**
     * Compiles and dispatches an intent, returning a commit when a patch is produced.
     */
    dispatchIntent(name, payload, options = {}) {
        const producer = this.intentProducers.get(name);
        if (!producer)
            return null;
        const context = {
            state: this.state,
            query: (query) => this.query(query),
        };
        const produced = producer(payload, context);
        if (!produced)
            return null;
        let patch;
        let metadata;
        let event;
        if (isCompiledIntent(produced)) {
            patch = produced.patch;
            metadata = produced.metadata;
            event = produced.event;
        }
        else {
            patch = produced;
        }
        return this.commit(patch, {
            source: options.source ?? 'intent',
            intent: {
                name,
                payload,
            },
            metadata: mergeMetadata(metadata, options.metadata),
            history: options.history,
            emitEvent: options.emitEvent,
            event: typeof options.event === 'undefined' ? event : options.event,
        });
    }
    onCommit(listener) {
        this.commitListeners.add(listener);
        return () => {
            this.commitListeners.delete(listener);
        };
    }
    onEvent(listener) {
        this.eventListeners.add(listener);
        return () => {
            this.eventListeners.delete(listener);
        };
    }
    onQueryRun(listener) {
        this.queryRunListeners.add(listener);
        return () => {
            this.queryRunListeners.delete(listener);
        };
    }
    onInvalidation(listener) {
        this.invalidationListeners.add(listener);
        return () => {
            this.invalidationListeners.delete(listener);
        };
    }
    onState(listener) {
        this.stateListeners.add(listener);
        return () => {
            this.stateListeners.delete(listener);
        };
    }
    getCommitLog() {
        return this.commits;
    }
    /**
     * Returns whether undo is available for a given history channel.
     */
    canUndo(channel) {
        const history = this.getHistoryChannelState(this.normalizeHistoryChannel(channel));
        return history.undoStack.length > 0;
    }
    /**
     * Returns whether redo is available for a given history channel.
     */
    canRedo(channel) {
        const history = this.getHistoryChannelState(this.normalizeHistoryChannel(channel));
        return history.redoStack.length > 0;
    }
    /**
     * Applies the inverse patch for the latest undoable commit in a history channel.
     */
    undo(recordOrId, channel) {
        const resolvedChannel = this.normalizeHistoryChannel(channel);
        const history = this.getHistoryChannelState(resolvedChannel);
        const target = history.undoStack[history.undoStack.length - 1];
        if (!target)
            return null;
        const requestedCommitId = this.toRequestedCommitId(recordOrId);
        if (requestedCommitId && target.id !== requestedCommitId) {
            return null;
        }
        const record = this.commit(cloneValue(target.inversePatch), {
            source: 'undo',
            metadata: {
                undoneCommitId: target.id,
                historyChannel: resolvedChannel,
            },
            history: false,
            emitEvent: false,
        });
        history.undoStack.pop();
        history.redoStack.push(target);
        this.clampHistoryChannel(history);
        return record;
    }
    /**
     * Re-applies the latest redone commit in a history channel.
     */
    redo(recordOrId, channel) {
        const resolvedChannel = this.normalizeHistoryChannel(channel);
        const history = this.getHistoryChannelState(resolvedChannel);
        const target = history.redoStack[history.redoStack.length - 1];
        if (!target)
            return null;
        const requestedCommitId = this.toRequestedCommitId(recordOrId);
        if (requestedCommitId && target.id !== requestedCommitId) {
            return null;
        }
        const record = this.commit(cloneValue(target.patch), {
            source: 'redo',
            metadata: {
                redoneCommitId: target.id,
                historyChannel: resolvedChannel,
            },
            history: false,
            emitEvent: false,
        });
        history.redoStack.pop();
        history.undoStack.push(target);
        this.clampHistoryChannel(history);
        return record;
    }
    nextId(prefix) {
        this.idCounter += 1;
        return `${prefix}_${this.idFactory()}_${this.idCounter.toString(36)}`;
    }
    getCompiledQuery(query) {
        const cached = this.queryPlanCache.get(query);
        if (cached)
            return cached;
        const compiled = compileQueryNode(query);
        this.queryPlanCache.set(query, compiled);
        return compiled;
    }
    executeQuery(query, scope, reason, changedPaths, queryId) {
        const started = now();
        const dependencies = new Map();
        let result;
        if (typeof query === 'function') {
            addDependency(dependencies, []);
            const runtime = {
                state: this.state,
                scope,
                get: (path) => readScopedPath(this.state, path, scope, dependencies),
            };
            result = query(this.state, runtime);
        }
        else {
            const compiled = this.getCompiledQuery(query);
            result = evaluateCompiledQueryNode(compiled, this.state, [], {
                state: this.state,
                scope,
                operators: this.queryOperators,
                dependencies,
            });
        }
        return {
            queryId,
            reason,
            at: Date.now(),
            durationMs: now() - started,
            dependencies: [...dependencies.values()],
            changedPaths: changedPaths ? changedPaths.map((path) => [...path]) : undefined,
            result,
            state: this.state,
        };
    }
    runActiveQuery(active, reason, changedPaths) {
        const event = this.executeQuery(active.query, active.scope, reason, changedPaths, active.id);
        for (const listener of this.queryRunListeners) {
            listener(event);
        }
        const changed = !active.hasValue || !active.equalityFn(active.lastResult, event.result);
        active.hasValue = true;
        active.lastResult = event.result;
        active.dependencies = event.dependencies.map((path) => [...path]);
        return { event, changed };
    }
    updateHistoryStacks(record, options) {
        if (!record.inversePatch) {
            return;
        }
        if (record.source === 'undo' || record.source === 'redo') {
            return;
        }
        if (options.history === false) {
            return;
        }
        const channel = record.historyChannel ?? this.normalizeHistoryChannel();
        const history = this.getHistoryChannelState(channel);
        history.undoStack.push({
            id: record.id,
            patch: cloneValue(record.patch),
            inversePatch: cloneValue(record.inversePatch),
        });
        history.redoStack = [];
        this.clampHistoryChannel(history);
    }
    resolveHistoryChannel(options) {
        if (options.history === false) {
            return undefined;
        }
        if (typeof options.history === 'string') {
            return this.normalizeHistoryChannel(options.history);
        }
        if (options.history && typeof options.history === 'object') {
            return this.normalizeHistoryChannel(options.history.channel);
        }
        return this.normalizeHistoryChannel();
    }
    normalizeHistoryChannel(channel) {
        const normalized = channel?.trim();
        return normalized && normalized.length > 0
            ? normalized
            : DEFAULT_HISTORY_CHANNEL;
    }
    getHistoryChannelState(channel) {
        const existing = this.historyChannels.get(channel);
        if (existing) {
            return existing;
        }
        const created = {
            undoStack: [],
            redoStack: [],
        };
        this.historyChannels.set(channel, created);
        return created;
    }
    clampHistoryChannel(history) {
        if (history.undoStack.length > this.maxCommits) {
            history.undoStack = history.undoStack.slice(history.undoStack.length - this.maxCommits);
        }
        if (history.redoStack.length > this.maxCommits) {
            history.redoStack = history.redoStack.slice(history.redoStack.length - this.maxCommits);
        }
    }
    toRequestedCommitId(recordOrId) {
        if (!recordOrId)
            return undefined;
        if (typeof recordOrId === 'string')
            return recordOrId;
        return recordOrId.id;
    }
    invalidateQueries(record) {
        for (const activeUnknown of this.activeQueries.values()) {
            const active = activeUnknown;
            const shouldRun = active.dependencies.length === 0 ||
                active.dependencies.some((dependency) => record.changedPaths.some((changed) => arePathsRelated(dependency, changed)));
            if (!shouldRun)
                continue;
            const invalidationEvent = {
                queryId: active.id,
                at: Date.now(),
                dependencies: active.dependencies.map((path) => [...path]),
                changedPaths: record.changedPaths.map((path) => [...path]),
                commit: record,
            };
            for (const listener of this.invalidationListeners) {
                listener(invalidationEvent);
            }
            const run = this.runActiveQuery(active, 'commit', record.changedPaths);
            if (run.changed) {
                active.listener(run.event.result, run.event);
            }
        }
    }
    resolveEvent(record, options) {
        if (options.event === false)
            return undefined;
        const shouldEmitByMode = (() => {
            if (typeof options.emitEvent === 'boolean')
                return options.emitEvent;
            if (options.event)
                return true;
            switch (this.eventMode) {
                case 'always':
                    return true;
                case 'when-observed':
                    return this.eventListeners.size > 0;
                case 'manual':
                default:
                    return false;
            }
        })();
        if (!shouldEmitByMode)
            return undefined;
        let override;
        if (typeof options.event === 'function') {
            const produced = options.event(record);
            if (produced === false)
                return undefined;
            if (typeof produced !== 'undefined') {
                override = produced;
            }
        }
        else if (options.event) {
            override = options.event;
        }
        const base = {
            id: this.nextId('event'),
            name: record.intent?.name ?? 'commit',
            commitId: record.id,
            at: record.at,
            patch: record.patch,
            diff: record.diff,
            metadata: record.metadata,
        };
        if (!override)
            return base;
        return {
            ...base,
            ...override,
            metadata: mergeMetadata(base.metadata, override.metadata),
            patch: override.patch ?? base.patch,
            diff: override.diff ?? base.diff,
            commitId: override.commitId ?? base.commitId,
            name: override.name ?? base.name,
            at: override.at ?? base.at,
            id: override.id ?? base.id,
        };
    }
}
/**
 * Creates a new Graphite runtime/store instance.
 */
export function createGraphStore(options) {
    return new GraphiteRuntime(options);
}
//# sourceMappingURL=core.js.map