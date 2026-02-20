import type { DispatchIntentOptions, GraphState, GraphiteStore, MutationPatch } from './types';
export interface GraphConnectorContext<TState extends GraphState = GraphState> {
    readonly store: GraphiteStore<TState>;
    getState(): Readonly<TState>;
    commitExternalPatch(patch: MutationPatch, metadata?: Record<string, unknown>): void;
    dispatchIntent<TPayload>(name: string, payload: TPayload, options?: DispatchIntentOptions<TState>): void;
}
export interface GraphConnectorHandle {
    id: string;
    refresh: () => Promise<void>;
    dispose: () => Promise<void>;
}
type GraphConnectorStartResult = void | {
    refresh?: () => void | Promise<void>;
    dispose?: () => void | Promise<void>;
} | (() => void | Promise<void>);
export interface GraphConnector<TState extends GraphState = GraphState, TConfig = unknown> {
    readonly id: string;
    start(config: TConfig, ctx: GraphConnectorContext<TState>): GraphConnectorStartResult | Promise<GraphConnectorStartResult>;
}
export declare class GraphConnectorHost<TState extends GraphState = GraphState> {
    private readonly store;
    private readonly active;
    constructor(store: GraphiteStore<TState>);
    connect<TConfig>(connector: GraphConnector<TState, TConfig>, config: TConfig): Promise<GraphConnectorHandle>;
    getActiveHandles(): readonly GraphConnectorHandle[];
    disconnect(id: string): Promise<boolean>;
    disconnectAll(): Promise<void>;
}
export declare function createConnectorHost<TState extends GraphState = GraphState>(store: GraphiteStore<TState>): GraphConnectorHost<TState>;
export interface HttpPollingConnectorOptions<TState extends GraphState = GraphState, TResponse = unknown> {
    id: string;
    request: RequestInfo | ((ctx: GraphConnectorContext<TState>) => RequestInfo | Promise<RequestInfo>);
    init?: RequestInit | ((ctx: GraphConnectorContext<TState>) => RequestInit | Promise<RequestInit>);
    intervalMs?: number;
    immediate?: boolean;
    parse?: (response: Response, ctx: GraphConnectorContext<TState>) => Promise<TResponse>;
    toPatch: (payload: TResponse, ctx: GraphConnectorContext<TState>) => MutationPatch | null | undefined;
    metadata?: Record<string, unknown> | ((payload: TResponse) => Record<string, unknown> | undefined);
    onError?: (error: unknown, ctx: GraphConnectorContext<TState>) => void;
}
export declare function createHttpPollingConnector<TState extends GraphState = GraphState, TResponse = unknown>(options: HttpPollingConnectorOptions<TState, TResponse>): GraphConnector<TState, void>;
export interface WebSocketConnectorOptions<TState extends GraphState = GraphState, TMessage = unknown> {
    id: string;
    url: string | ((ctx: GraphConnectorContext<TState>) => string | Promise<string>);
    protocols?: string | readonly string[];
    parseMessage?: (event: MessageEvent<unknown>, ctx: GraphConnectorContext<TState>) => TMessage;
    toPatch?: (message: TMessage, ctx: GraphConnectorContext<TState>) => MutationPatch | null | undefined;
    metadata?: Record<string, unknown> | ((message: TMessage) => Record<string, unknown> | undefined);
    onOpen?: (event: Event, ctx: GraphConnectorContext<TState>) => void;
    onClose?: (event: CloseEvent, ctx: GraphConnectorContext<TState>) => void;
    onError?: (event: Event, ctx: GraphConnectorContext<TState>) => void;
}
export declare function createWebSocketConnector<TState extends GraphState = GraphState, TMessage = unknown>(options: WebSocketConnectorOptions<TState, TMessage>): GraphConnector<TState, void>;
export {};
//# sourceMappingURL=connectors.d.ts.map