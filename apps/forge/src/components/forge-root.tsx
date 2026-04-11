'use client';

import * as React from 'react';

import { ForgeLanding } from './forge-auth';
import { ForgeWorkspace } from './forge-workspace';
import { useForgeRouter } from '../lib/forge-router';
import { useForgeSession } from '../lib/forge-session';

function ForgeLoadingScreen({ message }: { message: string }) {
    return (
        <div
            style={{
                alignItems: 'center',
                background:
                    'radial-gradient(circle at top, rgba(43, 95, 255, 0.2), transparent 34%), #090c11',
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                minHeight: '100vh',
            }}>
            <div
                style={{
                    background: 'rgba(14, 18, 24, 0.88)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '18px',
                    padding: '1rem 1.2rem',
                }}>
                {message}
            </div>
        </div>
    );
}

export function ForgeRoot() {
    const { navigate, route } = useForgeRouter();
    const { authLoading, bootstrap, user, workspaceLoading, workspaces } = useForgeSession();

    const currentWorkspace = React.useMemo(() => {
        if (route.kind === 'workspace') {
            return workspaces.find((workspace) => workspace.slug === route.slug) ?? null;
        }
        return workspaces[0] ?? null;
    }, [route, workspaces]);

    React.useEffect(() => {
        if (!user) {
            if (route.kind !== 'landing') {
                navigate('/', { replace: true });
            }
            return;
        }

        if (workspaceLoading || !workspaces.length) {
            return;
        }

        const targetSlug =
            route.kind === 'workspace' && currentWorkspace
                ? route.slug
                : currentWorkspace?.slug;

        if (!targetSlug) {
            return;
        }

        const nextPath = `/workspaces/${encodeURIComponent(targetSlug)}`;
        if (nextPath !== window.location.pathname) {
            navigate(nextPath, { replace: true });
        }
    }, [currentWorkspace, navigate, route, user, workspaceLoading, workspaces.length]);

    if (authLoading) {
        return <ForgeLoadingScreen message='Loading Forge auth…' />;
    }

    if (!user) {
        return <ForgeLanding />;
    }

    if (bootstrap.error) {
        return <ForgeLoadingScreen message={bootstrap.error} />;
    }

    if (workspaceLoading || !currentWorkspace) {
        return <ForgeLoadingScreen message='Preparing your workspace…' />;
    }

    return <ForgeWorkspace workspace={currentWorkspace} />;
}
