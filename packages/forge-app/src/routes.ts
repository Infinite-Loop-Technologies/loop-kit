import type { ForgeNavigationMode, ForgeRouteDefinition } from './types';

export const forgeRoutes: readonly ForgeRouteDefinition[] = [
    {
        id: 'home',
        path: '/',
        navLabel: 'Home',
        title: 'Forge Home',
        kicker: 'operator overview',
        description:
            'Overview surface for the shared Forge shell, active organizations, and the next operator workflows.',
    },
    {
        id: 'workspace',
        path: '/organization/workspace',
        navLabel: 'Workspace',
        title: 'Organization Workspace',
        kicker: 'organization cockpit',
        description:
            'GTD-style workspace for organizations, runs, inbox review, and the first Forge operator surfaces.',
    },
    {
        id: 'runs',
        path: '/runs',
        navLabel: 'Runs',
        title: 'Runs',
        kicker: 'execution activity',
        description:
            'Review run state, recent failures, and the execution queue without leaving the shared Forge shell.',
    },
    {
        id: 'settings',
        path: '/settings',
        navLabel: 'Settings',
        title: 'Settings',
        kicker: 'account and workspace posture',
        description:
            'Adjust workspace defaults, account posture, and shell-owned bridge behavior.',
    },
    {
        id: 'billing',
        path: '/billing',
        navLabel: 'Billing',
        title: 'Billing',
        kicker: 'billing and quota',
        description:
            'Inspect plan state, usage posture, and the entitlement data feeding Forge decisions.',
    },
] as const;

export function normalizeForgePath(path: string | null | undefined): string {
    const trimmed = path?.trim();
    if (!trimmed || trimmed === '#') {
        return '/';
    }

    let normalized = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
    if (!normalized.startsWith('/')) {
        normalized = `/${normalized}`;
    }

    normalized = normalized.replace(/\/{2,}/g, '/');
    if (normalized.length > 1) {
        normalized = normalized.replace(/\/+$/g, '');
    }

    return normalized || '/';
}

export function readForgePathFromLocation(
    mode: ForgeNavigationMode,
    locationLike: Pick<Location, 'pathname' | 'hash'>,
    initialPath = '/',
): string {
    if (mode === 'memory') {
        return normalizeForgePath(initialPath);
    }

    if (mode === 'hash') {
        return normalizeForgePath(locationLike.hash || initialPath);
    }

    return normalizeForgePath(locationLike.pathname || initialPath);
}

export function matchForgeRoute(path: string): ForgeRouteDefinition {
    const normalized = normalizeForgePath(path);
    return forgeRoutes.find((route) => route.path === normalized) ?? forgeRoutes[0]!;
}

export function resolveForgeHref(
    path: string,
    mode: ForgeNavigationMode,
): string {
    const normalized = normalizeForgePath(path);

    if (mode === 'hash') {
        return normalized === '/' ? '#/' : `#${normalized}`;
    }

    return normalized;
}
