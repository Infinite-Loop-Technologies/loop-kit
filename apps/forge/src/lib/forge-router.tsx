'use client';

import * as React from 'react';

export type ForgeRoute =
    | {
          kind: 'landing';
      }
    | {
          kind: 'workspace';
          slug: string;
      };

type ForgeRouterContextValue = {
    navigate: (path: string, options?: { replace?: boolean }) => void;
    path: string;
    route: ForgeRoute;
};

const ForgeRouterContext = React.createContext<ForgeRouterContextValue | null>(null);

function getPathname() {
    if (typeof window === 'undefined') {
        return '/';
    }
    return window.location.pathname || '/';
}

function normalizePath(path: string) {
    if (!path.startsWith('/')) {
        return `/${path}`;
    }
    return path;
}

function parseRoute(path: string): ForgeRoute {
    const normalized = normalizePath(path);
    const workspaceMatch = normalized.match(/^\/workspaces\/([^/]+)$/);
    if (workspaceMatch?.[1]) {
        return {
            kind: 'workspace',
            slug: decodeURIComponent(workspaceMatch[1]),
        };
    }
    return { kind: 'landing' };
}

export function ForgeRouterProvider({ children }: { children: React.ReactNode }) {
    const [path, setPath] = React.useState(() => getPathname());

    React.useEffect(() => {
        const onPopState = () => {
            setPath(getPathname());
        };

        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    const navigate = React.useCallback(
        (nextPath: string, options?: { replace?: boolean }) => {
            const normalized = normalizePath(nextPath);
            if (normalized === getPathname()) {
                return;
            }
            if (options?.replace) {
                window.history.replaceState(null, '', normalized);
            } else {
                window.history.pushState(null, '', normalized);
            }
            setPath(normalized);
        },
        [],
    );

    const value = React.useMemo<ForgeRouterContextValue>(
        () => ({
            navigate,
            path,
            route: parseRoute(path),
        }),
        [navigate, path],
    );

    return <ForgeRouterContext.Provider value={value}>{children}</ForgeRouterContext.Provider>;
}

export function useForgeRouter() {
    const value = React.useContext(ForgeRouterContext);
    if (!value) {
        throw new Error('ForgeRouterProvider is required before using Forge routes.');
    }
    return value;
}
