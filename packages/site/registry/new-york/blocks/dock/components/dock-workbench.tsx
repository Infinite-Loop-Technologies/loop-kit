'use client';

import * as React from 'react';
import {
    GraphiteInspector,
    useGraphite,
    useIntent,
    useQuery,
} from '@loop-kit/graphite/react';
import { Plus, Redo2, Undo2, Wrench, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { GraphiteIntentCommandMenu } from '../../../systems/graphite-intent-command-menu';
import { GraphiteShortcutManager, useGraphiteShortcutBindings } from '../../../systems/graphite-shortcut-manager';
import { DockCanvas } from './dock-canvas';
import { getActivePanelRef, panelTitle } from './dock-helpers';
import {
    createDefaultShortcutBindings,
    createDockIntentRegistry,
    DOCK_HISTORY_CHANNEL,
    DOCK_INTENTS,
    DOCK_LAYOUT_DISPATCH_OPTIONS,
    DOCK_PANEL_QUERY,
    DOCK_UI_DISPATCH_OPTIONS,
    DockBlockState,
    SHORTCUT_CONTEXT_FIELDS,
    UI_INTENTS,
} from './dock-store';

export type DockWorkbenchMode = 'full' | 'preview';

type DockWorkbenchProps = {
    mode?: DockWorkbenchMode;
    className?: string;
};

function DockPanelBody({
    panelId,
    groupId,
    dockState,
}: {
    panelId: string | null;
    groupId: string;
    dockState: DockBlockState['dock'];
}) {
    if (!panelId) {
        return <p className='text-muted-foreground'>Empty group</p>;
    }

    const title = panelTitle(dockState, panelId);

    if (panelId.includes('explorer')) {
        return (
            <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                    <p className='text-sm font-medium text-foreground'>{title}</p>
                    <Badge variant='outline' className='text-[10px]'>
                        {groupId}
                    </Badge>
                </div>
                <ul className='space-y-1 text-[11px]'>
                    <li className='rounded border bg-background/50 px-2 py-1'>
                        src/app.ts
                    </li>
                    <li className='rounded border bg-background/50 px-2 py-1'>
                        src/features/dock.ts
                    </li>
                    <li className='rounded border bg-background/50 px-2 py-1'>
                        README.md
                    </li>
                </ul>
            </div>
        );
    }

    if (panelId.includes('editor')) {
        return (
            <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                    <p className='text-sm font-medium text-foreground'>{title}</p>
                    <Badge variant='outline' className='text-[10px]'>
                        active
                    </Badge>
                </div>
                <pre className='rounded border bg-background/60 p-2 text-[11px] text-foreground/80'>
                    {`dispatchIntent('dock/move-panel', payload)`}
                </pre>
            </div>
        );
    }

    if (panelId.includes('console')) {
        return (
            <div className='space-y-1 font-mono text-[11px]'>
                <p className='text-foreground/80'>[dock] move-panel group-left -&gt; group-center</p>
                <p className='text-muted-foreground'>[dock] normalize split-root weights ok</p>
                <p className='text-muted-foreground'>[dock] overlay: split-bottom</p>
            </div>
        );
    }

    return (
        <div className='space-y-1'>
            <p className='text-sm font-medium text-foreground'>{title}</p>
            <p className='text-[11px] text-muted-foreground'>{panelId}</p>
        </div>
    );
}

export function DockWorkbench({ mode = 'full', className }: DockWorkbenchProps) {
    const store = useGraphite<DockBlockState>();
    const dispatchIntent = useIntent<DockBlockState>();

    const ui = useQuery<DockBlockState, DockBlockState['ui']>((state) => state.ui);
    const dockState = useQuery<DockBlockState, DockBlockState['dock']>(
        (state) => state.dock,
    );
    const panels = useQuery<DockBlockState, ReturnType<typeof DOCK_PANEL_QUERY>>(
        DOCK_PANEL_QUERY,
    );

    const [shortcutBindings, setShortcutBindings] = React.useState(
        createDefaultShortcutBindings,
    );
    const [history, setHistory] = React.useState(() => ({
        canUndo: store.canUndo(DOCK_HISTORY_CHANNEL),
        canRedo: store.canRedo(DOCK_HISTORY_CHANNEL),
    }));

    const includeDebug = mode === 'full';
    const intentRegistry = React.useMemo(
        () => createDockIntentRegistry(includeDebug),
        [includeDebug],
    );

    useGraphiteShortcutBindings<DockBlockState>({
        intents: intentRegistry,
        bindings: shortcutBindings,
        enabled: ui.shortcutsEnabled,
        allowInEditable: true,
        contextSelector: (state) => ({
            panelCount: panels.length,
            canUndo: store.canUndo(DOCK_HISTORY_CHANNEL),
            canRedo: store.canRedo(DOCK_HISTORY_CHANNEL),
            overlayVisible: state.ui.showOverlay,
            shortcutsEnabled: state.ui.shortcutsEnabled,
        }),
    });

    React.useEffect(() => {
        return store.onCommit(() => {
            setHistory({
                canUndo: store.canUndo(DOCK_HISTORY_CHANNEL),
                canRedo: store.canRedo(DOCK_HISTORY_CHANNEL),
            });
        });
    }, [store]);

    const activePanelRef = React.useMemo(
        () => getActivePanelRef(dockState),
        [dockState],
    );

    const addPanel = React.useCallback(() => {
        dispatchIntent(
            DOCK_INTENTS.addPanel,
            { title: `Panel ${panels.length + 1}` },
            DOCK_LAYOUT_DISPATCH_OPTIONS,
        );
    }, [dispatchIntent, panels.length]);

    const removeActivePanel = React.useCallback(() => {
        if (!activePanelRef) return;
        dispatchIntent(
            DOCK_INTENTS.removePanel,
            { panelId: activePanelRef.panelId },
            DOCK_LAYOUT_DISPATCH_OPTIONS,
        );
    }, [activePanelRef, dispatchIntent]);

    const toggleOverlay = React.useCallback(
        (next: boolean) => {
            dispatchIntent(
                UI_INTENTS.setOverlayVisible,
                { visible: next },
                DOCK_UI_DISPATCH_OPTIONS,
            );
        },
        [dispatchIntent],
    );

    return (
        <div className={className ?? 'space-y-3'}>
            <GraphiteIntentCommandMenu intents={intentRegistry} enabled />

            <Card className='bg-card/90'>
                <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center justify-between text-base'>
                        <span className='flex items-center gap-2'>
                            <Wrench className='h-4 w-4 text-primary' />
                            Dock Workbench
                        </span>
                        <div className='flex items-center gap-2 text-xs font-normal text-muted-foreground'>
                            <Badge variant='outline'>dnd-kit</Badge>
                            <Badge variant='outline'>graphite intents</Badge>
                            <Badge variant='outline'>drop guides</Badge>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className='space-y-3'>
                    <div className='flex flex-wrap items-center gap-2'>
                        <Button size='sm' onClick={addPanel}>
                            <Plus className='mr-1 h-4 w-4' />
                            Add Panel
                        </Button>
                        <Button
                            size='sm'
                            variant='outline'
                            disabled={!activePanelRef}
                            onClick={removeActivePanel}>
                            <X className='mr-1 h-4 w-4' />
                            Remove Active
                        </Button>
                        <Button
                            size='sm'
                            variant='outline'
                            disabled={!history.canUndo}
                            onClick={() =>
                                dispatchIntent(
                                    UI_INTENTS.undoLayout,
                                    undefined,
                                    DOCK_UI_DISPATCH_OPTIONS,
                                )
                            }>
                            <Undo2 className='mr-1 h-4 w-4' />
                            Undo
                        </Button>
                        <Button
                            size='sm'
                            variant='outline'
                            disabled={!history.canRedo}
                            onClick={() =>
                                dispatchIntent(
                                    UI_INTENTS.redoLayout,
                                    undefined,
                                    DOCK_UI_DISPATCH_OPTIONS,
                                )
                            }>
                            <Redo2 className='mr-1 h-4 w-4' />
                            Redo
                        </Button>

                        <div className='ml-auto flex items-center gap-3 text-xs text-muted-foreground'>
                            <label className='inline-flex items-center gap-2'>
                                <Switch
                                    checked={ui.showOverlay}
                                    onCheckedChange={toggleOverlay}
                                />
                                overlay
                            </label>
                            {mode === 'full' ? (
                                <>
                                    <label className='inline-flex items-center gap-2'>
                                        <Switch
                                            checked={ui.showOverlayLabels}
                                            onCheckedChange={(checked) =>
                                                dispatchIntent(
                                                    UI_INTENTS.setOverlayLabelsVisible,
                                                    { visible: checked },
                                                    DOCK_UI_DISPATCH_OPTIONS,
                                                )
                                            }
                                        />
                                        labels
                                    </label>
                                    <label className='inline-flex items-center gap-2'>
                                        <Switch
                                            checked={ui.shortcutsEnabled}
                                            onCheckedChange={(checked) =>
                                                dispatchIntent(
                                                    UI_INTENTS.setShortcutsEnabled,
                                                    { enabled: checked },
                                                    DOCK_UI_DISPATCH_OPTIONS,
                                                )
                                            }
                                        />
                                        shortcuts
                                    </label>
                                    <Button
                                        size='sm'
                                        variant='ghost'
                                        className='h-7 px-2 text-[11px]'
                                        onClick={() =>
                                            dispatchIntent(
                                                UI_INTENTS.setShortcutManagerVisible,
                                                {
                                                    visible:
                                                        !ui.showShortcutManager,
                                                },
                                                DOCK_UI_DISPATCH_OPTIONS,
                                            )
                                        }>
                                        shortcut manager
                                    </Button>
                                </>
                            ) : null}
                        </div>
                    </div>

                    <DockCanvas
                        className={
                            mode === 'preview'
                                ? 'relative h-[520px] overflow-hidden rounded-xl border bg-muted/10'
                                : 'relative h-[620px] overflow-hidden rounded-xl border bg-muted/10'
                        }
                        renderPanelBody={(panelId, groupId) => (
                            <DockPanelBody
                                panelId={panelId}
                                groupId={groupId}
                                dockState={dockState}
                            />
                        )}
                    />

                    {mode === 'full' ? (
                        <>
                            <div className='grid gap-3 md:grid-cols-2'>
                                <Card className='bg-muted/20'>
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='text-xs uppercase tracking-wide text-muted-foreground'>
                                            Active State
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-1 text-xs'>
                                        <p>panels: {panels.length}</p>
                                        <p>
                                            active:{' '}
                                            {activePanelRef?.panelId ?? 'none'}
                                        </p>
                                        <p>
                                            canUndo:{' '}
                                            {history.canUndo ? 'yes' : 'no'}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className='bg-muted/20'>
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='text-xs uppercase tracking-wide text-muted-foreground'>
                                            Panels
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className='space-y-1 text-xs'>
                                            {panels.map((panel) => (
                                                <li
                                                    key={panel.id}
                                                    className='rounded border bg-background/70 px-2 py-1'>
                                                    <div className='truncate font-medium'>
                                                        {panel.title}
                                                    </div>
                                                    <div className='truncate text-muted-foreground'>
                                                        {panel.groupId}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>

                            <Separator />

                            {ui.showShortcutManager ? (
                                <Card className='bg-muted/20'>
                                    <CardContent className='pt-4'>
                                        <GraphiteShortcutManager
                                            intents={intentRegistry}
                                            bindings={shortcutBindings}
                                            onBindingsChange={
                                                setShortcutBindings
                                            }
                                            contextFields={
                                                SHORTCUT_CONTEXT_FIELDS
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            ) : null}

                            <Card className='bg-muted/20'>
                                <CardContent className='pt-4'>
                                    <GraphiteInspector maxRows={12} />
                                </CardContent>
                            </Card>
                        </>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
