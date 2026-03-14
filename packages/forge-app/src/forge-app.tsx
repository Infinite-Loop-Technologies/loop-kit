import * as React from 'react';
import { Panel, UiProvider, cn, resolveDefaultUiSkin } from '@loop-kit/ui';

import { useForgeNavigation } from './navigation';
import { forgeRoutes, resolveForgeHref } from './routes';
import { ForgePanelHost } from './forge-panel-host';
import type { ForgeRouteDefinition, ForgeShellConfig } from './types';

type ForgeAppProps = {
    shell: ForgeShellConfig;
    initialPath?: string;
};

function shouldHandleClientNavigation(event: React.MouseEvent<HTMLAnchorElement>) {
    return !(
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey
    );
}

function RouteNavLink({
    route,
    active,
    href,
    onNavigate,
}: {
    route: ForgeRouteDefinition;
    active: boolean;
    href: string;
    onNavigate: (path: string) => void;
}) {
    return (
        <a
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors',
                active
                    ? 'border-primary/60 bg-primary/15 text-foreground'
                    : 'border-border/70 bg-background/65 text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
            onClick={(event) => {
                if (!shouldHandleClientNavigation(event)) {
                    return;
                }

                event.preventDefault();
                onNavigate(route.path);
            }}>
            <span>
                <span className='block text-[11px] uppercase tracking-[0.22em] text-muted-foreground'>
                    {route.kicker}
                </span>
                <span className='mt-1 block text-sm font-medium'>{route.navLabel}</span>
            </span>
            <span
                className={cn(
                    'h-2.5 w-2.5 rounded-full transition-colors',
                    active ? 'bg-primary' : 'bg-border group-hover:bg-primary/70',
                )}
            />
        </a>
    );
}

function ShellAside({
    shell,
    activeRoute,
    onNavigate,
}: {
    shell: ForgeShellConfig;
    activeRoute: ForgeRouteDefinition;
    onNavigate: (path: string) => void;
}) {
    const mode = shell.navigationMode ?? 'history';

    return (
        <aside className='hidden w-[20rem] shrink-0 flex-col gap-4 lg:flex'>
            <Panel variant='accent' className='p-5'>
                <p className='text-[11px] uppercase tracking-[0.3em] text-muted-foreground'>
                    Forge
                </p>
                <h1
                    className='mt-4 text-3xl font-semibold text-foreground'
                    style={{
                        fontFamily:
                            '"Bahnschrift SemiBold", "Aptos Display", "Segoe UI", system-ui, sans-serif',
                    }}>
                    Harness Console
                </h1>
                <p className='mt-3 text-sm leading-6 text-muted-foreground'>
                    Operator shell for organizations, runs, settings, and the emerging AI harness workflow.
                </p>
            </Panel>

            <Panel className='p-4'>
                <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                    navigation
                </p>
                <nav className='mt-4 space-y-3'>
                    {forgeRoutes.map((route) => (
                        <RouteNavLink
                            key={route.id}
                            route={route}
                            active={route.id === activeRoute.id}
                            href={resolveForgeHref(route.path, mode)}
                            onNavigate={onNavigate}
                        />
                    ))}
                </nav>
            </Panel>

            <Panel variant='muted' className='p-4'>
                <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                    shell context
                </p>
                <div className='mt-4 space-y-4 text-sm'>
                    <div>
                        <p className='text-xs uppercase tracking-[0.16em] text-muted-foreground'>
                            organization
                        </p>
                        <p className='mt-1 text-foreground'>{shell.organizationName}</p>
                    </div>
                    <div>
                        <p className='text-xs uppercase tracking-[0.16em] text-muted-foreground'>
                            workspace
                        </p>
                        <p className='mt-1 text-foreground'>{shell.workspaceName}</p>
                    </div>
                    <div>
                        <p className='text-xs uppercase tracking-[0.16em] text-muted-foreground'>
                            environment
                        </p>
                        <p className='mt-1 text-foreground'>{shell.environmentLabel}</p>
                    </div>
                    <div>
                        <p className='text-xs uppercase tracking-[0.16em] text-muted-foreground'>
                            navigation mode
                        </p>
                        <p className='mt-1 text-foreground'>{mode}</p>
                    </div>
                </div>
            </Panel>
        </aside>
    );
}

function ShellHeader({
    shell,
    route,
    onNavigate,
}: {
    shell: ForgeShellConfig;
    route: ForgeRouteDefinition;
    onNavigate: (path: string) => void;
}) {
    const mode = shell.navigationMode ?? 'history';

    return (
        <div className='grid gap-4 xl:grid-cols-[minmax(0,1fr),22rem]'>
            <Panel className='p-5 md:p-6'>
                <div className='flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground'>
                    <span className='rounded-full border border-border/70 bg-background/65 px-3 py-1'>
                        shared frontend
                    </span>
                    <span className='rounded-full border border-border/70 bg-background/65 px-3 py-1'>
                        {shell.platform} shell
                    </span>
                    <span className='rounded-full border border-border/70 bg-background/65 px-3 py-1'>
                        {mode} routing
                    </span>
                </div>

                <h2
                    className='mt-5 text-3xl font-semibold text-foreground md:text-4xl'
                    style={{
                        fontFamily:
                            '"Bahnschrift SemiBold", "Aptos Display", "Segoe UI", system-ui, sans-serif',
                    }}>
                    {route.title}
                </h2>
                <p className='mt-3 max-w-3xl text-sm leading-7 text-muted-foreground'>
                    {route.description}
                </p>

                <div className='mt-5 flex flex-wrap gap-2 lg:hidden'>
                    {forgeRoutes.map((candidate) => (
                        <RouteNavLink
                            key={candidate.id}
                            route={candidate}
                            active={candidate.id === route.id}
                            href={resolveForgeHref(candidate.path, mode)}
                            onNavigate={onNavigate}
                        />
                    ))}
                </div>
            </Panel>

            <Panel variant='muted' className='p-5'>
                <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                    platform bridge
                </p>
                <h3
                    className='mt-3 text-xl font-semibold text-foreground'
                    style={{
                        fontFamily:
                            '"Bahnschrift SemiBold", "Aptos Display", "Segoe UI", system-ui, sans-serif',
                    }}>
                    {shell.title}
                </h3>
                <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                    {shell.environmentLabel}
                </p>
                <div className='mt-4 space-y-2 text-sm text-muted-foreground'>
                    {(shell.capabilitySummary?.length
                        ? shell.capabilitySummary
                        : ['Capability summary is intentionally minimal for this scaffold.']
                    ).map((entry) => (
                        <div
                            key={entry}
                            className='rounded-2xl border border-border/70 bg-background/65 px-3 py-2'>
                            {entry}
                        </div>
                    ))}
                </div>
            </Panel>
        </div>
    );
}

export function ForgeApp({ shell, initialPath = '/' }: ForgeAppProps) {
    const mode = shell.navigationMode ?? 'history';
    const { route, navigate } = useForgeNavigation(mode, initialPath);
    const skin = resolveDefaultUiSkin(shell.skinId);
    const skinMode = shell.skinMode ?? 'dark';

    return (
        <UiProvider skin={skin} mode={skinMode}>
            <div className='min-h-screen'>
                <div className='mx-auto flex min-h-screen w-full max-w-[1760px] gap-4 p-4 md:p-6'>
                    <ShellAside shell={shell} activeRoute={route} onNavigate={navigate} />

                    <main className='flex min-w-0 flex-1 flex-col gap-4'>
                        <ShellHeader shell={shell} route={route} onNavigate={navigate} />
                        <ForgePanelHost route={route} shell={shell} />
                    </main>
                </div>
            </div>
        </UiProvider>
    );
}
