import * as React from 'react';
import {
    createDockGroup,
    createDockLayer,
    createDockPanel,
    createDockState,
    type DockState,
} from '@loop-kit/dock';
import type { ColorMode } from '@loop-kit/loom-core';
import {
    DockProvider,
    DockStage,
    type DockPanelRegistry,
    type DockPanelRendererProps,
} from '@loop-kit/loom-pack-dock';
import {
    Badge,
    Box,
    Button,
    Grid,
    Heading,
    Inline,
    LoomProvider,
    Panel,
    Stack,
    Surface,
    Text,
    type LoomReactThemeLayer,
} from '@loop-kit/loom-react';
import { aquaticReactTheme } from '@loop-kit/loom-theme-aquatic-react';
import { baseReactTheme } from '@loop-kit/loom-theme-base-react';
import { neumorphReactTheme } from '@loop-kit/loom-theme-neumorph-react';

type DemoThemeId = 'base' | 'aquatic' | 'neumorph';

const layerIds = {
    modal: 'layer-modal',
    peek: 'layer-peek',
    workspace: 'layer-workspace',
} as const;

const groupIds = {
    inspector: 'group-inspector',
    modal: 'group-modal',
    peek: 'group-peek',
    sidebar: 'group-sidebar',
    workspace: 'group-workspace',
} as const;

const panelIds = {
    console: 'panel-console',
    inspector: 'panel-inspector',
    modal: 'panel-modal',
    notes: 'panel-notes',
    peek: 'panel-peek',
    preview: 'panel-preview',
    sidebar: 'panel-sidebar',
} as const;

function resolveThemes(themeId: DemoThemeId): LoomReactThemeLayer[] {
    switch (themeId) {
        case 'aquatic':
            return [baseReactTheme, aquaticReactTheme];
        case 'neumorph':
            return [baseReactTheme, neumorphReactTheme];
        default:
            return [baseReactTheme];
    }
}

function createDemoDockState(): DockState {
    return createDockState({
        activeGroupId: groupIds.workspace,
        activeLayerId: layerIds.workspace,
        focusedPanelId: panelIds.preview,
        groups: {
            [groupIds.inspector]: createDockGroup({
                chrome: { framed: false, showTabs: false, showTitlebar: false },
                id: groupIds.inspector,
                layerId: layerIds.workspace,
                layout: { basis: '18rem', min: '16rem', width: '18rem' },
                meta: { acceptsKinds: ['inspector'], family: 'inspector' },
                mode: 'single',
                panelIds: [panelIds.inspector],
                policies: { attachable: false, closeable: false, movable: false, reorderable: false, splittable: false },
                title: 'Inspector',
            }),
            [groupIds.sidebar]: createDockGroup({
                chrome: { framed: false, showTabs: false, showTitlebar: false },
                id: groupIds.sidebar,
                layerId: layerIds.workspace,
                layout: { basis: '15rem', min: '13rem', width: '15rem' },
                meta: { acceptsKinds: ['sidebar'], family: 'sidebar' },
                mode: 'single',
                panelIds: [panelIds.sidebar],
                policies: { attachable: false, closeable: false, movable: false, reorderable: false, splittable: false },
                title: 'Navigation',
            }),
            [groupIds.workspace]: createDockGroup({
                chrome: { framed: false, showTabs: true, showTitlebar: false },
                id: groupIds.workspace,
                layerId: layerIds.workspace,
                layout: { basis: 'auto', grow: 1, min: '0' },
                meta: { acceptsKinds: ['workspace-console', 'workspace-notes', 'workspace-preview'], family: 'workspace' },
                mode: 'tabs',
                panelIds: [panelIds.preview, panelIds.notes, panelIds.console],
                policies: { closeable: false, reorderable: true, splittable: true },
                title: 'Workspace',
            }),
        },
        layerOrder: [layerIds.workspace, layerIds.peek, layerIds.modal],
        layers: {
            [layerIds.modal]: createDockLayer({
                groupIds: [],
                id: layerIds.modal,
                kind: 'overlay',
                overlay: { behavior: 'replace', interaction: 'modal', maxGroups: 1 },
            }),
            [layerIds.peek]: createDockLayer({
                groupIds: [],
                id: layerIds.peek,
                kind: 'overlay',
                overlay: { behavior: 'replace', interaction: 'passthrough', maxGroups: 1 },
            }),
            [layerIds.workspace]: createDockLayer({
                flow: { direction: 'horizontal', gap: '0', reorder: 'horizontal-only' },
                groupIds: [groupIds.sidebar, groupIds.workspace, groupIds.inspector],
                id: layerIds.workspace,
                kind: 'flow',
            }),
        },
        panels: {
            [panelIds.console]: createDockPanel({ id: panelIds.console, kind: 'workspace-console', meta: { family: 'workspace' }, title: 'Console' }),
            [panelIds.inspector]: createDockPanel({ id: panelIds.inspector, kind: 'inspector', meta: { family: 'inspector', neverSplit: true }, title: 'Inspector' }),
            [panelIds.notes]: createDockPanel({ id: panelIds.notes, kind: 'workspace-notes', meta: { family: 'workspace' }, title: 'Notes' }),
            [panelIds.preview]: createDockPanel({ id: panelIds.preview, kind: 'workspace-preview', meta: { family: 'workspace' }, title: 'Preview' }),
            [panelIds.sidebar]: createDockPanel({ id: panelIds.sidebar, kind: 'sidebar', meta: { family: 'sidebar', neverSplit: true }, title: 'Sidebar' }),
        },
    });
}

function openPeek(controller: DockPanelRendererProps['controller']) {
    controller.openPanel({
        group: {
            chrome: { framed: false, showTabs: false, showTitlebar: false },
            layout: { placement: { edge: 'right', kind: 'edge', width: '22rem' } },
            mode: 'swap',
            policies: { closeable: true, movable: false, reorderable: false, splittable: false },
            title: 'Peek',
        },
        groupId: groupIds.peek,
        layerId: layerIds.peek,
        panel: createDockPanel({ id: panelIds.peek, kind: 'peek', meta: { family: 'overlay', neverSplit: true }, title: 'Peek Drawer' }),
    });
}

function openModal(controller: DockPanelRendererProps['controller']) {
    controller.openPanel({
        group: {
            chrome: { framed: false, showTabs: false, showTitlebar: false },
            layout: { placement: { kind: 'center', top: '5rem', width: 'min(34rem, calc(100vw - 3rem))' } },
            mode: 'swap',
            policies: { closeable: true, movable: false, reorderable: false, splittable: false },
            title: 'Modal',
        },
        groupId: groupIds.modal,
        layerId: layerIds.modal,
        panel: createDockPanel({ id: panelIds.modal, kind: 'modal', meta: { family: 'overlay', neverSplit: true }, title: 'Modal Review' }),
    });
}

function SidebarPanel() {
    return (
        <Stack gap='2'>
            <Badge tone='accent'>Locked Group</Badge>
            <Text tone='muted'>Sidebar tabs cannot accept workspace panels.</Text>
            <Badge kind='outline' tone='muted'>family: sidebar</Badge>
        </Stack>
    );
}

function InspectorPanel() {
    return (
        <Stack gap='3'>
            <Heading level={3} size='sm'>Policy</Heading>
            <Text tone='muted'>Try dragging workspace tabs over the sidebar or inspector. The runtime will reject those drops because the dock policy only accepts matching families.</Text>
            <Badge kind='outline' tone='accent'>neverSplit protected</Badge>
        </Stack>
    );
}

function WorkspacePreviewPanel({ controller }: DockPanelRendererProps) {
    return (
        <Stack gap='4'>
            <Heading level={3} size='md'>Interaction Runtime Demo</Heading>
            <Text tone='muted'>Drag the tabs onto panel edges to split the workspace. Dragging into the middle reattaches as tabs. Use the buttons below to open overlay layers.</Text>
            <Inline gap='2'>
                <Button kind='outline' onClick={() => openPeek(controller)} type='button'>Open Peek</Button>
                <Button onClick={() => openModal(controller)} type='button'>Open Modal</Button>
            </Inline>
            <Inline gap='2'>
                <Badge tone='accent'>drag tabs</Badge>
                <Badge kind='outline' tone='muted'>split edges</Badge>
                <Badge kind='outline' tone='muted'>policy families</Badge>
            </Inline>
        </Stack>
    );
}

function NotesPanel() {
    return (
        <Stack gap='3'>
            <Heading level={3} size='sm'>Notes</Heading>
            <Text tone='muted'>This panel is intentionally compatible with the main workspace group only. Split it, re-tab it, and drag it between workspace panes.</Text>
        </Stack>
    );
}

function ConsolePanel() {
    return (
        <Panel emphasis='strong'>
            <Stack gap='2'>
                <Heading level={3} size='sm'>Console</Heading>
                <Text tone='muted'>The interaction runtime owns keyboard ingress, scope hierarchy, and drag session state. The dock package owns drop resolution and policy decisions.</Text>
            </Stack>
        </Panel>
    );
}

function PeekPanel({ controller }: DockPanelRendererProps) {
    return (
        <Stack gap='3'>
            <Heading level={3} size='sm'>Peek Layer</Heading>
            <Text tone='muted'>This layer is passthrough, so the background remains interactive while the drawer is open.</Text>
            <Button kind='outline' onClick={() => controller.dismissLayer({ layerId: layerIds.peek })} type='button'>Close Peek</Button>
        </Stack>
    );
}

function ModalPanel({ controller }: DockPanelRendererProps) {
    return (
        <Panel emphasis='strong'>
            <Stack gap='3'>
                <Heading level={3} size='md'>Modal Layer</Heading>
                <Text tone='muted'>This layer is modal, so Escape and backdrop clicks dismiss it through the shared keyboard ingress and dock action dispatch.</Text>
                <Button onClick={() => controller.dismissLayer({ layerId: layerIds.modal })} type='button'>Dismiss Modal</Button>
            </Stack>
        </Panel>
    );
}

function createPanelRegistry(): DockPanelRegistry {
    return {
        kinds: {
            inspector: InspectorPanel,
            modal: ModalPanel,
            peek: PeekPanel,
            sidebar: SidebarPanel,
            'workspace-console': ConsolePanel,
            'workspace-notes': NotesPanel,
            'workspace-preview': WorkspacePreviewPanel,
        },
    };
}

export function App() {
    const [themeId, setThemeId] = React.useState<DemoThemeId>('base');
    const [colorMode, setColorMode] = React.useState<ColorMode>('dark');
    const initialState = React.useMemo(() => createDemoDockState(), []);
    const registry = React.useMemo(() => createPanelRegistry(), []);
    const themes = React.useMemo(() => resolveThemes(themeId), [themeId]);

    return (
        <LoomProvider colorMode={colorMode} themes={themes}>
            <Surface style={{ minHeight: '100vh', padding: '1rem' }}>
                <Stack gap='4'>
                    <Panel emphasis='strong'>
                        <Inline align='center' justify='space-between'>
                            <Stack gap='2'>
                                <Heading level={1} size='lg'>Dock Demo</Heading>
                                <Text tone='muted'>Workspace splits, non-interoperable sidebar and inspector groups, plus modal and peek layers driven by the new interaction runtime.</Text>
                            </Stack>
                            <Inline gap='2'>
                                <Button kind='outline' onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')} type='button'>{colorMode}</Button>
                                <Button kind='outline' onClick={() => setThemeId(themeId === 'base' ? 'aquatic' : themeId === 'aquatic' ? 'neumorph' : 'base')} type='button'>{themeId}</Button>
                            </Inline>
                        </Inline>
                    </Panel>

                    <Grid columns='1fr' gap='4'>
                        <Panel emphasis='subtle'>
                            <DockProvider initialState={initialState} registry={registry}>
                                <DockStage style={{ minHeight: '44rem' }} />
                            </DockProvider>
                        </Panel>
                    </Grid>
                </Stack>
            </Surface>
        </LoomProvider>
    );
}
