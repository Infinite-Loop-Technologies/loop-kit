import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, } from 'react';
import { attachGraphitePersistence, } from './persistence';
const GraphiteContext = createContext(null);
export function GraphiteProvider({ store, children, }) {
    return (_jsx(GraphiteContext.Provider, { value: store, children: children }));
}
export function useGraphite() {
    const store = useContext(GraphiteContext);
    if (!store) {
        throw new Error('useGraphite must be used inside <GraphiteProvider>.');
    }
    return store;
}
export function useQuery(query, options = {}) {
    const store = useGraphite();
    const queryRef = useRef(query);
    queryRef.current = query;
    const [result, setResult] = useState(() => store.query(query, options.scope));
    const subscriptionRef = useRef(null);
    const scope = options.scope;
    const equalityFn = options.equalityFn;
    useEffect(() => {
        const subscription = store.watchQuery(queryRef.current, (nextResult) => {
            setResult(nextResult);
        }, {
            fireImmediately: false,
            scope,
            equalityFn,
        });
        subscriptionRef.current = subscription;
        setResult(subscription.getCurrent());
        return () => {
            subscriptionRef.current = null;
            subscription.unsubscribe();
        };
    }, [store, scope, equalityFn]);
    useEffect(() => {
        const subscription = subscriptionRef.current;
        if (!subscription)
            return;
        setResult(subscription.update(query));
    }, [query]);
    return result;
}
export function useCommit() {
    const store = useGraphite();
    return useCallback((patch, options) => store.commit(patch, options), [store]);
}
export function useHistory() {
    const store = useGraphite();
    const [state, setState] = useState(() => ({
        canUndo: store.canUndo(),
        canRedo: store.canRedo(),
    }));
    useEffect(() => {
        return store.onCommit(() => {
            setState({
                canUndo: store.canUndo(),
                canRedo: store.canRedo(),
            });
        });
    }, [store]);
    const undo = useCallback((recordOrId) => store.undo(recordOrId), [store]);
    const redo = useCallback((recordOrId) => store.redo(recordOrId), [store]);
    return {
        canUndo: state.canUndo,
        canRedo: state.canRedo,
        undo,
        redo,
    };
}
export function useIntent() {
    const store = useGraphite();
    const dispatch = useCallback((name, payload, options) => store.dispatchIntent(name, payload, options), [store]);
    return dispatch;
}
export function useGraphitePersistence(options) {
    const store = useGraphite();
    const { adapter, strategy, debounceMs, maxCommits, hydrateOnMount = true, } = options;
    useEffect(() => {
        const controller = attachGraphitePersistence(store, {
            adapter,
            strategy,
            debounceMs,
            maxCommits,
        });
        if (hydrateOnMount) {
            void controller.hydrate();
        }
        return () => {
            void controller.flush();
            controller.dispose();
        };
    }, [store, adapter, strategy, debounceMs, maxCommits, hydrateOnMount]);
}
export function useCommitLog(limit = 50) {
    const store = useGraphite();
    const [records, setRecords] = useState(() => {
        const all = store.getCommitLog();
        return all.slice(Math.max(0, all.length - limit));
    });
    useEffect(() => {
        return store.onCommit(() => {
            const all = store.getCommitLog();
            setRecords(all.slice(Math.max(0, all.length - limit)));
        });
    }, [store, limit]);
    return records;
}
export function useIntentShortcuts(shortcuts, options = {}) {
    const store = useGraphite();
    const dispatchIntent = useIntent();
    const enabled = options.enabled ?? true;
    const preventDefault = options.preventDefault ?? true;
    const allowInEditable = options.allowInEditable ?? false;
    const stopPropagation = options.stopPropagation ?? true;
    const capture = options.capture ?? true;
    const shortcutsRef = useRef(shortcuts);
    shortcutsRef.current = shortcuts;
    useEffect(() => {
        if (!enabled)
            return;
        const onKeyDown = (event) => {
            for (const shortcut of shortcutsRef.current) {
                if (!matchesShortcut(event, shortcut.shortcut)) {
                    continue;
                }
                const allowInEditableForShortcut = shortcut.allowInEditable ?? allowInEditable;
                if (!allowInEditableForShortcut && isEditableEventTarget(event.target)) {
                    continue;
                }
                const executionContext = {
                    event,
                    state: store.getState(),
                    store,
                };
                const payload = typeof shortcut.payload === 'function'
                    ? shortcut.payload(executionContext)
                    : shortcut.payload;
                const context = {
                    ...executionContext,
                    payload,
                };
                const shouldRun = typeof shortcut.when === 'function'
                    ? shortcut.when(context)
                    : (shortcut.when ?? true);
                if (!shouldRun) {
                    continue;
                }
                if ((shortcut.preventDefault ?? preventDefault) && event.cancelable) {
                    event.preventDefault();
                }
                if (shortcut.stopPropagation ?? stopPropagation) {
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                }
                dispatchIntent(shortcut.intent, payload);
                break;
            }
        };
        window.addEventListener('keydown', onKeyDown, { capture });
        return () => {
            window.removeEventListener('keydown', onKeyDown, { capture });
        };
    }, [store, dispatchIntent, enabled, preventDefault, allowInEditable, stopPropagation, capture]);
}
function normalizeShortcut(shortcut) {
    return shortcut
        .toLowerCase()
        .split('+')
        .map((part) => part.trim())
        .filter(Boolean);
}
function normalizeShortcutToken(token) {
    switch (token) {
        case 'cmd':
        case 'command':
            return 'meta';
        case 'option':
            return 'alt';
        case 'dot':
        case 'period':
            return '.';
        case 'comma':
            return ',';
        case 'esc':
            return 'escape';
        case 'del':
            return 'delete';
        case 'return':
            return 'enter';
        default:
            return token;
    }
}
function normalizeEventKey(key) {
    return normalizeShortcutToken(key.toLowerCase());
}
function isEditableEventTarget(target) {
    if (!(target instanceof HTMLElement))
        return false;
    if (target.isContentEditable)
        return true;
    const tag = target.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
}
function matchesShortcut(event, shortcut) {
    const parts = normalizeShortcut(shortcut).map((part) => normalizeShortcutToken(part));
    const key = normalizeEventKey(event.key);
    const requiresMod = parts.includes('mod') || parts.includes('cmdorctrl');
    const requiresCtrl = parts.includes('ctrl');
    const requiresMeta = parts.includes('meta');
    const requiresShift = parts.includes('shift');
    const requiresAlt = parts.includes('alt');
    if (requiresMod && !(event.ctrlKey || event.metaKey))
        return false;
    if (requiresCtrl && !event.ctrlKey)
        return false;
    if (requiresMeta && !event.metaKey)
        return false;
    if (requiresShift && !event.shiftKey)
        return false;
    if (requiresAlt && !event.altKey)
        return false;
    const allowsCtrl = requiresCtrl || requiresMod;
    const allowsMeta = requiresMeta || requiresMod;
    if (!allowsCtrl && event.ctrlKey)
        return false;
    if (!allowsMeta && event.metaKey)
        return false;
    if (!requiresShift && event.shiftKey)
        return false;
    if (!requiresAlt && event.altKey)
        return false;
    const keyPart = parts.find((part) => part !== 'ctrl' &&
        part !== 'meta' &&
        part !== 'shift' &&
        part !== 'alt' &&
        part !== 'mod' &&
        part !== 'cmdorctrl');
    if (!keyPart)
        return false;
    return key === keyPart;
}
function previewPatch(record) {
    try {
        return JSON.stringify(record.patch, null, 2);
    }
    catch {
        return '[Patch preview unavailable]';
    }
}
function formatPath(path) {
    if (path.length === 0)
        return 'root';
    return path.map((segment) => String(segment)).join('.');
}
export function GraphiteInspector({ className, maxRows = 20 }) {
    const store = useGraphite();
    const commits = useCommitLog(maxRows);
    const [events, setEvents] = useState([]);
    const [queryRuns, setQueryRuns] = useState([]);
    const [invalidations, setInvalidations] = useState([]);
    const queryRunRowId = useRef(0);
    const invalidationRowId = useRef(0);
    useEffect(() => {
        return store.onEvent((event) => {
            setEvents((prev) => [event, ...prev].slice(0, maxRows));
        });
    }, [store, maxRows]);
    useEffect(() => {
        return store.onQueryRun((event) => {
            queryRunRowId.current += 1;
            setQueryRuns((prev) => [{ id: queryRunRowId.current, event }, ...prev].slice(0, maxRows));
        });
    }, [store, maxRows]);
    useEffect(() => {
        return store.onInvalidation((event) => {
            invalidationRowId.current += 1;
            setInvalidations((prev) => [{ id: invalidationRowId.current, event }, ...prev].slice(0, maxRows));
        });
    }, [store, maxRows]);
    return (_jsxs("div", { className: className, children: [_jsxs("section", { children: [_jsx("h3", { children: "Graphite Commits" }), _jsx("div", { style: { maxHeight: 240, overflow: 'auto', border: '1px solid #d4d4d8', borderRadius: 8 }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { align: 'left', children: "#" }), _jsx("th", { align: 'left', children: "Source" }), _jsx("th", { align: 'left', children: "Intent" }), _jsx("th", { align: 'left', children: "Changed Paths" })] }) }), _jsx("tbody", { children: [...commits].reverse().slice(0, maxRows).map((record) => (_jsxs("tr", { children: [_jsx("td", { children: record.index }), _jsx("td", { children: record.source }), _jsx("td", { children: record.intent?.name ?? '-' }), _jsx("td", { children: record.changedPaths.map((path) => formatPath(path)).join(', ') || 'none' })] }, record.id))) })] }) })] }), _jsxs("section", { style: { marginTop: 12 }, children: [_jsx("h3", { children: "Latest Patch" }), _jsx("pre", { style: {
                            maxHeight: 180,
                            overflow: 'auto',
                            margin: 0,
                            border: '1px solid #d4d4d8',
                            borderRadius: 8,
                            padding: 8,
                            fontSize: 12,
                        }, children: commits.length > 0 ? previewPatch(commits[commits.length - 1]) : 'No commits yet' })] }), _jsxs("section", { style: { marginTop: 12 }, children: [_jsxs("h3", { children: ["Events (", events.length, ")"] }), _jsx("div", { style: { maxHeight: 140, overflow: 'auto', border: '1px solid #d4d4d8', borderRadius: 8, padding: 8 }, children: events.length === 0 ? (_jsx("p", { style: { margin: 0, fontSize: 12 }, children: "No events emitted." })) : (events.map((event) => (_jsxs("p", { style: { margin: '2px 0', fontSize: 12 }, children: [_jsx("strong", { children: event.name }), " ", '->', " commit ", event.commitId] }, event.id)))) })] }), _jsxs("section", { style: { marginTop: 12 }, children: [_jsxs("h3", { children: ["Query Runs (", queryRuns.length, ")"] }), _jsx("div", { style: { maxHeight: 140, overflow: 'auto', border: '1px solid #d4d4d8', borderRadius: 8, padding: 8 }, children: queryRuns.length === 0 ? (_jsx("p", { style: { margin: 0, fontSize: 12 }, children: "No query runs yet." })) : (queryRuns.map((entry) => (_jsxs("p", { style: { margin: '2px 0', fontSize: 12 }, children: [entry.event.queryId, ": ", entry.event.reason, " (", entry.event.durationMs.toFixed(2), "ms)"] }, entry.id)))) })] }), _jsxs("section", { style: { marginTop: 12 }, children: [_jsxs("h3", { children: ["Invalidations (", invalidations.length, ")"] }), _jsx("div", { style: { maxHeight: 140, overflow: 'auto', border: '1px solid #d4d4d8', borderRadius: 8, padding: 8 }, children: invalidations.length === 0 ? (_jsx("p", { style: { margin: 0, fontSize: 12 }, children: "No invalidations yet." })) : (invalidations.map((entry) => (_jsxs("p", { style: { margin: '2px 0', fontSize: 12 }, children: [entry.event.queryId, ": ", entry.event.changedPaths.map((path) => formatPath(path)).join(', ')] }, entry.id)))) })] })] }));
}
export function GraphiteIntentBrowser({ shortcuts, bind = false, active, className, }) {
    useIntentShortcuts(shortcuts, { enabled: bind });
    const isActive = active ?? bind;
    const sorted = useMemo(() => [...shortcuts].sort((left, right) => left.shortcut.localeCompare(right.shortcut)), [shortcuts]);
    return (_jsxs("div", { className: className, children: [_jsx("h3", { children: "Intent Browser" }), _jsx("div", { style: { border: '1px solid #d4d4d8', borderRadius: 8, overflow: 'hidden' }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { align: 'left', children: "Shortcut" }), _jsx("th", { align: 'left', children: "Intent" }), _jsx("th", { align: 'left', children: "When" }), _jsx("th", { align: 'left', children: "Prevent" }), _jsx("th", { align: 'left', children: "Description" })] }) }), _jsx("tbody", { children: sorted.map((entry) => (_jsxs("tr", { children: [_jsx("td", { children: entry.shortcut }), _jsx("td", { children: entry.intent }), _jsx("td", { children: typeof entry.when === 'undefined' ? 'always' : typeof entry.when === 'function' ? 'dynamic' : entry.when ? 'true' : 'false' }), _jsx("td", { children: entry.preventDefault === false ? 'no' : 'yes' }), _jsx("td", { children: entry.description ?? '-' })] }, `${entry.shortcut}-${entry.intent}`))) })] }) }), isActive ? (_jsx("p", { style: { marginTop: 8, fontSize: 12 }, children: "Keyboard shortcuts are currently active." })) : (_jsx("p", { style: { marginTop: 8, fontSize: 12 }, children: "Preview mode. Pass `bind=true` to enable shortcuts." }))] }));
}
//# sourceMappingURL=react.js.map