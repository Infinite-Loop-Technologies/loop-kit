import { type LinkMutationPayload, type MoveMutationPayload, type MutationCommand, type QueryDirectiveObject, type QueryMacro, type UnlinkMutationPayload } from './types';
/**
 * Creates a typed mutation command object.
 */
export declare function mutation<Name extends string, Payload>(kind: Name, payload: Payload): MutationCommand<Name, Payload>;
/**
 * Type guard for mutation command objects.
 */
export declare function isMutationCommand(value: unknown): value is MutationCommand;
/**
 * Built-in mutation helpers.
 */
export declare const $set: <T>(value: T) => MutationCommand<"set", T>;
export declare const $merge: <T>(value: T) => MutationCommand<"merge", T>;
export declare const $delete: () => MutationCommand<"delete", undefined>;
export declare const $move: (payload: MoveMutationPayload) => MutationCommand<"move", MoveMutationPayload>;
export declare const $link: (payload: LinkMutationPayload) => MutationCommand<"link", LinkMutationPayload>;
export declare const $unlink: (payload: UnlinkMutationPayload) => MutationCommand<"unlink", UnlinkMutationPayload>;
/**
 * Creates a strongly typed custom mutation helper.
 */
export declare function defineMutation<const Name extends string, const Args extends readonly unknown[], Payload>(name: Name, payloadFactory: (...args: Args) => Payload): (...args: Args) => MutationCommand<Name, Payload>;
/**
 * Marks an object as a query macro fragment.
 */
export declare function queryMacro<T extends QueryDirectiveObject>(directive: T): QueryMacro<T>;
/**
 * Built-in query macro helpers.
 */
export declare const $where: (predicate: unknown) => QueryMacro<{
    $where: unknown;
}>;
export declare const $orderBy: (order: unknown) => QueryMacro<{
    $orderBy: unknown;
}>;
export declare const $limit: (count: number) => QueryMacro<{
    $limit: number;
}>;
export declare const $offset: (count: number) => QueryMacro<{
    $offset: number;
}>;
export declare const $each: (descriptor?: unknown) => QueryMacro<{
    $each: unknown;
}>;
/**
 * Creates a strongly typed custom query macro helper.
 */
export declare function defineQueryMacro<const Name extends string, const Args extends readonly unknown[], Payload>(name: Name, payloadFactory: (...args: Args) => Payload): (...args: Args) => QueryMacro<Record<`$${Name}`, Payload>>;
/**
 * Shallowly composes query macro fragments from left to right.
 */
export declare function composeQuery(...fragments: QueryDirectiveObject[]): QueryDirectiveObject;
//# sourceMappingURL=dsl.d.ts.map