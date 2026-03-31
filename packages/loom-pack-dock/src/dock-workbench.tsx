'use client';

import * as React from 'react';
import {
    GraphiteIntentBrowser,
    useGraphite,
    useHistory,
    useIntent,
    useQuery,
} from '@loop-kit/graphite-react';
import { useInteractionRuntime, useViewSnapshot } from '@loop-kit/loom-interactions';
import {
    Badge,
    Button,
    Dialog,
    Grid,
    Heading,
    Inline,
    Panel,
    Stack,
    Switch,
    Tabs,
    Text,
} from '@loop-kit/loom-react';
import {
    ShortcutSettingsPanel,
    useGraphiteShortcutBindings,
    type GraphiteShortcutBinding,
} from '@loop-kit/loom-pack-shortcuts';
import { ThemeSettingsPanel } from '@loop-kit/loom-pack-settings';
import {
    LayoutPanelLeft,
    LayoutPanelTop,
    MoonStar,
    Plus,
    Redo2,
    Sparkles,
    Undo2,
} from 'lucide-react';

import { DockCanvas, type DockCanvasDebugState } from './dock-canvas';
import { getActivePanelRef, panelTitle } from './dock-helpers';
import {
    DOCK_HISTORY_CHANNEL,
    DOCK_INTENTS,
    DOCK_LAYOUT_DISPATCH_OPTIONS,
    DOCK_PANEL_QUERY,
    DOCK_UI_DISPATCH_OPTIONS,
    SHORTCUT_CONTEXT_FIELDS,
    UI_INTENTS,
    createDefaultShortcutBindings,
    createDockIntentRegistry,
    dockThemeIds,
    type DockBlockState,
    type DockSettingsPanelSection,
    type DockThemeId,
} from './store';

export type DockWorkbenchMode = 'full' | 'preview';

type DockWorkbenchProps = {
    className?: string;
    mode?: DockWorkbenchMode;
};

const themeOptions = [
    {
        description: 'Neutral baseline theme with the standard semantic recipe set.',
        id: 'base',
        label: 'Base',
    },
    {
        description: 'Glossy, translucent surfaces and a brighter aquatic accent story.',
        id: 'aquatic',
        label: 'Aquatic',
    },
    {
        description: 'Soft contours, recessed surfaces, and more pronounced depth cues.',
        id: 'neumorph',
        label: 'Neumorph',
    },
] as const;

const primitiveSpotlight = [
    {
        detail: 'Themes can override tokens, recipes, or implementations, but primitive props stay stable and portable.',
        id: 'panel',
        title: 'Panel Blueprint',
    },
    {
        detail: 'Recipes resolve semantic variants into part-level classes, inline style, and data attributes without rendering.',
        id: 'recipes',
        title: 'Recipe Layer',
    },
    {
        detail: 'Specialized shells like this dock workbench live above primitives and themes instead of mutating primitive contracts.',
        id: 'pack',
        title: 'Pack Layer',
    },
] as const;

function nextThemeId(current: DockThemeId): DockThemeId {
    const index = dockThemeIds.indexOf(current);
    return dockThemeIds[(index + 1) % dockThemeIds.length] ?? 'base';
}

function findPanelRefByIdOrTitle(
    dock: DockBlockState['dock'],
    panelId: string,
    panelTitleValue: string,
) {
    for (const node of Object.values(dock.nodes)) {
        if (node.kind !== 'group') {
            continue;
        }
        for (const childId of node.links.children) {
            const child = dock.nodes[childId];
            if (!child || child.kind !== 'panel') {
                continue;
            }
            if (child.id === panelId || child.data.title === panelTitleValue) {
                return {
                    groupId: node.id,
                    panelId: child.id,
                };
            }
        }
    }
    return null;
}

function CatalogPanel() {
    return (
        <Stack gap='3'>
            <Text tone='muted' size='sm'>
                The dock pack owns the reusable workbench shell. Themes swap visual language;
                packs add product semantics without changing primitive contracts.
            </Text>
            {primitiveSpotlight.map((item, index) => (
                <Panel
                    key={item.id}
                    density='compact'
                    emphasis={index === 0 ? 'strong' : 'subtle'}>
                    <Stack gap='2'>
                        <Inline align='center' justify='space-between'>
                            <Heading level={3} size='sm'>
                                {item.title}
                            </Heading>
                            <Badge
                                kind='outline'
                                tone={index === 0 ? 'accent' : index === 1 ? 'info' : 'success'}>
                                {item.id}
                            </Badge>
                        </Inline>
                        <Text tone='muted' size='sm'>
                            {item.detail}
                        </Text>
                    </Stack>
                </Panel>
            ))}
        </Stack>
    );
}

function PreviewPanel({
    colorMode,
    onOpenHelp,
    themeId,
}: {
    colorMode: DockBlockState['ui']['colorMode'];
    onOpenHelp: () => void;
    themeId: DockThemeId;
}) {
    return (
        <Stack gap='4'>
            <Inline align='center' justify='space-between'>
                <Inline gap='2'>
                    <Badge tone='accent'>{themeId}</Badge>
                    <Badge kind='outline' tone='muted'>
                        {colorMode}
                    </Badge>
                </Inline>
                <Button kind='outline' onClick={onOpenHelp} type='button'>
                    Override Levels
                </Button>
            </Inline>

            <Panel emphasis='strong'>
                <Stack gap='3'>
                    <Text
                        as='span'
                        size='sm'
                        style={{ letterSpacing: '0.14em', textTransform: 'uppercase' }}
                        tone='muted'>
                        Loom React Renderer
                    </Text>
                    <Heading level={2} size='xl'>
                        Same primitive contract, visibly different theme output.
                    </Heading>
                    <Text tone='muted'>
                        Light and dark mode resolve at the provider. Themes can replace a
                        primitive implementation, but they do not invent extra public props.
                    </Text>
                    <Inline gap='2'>
                        <Button tone='accent' type='button'>
                            Primary Action
                        </Button>
                        <Button kind='outline' type='button'>
                            Secondary
                        </Button>
                        <Button kind='ghost' type='button'>
                            Quiet
                        </Button>
                    </Inline>
                </Stack>
            </Panel>

            <Tabs
                items={[
                    {
                        content: (
                            <Text tone='muted'>
                                Semantic tokens stay intentionally small: color, space, radius,
                                font, shadow, motion.
                            </Text>
                        ),
                        id: 'tokens',
                        label: 'Tokens',
                    },
                    {
                        content: (
                            <Text tone='muted'>
                                Recipes receive resolved tokens, variant values, and UI state, then
                                emit part-level styles.
                            </Text>
                        ),
                        id: 'recipes',
                        label: 'Recipes',
                    },
                    {
                        content: (
                            <Text tone='muted'>
                                Packs own richer behaviors like this dock shell, settings flows, and
                                shortcuts tooling.
                            </Text>
                        ),
                        id: 'packs',
                        label: 'Packs',
                    },
                ]}
            />
        </Stack>
    );
}

function SettingsPanelBody({
    colorMode,
    onColorModeChange,
    onOpenShortcuts,
    onOverlayLabelsVisibleChange,
    onOverlayVisibleChange,
    onThemeChange,
    overlayLabelsVisible,
    overlayVisible,
    themeId,
}: {
    colorMode: DockBlockState['ui']['colorMode'];
    onColorModeChange: (mode: DockBlockState['ui']['colorMode']) => void;
    onOpenShortcuts: () => void;
    onOverlayLabelsVisibleChange: (visible: boolean) => void;
    onOverlayVisibleChange: (visible: boolean) => void;
    onThemeChange: (themeId: DockThemeId) => void;
    overlayLabelsVisible: boolean;
    overlayVisible: boolean;
    themeId: DockThemeId;
}) {
    return (
        <Stack gap='3'>
            <ThemeSettingsPanel
                colorMode={colorMode}
                onColorModeChange={onColorModeChange}
                onThemeChange={(next) => {
                    if (dockThemeIds.includes(next as DockThemeId)) {
                        onThemeChange(next as DockThemeId);
                    }
                }}
                themeId={themeId}
                themes={themeOptions}
            />

            <Panel emphasis='subtle'>
                <Stack gap='3'>
                    <Heading level={3} size='sm'>
                        Overlay Controls
                    </Heading>
                    <Inline align='center' justify='space-between'>
                        <Text as='span' size='sm'>
                            Show drop guides
                        </Text>
                        <Switch
                            checked={overlayVisible}
                            onCheckedChange={onOverlayVisibleChange}
                        />
                    </Inline>
                    <Inline align='center' justify='space-between'>
                        <Text as='span' size='sm'>
                            Show guide labels
                        </Text>
                        <Switch
                            checked={overlayLabelsVisible}
                            onCheckedChange={onOverlayLabelsVisibleChange}
                        />
                    </Inline>
                    <Button kind='outline' onClick={onOpenShortcuts} type='button'>
                        Open Shortcut Browser
                    </Button>
                </Stack>
            </Panel>
        </Stack>
    );
}

function NotesPanel({
    debug,
    intentLogs,
}: {
    debug: DockCanvasDebugState | null;
    intentLogs: readonly string[];
}) {
    return (
        <Stack gap='3'>
            <Panel emphasis='subtle'>
                <Stack gap='2'>
                    <Heading level={3} size='sm'>
                        Runtime Notes
                    </Heading>
                    <Text tone='muted' size='sm'>
                        Interaction registries keep ephemeral state like measurements and drag
                        coordinates out of Graphite.
                    </Text>
                </Stack>
            </Panel>

            <Grid columns={2} gap='3'>
                <Panel density='compact' emphasis='subtle'>
                    <Stack gap='1'>
                        <Text as='span' size='sm' tone='muted'>
                            Active drag
                        </Text>
                        <Text size='sm'>{debug?.activeDragPanelId ?? 'none'}</Text>
                    </Stack>
                </Panel>
                <Panel density='compact' emphasis='subtle'>
                    <Stack gap='1'>
                        <Text as='span' size='sm' tone='muted'>
                            Active drop zone
                        </Text>
                        <Text size='sm'>{debug?.dropTarget?.zone ?? 'none'}</Text>
                    </Stack>
                </Panel>
            </Grid>

            <Panel emphasis='subtle'>
                <Stack gap='2'>
                    <Heading level={3} size='sm'>
                        Recent Layout Activity
                    </Heading>
                    {intentLogs.length <= 0 ? (
                        <Text tone='muted' size='sm'>
                            No layout commits yet.
                        </Text>
                    ) : (
                        intentLogs.map((entry, index) => (
                            <Text key={`${entry}-${index}`} size='sm' tone='muted'>
                                {entry}
                            </Text>
                        ))
                    )}
                </Stack>
            </Panel>
        </Stack>
    );
}

export function DockWorkbench({
    className,
    mode = 'full',
}: DockWorkbenchProps) {
    const store = useGraphite<DockBlockState>();
    const dispatchIntent = useIntent<DockBlockState>();
    const history = useHistory<DockBlockState>({
        channel: DOCK_HISTORY_CHANNEL,
    });
    const interactionRuntime = useInteractionRuntime();
    const stageView = useViewSnapshot('loom-pack-dock-stage');
    const dragSnapshot = React.useSyncExternalStore(
        interactionRuntime.drag.subscribe,
        () => interactionRuntime.drag.snapshot(),
        () => interactionRuntime.drag.snapshot(),
    );

    const ui = useQuery<DockBlockState, DockBlockState['ui']>((state) => state.ui);
    const dockState = useQuery<DockBlockState, DockBlockState['dock']>(
        (state) => state.dock,
    );
    const panels = useQuery<DockBlockState, ReturnType<typeof DOCK_PANEL_QUERY>>(
        DOCK_PANEL_QUERY,
    );

    const [debugState, setDebugState] = React.useState<DockCanvasDebugState | null>(
        null,
    );
    const [intentLogs, setIntentLogs] = React.useState<string[]>([]);
    const [overrideHelpOpen, setOverrideHelpOpen] = React.useState(false);
    const [shortcutBindings, setShortcutBindings] = React.useState<GraphiteShortcutBinding[]>(
        createDefaultShortcutBindings,
    );

    const intentRegistry = React.useMemo(() => createDockIntentRegistry(true), []);

    const registeredShortcuts = useGraphiteShortcutBindings<DockBlockState>({
        allowInEditable: true,
        bindings: shortcutBindings,
        contextSelector: (state) => ({
            canRedo: store.canRedo(DOCK_HISTORY_CHANNEL),
            canUndo: store.canUndo(DOCK_HISTORY_CHANNEL),
            colorMode: state.ui.colorMode,
            overlayVisible: state.ui.showOverlay,
            panelCount: panels.length,
            shortcutsEnabled: state.ui.shortcutsEnabled,
            themeId: state.ui.themeId,
        }),
        enabled: ui.shortcutsEnabled,
        intents: intentRegistry,
    });

    React.useEffect(() => {
        return store.onCommit((commit) => {
            const when = new Date(commit.at).toLocaleTimeString();
            const origin = commit.intent?.name ?? commit.source ?? 'commit';
            setIntentLogs((current) => [`[${when}] ${origin}`, ...current].slice(0, 10));
        });
    }, [store]);

    const activePanelRef = React.useMemo(
        () => getActivePanelRef(dockState, ui.activeGroupId),
        [dockState, ui.activeGroupId],
    );

    const focusPanel = React.useCallback(
        (
            panelId: string,
            panelTitleValue: string,
            options?: {
                section?: DockSettingsPanelSection;
            },
        ) => {
            if (options?.section) {
                dispatchIntent(
                    UI_INTENTS.setSettingsPanelSection,
                    { section: options.section },
                    DOCK_UI_DISPATCH_OPTIONS,
                );
            }

            const existing = findPanelRefByIdOrTitle(
                dockState,
                panelId,
                panelTitleValue,
            );
            if (existing) {
                dispatchIntent(
                    DOCK_INTENTS.activatePanel,
                    existing,
                    { history: false },
                );
                dispatchIntent(
                    UI_INTENTS.setActiveGroup,
                    { groupId: existing.groupId },
                    DOCK_UI_DISPATCH_OPTIONS,
                );
                return;
            }

            dispatchIntent(
                DOCK_INTENTS.addPanel,
                {
                    groupId: ui.activeGroupId,
                    panelId,
                    title: panelTitleValue,
                },
                DOCK_LAYOUT_DISPATCH_OPTIONS,
            );
        },
        [dispatchIntent, dockState, ui.activeGroupId],
    );

    const handledSettingsRequestIdRef = React.useRef(ui.settingsPanelOpenRequestId);
    React.useEffect(() => {
        if (ui.settingsPanelOpenRequestId === handledSettingsRequestIdRef.current) {
            return;
        }
        handledSettingsRequestIdRef.current = ui.settingsPanelOpenRequestId;
        if (ui.settingsPanelSection === 'shortcuts') {
            focusPanel('panel-shortcuts', 'Shortcuts', {
                section: 'shortcuts',
            });
            return;
        }
        focusPanel('panel-settings', 'Settings', {
            section: ui.settingsPanelSection,
        });
    }, [focusPanel, ui.settingsPanelOpenRequestId, ui.settingsPanelSection]);

    const toggleColorMode = React.useCallback(() => {
        dispatchIntent(
            UI_INTENTS.setColorMode,
            { mode: ui.colorMode === 'dark' ? 'light' : 'dark' },
            DOCK_UI_DISPATCH_OPTIONS,
        );
    }, [dispatchIntent, ui.colorMode]);

    const removeActivePanel = React.useCallback(() => {
        if (!activePanelRef) {
            return;
        }
        dispatchIntent(
            DOCK_INTENTS.removePanel,
            { panelId: activePanelRef.panelId },
            DOCK_LAYOUT_DISPATCH_OPTIONS,
        );
    }, [activePanelRef, dispatchIntent]);

    return (
        <Stack className={className} gap='4'>
            <Dialog
                description='Loom supports token overrides, recipe overrides, primitive implementation overrides, and pack-level specialization.'
                footer={
                    <Button
                        kind='outline'
                        onClick={() => setOverrideHelpOpen(false)}
                        type='button'>
                        Close
                    </Button>
                }
                onOpenChange={setOverrideHelpOpen}
                open={overrideHelpOpen}
                title='Loom Override Levels'>
                <Stack gap='3'>
                    <Text>
                        Level 1: token override. Level 2: recipe override. Level 3: primitive
                        implementation override. Level 4: pack/addon layer.
                    </Text>
                    <Text tone='muted'>
                        This dock workbench is a pack-level surface. Aquatic and neumorph both
                        demonstrate implementation overrides without changing primitive props.
                    </Text>
                </Stack>
            </Dialog>

            <Panel emphasis='strong'>
                <Stack gap='4'>
                    <Inline align='center' justify='space-between'>
                        <Stack gap='2'>
                            <Inline align='center' gap='2'>
                                <Sparkles size={16} />
                                <Text
                                    as='span'
                                    size='sm'
                                    style={{ letterSpacing: '0.18em', textTransform: 'uppercase' }}
                                    tone='muted'>
                                    Loom Pack Dock
                                </Text>
                            </Inline>
                            <Heading level={1} size='xl'>
                                Docked composition on top of Loom primitives and themes.
                            </Heading>
                            <Text tone='muted'>
                                `@loop-kit/dock` remains the Graphite-backed model and layout core.
                                This pack owns the higher-level React workbench.
                            </Text>
                        </Stack>
                        <Inline gap='2'>
                            <Badge tone='accent'>{ui.themeId}</Badge>
                            <Badge kind='outline' tone='muted'>
                                {ui.colorMode}
                            </Badge>
                        </Inline>
                    </Inline>

                    <Inline gap='2' justify='space-between'>
                        <Inline gap='2'>
                            <Button
                                onClick={() =>
                                    dispatchIntent(
                                        DOCK_INTENTS.addPanel,
                                        {
                                            groupId: ui.activeGroupId,
                                            title: `Panel ${panels.length + 1}`,
                                        },
                                        DOCK_LAYOUT_DISPATCH_OPTIONS,
                                    )
                                }
                                type='button'>
                                <Plus size={16} />
                                Add Panel
                            </Button>
                            <Button
                                disabled={!activePanelRef}
                                kind='outline'
                                onClick={removeActivePanel}
                                type='button'>
                                Remove Focused
                            </Button>
                            <Button
                                disabled={!history.canUndo}
                                kind='outline'
                                onClick={() =>
                                    dispatchIntent(
                                        UI_INTENTS.undoLayout,
                                        undefined,
                                        DOCK_UI_DISPATCH_OPTIONS,
                                    )
                                }
                                type='button'>
                                <Undo2 size={16} />
                                Undo
                            </Button>
                            <Button
                                disabled={!history.canRedo}
                                kind='outline'
                                onClick={() =>
                                    dispatchIntent(
                                        UI_INTENTS.redoLayout,
                                        undefined,
                                        DOCK_UI_DISPATCH_OPTIONS,
                                    )
                                }
                                type='button'>
                                <Redo2 size={16} />
                                Redo
                            </Button>
                        </Inline>

                        <Inline gap='2'>
                            <Button
                                kind='outline'
                                onClick={() =>
                                    dispatchIntent(
                                        UI_INTENTS.setThemeId,
                                        { themeId: nextThemeId(ui.themeId) },
                                        DOCK_UI_DISPATCH_OPTIONS,
                                    )
                                }
                                type='button'>
                                <LayoutPanelLeft size={16} />
                                Next Theme
                            </Button>
                            <Button
                                kind='outline'
                                onClick={toggleColorMode}
                                type='button'>
                                <MoonStar size={16} />
                                Toggle Mode
                            </Button>
                            <Button
                                kind='outline'
                                onClick={() =>
                                    focusPanel('panel-settings', 'Settings', {
                                        section: 'general',
                                    })
                                }
                                type='button'>
                                <LayoutPanelTop size={16} />
                                Settings
                            </Button>
                        </Inline>
                    </Inline>

                    <div style={{ height: mode === 'preview' ? 540 : 700 }}>
                        <DockCanvas
                            onDebugStateChange={setDebugState}
                            onPanelActivate={(_panelId, groupId) =>
                                dispatchIntent(
                                    UI_INTENTS.setActiveGroup,
                                    { groupId },
                                    DOCK_UI_DISPATCH_OPTIONS,
                                )
                            }
                            renderPanelBody={(panelId) => {
                                if (!panelId) {
                                    return (
                                        <Text tone='muted' size='sm'>
                                            Empty panel group.
                                        </Text>
                                    );
                                }

                                if (panelId === 'panel-catalog') {
                                    return <CatalogPanel />;
                                }

                                if (panelId === 'panel-preview') {
                                    return (
                                        <PreviewPanel
                                            colorMode={ui.colorMode}
                                            onOpenHelp={() => setOverrideHelpOpen(true)}
                                            themeId={ui.themeId}
                                        />
                                    );
                                }

                                if (panelId === 'panel-settings') {
                                    return (
                                        <SettingsPanelBody
                                            colorMode={ui.colorMode}
                                            onColorModeChange={(nextMode) =>
                                                dispatchIntent(
                                                    UI_INTENTS.setColorMode,
                                                    { mode: nextMode },
                                                    DOCK_UI_DISPATCH_OPTIONS,
                                                )
                                            }
                                            onOpenShortcuts={() =>
                                                focusPanel('panel-shortcuts', 'Shortcuts', {
                                                    section: 'shortcuts',
                                                })
                                            }
                                            onOverlayLabelsVisibleChange={(visible) =>
                                                dispatchIntent(
                                                    UI_INTENTS.setOverlayLabelsVisible,
                                                    { visible },
                                                    DOCK_UI_DISPATCH_OPTIONS,
                                                )
                                            }
                                            onOverlayVisibleChange={(visible) =>
                                                dispatchIntent(
                                                    UI_INTENTS.setOverlayVisible,
                                                    { visible },
                                                    DOCK_UI_DISPATCH_OPTIONS,
                                                )
                                            }
                                            onThemeChange={(themeId) =>
                                                dispatchIntent(
                                                    UI_INTENTS.setThemeId,
                                                    { themeId },
                                                    DOCK_UI_DISPATCH_OPTIONS,
                                                )
                                            }
                                            overlayLabelsVisible={ui.showOverlayLabels}
                                            overlayVisible={ui.showOverlay}
                                            themeId={ui.themeId}
                                        />
                                    );
                                }

                                if (panelId === 'panel-shortcuts') {
                                    return (
                                        <ShortcutSettingsPanel
                                            bindings={shortcutBindings}
                                            contextFields={SHORTCUT_CONTEXT_FIELDS}
                                            intents={intentRegistry}
                                            onBindingsChange={setShortcutBindings}
                                        />
                                    );
                                }

                                if (panelId === 'panel-notes') {
                                    return (
                                        <NotesPanel
                                            debug={debugState}
                                            intentLogs={intentLogs}
                                        />
                                    );
                                }

                                return (
                                    <Stack gap='2'>
                                        <Heading level={3} size='sm'>
                                            {panelTitle(dockState, panelId)}
                                        </Heading>
                                        <Text size='sm' tone='muted'>
                                            This panel was created from the dock model and still
                                            respects the Loom provider theme.
                                        </Text>
                                    </Stack>
                                );
                            }}
                        />
                    </div>

                    {mode === 'full' ? (
                        <Grid columns={3} gap='3'>
                            <Panel emphasis='subtle'>
                                <Stack gap='2'>
                                    <Heading level={3} size='sm'>
                                        View Registry
                                    </Heading>
                                    <Text size='sm' tone='muted'>
                                        Stage: {Math.round(stageView?.rect?.width ?? 0)} x{' '}
                                        {Math.round(stageView?.rect?.height ?? 0)}
                                    </Text>
                                    <Text size='sm' tone='muted'>
                                        Focused group: {ui.activeGroupId || 'none'}
                                    </Text>
                                </Stack>
                            </Panel>

                            <Panel emphasis='subtle'>
                                <Stack gap='2'>
                                    <Heading level={3} size='sm'>
                                        Drag Coordinator
                                    </Heading>
                                    <Text size='sm' tone='muted'>
                                        Item: {dragSnapshot?.itemId ?? 'none'}
                                    </Text>
                                    <Text size='sm' tone='muted'>
                                        Point:{' '}
                                        {dragSnapshot?.point
                                            ? `${Math.round(dragSnapshot.point.x)}, ${Math.round(dragSnapshot.point.y)}`
                                            : 'idle'}
                                    </Text>
                                </Stack>
                            </Panel>

                            <Panel emphasis='subtle'>
                                <Stack gap='2'>
                                    <Heading level={3} size='sm'>
                                        History
                                    </Heading>
                                    <Text size='sm' tone='muted'>
                                        Undo: {history.canUndo ? 'ready' : 'empty'}
                                    </Text>
                                    <Text size='sm' tone='muted'>
                                        Redo: {history.canRedo ? 'ready' : 'empty'}
                                    </Text>
                                </Stack>
                            </Panel>
                        </Grid>
                    ) : null}
                </Stack>
            </Panel>

            {mode === 'full' ? (
                <Panel emphasis='subtle'>
                    <Stack gap='3'>
                        <Heading level={2} size='md'>
                            Registered Shortcuts
                        </Heading>
                        <GraphiteIntentBrowser shortcuts={registeredShortcuts} />
                    </Stack>
                </Panel>
            ) : null}
        </Stack>
    );
}
