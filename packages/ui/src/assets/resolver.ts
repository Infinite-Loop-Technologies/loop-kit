import {
    defaultAssetRegistry,
    type AssetRegistry,
} from './registry';

export type AssetResolver = {
    resolve: (uri: string) => string | undefined;
};

function parseAssetUri(uri: string): { kind: string; key: string } | null {
    if (!uri.startsWith('asset://')) {
        return null;
    }

    const withoutScheme = uri.slice('asset://'.length);
    const [kind, ...parts] = withoutScheme.split('/').filter(Boolean);
    if (!kind || parts.length === 0) {
        return null;
    }

    return {
        kind,
        key: parts.join('/'),
    };
}

export function createAssetResolver(input?: {
    assets?: Record<string, string>;
    textures?: Record<string, string>;
}): AssetResolver {
    const registry: AssetRegistry = {
        assets: {
            ...defaultAssetRegistry.assets,
            ...(input?.assets ?? {}),
        },
        textures: {
            ...defaultAssetRegistry.textures,
            ...(input?.textures ?? {}),
        },
    };

    return {
        resolve(uri) {
            const parsed = parseAssetUri(uri);
            if (!parsed) {
                return undefined;
            }

            if (parsed.kind === 'texture') {
                return registry.textures[parsed.key];
            }

            if (parsed.kind === 'asset') {
                return registry.assets[parsed.key];
            }

            return undefined;
        },
    };
}
