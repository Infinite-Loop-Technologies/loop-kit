import {
    CodeEditorBlock,
    DockWorkspaceDemo,
    GraphiteConnectorsBlock,
    GraphiteQueryTableBlock,
    GraphiteStudioBlock,
    OutlineEditorBlock,
    ThemeManagerBlock,
    TokenEditorBlock,
} from '../../blocks';
import { defaultThemeSet } from '../../theme';
import { listDesignTokenEntries } from '../../blocks/dock/theme-state';
import type { UiStory } from '../types';

function ThemeManagerStory() {
    return (
        <ThemeManagerBlock
            mode='light'
            presetId='default'
            presets={[
                {
                    id: 'default',
                    label: 'Default',
                    description: 'Default loop theme set',
                },
            ]}
            onModeChange={() => undefined}
            onPresetChange={() => undefined}
        />
    );
}

function TokenEditorStory() {
    const entries = listDesignTokenEntries(defaultThemeSet.light).slice(0, 12);
    return (
        <TokenEditorBlock
            entries={entries}
            onTokenChange={() => undefined}
        />
    );
}

export const blockStories: UiStory[] = [
    {
        id: 'blocks.dock-workspace',
        title: 'Dock Workspace',
        section: 'blocks',
        tags: ['dock', 'graphite', 'tokens', 'demo'],
        render: () => <DockWorkspaceDemo mode='preview' />,
    },
    {
        id: 'blocks.graphite-studio',
        title: 'Graphite Studio',
        section: 'blocks',
        tags: ['graphite', 'studio'],
        render: () => <GraphiteStudioBlock />,
    },
    {
        id: 'blocks.graphite-query-table',
        title: 'Graphite Query Table',
        section: 'blocks',
        tags: ['graphite', 'query', 'table'],
        render: () => <GraphiteQueryTableBlock />,
    },
    {
        id: 'blocks.graphite-connectors',
        title: 'Graphite Connectors',
        section: 'blocks',
        tags: ['graphite', 'connectors'],
        render: () => <GraphiteConnectorsBlock />,
    },
    {
        id: 'blocks.outline-editor',
        title: 'Outline Editor',
        section: 'blocks',
        tags: ['outline', 'editor'],
        render: () => <OutlineEditorBlock />,
    },
    {
        id: 'blocks.code-editor',
        title: 'Code Editor',
        section: 'blocks',
        tags: ['code', 'editor'],
        render: () => <CodeEditorBlock />,
    },
    {
        id: 'blocks.theme-manager',
        title: 'Theme Manager',
        section: 'blocks',
        tags: ['theme', 'tokens'],
        render: () => <ThemeManagerStory />,
    },
    {
        id: 'blocks.token-editor',
        title: 'Token Editor',
        section: 'blocks',
        tags: ['theme', 'tokens', 'editor'],
        render: () => <TokenEditorStory />,
    },
];
