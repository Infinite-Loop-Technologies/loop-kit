import * as React from 'react';
import { GraphiteProvider, useQuery } from '@loop-kit/graphite-react';
import type { ColorMode } from '@loop-kit/loom-core';
import { InteractionProvider } from '@loop-kit/loom-interactions';
import {
    Badge,
    Grid,
    Heading,
    Icon,
    Inline,
    LoomProvider,
    Panel,
    Separator,
    Stack,
    Surface,
    Text,
    useLoomTokens,
    type LoomReactThemeLayer,
} from '@loop-kit/loom-react';
import {
    DockWorkspaceBlock,
    createDockStore,
    type DockBlockState,
} from '@loop-kit/loom-pack-dock';
import { aquaticReactTheme } from '@loop-kit/loom-theme-aquatic-react';
import { baseReactTheme } from '@loop-kit/loom-theme-base-react';
import { neumorphReactTheme } from '@loop-kit/loom-theme-neumorph-react';

function resolveDockThemes(
    themeId: DockBlockState['ui']['themeId'],
): LoomReactThemeLayer[] {
    switch (themeId) {
        case 'aquatic':
            return [baseReactTheme, aquaticReactTheme];
        case 'neumorph':
            return [baseReactTheme, neumorphReactTheme];
        case 'base':
        default:
            return [baseReactTheme];
    }
}

function DockDemoPage() {
    const colorMode = useQuery<DockBlockState, ColorMode>((state) => state.ui.colorMode);
    const themeId = useQuery<DockBlockState, DockBlockState['ui']['themeId']>(
        (state) => state.ui.themeId,
    );
    const themes = React.useMemo(() => resolveDockThemes(themeId), [themeId]);

    return (
        <InteractionProvider>
            <LoomProvider colorMode={colorMode} themes={themes}>
                <DockDemoContent />
            </LoomProvider>
        </InteractionProvider>
    );
}

function DockDemoContent() {
    const tokens = useLoomTokens();
    const themeId = useQuery<DockBlockState, DockBlockState['ui']['themeId']>(
        (state) => state.ui.themeId,
    );
    const colorMode = useQuery<DockBlockState, ColorMode>((state) => state.ui.colorMode);

    return (
        <Surface
            className='dock-demo-shell'
            style={{
                background: `linear-gradient(180deg, ${tokens.color.surface.raised} 0%, ${tokens.color.surface.default} 42%, ${tokens.color.surface.sunken} 100%)`,
                minHeight: '100vh',
            }}>
            <Stack gap='4'>
                <Panel emphasis='strong'>
                    <Stack gap='4'>
                        <Inline align='center' justify='space-between'>
                            <Stack gap='2'>
                                <Inline align='center' gap='2'>
                                    <Icon name='panelLeft' size='sm' />
                                    <Text
                                        as='span'
                                        size='sm'
                                        style={{
                                            letterSpacing: '0.16em',
                                            textTransform: 'uppercase',
                                        }}
                                        tone='muted'>
                                        Dock Demo
                                    </Text>
                                </Inline>
                                <Heading level={1} size='xl'>
                                    Dock composition now lives in a Loom pack.
                                </Heading>
                                <Text tone='muted'>
                                    The dock model remains Graphite-backed. The pack owns the
                                    reusable React workbench, and this page stays inside the same
                                    Loom provider so theme and mode changes affect the full shell.
                                </Text>
                            </Stack>

                            <Inline gap='2'>
                                <Badge tone='accent'>{themeId}</Badge>
                                <Badge kind='outline' tone='muted'>
                                    {colorMode}
                                </Badge>
                            </Inline>
                        </Inline>

                        <Separator />

                        <Grid columns={3} gap='3'>
                            <Panel density='compact' emphasis='subtle'>
                                <Stack gap='2'>
                                    <Inline align='center' gap='2'>
                                        <Icon name='settings' size='sm' />
                                        <Heading level={2} size='sm'>
                                            Pack Surface
                                        </Heading>
                                    </Inline>
                                    <Text size='sm' tone='muted'>
                                        `loom-pack-dock` owns the higher-level workbench, not the
                                        primitive contracts.
                                    </Text>
                                </Stack>
                            </Panel>
                            <Panel density='compact' emphasis='subtle'>
                                <Stack gap='2'>
                                    <Inline align='center' gap='2'>
                                        <Icon name='panelRight' size='sm' />
                                        <Heading level={2} size='sm'>
                                            Theme Proof
                                        </Heading>
                                    </Inline>
                                    <Text size='sm' tone='muted'>
                                        Theme and mode changes come from the dock store and flow
                                        through the same Loom provider as the page shell.
                                    </Text>
                                </Stack>
                            </Panel>
                            <Panel density='compact' emphasis='subtle'>
                                <Stack gap='2'>
                                    <Inline align='center' gap='2'>
                                        <Icon name='info' size='sm' />
                                        <Heading level={2} size='sm'>
                                            Interaction Runtime
                                        </Heading>
                                    </Inline>
                                    <Text size='sm' tone='muted'>
                                        Measured views, drag state, and shortcut routing stay in
                                        `loom-interactions`, not in Graphite facts.
                                    </Text>
                                </Stack>
                            </Panel>
                        </Grid>
                    </Stack>
                </Panel>

                <Surface style={{ minHeight: '48rem', padding: '0.75rem' }}>
                    <DockWorkspaceBlock mode='full' />
                </Surface>
            </Stack>
        </Surface>
    );
}

export function App() {
    const store = React.useMemo(() => createDockStore(), []);

    return (
        <GraphiteProvider store={store}>
            <DockDemoPage />
        </GraphiteProvider>
    );
}
