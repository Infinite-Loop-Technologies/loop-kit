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
} from '@loop-kit/loom-pack-dock';
import {
    Badge,
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
        activeGroupId: 'group-workspace',
        activeLayerId: 'layer-main',
        focusedPanelId: 'panel-preview',
        groups: {
            'group-inspector': createDockGroup({
                chrome: {
                    framed: false,
                    showTabs: false,
                    showTitlebar: false,
                },
                id: 'group-inspector',
                layerId: 'layer-main',
                layout: {
                    basis: '20rem',
                    min: '18rem',
                    width: '20rem',
                },
                mode: 'single',
                panelIds: ['panel-inspector'],
                policies: {
                    closeable: false,
                    movable: false,
                    reorderable: false,
                    splittable: false,
                },
                title: 'Inspector',
            }),
            'group-sidebar': createDockGroup({
                chrome: {
                    framed: false,
                    showTabs: false,
                    showTitlebar: false,
                },
                id: 'group-sidebar',
                layerId: 'layer-main',
                layout: {
                    basis: '16rem',
                    min: '14rem',
                    width: '16rem',
                },
                mode: 'single',
                panelIds: ['panel-sidebar'],
                policies: {
                    closeable: false,
                    movable: false,
                    reorderable: false,
                    splittable: false,
                },
                title: 'Navigation',
            }),
            'group-workspace': createDockGroup({
                chrome: {
                    framed: false,
                    showTabs: true,
                    showTitlebar: false,
                },
                id: 'group-workspace',
                layerId: 'layer-main',
                layout: {
                    basis: 'auto',
                    grow: 1,
                    min: '0',
                },
                mode: 'tabs',
                panelIds: ['panel-preview', 'panel-notes'],
                title: 'Workspace',
            }),
        },
        layerOrder: ['layer-main'],
        layers: {
            'layer-main': createDockLayer({
                flow: {
                    direction: 'horizontal',
                    gap: '0',
                    reorder: 'horizontal-only',
                },
                groupIds: ['group-sidebar', 'group-workspace', 'group-inspector'],
                id: 'layer-main',
                kind: 'flow',
            }),
        },
        panels: {
            'panel-inspector': createDockPanel({
                id: 'panel-inspector',
                kind: 'inspector',
                title: 'Inspector',
            }),
            'panel-notes': createDockPanel({
                id: 'panel-notes',
                kind: 'notes',
                title: 'Notes',
            }),
            'panel-preview': createDockPanel({
                id: 'panel-preview',
                kind: 'preview',
                title: 'Preview',
            }),
            'panel-sidebar': createDockPanel({
                id: 'panel-sidebar',
                kind: 'sidebar',
                title: 'Sidebar',
            }),
        },
    });
}

function createPanelRegistry(): DockPanelRegistry {
    return {
        kinds: {
            inspector: function InspectorPanel() {
                return (
                    <Stack gap='3'>
                        <Heading level={3} size='sm'>
                            Dock State
                        </Heading>
                        <Text tone='muted'>The dock package is now headless and theme-agnostic.</Text>
                        <Badge kind='outline' tone='accent'>
                            Canonical store
                        </Badge>
                    </Stack>
                );
            },
            notes: function NotesPanel() {
                return (
                    <Stack gap='3'>
                        <Heading level={3} size='sm'>
                            Notes
                        </Heading>
                        <Text tone='muted'>
                            This demo intentionally avoids pack-owned theme selection and Graphite state.
                        </Text>
                    </Stack>
                );
            },
            preview: function PreviewPanel() {
                return (
                    <Panel emphasis='strong'>
                        <Stack gap='3'>
                            <Heading level={3} size='md'>
                                Dock Stage
                            </Heading>
                            <Text tone='muted'>
                                Theme and color mode are supplied by the app shell through LoomProvider.
                            </Text>
                        </Stack>
                    </Panel>
                );
            },
            sidebar: function SidebarPanel() {
                return (
                    <Stack gap='2'>
                        <Badge tone='accent'>dock</Badge>
                        <Badge kind='outline' tone='muted'>
                            state
                        </Badge>
                        <Badge kind='outline' tone='muted'>
                            loom-pack-dock
                        </Badge>
                    </Stack>
                );
            },
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
            <Surface
                style={{
                    minHeight: '100vh',
                    padding: '1rem',
                }}>
                <Stack gap='4'>
                    <Panel emphasis='strong'>
                        <Inline align='center' justify='space-between'>
                            <Stack gap='2'>
                                <Heading level={1} size='lg'>
                                    Dock Demo
                                </Heading>
                                <Text tone='muted'>
                                    App-owned theme selection, headless dock state, and a single React bridge.
                                </Text>
                            </Stack>
                            <Inline gap='2'>
                                <Button kind='outline' onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')} type='button'>
                                    {colorMode}
                                </Button>
                                <Button kind='outline' onClick={() => setThemeId(themeId === 'base' ? 'aquatic' : themeId === 'aquatic' ? 'neumorph' : 'base')} type='button'>
                                    {themeId}
                                </Button>
                            </Inline>
                        </Inline>
                    </Panel>

                    <Grid columns='1fr' gap='4'>
                        <Panel emphasis='subtle'>
                            <DockProvider initialState={initialState} registry={registry}>
                                <DockStage style={{ minHeight: '42rem' }} />
                            </DockProvider>
                        </Panel>
                    </Grid>
                </Stack>
            </Surface>
        </LoomProvider>
    );
}
