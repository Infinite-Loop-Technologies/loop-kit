import { z } from 'zod';
import { err, ok, type Result } from './result.js';

export const LocalRefSchema = z.object({
    kind: z.literal('local'),
    id: z.string().min(1),
});

export const FileRefSchema = z.object({
    kind: z.literal('file'),
    path: z.string().min(1),
});

export const GitRefSchema = z.object({
    kind: z.literal('git'),
    repo: z.string().url(),
    ref: z.string().optional(),
    subpath: z.string().optional(),
});

export const HttpRefSchema = z.object({
    kind: z.literal('http'),
    url: z.string().url(),
});

export const LoopRefUriSchema = z.object({
    kind: z.literal('loop'),
    namespace: z.string().min(1),
    name: z.string().min(1),
    tag: z.string().optional(),
});

export const NpmRefSchema = z.object({
    kind: z.literal('npm'),
    packageName: z.string().min(1),
    version: z.string().optional(),
});

export const LoopRefSchema = z.discriminatedUnion('kind', [
    LocalRefSchema,
    FileRefSchema,
    GitRefSchema,
    HttpRefSchema,
    LoopRefUriSchema,
    NpmRefSchema,
]);

export type LoopRef = z.infer<typeof LoopRefSchema>;

function parseGitRef(input: string): LoopRef | null {
    const prefix = 'git:';
    if (!input.startsWith(prefix)) {
        return null;
    }

    const payload = input.slice(prefix.length);
    const [repo, suffix] = payload.split('#', 2);
    if (!repo) {
        return null;
    }

    if (!suffix) {
        return { kind: 'git', repo };
    }

    const [ref, subpath] = suffix.split(':', 2);
    return {
        kind: 'git',
        repo,
        ref: ref || undefined,
        subpath: subpath || undefined,
    };
}

function parseLoopUri(input: string): LoopRef | null {
    const prefix = 'loop://';
    if (!input.startsWith(prefix)) {
        return null;
    }

    const payload = input.slice(prefix.length);
    const slashIndex = payload.indexOf('/');
    if (slashIndex <= 0) {
        return null;
    }

    const namespace = payload.slice(0, slashIndex);
    const nameWithTag = payload.slice(slashIndex + 1);
    const atIndex = nameWithTag.lastIndexOf('@');

    if (atIndex <= 0) {
        return { kind: 'loop', namespace, name: nameWithTag };
    }

    return {
        kind: 'loop',
        namespace,
        name: nameWithTag.slice(0, atIndex),
        tag: nameWithTag.slice(atIndex + 1) || undefined,
    };
}

function parseNpmRef(input: string): LoopRef | null {
    const prefix = 'npm:';
    if (!input.startsWith(prefix)) {
        return null;
    }

    const payload = input.slice(prefix.length);
    if (!payload) {
        return null;
    }

    const scoped = payload.startsWith('@');
    if (scoped) {
        const secondAt = payload.indexOf('@', 1);
        if (secondAt === -1) {
            return { kind: 'npm', packageName: payload };
        }

        return {
            kind: 'npm',
            packageName: payload.slice(0, secondAt),
            version: payload.slice(secondAt + 1) || undefined,
        };
    }

    const atIndex = payload.lastIndexOf('@');
    if (atIndex <= 0) {
        return { kind: 'npm', packageName: payload };
    }

    return {
        kind: 'npm',
        packageName: payload.slice(0, atIndex),
        version: payload.slice(atIndex + 1) || undefined,
    };
}

export function parseLoopRef(input: string): Result<LoopRef> {
    const trimmed = input.trim();

    let parsed: LoopRef | null = null;
    if (trimmed.startsWith('local:')) {
        parsed = { kind: 'local', id: trimmed.slice('local:'.length) };
    } else if (trimmed.startsWith('file:')) {
        parsed = { kind: 'file', path: trimmed.slice('file:'.length) };
    } else if (trimmed.startsWith('git:')) {
        parsed = parseGitRef(trimmed);
    } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        parsed = { kind: 'http', url: trimmed };
    } else if (trimmed.startsWith('loop://')) {
        parsed = parseLoopUri(trimmed);
    } else if (trimmed.startsWith('npm:')) {
        parsed = parseNpmRef(trimmed);
    } else {
        parsed = { kind: 'local', id: trimmed };
    }

    if (!parsed) {
        return err({
            code: 'ref.parse_failed',
            message: `Failed to parse ref: ${input}`,
        });
    }

    const validated = LoopRefSchema.safeParse(parsed);
    if (!validated.success) {
        return err({
            code: 'ref.invalid',
            message: 'Loop ref is invalid.',
            details: { issues: validated.error.issues },
        });
    }

    return ok(validated.data);
}
