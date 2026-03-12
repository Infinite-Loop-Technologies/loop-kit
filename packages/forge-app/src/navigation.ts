import * as React from 'react';

import { matchForgeRoute, normalizeForgePath, readForgePathFromLocation } from './routes';
import type { ForgeNavigationMode } from './types';

type ForgeNavigationState = {
    path: string;
    route: ReturnType<typeof matchForgeRoute>;
    navigate: (nextPath: string) => void;
};

export function useForgeNavigation(
    mode: ForgeNavigationMode,
    initialPath = '/',
): ForgeNavigationState {
    const readCurrentPath = React.useCallback(() => {
        if (typeof window === 'undefined') {
            return normalizeForgePath(initialPath);
        }

        return readForgePathFromLocation(mode, window.location, initialPath);
    }, [initialPath, mode]);

    const [path, setPath] = React.useState<string>(() => readCurrentPath());

    React.useEffect(() => {
        setPath(readCurrentPath());
    }, [readCurrentPath]);

    React.useEffect(() => {
        if (mode === 'memory' || typeof window === 'undefined') {
            return;
        }

        const eventName = mode === 'hash' ? 'hashchange' : 'popstate';
        const handleChange = () => {
            setPath(readCurrentPath());
        };

        window.addEventListener(eventName, handleChange);
        return () => {
            window.removeEventListener(eventName, handleChange);
        };
    }, [mode, readCurrentPath]);

    const navigate = React.useCallback(
        (nextPath: string) => {
            const normalized = normalizeForgePath(nextPath);

            if (mode === 'memory' || typeof window === 'undefined') {
                setPath(normalized);
                return;
            }

            if (mode === 'hash') {
                const nextHash = normalized === '/' ? '#/' : `#${normalized}`;
                if (window.location.hash !== nextHash) {
                    window.location.hash = nextHash;
                } else {
                    setPath(normalized);
                }
                return;
            }

            if (window.location.pathname !== normalized) {
                window.history.pushState(null, '', normalized);
            }
            setPath(normalized);
        },
        [mode],
    );

    return {
        path,
        route: matchForgeRoute(path),
        navigate,
    };
}
