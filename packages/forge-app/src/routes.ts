import type { ForgeNavigationMode, ForgeRouteDefinition } from './types';

export const forgeRoutes: readonly ForgeRouteDefinition[] = [
    {
        id: 'home',
        path: '/',
        navLabel: 'Home',
        title: 'Forge Home',
        kicker: 'shell control surface',
        description:
            'Shared entry surface for shell status, workspace context, and the next product slices.',
    },
    {
        id: 'workspace',
        path: '/organization/workspace',
        navLabel: 'Workspace',
        title: 'Organization Workspace',
        kicker: 'panel-ready workbench shell',
        description:
            'Workbench route for the first shared panel host, team context, and future agent surfaces.',
    },
    {
        id: 'runs',
        path: '/runs',
        navLabel: 'Runs',
        title: 'Runs',
        kicker: 'execution queue placeholder',
        description:
            'Thin shell route for queued, active, and historical runs without committing to product workflows yet.',
    },
    {
        id: 'settings',
        path: '/settings',
        navLabel: 'Settings',
        title: 'Settings',
        kicker: 'policy and bridge controls',
        description:
            'Configuration surface for shell policy, platform bridge posture, and operator preferences.',
    },
    {
        id: 'billing',
        path: '/billing',
        navLabel: 'Billing',
        title: 'Billing',
        kicker: 'commercial placeholder',
        description:
            'Commercial shell for seats, automation usage, and contract checkpoints.',
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
