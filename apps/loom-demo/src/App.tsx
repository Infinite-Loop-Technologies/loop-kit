import * as React from 'react';
import {
    InteractionProvider,
    useMeasuredView,
    useViewSnapshot,
} from '@loop-kit/loom-interactions';
import { DockWorkspaceDemo } from '@loop-kit/loom-pack-dock';
import {
    DataTable,
    createQueryBuilderModel,
    type DataTableColumn,
} from '@loop-kit/loom-pack-data';
import { ThemeSettingsPanel } from '@loop-kit/loom-pack-settings';
import {
    Badge,
    Button,
    Grid,
    Heading,
    Inline,
    LoomProvider,
    Panel,
    Stack,
    Tabs,
    Text,
} from '@loop-kit/loom-react';
import { aquaticReactTheme } from '@loop-kit/loom-theme-aquatic-react';
import { baseReactTheme } from '@loop-kit/loom-theme-base-react';
import { neumorphReactTheme } from '@loop-kit/loom-theme-neumorph-react';

const themeOptions = [
    {
        description: 'Base theme with the standard semantic token surface.',
        id: 'base',
        label: 'Base',
    },
    {
        description: 'Glossy, translucent, frutiger-aero-ish surfaces.',
        id: 'aquatic',
        label: 'Aquatic',
    },
    {
        description: 'Soft contours and neumorphic depth.',
        id: 'neumorph',
        label: 'Neumorph',
    },
] as const;

const sampleRows = [
    { id: 'loom-core', owner: 'core', role: 'Contracts, blueprints, recipe types' },
    { id: 'loom-react', owner: 'renderer', role: 'Provider, hooks, primitive wrappers' },
    { id: 'loom-pack-dock', owner: 'pack', role: 'Dock workbench built on top of Loom' },
] as const;

const sampleColumns: DataTableColumn<(typeof sampleRows)[number]>[] = [
    { key: 'id', header: 'Package', sortable: true, sortValue: (row) => row.id, cell: (row) => row.id },
    { key: 'owner', header: 'Layer', sortable: true, sortValue: (row) => row.owner, cell: (row) => row.owner },
    { key: 'role', header: 'Role', cell: (row) => row.role },
];

function resolveThemes(themeId: string) {
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

function ViewRegistryCard() {
    const ref = useMeasuredView<HTMLDivElement>('loom-demo-registry-card');
    const snapshot = useViewSnapshot('loom-demo-registry-card');

    return (
        <div
            ref={ref}
            style={{
                background: 'color-mix(in oklch, var(--loom-color-surface-raised) 88%, transparent)',
                border: '1px solid var(--loom-color-border)',
                borderRadius: 'var(--loom-radius-lg)',
                boxShadow: 'var(--loom-shadow-sm)',
                padding: '1rem',
            }}>
            <Stack gap='2'>
                <Heading level={3} size='sm'>
                    View Registry
                </Heading>
                <Text tone='muted' size='sm'>
                    This card registers itself through `loom-interactions` and reports live measured
                    bounds.
                </Text>
                <Badge kind='outline' tone='info'>
                    {Math.round(snapshot?.rect?.width ?? 0)} x {Math.round(snapshot?.rect?.height ?? 0)}
                </Badge>
            </Stack>
        </div>
    );
}

export function App() {
    const [themeId, setThemeId] = React.useState<'base' | 'aquatic' | 'neumorph'>('base');
    const [colorMode, setColorMode] = React.useState<'light' | 'dark'>('dark');
    const themes = React.useMemo(() => resolveThemes(themeId), [themeId]);

    return (
        <main className='loom-demo-shell'>
            <section className='loom-demo-hero'>
                <div className='loom-demo-copy'>
                    <p className='loom-demo-kicker'>Loom Architecture Demo</p>
                    <h1>Loom replaces the old UI system with contracts, themes, interactions, and packs.</h1>
                    <p className='loom-demo-body'>
                        This demo shows provider-level theme and color-mode switching, portable
                        primitives, a pack surface, and a visible interaction registry example.
                    </p>
                </div>
                <div className='loom-demo-meta'>
                    <span>primitives</span>
                    <span>themes</span>
                    <span>packs</span>
                    <span>interactions</span>
                </div>
            </section>

            <InteractionProvider>
                <LoomProvider colorMode={colorMode} themes={themes}>
                    <section className='loom-demo-section'>
                        <Grid columns={2} gap='4'>
                            <Panel emphasis='strong'>
                                <Stack gap='4'>
                                    <Heading level={2} size='lg'>
                                        Primitive Gallery
                                    </Heading>
                                    <Inline gap='2'>
                                        <Badge tone='accent'>{themeId}</Badge>
                                        <Badge kind='outline' tone='muted'>
                                            {colorMode}
                                        </Badge>
                                    </Inline>
                                    <Inline gap='2'>
                                        <Button type='button'>Primary</Button>
                                        <Button kind='outline' type='button'>Outline</Button>
                                        <Button kind='ghost' type='button'>Ghost</Button>
                                    </Inline>
                                    <Tabs
                                        items={[
                                            {
                                                id: 'blueprints',
                                                label: 'Blueprints',
                                                content: <Text tone='muted'>Blueprints define parts, variants, defaults, and semantic prop mapping.</Text>,
                                            },
                                            {
                                                id: 'recipes',
                                                label: 'Recipes',
                                                content: <Text tone='muted'>Recipes stay pure style resolvers. They do not render and they do not know Graphite.</Text>,
                                            },
                                            {
                                                id: 'packs',
                                                label: 'Packs',
                                                content: <Text tone='muted'>Packs own higher-level, reusable features like docks, settings, shortcuts, and data shells.</Text>,
                                            },
                                        ]}
                                    />
                                </Stack>
                            </Panel>

                            <Panel emphasis='subtle'>
                                <ThemeSettingsPanel
                                    colorMode={colorMode}
                                    onColorModeChange={setColorMode}
                                    onThemeChange={(next) => {
                                        if (next === 'base' || next === 'aquatic' || next === 'neumorph') {
                                            setThemeId(next);
                                        }
                                    }}
                                    themeId={themeId}
                                    themes={themeOptions}
                                />
                            </Panel>
                        </Grid>
                    </section>

                    <section className='loom-demo-section'>
                        <Grid columns={2} gap='4'>
                            <ViewRegistryCard />
                            <Panel emphasis='subtle'>
                                <Stack gap='3'>
                                    <Heading level={3} size='sm'>
                                        Pack Data
                                    </Heading>
                                    <Text tone='muted' size='sm'>
                                        Higher-level reusable data-oriented UI lives in packs, not in primitive themes.
                                    </Text>
                                    <DataTable columns={sampleColumns} rows={sampleRows} />
                                    <Text tone='muted' size='sm'>
                                        Query model seeded: {createQueryBuilderModel().mode}
                                    </Text>
                                </Stack>
                            </Panel>
                        </Grid>
                    </section>
                </LoomProvider>
            </InteractionProvider>

            <section className='loom-demo-section'>
                <div className='loom-demo-stage-header'>
                    <div>
                        <p className='loom-demo-kicker'>Pack Example</p>
                        <h2>Dock pack preview</h2>
                    </div>
                    <Inline gap='2'>
                        <Badge tone='accent'>{themeId}</Badge>
                        <Badge kind='outline' tone='muted'>
                            {colorMode}
                        </Badge>
                    </Inline>
                </div>
                <div className='loom-demo-dock-stage'>
                    <DockWorkspaceDemo
                        initialColorMode={colorMode}
                        initialThemeId={themeId}
                        mode='preview'
                    />
                </div>
            </section>
        </main>
    );
}
