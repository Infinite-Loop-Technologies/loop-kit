function toAsyncVoid(fn) {
    if (!fn) {
        return async () => undefined;
    }
    return async () => {
        await fn();
    };
}
function toAsyncRefresh(fn) {
    if (!fn) {
        return async () => undefined;
    }
    return async () => {
        await fn();
    };
}
export class GraphConnectorHost {
    store;
    active = new Map();
    constructor(store) {
        this.store = store;
    }
    async connect(connector, config) {
        const existing = this.active.get(connector.id);
        if (existing) {
            await existing.dispose();
            this.active.delete(connector.id);
        }
        const context = {
            store: this.store,
            getState: () => this.store.getState(),
            commitExternalPatch: (patch, metadata) => {
                this.store.materializeExternalPatch(patch, metadata);
            },
            dispatchIntent: (name, payload, options) => {
                this.store.dispatchIntent(name, payload, options);
            },
        };
        const started = await connector.start(config, context);
        let refresh = null;
        let dispose = null;
        if (typeof started === 'function') {
            dispose = started;
        }
        else if (started) {
            refresh = started.refresh ?? null;
            dispose = started.dispose ?? null;
        }
        const handle = {
            id: connector.id,
            refresh: toAsyncRefresh(refresh),
            dispose: async () => {
                await toAsyncVoid(dispose)();
                this.active.delete(connector.id);
            },
        };
        this.active.set(connector.id, handle);
        return handle;
    }
    getActiveHandles() {
        return [...this.active.values()];
    }
    async disconnect(id) {
        const handle = this.active.get(id);
        if (!handle)
            return false;
        await handle.dispose();
        return true;
    }
    async disconnectAll() {
        const handles = [...this.active.values()];
        for (const handle of handles) {
            await handle.dispose();
        }
    }
}
export function createConnectorHost(store) {
    return new GraphConnectorHost(store);
}
export function createHttpPollingConnector(options) {
    return {
        id: options.id,
        start(_config, ctx) {
            let disposed = false;
            let timer = null;
            const abortController = new AbortController();
            const parser = options.parse ??
                (async (response) => (await response.json()));
            const runOnce = async () => {
                if (disposed)
                    return;
                try {
                    const requestInfo = typeof options.request === 'function'
                        ? await options.request(ctx)
                        : options.request;
                    const requestInit = typeof options.init === 'function'
                        ? await options.init(ctx)
                        : options.init;
                    const response = await fetch(requestInfo, {
                        ...(requestInit ?? {}),
                        signal: abortController.signal,
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP connector "${options.id}" failed with status ${response.status}.`);
                    }
                    const payload = await parser(response, ctx);
                    const patch = options.toPatch(payload, ctx);
                    if (!patch)
                        return;
                    const metadata = typeof options.metadata === 'function'
                        ? options.metadata(payload)
                        : options.metadata;
                    ctx.commitExternalPatch(patch, {
                        connectorId: options.id,
                        connectorType: 'http-polling',
                        ...(metadata ?? {}),
                    });
                }
                catch (error) {
                    if (disposed)
                        return;
                    if (error instanceof Error &&
                        error.name === 'AbortError') {
                        return;
                    }
                    options.onError?.(error, ctx);
                }
            };
            if (options.immediate ?? true) {
                void runOnce();
            }
            if ((options.intervalMs ?? 0) > 0) {
                timer = setInterval(() => {
                    void runOnce();
                }, Math.max(100, Math.trunc(options.intervalMs ?? 0)));
            }
            return {
                refresh: runOnce,
                dispose: () => {
                    disposed = true;
                    abortController.abort();
                    if (timer) {
                        clearInterval(timer);
                        timer = null;
                    }
                },
            };
        },
    };
}
function parseWebSocketMessage(event) {
    if (typeof event.data === 'string') {
        try {
            return JSON.parse(event.data);
        }
        catch {
            return event.data;
        }
    }
    return event.data;
}
export function createWebSocketConnector(options) {
    return {
        id: options.id,
        async start(_config, ctx) {
            if (typeof WebSocket === 'undefined') {
                throw new Error(`WebSocket is unavailable in this runtime for connector "${options.id}".`);
            }
            const url = typeof options.url === 'function'
                ? await options.url(ctx)
                : options.url;
            const protocols = typeof options.protocols === 'string'
                ? options.protocols
                : options.protocols
                    ? Array.from(options.protocols)
                    : undefined;
            const socket = new WebSocket(url, protocols);
            const parse = options.parseMessage ??
                ((event) => parseWebSocketMessage(event));
            const onOpen = (event) => {
                options.onOpen?.(event, ctx);
            };
            const onError = (event) => {
                options.onError?.(event, ctx);
            };
            const onClose = (event) => {
                options.onClose?.(event, ctx);
            };
            const onMessage = (event) => {
                if (!options.toPatch)
                    return;
                const parsed = parse(event, ctx);
                const patch = options.toPatch(parsed, ctx);
                if (!patch)
                    return;
                const metadata = typeof options.metadata === 'function'
                    ? options.metadata(parsed)
                    : options.metadata;
                ctx.commitExternalPatch(patch, {
                    connectorId: options.id,
                    connectorType: 'websocket',
                    ...(metadata ?? {}),
                });
            };
            socket.addEventListener('open', onOpen);
            socket.addEventListener('error', onError);
            socket.addEventListener('close', onClose);
            socket.addEventListener('message', onMessage);
            return {
                dispose: () => {
                    socket.removeEventListener('open', onOpen);
                    socket.removeEventListener('error', onError);
                    socket.removeEventListener('close', onClose);
                    socket.removeEventListener('message', onMessage);
                    socket.close();
                },
            };
        },
    };
}
//# sourceMappingURL=connectors.js.map