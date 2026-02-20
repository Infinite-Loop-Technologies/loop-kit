import type {
  DispatchIntentOptions,
  GraphState,
  GraphiteStore,
  MutationPatch,
} from './types';

export interface GraphConnectorContext<TState extends GraphState = GraphState> {
  readonly store: GraphiteStore<TState>;
  getState(): Readonly<TState>;
  commitExternalPatch(
    patch: MutationPatch,
    metadata?: Record<string, unknown>
  ): void;
  dispatchIntent<TPayload>(
    name: string,
    payload: TPayload,
    options?: DispatchIntentOptions<TState>
  ): void;
}

export interface GraphConnectorHandle {
  id: string;
  refresh: () => Promise<void>;
  dispose: () => Promise<void>;
}

type GraphConnectorStartResult =
  | void
  | {
      refresh?: () => void | Promise<void>;
      dispose?: () => void | Promise<void>;
    }
  | (() => void | Promise<void>);

export interface GraphConnector<
  TState extends GraphState = GraphState,
  TConfig = unknown,
> {
  readonly id: string;
  start(
    config: TConfig,
    ctx: GraphConnectorContext<TState>
  ): GraphConnectorStartResult | Promise<GraphConnectorStartResult>;
}

function toAsyncVoid(fn?: (() => void | Promise<void>) | null) {
  if (!fn) {
    return async () => undefined;
  }

  return async () => {
    await fn();
  };
}

function toAsyncRefresh(fn?: (() => void | Promise<void>) | null) {
  if (!fn) {
    return async () => undefined;
  }

  return async () => {
    await fn();
  };
}

export class GraphConnectorHost<TState extends GraphState = GraphState> {
  private readonly store: GraphiteStore<TState>;
  private readonly active = new Map<string, GraphConnectorHandle>();

  constructor(store: GraphiteStore<TState>) {
    this.store = store;
  }

  async connect<TConfig>(
    connector: GraphConnector<TState, TConfig>,
    config: TConfig
  ): Promise<GraphConnectorHandle> {
    const existing = this.active.get(connector.id);
    if (existing) {
      await existing.dispose();
      this.active.delete(connector.id);
    }

    const context: GraphConnectorContext<TState> = {
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

    let refresh: (() => void | Promise<void>) | null = null;
    let dispose: (() => void | Promise<void>) | null = null;

    if (typeof started === 'function') {
      dispose = started;
    } else if (started) {
      refresh = started.refresh ?? null;
      dispose = started.dispose ?? null;
    }

    const handle: GraphConnectorHandle = {
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

  getActiveHandles(): readonly GraphConnectorHandle[] {
    return [...this.active.values()];
  }

  async disconnect(id: string): Promise<boolean> {
    const handle = this.active.get(id);
    if (!handle) return false;
    await handle.dispose();
    return true;
  }

  async disconnectAll(): Promise<void> {
    const handles = [...this.active.values()];
    for (const handle of handles) {
      await handle.dispose();
    }
  }
}

export function createConnectorHost<TState extends GraphState = GraphState>(
  store: GraphiteStore<TState>
) {
  return new GraphConnectorHost(store);
}

export interface HttpPollingConnectorOptions<
  TState extends GraphState = GraphState,
  TResponse = unknown,
> {
  id: string;
  request:
    | RequestInfo
    | ((ctx: GraphConnectorContext<TState>) => RequestInfo | Promise<RequestInfo>);
  init?:
    | RequestInit
    | ((ctx: GraphConnectorContext<TState>) => RequestInit | Promise<RequestInit>);
  intervalMs?: number;
  immediate?: boolean;
  parse?: (
    response: Response,
    ctx: GraphConnectorContext<TState>
  ) => Promise<TResponse>;
  toPatch: (
    payload: TResponse,
    ctx: GraphConnectorContext<TState>
  ) => MutationPatch | null | undefined;
  metadata?:
    | Record<string, unknown>
    | ((payload: TResponse) => Record<string, unknown> | undefined);
  onError?: (error: unknown, ctx: GraphConnectorContext<TState>) => void;
}

export function createHttpPollingConnector<
  TState extends GraphState = GraphState,
  TResponse = unknown,
>(
  options: HttpPollingConnectorOptions<TState, TResponse>
): GraphConnector<TState, void> {
  return {
    id: options.id,
    start(_config, ctx) {
      let disposed = false;
      let timer: ReturnType<typeof setInterval> | null = null;
      const abortController = new AbortController();

      const parser =
        options.parse ??
        (async (response: Response) => (await response.json()) as TResponse);

      const runOnce = async () => {
        if (disposed) return;

        try {
          const requestInfo =
            typeof options.request === 'function'
              ? await options.request(ctx)
              : options.request;
          const requestInit =
            typeof options.init === 'function'
              ? await options.init(ctx)
              : options.init;
          const response = await fetch(requestInfo, {
            ...(requestInit ?? {}),
            signal: abortController.signal,
          });

          if (!response.ok) {
            throw new Error(
              `HTTP connector "${options.id}" failed with status ${response.status}.`
            );
          }

          const payload = await parser(response, ctx);
          const patch = options.toPatch(payload, ctx);
          if (!patch) return;

          const metadata =
            typeof options.metadata === 'function'
              ? options.metadata(payload)
              : options.metadata;

          ctx.commitExternalPatch(patch, {
            connectorId: options.id,
            connectorType: 'http-polling',
            ...(metadata ?? {}),
          });
        } catch (error) {
          if (disposed) return;
          if (
            error instanceof Error &&
            error.name === 'AbortError'
          ) {
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

export interface WebSocketConnectorOptions<
  TState extends GraphState = GraphState,
  TMessage = unknown,
> {
  id: string;
  url:
    | string
    | ((ctx: GraphConnectorContext<TState>) => string | Promise<string>);
  protocols?: string | readonly string[];
  parseMessage?: (
    event: MessageEvent<unknown>,
    ctx: GraphConnectorContext<TState>
  ) => TMessage;
  toPatch?: (
    message: TMessage,
    ctx: GraphConnectorContext<TState>
  ) => MutationPatch | null | undefined;
  metadata?:
    | Record<string, unknown>
    | ((message: TMessage) => Record<string, unknown> | undefined);
  onOpen?: (event: Event, ctx: GraphConnectorContext<TState>) => void;
  onClose?: (event: CloseEvent, ctx: GraphConnectorContext<TState>) => void;
  onError?: (event: Event, ctx: GraphConnectorContext<TState>) => void;
}

function parseWebSocketMessage(event: MessageEvent<unknown>) {
  if (typeof event.data === 'string') {
    try {
      return JSON.parse(event.data) as unknown;
    } catch {
      return event.data;
    }
  }
  return event.data;
}

export function createWebSocketConnector<
  TState extends GraphState = GraphState,
  TMessage = unknown,
>(
  options: WebSocketConnectorOptions<TState, TMessage>
): GraphConnector<TState, void> {
  return {
    id: options.id,
    async start(_config, ctx) {
      if (typeof WebSocket === 'undefined') {
        throw new Error(
          `WebSocket is unavailable in this runtime for connector "${options.id}".`
        );
      }

      const url =
        typeof options.url === 'function'
          ? await options.url(ctx)
          : options.url;

      const protocols: string | string[] | undefined =
        typeof options.protocols === 'string'
          ? options.protocols
          : options.protocols
            ? Array.from(options.protocols)
            : undefined;
      const socket = new WebSocket(url, protocols);
      const parse =
        options.parseMessage ??
        ((event: MessageEvent<unknown>) =>
          parseWebSocketMessage(event) as TMessage);

      const onOpen = (event: Event) => {
        options.onOpen?.(event, ctx);
      };
      const onError = (event: Event) => {
        options.onError?.(event, ctx);
      };
      const onClose = (event: CloseEvent) => {
        options.onClose?.(event, ctx);
      };
      const onMessage = (event: MessageEvent<unknown>) => {
        if (!options.toPatch) return;
        const parsed = parse(event, ctx);
        const patch = options.toPatch(parsed, ctx);
        if (!patch) return;

        const metadata =
          typeof options.metadata === 'function'
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
