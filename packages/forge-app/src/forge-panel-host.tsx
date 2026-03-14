import { Panel, cn } from '@loop-kit/ui';

import { ForgeWorkspaceShell } from './forge-workspace-shell';
import type { ForgeRouteDefinition, ForgeRouteId, ForgeShellConfig } from './types';

type ForgePanelHostProps = {
    route: ForgeRouteDefinition;
    shell: ForgeShellConfig;
};

type RouteSurfaceCard = {
    id: string;
    eyebrow: string;
    title: string;
    body: string;
    tone?: 'surface' | 'muted' | 'accent';
};

function SurfaceCard({
    eyebrow,
    title,
    body,
    tone = 'surface',
    className,
}: RouteSurfaceCard & { className?: string }) {
    return (
        <Panel variant={tone} className={cn('h-full p-4', className)}>
            <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                {eyebrow}
            </p>
            <h3
                className='mt-3 text-lg font-semibold text-foreground'
                style={{
                    fontFamily:
                        '"Bahnschrift SemiBold", "Aptos Display", "Segoe UI", system-ui, sans-serif',
                }}>
                {title}
            </h3>
            <p className='mt-2 text-sm leading-6 text-muted-foreground'>{body}</p>
        </Panel>
    );
}

function ShellBulletList({
    items,
    emptyLabel,
}: {
    items: readonly string[] | undefined;
    emptyLabel: string;
}) {
    const entries = items?.length ? items : [emptyLabel];

    return (
        <ul className='space-y-2 text-sm text-muted-foreground'>
            {entries.map((entry) => (
                <li key={entry} className='flex items-start gap-3'>
                    <span className='mt-2 h-1.5 w-1.5 rounded-full bg-primary/80' />
                    <span>{entry}</span>
                </li>
            ))}
        </ul>
    );
}

function createRouteSurfaceCards(
    routeId: ForgeRouteId,
    shell: ForgeShellConfig,
): readonly RouteSurfaceCard[] {
    switch (routeId) {
        case 'home':
            return [
                {
                    id: 'home-shell',
                    eyebrow: 'shared shell contract',
                    title: `${shell.title} is mounted`,
                    body: `The reusable Forge frontend package is running inside the ${shell.platform} shell with ${shell.navigationMode ?? 'history'} routing.`,
                    tone: 'accent',
                },
                {
                    id: 'home-workspace',
                    eyebrow: 'workspace context',
                    title: `${shell.organizationName} / ${shell.workspaceName}`,
                    body: 'Shell state is intentionally thin so auth, data loading, and command surfaces can layer in without replacing the frame.',
                },
                {
                    id: 'home-next',
                    eyebrow: 'next slice',
                    title: 'Shared app first, product logic later',
                    body: 'This slice stops at shell layout, route scaffolding, and a panel-host baseline instead of inventing Forge workflows too early.',
                    tone: 'muted',
                },
            ];
        case 'runs':
            return [
                {
                    id: 'runs-queue',
                    eyebrow: 'queue',
                    title: 'Queued runs',
                    body: 'Pending orchestration, retries, and lane-specific dispatch will land here once backend contracts are explicit.',
                },
                {
                    id: 'runs-live',
                    eyebrow: 'live telemetry',
                    title: 'Active execution',
                    body: 'The shell layout leaves space for live logs, intent traces, and step graphs without coupling them to this route stub.',
                    tone: 'accent',
                },
                {
                    id: 'runs-archive',
                    eyebrow: 'history',
                    title: 'Replay and audit',
                    body: 'Historical run playback, approvals, and export surfaces remain a follow-up slice.',
                    tone: 'muted',
                },
            ];
        case 'settings':
            return [
                {
                    id: 'settings-shell',
                    eyebrow: 'shell policy',
                    title: 'Shell configuration',
                    body: 'Window behavior, navigation policy, and platform bridge toggles can live here without leaking platform code into the shared app package.',
                    tone: 'accent',
                },
                {
                    id: 'settings-workspace',
                    eyebrow: 'workspace defaults',
                    title: 'Org-scoped preferences',
                    body: 'Team defaults, panel presets, and operator policies are represented as placeholders only for now.',
                },
                {
                    id: 'settings-bridges',
                    eyebrow: 'bridge posture',
                    title: 'Future platform bridges',
                    body: 'Desktop, web, and later mobile bridges should attach through shell-owned adapters instead of branching shared UI code.',
                    tone: 'muted',
                },
            ];
        case 'billing':
            return [
                {
                    id: 'billing-usage',
                    eyebrow: 'usage',
                    title: 'Automation usage',
                    body: 'Seat counts, provider usage, and workspace consumption can plug into this shell without changing route structure.',
                    tone: 'accent',
                },
                {
                    id: 'billing-contracts',
                    eyebrow: 'commercial posture',
                    title: 'Contracts and invoices',
                    body: 'Contract milestones, billing contacts, and procurement checkpoints remain stubbed placeholders.',
                },
                {
                    id: 'billing-risk',
                    eyebrow: 'risk',
                    title: 'No product billing logic yet',
                    body: 'The shell intentionally avoids inventing billing workflows before pricing, entitlements, and backend boundaries are defined.',
                    tone: 'muted',
                },
            ];
        case 'workspace':
        default:
            return [
                {
                    id: 'workspace-shell',
                    eyebrow: 'panel-ready shell',
                    title: 'Shared workbench route',
                    body: 'The first workspace route carries the panel host baseline while keeping route wiring light enough for future platform shells.',
                    tone: 'accent',
                },
                {
                    id: 'workspace-bridge',
                    eyebrow: 'platform bridge',
                    title: 'Shell-specific adapters stay outside',
                    body: 'Filesystem access, native menus, and OS integrations belong to the desktop shell, not the shared route package.',
                },
                {
                    id: 'workspace-product',
                    eyebrow: 'future product work',
                    title: 'Panels now, product logic later',
                    body: 'Agent feeds, editors, and run detail panes can attach incrementally to the host shown below.',
                    tone: 'muted',
                },
            ];
    }
}

export function ForgePanelHost({ route, shell }: ForgePanelHostProps) {
    const cards = createRouteSurfaceCards(route.id, shell);

    if (route.id === 'workspace') {
        return <ForgeWorkspaceShell routeId={route.id} shell={shell} />;
    }

    return (
        <section className='space-y-4'>
            <div className='grid gap-4 lg:grid-cols-3'>
                {cards.map((card) => (
                    <SurfaceCard key={card.id} {...card} />
                ))}
            </div>

            <div className='grid gap-4 xl:grid-cols-[minmax(0,1fr),20rem]'>
                <Panel variant='surface' className='p-5'>
                    <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                        route briefing
                    </p>
                    <h3
                        className='mt-3 text-2xl font-semibold text-foreground'
                        style={{
                            fontFamily:
                                '"Bahnschrift SemiBold", "Aptos Display", "Segoe UI", system-ui, sans-serif',
                        }}>
                        {route.title}
                    </h3>
                    <p className='mt-3 max-w-3xl text-sm leading-7 text-muted-foreground'>
                        {route.description}
                    </p>
                    <div className='mt-6 grid gap-3 md:grid-cols-3'>
                        {['shell route', 'shared app', 'future platform'].map((label) => (
                            <div
                                key={label}
                                className='rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground'>
                                {label}
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel variant='muted' className='p-4'>
                    <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                        shell notes
                    </p>
                    <div className='mt-4'>
                        <ShellBulletList
                            items={shell.notes}
                            emptyLabel='Shell notes are intentionally sparse for this scaffold.'
                        />
                    </div>
                </Panel>
            </div>
        </section>
    );
}
