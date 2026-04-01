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
    Icon,
    IconButton,
    Inline,
    LoomProvider,
    Panel,
    Separator,
    Stack,
    Surface,
    Tabs,
    Text,
    useLoomTokens,
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

function DemoPageShell({ children }: { children: React.ReactNode }) {
    const tokens = useLoomTokens();

    return (
        <main className='loom-demo-shell'>
            <Surface
                emphasis='strong'
                style={{
                    background: `linear-gradient(180deg, ${tokens.color.surface.raised} 0%, ${tokens.color.surface.default} 48%, ${tokens.color.surface.sunken} 100%)`,
                    minHeight: 'calc(100vh - 2rem)',
                    padding: 'clamp(1rem, 2vw, 1.5rem)',
                }}>
                <Stack gap='4'>{children}</Stack>
            </Surface>
        </main>
    );
}

function DemoSection({
    children,
    description,
    icon,
    title,
}: {
    children: React.ReactNode;
    description: string;
    icon: React.ComponentProps<typeof Icon>['name'];
    title: string;
}) {
    return (
        <Panel emphasis='subtle'>
            <Stack gap='3'>
                <Inline align='center' gap='2'>
                    <Icon name={icon} tone='accent' />
                    <Stack gap='1'>
                        <Heading level={2} size='md'>
                            {title}
                        </Heading>
                        <Text size='sm' tone='muted'>
                            {description}
                        </Text>
                    </Stack>
                </Inline>
                <Separator />
                {children}
            </Stack>
        </Panel>
    );
}

function ArchitectureNote() {
    return (
        <Panel emphasis='subtle'>
            <Stack gap='2'>
                <Inline align='center' gap='2'>
                    <Icon name='info' tone='info' />
                    <Heading level={3} size='sm'>
                        Demo Contract
                    </Heading>
                </Inline>
                <Text size='sm' tone='muted'>
                    This demo keeps CSS close to neutral. The active theme should control tokens,
                    recipes, primitive implementations, icons, and the visible page shell.
                </Text>
            </Stack>
        </Panel>
    );
}

function ViewRegistryCard() {
    const ref = useMeasuredView<HTMLDivElement>('loom-demo-registry-card');
    const snapshot = useViewSnapshot('loom-demo-registry-card');

    return (
        <div
            ref={ref}
            style={{
                minHeight: '100%',
            }}>
            <Panel
                emphasis='subtle'
                style={{
                    minHeight: '100%',
                }}>
                <Stack gap='3'>
                    <Inline align='center' gap='2'>
                        <Icon name='search' tone='info' />
                        <Heading level={3} size='sm'>
                            View Registry
                        </Heading>
                    </Inline>
                    <Text tone='muted' size='sm'>
                        This card registers itself through `loom-interactions` and reports live
                        measured bounds.
                    </Text>
                    <Badge kind='outline' tone='info'>
                        {Math.round(snapshot?.rect?.width ?? 0)} x{' '}
                        {Math.round(snapshot?.rect?.height ?? 0)}
                    </Badge>
                </Stack>
            </Panel>
        </div>
    );
}

function DemoContent({
    colorMode,
    onColorModeChange,
    onThemeChange,
    themeId,
}: {
    colorMode: 'light' | 'dark';
    onColorModeChange: (mode: 'light' | 'dark') => void;
    onThemeChange: (themeId: 'base' | 'aquatic' | 'neumorph') => void;
    themeId: 'base' | 'aquatic' | 'neumorph';
}) {
    return (
        <DemoPageShell>
            <Grid
                columns='repeat(auto-fit, minmax(min(22rem, 100%), 1fr))'
                gap='4'>
                <Panel emphasis='strong'>
                    <Stack gap='4'>
                        <Inline align='center' gap='2'>
                            <Badge tone='accent'>Loom Demo</Badge>
                            <Badge kind='outline' tone='muted'>
                                {themeId}
                            </Badge>
                            <Badge kind='outline' tone='muted'>
                                {colorMode}
                            </Badge>
                        </Inline>
                        <Stack gap='2'>
                            <Heading level={1} size='xl'>
                                Loom owns the shell, the primitives, and the pack showcase.
                            </Heading>
                            <Text tone='muted'>
                                Theme swapping and color mode should change the entire page, not
                                just isolated widgets. This page is intentionally composed from
                                Loom primitives rather than custom visual CSS.
                            </Text>
                        </Stack>
                        <Inline gap='2'>
                            <Button startIcon='plus' type='button'>
                                Primary Action
                            </Button>
                            <Button endIcon='chevronRight' kind='outline' type='button'>
                                Explore Recipes
                            </Button>
                            <IconButton kind='ghost' label='Theme architecture' name='settings' type='button' />
                        </Inline>
                        <Inline gap='2'>
                            <Badge tone='accent'>primitives</Badge>
                            <Badge tone='info'>themes</Badge>
                            <Badge tone='success'>packs</Badge>
                            <Badge tone='warning'>interactions</Badge>
                        </Inline>
                    </Stack>
                </Panel>

                <Stack gap='3'>
                    <ThemeSettingsPanel
                        colorMode={colorMode}
                        onColorModeChange={onColorModeChange}
                        onThemeChange={(next) => {
                            if (next === 'base' || next === 'aquatic' || next === 'neumorph') {
                                onThemeChange(next);
                            }
                        }}
                        themeId={themeId}
                        themes={themeOptions}
                    />
                    <ArchitectureNote />
                </Stack>
            </Grid>

            <DemoSection
                description='Portable style axes, semantic icons, and the recipe layer should stay visible here.'
                icon='panelLeft'
                title='Primitive Showcase'>
                <Grid columns='repeat(auto-fit, minmax(min(18rem, 100%), 1fr))' gap='4'>
                    <Panel emphasis='strong'>
                        <Stack gap='4'>
                            <Heading level={3} size='sm'>
                                Actions and Icons
                            </Heading>
                            <Inline gap='2'>
                                <Button startIcon='plus' type='button'>
                                    Create
                                </Button>
                                <Button endIcon='chevronRight' kind='outline' type='button'>
                                    Continue
                                </Button>
                                <Button kind='ghost' startIcon='search' type='button'>
                                    Inspect
                                </Button>
                            </Inline>
                            <Inline gap='2'>
                                <Icon name='settings' tone='accent' />
                                <Icon name='info' tone='info' />
                                <Icon name='warning' tone='warning' />
                                <Icon name='check' tone='success' />
                            </Inline>
                        </Stack>
                    </Panel>

                    <Panel emphasis='subtle'>
                        <Stack gap='4'>
                            <Heading level={3} size='sm'>
                                Blueprint / Recipe / Pack
                            </Heading>
                            <Tabs
                                items={[
                                    {
                                        id: 'blueprints',
                                        label: 'Blueprints',
                                        content: (
                                            <Text tone='muted'>
                                                Blueprints define parts, variants, defaults, and
                                                semantic prop mapping.
                                            </Text>
                                        ),
                                    },
                                    {
                                        id: 'recipes',
                                        label: 'Recipes',
                                        content: (
                                            <Text tone='muted'>
                                                Recipes resolve styles from tokens, variants, and
                                                state without rendering DOM.
                                            </Text>
                                        ),
                                    },
                                    {
                                        id: 'packs',
                                        label: 'Packs',
                                        content: (
                                            <Text tone='muted'>
                                                Packs own higher-level UI such as docks, settings,
                                                shortcuts, and data shells.
                                            </Text>
                                        ),
                                    },
                                ]}
                            />
                        </Stack>
                    </Panel>
                </Grid>
            </DemoSection>

            <DemoSection
                description='The data pack should stay Loom-driven visually while owning higher-level data shells.'
                icon='search'
                title='Data and Interactions'>
                <Grid columns='repeat(auto-fit, minmax(min(18rem, 100%), 1fr))' gap='4'>
                    <ViewRegistryCard />
                    <Panel emphasis='subtle'>
                        <Stack gap='3'>
                            <Inline align='center' gap='2'>
                                <Icon name='info' tone='info' />
                                <Heading level={3} size='sm'>
                                    Pack Data
                                </Heading>
                            </Inline>
                            <Text tone='muted' size='sm'>
                                Higher-level reusable data-oriented UI lives in packs, not in
                                primitive themes or app CSS.
                            </Text>
                            <DataTable columns={sampleColumns} rows={sampleRows} />
                            <Text tone='muted' size='sm'>
                                Query model seeded: {createQueryBuilderModel().mode}
                            </Text>
                        </Stack>
                    </Panel>
                </Grid>
            </DemoSection>

            <DemoSection
                description='The dock pack remains a higher-level reusable surface built on Loom primitives and interaction registries.'
                icon='panelRight'
                title='Pack Example'>
                <Stack gap='3'>
                    <Inline align='center' justify='space-between'>
                        <Stack gap='1'>
                            <Heading level={3} size='sm'>
                                Dock Pack Preview
                            </Heading>
                            <Text size='sm' tone='muted'>
                                The same active theme and color mode should carry across the stage.
                            </Text>
                        </Stack>
                        <Inline gap='2'>
                            <Badge tone='accent'>{themeId}</Badge>
                            <Badge kind='outline' tone='muted'>
                                {colorMode}
                            </Badge>
                        </Inline>
                    </Inline>
                    <Surface
                        emphasis='strong'
                        style={{
                            minHeight: '620px',
                            padding: '0.75rem',
                        }}>
                        <DockWorkspaceDemo
                            initialColorMode={colorMode}
                            initialThemeId={themeId}
                            mode='preview'
                        />
                    </Surface>
                </Stack>
            </DemoSection>
        </DemoPageShell>
    );
}

export function App() {
    const [themeId, setThemeId] = React.useState<'base' | 'aquatic' | 'neumorph'>('base');
    const [colorMode, setColorMode] = React.useState<'light' | 'dark'>('dark');
    const themes = React.useMemo(() => resolveThemes(themeId), [themeId]);

    return (
        <InteractionProvider>
            <LoomProvider colorMode={colorMode} themes={themes}>
                <DemoContent
                    colorMode={colorMode}
                    onColorModeChange={setColorMode}
                    onThemeChange={setThemeId}
                    themeId={themeId}
                />
            </LoomProvider>
        </InteractionProvider>
    );
}
