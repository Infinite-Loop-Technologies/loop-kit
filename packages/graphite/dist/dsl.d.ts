import { type LinkMutationPayload, type MoveMutationPayload, type MutationCommand, type QueryDirectiveObject, type QueryMacro, type UnlinkMutationPayload } from './types';
export declare function mutation<Name extends string, Payload>(kind: Name, payload: Payload): MutationCommand<Name, Payload>;
export declare function isMutationCommand(value: unknown): value is MutationCommand;
export declare const $set: <T>(value: T) => MutationCommand<"set", T>;
export declare const $merge: <T>(value: T) => MutationCommand<"merge", T>;
export declare const $delete: () => MutationCommand<"delete", undefined>;
export declare const $move: (payload: MoveMutationPayload) => MutationCommand<"move", MoveMutationPayload>;
export declare const $link: (payload: LinkMutationPayload) => MutationCommand<"link", LinkMutationPayload>;
export declare const $unlink: (payload: UnlinkMutationPayload) => MutationCommand<"unlink", UnlinkMutationPayload>;
export declare function defineMutation<const Name extends string, const Args extends readonly unknown[], Payload>(name: Name, payloadFactory: (...args: Args) => Payload): (...args: Args) => MutationCommand<Name, Payload>;
export declare function queryMacro<T extends QueryDirectiveObject>(directive: T): QueryMacro<T>;
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
export declare function defineQueryMacro<const Name extends string, const Args extends readonly unknown[], Payload>(name: Name, payloadFactory: (...args: Args) => Payload): (...args: Args) => QueryMacro<Record<`$${Name}`, Payload>>;
export declare function composeQuery(...fragments: QueryDirectiveObject[]): QueryDirectiveObject;
//# sourceMappingURL=dsl.d.ts.map