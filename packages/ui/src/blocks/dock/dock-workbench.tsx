'use client';

import * as React from 'react';
import {
    useGraphite,
    useIntent,
    useQuery,
} from '@loop-kit/graphite/react';
import { Plus, Redo2, Settings2, Undo2, Wrench, X } from 'lucide-react';

import { Badge } from '../../legacy/ui/badge';
import { Button } from '../../legacy/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../legacy/ui/card';
import { Input } from '../../legacy/ui/input';
import { Separator } from '../../legacy/ui/separator';
import { Switch } from '../../legacy/ui/switch';
import { GraphiteIntentCommandMenu } from '../systems/graphite-intent-command-menu';
import {
    useGraphiteShortcutBindings,
    type GraphiteShortcutBinding,
} from '../systems/graphite-shortcut-manager';
import { ShortcutSettingsBlock } from '../shortcuts-settings';
import { ThemeManagerBlock } from '../theme-manager';
import { TokenEditorBlock } from '../token-editor';
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
    type DockSettingsPanelSection,
    SHORTCUT_CONTEXT_FIELDS,
    SETTINGS_PANEL_ID,
    SETTINGS_PANEL_TITLE,
    UI_INTENTS,
} from './dock-store';
import {
    listDesignTokenEntries,
    parseUiSkinDraft,
    serializeUiSkin,
} from './theme-state';

export type DockWorkbenchMode = 'full' | 'preview';

type DockWorkbenchProps = {
    mode?: DockWorkbenchMode;
    className?: string;
};

type DemoCatalogEntry = {
    id: string;
    title: string;
    description: string;
    accent: string;
};

const UI_DEMO_COMPONENTS: DemoCatalogEntry[] = [
    {
        id: 'signal-rail',
        title: 'Signal Rail',
        description: 'Slim navigation surfaces for GTD-style work that still feel editorial instead of toolish.',
        accent: 'navigation',
    },
    {
        id: 'hero-panels',
        title: 'Hero Panels',
        description: 'Large atmospheric cards with calmer borders, softer blur, and more intentional spacing.',
        accent: 'surfaces',
    },
    {
        id: 'texture-story',
        title: 'Texture Story',
        description: 'Panels should feel material, not flat. Textures and overlays are part of the language.',
        accent: 'texture',
    },
    {
        id: 'interaction-grammar',
        title: 'Interaction Grammar',
        description: 'Keyboard hints, panel gestures, and skin authoring should all read as one coherent system.',
        accent: 'motion',
    },
    {
        id: 'brand-voice',
        title: 'Brand Voice',
        description: 'A demo should sell an interface direction, not just prove that a set of blocks exists.',
        accent: 'direction',
    },
];

function copyToClipboard(value: string): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        return navigator.clipboard.writeText(value);
    }
    return Promise.resolve();
}

function ComponentCatalogPanel() {
    return (
        <div className='space-y-3'>
            <p className='text-xs text-muted-foreground'>
                A glamorous demo needs a clear spatial story. These are the surfaces this workbench
                is trying to prove out right now.
            </p>
            <div className='space-y-2'>
                {UI_DEMO_COMPONENTS.map((component) => {
                    return (
                        <div
                            key={component.id}
                            className='space-y-2 rounded-[1rem] border border-border/60 bg-secondary/55 p-3'>
                            <div className='flex items-center justify-between gap-2'>
                                <div className='min-w-0'>
                                    <p className='truncate text-sm font-semibold text-foreground'>
                                        {component.title}
                                    </p>
                                    <p className='truncate text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                                        {component.id}
                                    </p>
                                </div>
                                <Badge variant='outline' className='shrink-0 text-[10px]'>
                                    {component.accent}
                                </Badge>
                            </div>
                            <p className='text-xs leading-6 text-muted-foreground'>
                                {component.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function PreviewPanel({
    mode,
    skinLabel,
}: {
    mode: string;
    skinLabel: string;
}) {
    return (
        <div className='space-y-4'>
            <div className='flex items-center gap-2'>
                <Badge variant='outline'>skin: {skinLabel}</Badge>
                <Badge variant='outline'>mode: {mode}</Badge>
            </div>
            <Card className='overflow-hidden bg-card/88 shadow-[var(--loop-elevation-level1)]'>
                <CardHeader className='pb-2'>
                    <CardTitle className='text-sm'>Hero surface</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='rounded-[1.35rem] border border-border/60 bg-accent/60 p-4'>
                        <p className='text-[11px] uppercase tracking-[0.24em] text-muted-foreground'>
                            Editorial rhythm
                        </p>
                        <h3 className='mt-3 text-xl font-semibold text-foreground'>
                            Build a docked system that still feels composed.
                        </h3>
                        <p className='mt-2 text-sm leading-7 text-muted-foreground'>
                            The preview should show layered surfaces, calmer typography, and a more
                            intentional hierarchy than the old programmer-first demo.
                        </p>
                    </div>
                    <div className='grid gap-3 md:grid-cols-3 text-xs'>
                        <div className='rounded-[1rem] border border-border/60 bg-secondary/60 p-3'>
                            <p className='text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                                Texture
                            </p>
                            <p className='mt-2 text-sm text-foreground'>Softer overlays, richer material.</p>
                        </div>
                        <div className='rounded-[1rem] border border-border/60 bg-secondary/50 p-3'>
                            <p className='text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                                Contrast
                            </p>
                            <p className='mt-2 text-sm text-foreground'>Readable without looking severe.</p>
                        </div>
                        <div className='rounded-[1rem] border border-border/60 bg-sidebar/45 p-3'>
                            <p className='text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                                Motion
                            </p>
                            <p className='mt-2 text-sm text-foreground'>Panels should glide, not clatter.</p>
                        </div>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                        <Button size='sm'>Primary</Button>
                        <Button size='sm' variant='outline'>
                            Secondary
                        </Button>
                        <Button size='sm' variant='secondary'>
                            Subtle
                        </Button>
                    </div>
                    <Input className='h-9 text-sm' defaultValue='Token-driven control, but with better atmosphere.' />
                </CardContent>
            </Card>
        </div>
    );
}

function ShortcutStatusPanel({
    bindings,
    shortcutsEnabled,
    onOpenSettings,
}: {
    bindings: readonly GraphiteShortcutBinding[];
    shortcutsEnabled: boolean;
    onOpenSettings: () => void;
}) {
    const activeCount = bindings.filter((binding) => binding.enabled).length;
    return (
        <div className='space-y-3'>
            <p className='text-xs text-muted-foreground'>
                Keyboard support is part of the surface language. The interaction model should feel
                polished, not bolted on after the visuals.
            </p>
            <div className='grid grid-cols-2 gap-2 text-xs'>
                <div className='rounded border bg-secondary/60 p-2'>
                    <p className='text-[11px] text-muted-foreground'>Shortcuts</p>
                    <p className='font-semibold text-foreground'>{shortcutsEnabled ? 'on' : 'off'}</p>
                </div>
                <div className='rounded border bg-secondary/50 p-2'>
                    <p className='text-[11px] text-muted-foreground'>Bindings</p>
                    <p className='font-semibold text-foreground'>{activeCount}</p>
                </div>
            </div>
            <Button size='sm' variant='outline' onClick={onOpenSettings}>
                Open settings panel
            </Button>
        </div>
    );
}

function DockSettingsPanel({
    section,
    overlayVisible,
    overlayLabelsVisible,
    shortcutsEnabled,
    onSectionChange,
    onOverlayVisibleChange,
    onOverlayLabelsVisibleChange,
    onShortcutsEnabledChange,
    intents,
    bindings,
    onBindingsChange,
}: {
    section: DockSettingsPanelSection;
    overlayVisible: boolean;
    overlayLabelsVisible: boolean;
    shortcutsEnabled: boolean;
    onSectionChange: (section: DockSettingsPanelSection) => void;
    onOverlayVisibleChange: (visible: boolean) => void;
    onOverlayLabelsVisibleChange: (visible: boolean) => void;
    onShortcutsEnabledChange: (enabled: boolean) => void;
    intents: ReturnType<typeof createDockIntentRegistry>;
    bindings: readonly GraphiteShortcutBinding[];
    onBindingsChange: (bindings: GraphiteShortcutBinding[]) => void;
}) {
    return (
        <div className='space-y-3'>
            <div className='flex flex-wrap items-center gap-2'>
                <Button
                    size='sm'
                    variant={section === 'general' ? 'default' : 'outline'}
                    data-testid='dock-settings-section-general'
                    onClick={() => onSectionChange('general')}>
                    general
                </Button>
                <Button
                    size='sm'
                    variant={section === 'overlay' ? 'default' : 'outline'}
                    data-testid='dock-settings-section-overlay'
                    onClick={() => onSectionChange('overlay')}>
                    overlay
                </Button>
                <Button
                    size='sm'
                    variant={section === 'shortcuts' ? 'default' : 'outline'}
                    data-testid='dock-settings-section-shortcuts'
                    onClick={() => onSectionChange('shortcuts')}>
                    shortcuts
                </Button>
            </div>

            {section === 'general' ? (
                <Card className='bg-card/80'>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm'>Workspace Settings</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2 text-xs text-muted-foreground'>
                        <p>Settings now live inside dock panels instead of modal overlays.</p>
                        <p>
                            Use the top-right controls or <code>alt+,</code> to focus this panel.
                        </p>
                    </CardContent>
                </Card>
            ) : null}

            {section === 'overlay' ? (
                <Card className='bg-card/80'>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm'>Drop Overlay</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3 text-xs'>
                        <label className='flex items-center justify-between rounded border bg-secondary/35 px-2 py-1.5'>
                            <span>Show overlay guides</span>
                            <Switch
                                data-testid='dock-settings-overlay-visible'
                                checked={overlayVisible}
                                onCheckedChange={onOverlayVisibleChange}
                            />
                        </label>
                        <label className='flex items-center justify-between rounded border bg-secondary/35 px-2 py-1.5'>
                            <span>Show overlay labels</span>
                            <Switch
                                data-testid='dock-settings-overlay-labels-visible'
                                checked={overlayLabelsVisible}
                                onCheckedChange={onOverlayLabelsVisibleChange}
                            />
                        </label>
                    </CardContent>
                </Card>
            ) : null}

            {section === 'shortcuts' ? (
                <div className='space-y-3'>
                    <label className='flex items-center justify-between rounded border bg-secondary/35 px-2 py-1.5 text-xs'>
                        <span>Enable shortcuts</span>
                        <Switch
                            data-testid='dock-settings-shortcuts-enabled'
                            checked={shortcutsEnabled}
                            onCheckedChange={onShortcutsEnabledChange}
                        />
                    </label>
                    <ShortcutSettingsBlock
                        intents={intents}
                        bindings={bindings}
                        onBindingsChange={onBindingsChange}
                        contextFields={SHORTCUT_CONTEXT_FIELDS}
                    />
                </div>
            ) : null}
        </div>
    );
}

function IntentConsolePanel({ logs }: { logs: readonly string[] }) {
    return (
        <div className='space-y-3'>
            <div className='rounded-[1rem] border border-border/60 bg-accent/48 p-3'>
                <p className='text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                    Current direction
                </p>
                <p className='mt-2 text-sm leading-7 text-muted-foreground'>
                    The demo should feel like a skin atelier: fewer raw commands, more curation,
                    better hierarchy, and surfaces that actually sell the UI system.
                </p>
            </div>

            <div className='space-y-1 rounded-[1rem] border border-border/60 bg-sidebar/52 p-3 font-mono text-[11px]'>
                <p className='text-[11px] uppercase tracking-[0.18em] text-muted-foreground'>
                    Recent activity
                </p>
                {logs.length <= 0 ? (
                    <p className='pt-2 text-muted-foreground'>No layout intents yet.</p>
                ) : (
                    logs.map((line, index) => (
                        <p key={`${line}-${index}`} className='truncate text-muted-foreground'>
                            {line}
                        </p>
                    ))
                )}
            </div>
        </div>
    );
}

function findPanelRefByIdOrTitle(
    dock: DockBlockState['dock'],
    panelId: string,
    panelTitleValue: string,
): { panelId: string; groupId: string } | null {
    for (const node of Object.values(dock.nodes)) {
        if (node.kind !== 'group') continue;
        for (const childId of node.links.children) {
            const child = dock.nodes[childId];
            if (!child || child.kind !== 'panel') continue;
            if (child.id === panelId || child.data.title === panelTitleValue) {
                return {
                    panelId: child.id,
                    groupId: node.id,
                };
            }
        }
    }
    return null;
}

export function DockWorkbench({ mode = 'full', className }: DockWorkbenchProps) {
    const store = useGraphite<DockBlockState>();
    const dispatchIntent = useIntent<DockBlockState>();

    const ui = useQuery<DockBlockState, DockBlockState['ui']>((state) => state.ui);
    const dockState = useQuery<DockBlockState, DockBlockState['dock']>((state) => state.dock);
    const skin = useQuery<DockBlockState, DockBlockState['skin']>((state) => state.skin);
    const panels = useQuery<DockBlockState, ReturnType<typeof DOCK_PANEL_QUERY>>(
        DOCK_PANEL_QUERY,
    );

    const [shortcutBindings, setShortcutBindings] = React.useState(createDefaultShortcutBindings);
    const [history, setHistory] = React.useState(() => ({
        canUndo: store.canUndo(DOCK_HISTORY_CHANNEL),
        canRedo: store.canRedo(DOCK_HISTORY_CHANNEL),
    }));
    const [intentLogs, setIntentLogs] = React.useState<string[]>([]);
    const [skinImportValue, setSkinImportValue] = React.useState('');
    const [skinImportStatus, setSkinImportStatus] = React.useState<string | null>(null);

    const includeDebug = mode === 'full';
    const intentRegistry = React.useMemo(
        () => createDockIntentRegistry(includeDebug),
        [includeDebug],
    );

    const activeSkin = skin.skins[skin.skinId];
    const activeTheme = activeSkin
        ? skin.mode === 'dark'
            ? activeSkin.themes.dark
            : activeSkin.themes.light
        : undefined;
    const tokenEntries = React.useMemo(
        () => (activeTheme ? listDesignTokenEntries(activeTheme) : []),
        [activeTheme],
    );
    const skinOptions = React.useMemo(
        () =>
            Object.values(skin.skins).map((entry) => ({
                id: entry.id,
                label: entry.label,
                description: entry.description,
            })),
        [skin.skins],
    );
    const exportedSkinValue = React.useMemo(
        () => (activeSkin ? serializeUiSkin(activeSkin) : ''),
        [activeSkin],
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
            skinMode: state.skin.mode,
            skinId: state.skin.skinId,
        }),
    });

    React.useEffect(() => {
        return store.onCommit((commit) => {
            setHistory({
                canUndo: store.canUndo(DOCK_HISTORY_CHANNEL),
                canRedo: store.canRedo(DOCK_HISTORY_CHANNEL),
            });
            const when = new Date(commit.at).toLocaleTimeString();
            const origin = commit.intent?.name ?? commit.source ?? 'commit';
            setIntentLogs((current) => [`[${when}] ${origin}`, ...current].slice(0, 16));
        });
    }, [store]);

    const activePanelRef = React.useMemo(
        () => getActivePanelRef(dockState, ui.activeGroupId),
        [dockState, ui.activeGroupId],
    );

    const addPanel = React.useCallback(() => {
        dispatchIntent(
            DOCK_INTENTS.addPanel,
            { title: `Panel ${panels.length + 1}`, groupId: ui.activeGroupId },
            DOCK_LAYOUT_DISPATCH_OPTIONS,
        );
    }, [dispatchIntent, panels.length, ui.activeGroupId]);

    const removeActivePanel = React.useCallback(() => {
        if (!activePanelRef) return;
        dispatchIntent(
            DOCK_INTENTS.removePanel,
            { panelId: activePanelRef.panelId },
            DOCK_LAYOUT_DISPATCH_OPTIONS,
        );
    }, [activePanelRef, dispatchIntent]);

    const openSettingsPanel = React.useCallback(
        (section: DockSettingsPanelSection) => {
            dispatchIntent(
                UI_INTENTS.setSettingsPanelSection,
                { section },
                DOCK_UI_DISPATCH_OPTIONS,
            );

            const existingPanelRef = findPanelRefByIdOrTitle(
                dockState,
                SETTINGS_PANEL_ID,
                SETTINGS_PANEL_TITLE,
            );
            if (existingPanelRef) {
                dispatchIntent(
                    DOCK_INTENTS.activatePanel,
                    existingPanelRef,
                    { history: false },
                );
                dispatchIntent(
                    UI_INTENTS.setActiveGroup,
                    { groupId: existingPanelRef.groupId },
                    DOCK_UI_DISPATCH_OPTIONS,
                );
                return;
            }

            dispatchIntent(
                DOCK_INTENTS.addPanel,
                { title: SETTINGS_PANEL_TITLE, groupId: ui.activeGroupId },
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
        openSettingsPanel(ui.settingsPanelSection);
    }, [openSettingsPanel, ui.settingsPanelOpenRequestId, ui.settingsPanelSection]);

    const applySkinImport = React.useCallback(() => {
        try {
            const imported = parseUiSkinDraft(skinImportValue, skin.skins);
            dispatchIntent(
                UI_INTENTS.importSkin,
                { skinText: skinImportValue },
                DOCK_UI_DISPATCH_OPTIONS,
            );
            setSkinImportStatus(`Imported skin ${imported.label}.`);
        } catch (error) {
            setSkinImportStatus(String(error));
        }
    }, [dispatchIntent, skin.skins, skinImportValue]);

    return (
        <div className={className ?? 'space-y-3'}>
            <GraphiteIntentCommandMenu intents={intentRegistry} enabled />

            <Card className='bg-card/88 shadow-[var(--loop-elevation-level2)]'>
                <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center justify-between text-base'>
                        <span className='flex items-center gap-2'>
                            <Wrench className='h-4 w-4 text-primary' />
                            Loop UI Atelier
                        </span>
                        <div className='flex items-center gap-2 text-xs font-normal text-muted-foreground'>
                            <Badge variant='outline'>skin authoring</Badge>
                            <Badge variant='outline'>dock composition</Badge>
                            <Badge variant='outline'>token studio</Badge>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className='space-y-3'>
                    <div className='flex flex-wrap items-center gap-2'>
                        <Button size='sm' data-testid='dock-add-panel' onClick={addPanel}>
                            <Plus className='mr-1 h-4 w-4' />
                            New Panel
                        </Button>
                        <Button
                            size='sm'
                            variant='outline'
                            disabled={!activePanelRef}
                            data-testid='dock-remove-active-panel'
                            onClick={removeActivePanel}>
                            <X className='mr-1 h-4 w-4' />
                            Remove Focused
                        </Button>
                        <Button
                            size='sm'
                            variant='outline'
                            disabled={!history.canUndo}
                            data-testid='dock-undo-layout'
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
                            data-testid='dock-redo-layout'
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

                        <div className='ml-auto flex items-center gap-2 text-xs text-muted-foreground'>
                            <Button
                                size='sm'
                                variant='ghost'
                                className='h-7 px-2 text-[11px]'
                                data-testid='dock-open-overlay-settings'
                                onClick={() => openSettingsPanel('overlay')}>
                                overlays
                                <span className='ml-1 text-[10px]'>
                                    {ui.showOverlay ? 'on' : 'off'}
                                </span>
                            </Button>
                            <Button
                                size='sm'
                                variant='ghost'
                                className='h-7 px-2 text-[11px]'
                                data-testid='dock-open-shortcuts-settings'
                                onClick={() => openSettingsPanel('shortcuts')}>
                                shortcuts
                                <span className='ml-1 text-[10px]'>
                                    {ui.shortcutsEnabled ? 'on' : 'off'}
                                </span>
                            </Button>
                            <Button
                                size='sm'
                                variant='ghost'
                                className='h-7 px-2 text-[11px]'
                                data-testid='dock-open-general-settings'
                                onClick={() => openSettingsPanel('general')}>
                                <Settings2 className='mr-1 h-3.5 w-3.5' />
                                settings
                            </Button>
                        </div>
                    </div>

                    <DockCanvas
                        className={
                            mode === 'preview'
                                ? 'relative h-[520px] overflow-hidden rounded-xl border border-sidebar-border/70 bg-sidebar/24'
                                : 'relative h-[680px] overflow-hidden rounded-xl border border-sidebar-border/70 bg-sidebar/24'
                        }
                        renderPanelBody={(panelId, groupId) => {
                            if (!panelId) {
                                return <p className='text-muted-foreground'>Empty group</p>;
                            }

                            if (panelId === 'panel-component-catalog') {
                                return <ComponentCatalogPanel />;
                            }
                            if (panelId === 'panel-preview') {
                                return (
                                    <PreviewPanel
                                        mode={skin.mode}
                                        skinLabel={activeSkin?.label ?? skin.skinId}
                                    />
                                );
                            }
                            if (panelId === 'panel-theme-manager') {
                                return (
                                    <ThemeManagerBlock
                                        className='h-full min-h-0'
                                        mode={skin.mode}
                                        skinId={skin.skinId}
                                        skins={skinOptions}
                                        validationMessage={skin.validationMessage}
                                        exportValue={exportedSkinValue}
                                        onCopyExport={() => {
                                            void copyToClipboard(exportedSkinValue);
                                            setSkinImportStatus('Copied current skin JSON.');
                                        }}
                                        importValue={skinImportValue}
                                        onImportValueChange={setSkinImportValue}
                                        onImportApply={applySkinImport}
                                        importStatus={skinImportStatus}
                                        onModeChange={(nextMode) =>
                                            dispatchIntent(
                                                UI_INTENTS.setSkinMode,
                                                { mode: nextMode },
                                                DOCK_UI_DISPATCH_OPTIONS,
                                            )
                                        }
                                        onSkinChange={(skinId) =>
                                            dispatchIntent(
                                                UI_INTENTS.setSkinId,
                                                { skinId },
                                                DOCK_UI_DISPATCH_OPTIONS,
                                            )
                                        }
                                    />
                                );
                            }
                            if (panelId === 'panel-token-editor') {
                                return (
                                    <TokenEditorBlock
                                        className='h-full min-h-0'
                                        entries={tokenEntries}
                                        validationMessage={skin.validationMessage}
                                        onTokenChange={(path, value) =>
                                            dispatchIntent(
                                                UI_INTENTS.setSkinToken,
                                                { path, value },
                                                DOCK_UI_DISPATCH_OPTIONS,
                                            )
                                        }
                                    />
                                );
                            }
                            if (panelId === 'panel-shortcuts') {
                                return (
                                    <ShortcutStatusPanel
                                        bindings={shortcutBindings}
                                        shortcutsEnabled={ui.shortcutsEnabled}
                                        onOpenSettings={() => openSettingsPanel('shortcuts')}
                                    />
                                );
                            }
                            if (
                                panelId === SETTINGS_PANEL_ID ||
                                panelTitle(dockState, panelId) === SETTINGS_PANEL_TITLE
                            ) {
                                return (
                                    <DockSettingsPanel
                                        section={ui.settingsPanelSection}
                                        overlayVisible={ui.showOverlay}
                                        overlayLabelsVisible={ui.showOverlayLabels}
                                        shortcutsEnabled={ui.shortcutsEnabled}
                                        onSectionChange={(section) =>
                                            dispatchIntent(
                                                UI_INTENTS.setSettingsPanelSection,
                                                { section },
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
                                        onOverlayLabelsVisibleChange={(visible) =>
                                            dispatchIntent(
                                                UI_INTENTS.setOverlayLabelsVisible,
                                                { visible },
                                                DOCK_UI_DISPATCH_OPTIONS,
                                            )
                                        }
                                        onShortcutsEnabledChange={(enabled) =>
                                            dispatchIntent(
                                                UI_INTENTS.setShortcutsEnabled,
                                                { enabled },
                                                DOCK_UI_DISPATCH_OPTIONS,
                                            )
                                        }
                                        intents={intentRegistry}
                                        bindings={shortcutBindings}
                                        onBindingsChange={setShortcutBindings}
                                    />
                                );
                            }
                            if (panelId === 'panel-console') {
                                return <IntentConsolePanel logs={intentLogs} />;
                            }

                            return (
                                <div className='space-y-1'>
                                    <p className='text-sm font-medium text-foreground'>
                                        {panelTitle(dockState, panelId)}
                                    </p>
                                    <p className='text-[11px] text-muted-foreground'>
                                        {panelId} in {groupId}
                                    </p>
                                </div>
                            );
                        }}
                    />

                    {mode === 'full' ? (
                        <>
                            <div className='grid gap-3 md:grid-cols-2'>
                                <Card className='bg-sidebar/22'>
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='text-xs uppercase tracking-wide text-muted-foreground'>
                                            Surface Balance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-1 text-xs'>
                                        <p>panels: {panels.length}</p>
                                        <p>focused: {activePanelRef?.panelId ?? 'none'}</p>
                                        <p>skin: {skin.skinId}</p>
                                        <p>mode: {skin.mode}</p>
                                        <p>token entries: {tokenEntries.length}</p>
                                    </CardContent>
                                </Card>

                                <Card className='bg-secondary/30'>
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='text-xs uppercase tracking-wide text-muted-foreground'>
                                            Skin Snapshot
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-2 text-xs text-muted-foreground'>
                                        <p>Validation: {skin.validationMessage ?? 'schema valid'}</p>
                                        <p>Overlay guides: {ui.showOverlay ? 'visible' : 'hidden'}</p>
                                        <p>Settings panel: {ui.settingsPanelSection}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Separator />

                            <Card className='bg-accent/22'>
                                <CardContent className='space-y-2 pt-4 text-sm leading-7 text-muted-foreground'>
                                    <p>
                                        The workbench still exposes the real dock and token system,
                                        but the default presentation now aims to demonstrate a visual
                                        direction instead of a pile of internal knobs.
                                    </p>
                                    <p>
                                        Keep the authoring power. Lose the programmer-dashboard
                                        vibe.
                                    </p>
                                </CardContent>
                            </Card>
                        </>
                    ) : null}
                </CardContent>
            </Card>

        </div>
    );
}
