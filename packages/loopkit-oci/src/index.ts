export type RegistryMode = 'persistent-local' | 'ephemeral-local' | 'remote';
export type ArtifactKind = 'wasm-component' | 'wasm-package' | 'container' | 'executable';

export type OciReference = {
    registry: string;
    repository: string;
    tag?: string;
    digest?: string;
};

export function parseOciReference(input: string): OciReference {
    const trimmed = input.trim();
    if (trimmed.length === 0) {
        throw new Error('OCI reference cannot be empty.');
    }

    const [repositoryPart, digest] = trimmed.split('@');
    const lastSlash = repositoryPart.lastIndexOf('/');
    const tagIndex = repositoryPart.lastIndexOf(':');
    const hasTag = tagIndex > lastSlash;
    const repoWithRegistry = hasTag ? repositoryPart.slice(0, tagIndex) : repositoryPart;
    const tag = hasTag ? repositoryPart.slice(tagIndex + 1) : undefined;
    const slashIndex = repoWithRegistry.indexOf('/');

    if (slashIndex <= 0 || slashIndex === repoWithRegistry.length - 1) {
        throw new Error(`Invalid OCI reference: ${input}`);
    }

    return {
        registry: repoWithRegistry.slice(0, slashIndex),
        repository: repoWithRegistry.slice(slashIndex + 1),
        tag,
        digest,
    };
}

export function buildRegistryBaseUrl(
    mode: RegistryMode,
    options: { host?: string; port?: number } = {},
): string {
    if (mode === 'remote') {
        throw new Error('Remote registries must be supplied explicitly.');
    }

    const host = options.host ?? '127.0.0.1';
    const port = options.port ?? (mode === 'persistent-local' ? 5001 : 5002);
    return `${host}:${port}`;
}

export function buildArtifactRepository(
    namespace: string,
    name: string,
    kind: ArtifactKind,
): string {
    return `${namespace}/${kind}/${name}`;
}

export function createArtifactReference(input: {
    registry: string;
    namespace: string;
    name: string;
    kind: ArtifactKind;
    tag: string;
}): string {
    return `${input.registry}/${buildArtifactRepository(input.namespace, input.name, input.kind)}:${input.tag}`;
}

export function isRegistryAllowed(reference: OciReference | string, allowList: string[]): boolean {
    const parsed = typeof reference === 'string' ? parseOciReference(reference) : reference;
    return allowList.includes(parsed.registry);
}
