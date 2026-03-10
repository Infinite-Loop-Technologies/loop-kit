'use client';

import * as React from 'react';
import {
    GraphiteInspector,
    useGraphite,
    useIntent,
    useQuery,
} from '@loop-kit/graphite/react';
import { Copy, Plus, Redo2, Settings2, Undo2, Wrench, X } from 'lucide-react';

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
import { listDesignTokenEntries } from './theme-state';

export type DockWorkbenchMode = 'full' | 'preview';

type DockWorkbenchProps = {
    mode?: DockWorkbenchMode;
    className?: string;
};

type DemoCatalogEntry = {
    id: string;
    title: string;
    description: string;
    targetHint: string;
};

const UI_DEMO_COMPONENTS: DemoCatalogEntry[] = [
    {
        id: 'ui-dock-workspace',
        title: 'Dock Workspace',
        description: 'Graphite-first draggable tab/split dock workspace block.',
        targetHint: 'apps/ui-demo',
    },
    {
        id: 'ui-theme-manager',
        title: 'Theme Manager',
        description: 'Preset + mode selector to switch and reskin tokens live.',
        targetHint: 'apps/ui-demo',
    },
    {
        id: 'ui-token-editor',
        title: 'Token Editor',
        description: 'Editable design token matrix with schema validation.',
        targetHint: 'apps/ui-demo',
    },
    {
        id: 'ui-shortcuts-settings',
        title: 'Shortcuts Settings',
        description: 'Graphite-powered shortcut-to-intent settings panel.',
        targetHint: 'apps/ui-demo',
    },
    {
        id: 'ui-demo-starter',
        title: 'UI Demo Starter',
        description: 'Optional bundle to scaffold the complete demo shell.',
        targetHint: 'apps/ui-demo',
    },
];

function copyToClipboard(value: string): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        return navigator.clipboard.writeText(value);
    }
    return Promise.resolve();
}

function CommandCopyButton({ command }: { command: string }) {
    const [copied, setCopied] = React.useState(false);

    return (
        <Button
            size='sm'
            variant='outline'
            className='h-7 px-2 text-[11px]'
            onClick={async () => {
                await copyToClipboard(command);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1000);
            }}>
            <Copy className='mr-1 h-3 w-3' />
            {copied ? 'copied' : 'copy'}
        </Button>
    );
}

function ComponentCatalogPanel() {
    return (
        <div className='space-y-3'>
            <p className='text-xs text-muted-foreground'>
                Use repo-local CLI only. These commands run against this workspace and never use
                the published stable binary.
            </p>
            <div className='space-y-2'>
                {UI_DEMO_COMPONENTS.map((component) => {
                    const devCommand = `pnpm run loop:dev add local:${component.id} --to ${component.targetHint} --cwd . --dry-run`;
                    const distCommand = `node packages/loop-cli/dist/cli.js add local:${component.id} --to ${component.targetHint} --cwd . --dry-run`;
                    return (
                        <div
                            key={component.id}
                            className='space-y-1 rounded-md border border-border/60 bg-background/70 p-2'>
                            <div className='flex items-center justify-between gap-2'>
                                <div className='min-w-0'>
                                    <p className='truncate text-xs font-semibold text-foreground'>
                                        {component.title}
                                    </p>
                                    <p className='truncate text-[11px] text-muted-foreground'>
                                        local:{component.id}
                                    </p>
                                </div>
                                <Badge variant='outline' className='shrink-0 text-[10px]'>
                                    {component.targetHint}
                                </Badge>
                            </div>
                            <p className='text-[11px] text-muted-foreground'>{component.description}</p>
                            <div className='rounded border bg-muted/25 p-2 font-mono text-[10px] text-foreground/90'>
                                {devCommand}
                            </div>
                            <div className='flex items-center gap-2'>
                                <CommandCopyButton command={devCommand} />
                                <CommandCopyButton command={distCommand} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function PreviewPanel({
    mode,
    presetLabel,
}: {
    mode: string;
    presetLabel: string;
}) {
    return (
        <div className='space-y-3'>
            <div className='flex items-center gap-2'>
                <Badge variant='outline'>preset: {presetLabel}</Badge>
                <Badge variant='outline'>mode: {mode}</Badge>
            </div>
            <Card className='bg-background/70'>
                <CardHeader className='pb-2'>
                    <CardTitle className='text-sm'>Live Skin Preview</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-xs'>
                    <div className='flex flex-wrap gap-2'>
                        <Button size='sm'>Primary</Button>
                        <Button size='sm' variant='outline'>
                            Outline
                        </Button>
                        <Button size='sm' variant='secondary'>
                            Secondary
                        </Button>
                    </div>
                    <Input className='h-8 text-xs' defaultValue='Token-driven form control' />
                    <p className='rounded border border-border/60 bg-muted/20 px-2 py-1 text-[11px] text-muted-foreground'>
                        Edit tokens in the Token Editor panel to fully reskin this surface in real
                        time.
                    </p>
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
                Shortcuts dispatch Graphite intents and stay active while the command menu is open.
            </p>
            <div className='grid grid-cols-2 gap-2 text-xs'>
                <div className='rounded border bg-background/70 p-2'>
                    <p className='text-[11px] text-muted-foreground'>Enabled</p>
                    <p className='font-semibold text-foreground'>{shortcutsEnabled ? 'yes' : 'no'}</p>
                </div>
                <div className='rounded border bg-background/70 p-2'>
                    <p className='text-[11px] text-muted-foreground'>Active bindings</p>
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
                <Card className='bg-background/60'>
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
                <Card className='bg-background/60'>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm'>Drop Overlay</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3 text-xs'>
                        <label className='flex items-center justify-between rounded border bg-muted/20 px-2 py-1.5'>
                            <span>Show overlay guides</span>
                            <Switch
                                data-testid='dock-settings-overlay-visible'
                                checked={overlayVisible}
                                onCheckedChange={onOverlayVisibleChange}
                            />
                        </label>
                        <label className='flex items-center justify-between rounded border bg-muted/20 px-2 py-1.5'>
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
                    <label className='flex items-center justify-between rounded border bg-muted/20 px-2 py-1.5 text-xs'>
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
        <div className='space-y-1 font-mono text-[11px]'>
            {logs.length <= 0 ? (
                <p className='text-muted-foreground'>No intents yet.</p>
            ) : (
                logs.map((line, index) => (
                    <p key={`${line}-${index}`} className='truncate text-muted-foreground'>
                        {line}
                    </p>
                ))
            )}
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
    const theme = useQuery<DockBlockState, DockBlockState['theme']>((state) => state.theme);
    const panels = useQuery<DockBlockState, ReturnType<typeof DOCK_PANEL_QUERY>>(
        DOCK_PANEL_QUERY,
    );

    const [shortcutBindings, setShortcutBindings] = React.useState(createDefaultShortcutBindings);
    const [history, setHistory] = React.useState(() => ({
        canUndo: store.canUndo(DOCK_HISTORY_CHANNEL),
        canRedo: store.canRedo(DOCK_HISTORY_CHANNEL),
    }));
    const [intentLogs, setIntentLogs] = React.useState<string[]>([]);

    const includeDebug = mode === 'full';
    const intentRegistry = React.useMemo(
        () => createDockIntentRegistry(includeDebug),
        [includeDebug],
    );

    const activePreset = theme.presets[theme.presetId];
    const activeTheme = activePreset
        ? theme.mode === 'dark'
            ? activePreset.themes.dark
            : activePreset.themes.light
        : undefined;
    const tokenEntries = React.useMemo(
        () => (activeTheme ? listDesignTokenEntries(activeTheme) : []),
        [activeTheme],
    );
    const presetOptions = React.useMemo(
        () =>
            Object.values(theme.presets).map((preset) => ({
                id: preset.id,
                label: preset.label,
                description: preset.description,
            })),
        [theme.presets],
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
            themeMode: state.theme.mode,
            themePreset: state.theme.presetId,
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

    return (
        <div className={className ?? 'space-y-3'}>
            <GraphiteIntentCommandMenu intents={intentRegistry} enabled />

            <Card className='bg-card/90'>
                <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center justify-between text-base'>
                        <span className='flex items-center gap-2'>
                            <Wrench className='h-4 w-4 text-primary' />
                            UI Demo Workspace
                        </span>
                        <div className='flex items-center gap-2 text-xs font-normal text-muted-foreground'>
                            <Badge variant='outline'>graphite-first</Badge>
                            <Badge variant='outline'>dynamic dock</Badge>
                            <Badge variant='outline'>token reskin</Badge>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className='space-y-3'>
                    <div className='flex flex-wrap items-center gap-2'>
                        <Button size='sm' data-testid='dock-add-panel' onClick={addPanel}>
                            <Plus className='mr-1 h-4 w-4' />
                            Add Panel
                        </Button>
                        <Button
                            size='sm'
                            variant='outline'
                            disabled={!activePanelRef}
                            data-testid='dock-remove-active-panel'
                            onClick={removeActivePanel}>
                            <X className='mr-1 h-4 w-4' />
                            Remove Active
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
                                overlay
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
                                ? 'relative h-[520px] overflow-hidden rounded-xl border bg-muted/10'
                                : 'relative h-[680px] overflow-hidden rounded-xl border bg-muted/10'
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
                                        mode={theme.mode}
                                        presetLabel={activePreset?.label ?? theme.presetId}
                                    />
                                );
                            }
                            if (panelId === 'panel-theme-manager') {
                                return (
                                    <ThemeManagerBlock
                                        mode={theme.mode}
                                        presetId={theme.presetId}
                                        presets={presetOptions}
                                        validationMessage={theme.validationMessage}
                                        onModeChange={(nextMode) =>
                                            dispatchIntent(
                                                UI_INTENTS.setThemeMode,
                                                { mode: nextMode },
                                                DOCK_UI_DISPATCH_OPTIONS,
                                            )
                                        }
                                        onPresetChange={(presetId) =>
                                            dispatchIntent(
                                                UI_INTENTS.setThemePreset,
                                                { presetId },
                                                DOCK_UI_DISPATCH_OPTIONS,
                                            )
                                        }
                                    />
                                );
                            }
                            if (panelId === 'panel-token-editor') {
                                return (
                                    <TokenEditorBlock
                                        entries={tokenEntries}
                                        validationMessage={theme.validationMessage}
                                        onTokenChange={(path, value) =>
                                            dispatchIntent(
                                                UI_INTENTS.setThemeToken,
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
                                <Card className='bg-muted/20'>
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='text-xs uppercase tracking-wide text-muted-foreground'>
                                            Workspace State
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-1 text-xs'>
                                        <p>panels: {panels.length}</p>
                                        <p>active panel: {activePanelRef?.panelId ?? 'none'}</p>
                                        <p>theme: {theme.presetId}</p>
                                        <p>mode: {theme.mode}</p>
                                        <p>settings: {ui.settingsPanelSection}</p>
                                    </CardContent>
                                </Card>

                                <Card className='bg-muted/20'>
                                    <CardHeader className='pb-2'>
                                        <CardTitle className='text-xs uppercase tracking-wide text-muted-foreground'>
                                            Installed Flow Commands
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-1 text-xs'>
                                        <p className='rounded border bg-background/60 p-1.5 font-mono text-[11px]'>
                                            pnpm run loop:dev component list --cwd .
                                        </p>
                                        <p className='rounded border bg-background/60 p-1.5 font-mono text-[11px]'>
                                            node packages/loop-cli/dist/cli.js component show ui-demo-starter --cwd .
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Separator />

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
