import {
    CodeEditorBlock,
    GraphiteConnectorsBlock,
    GraphiteQueryTableBlock,
    GraphiteStudioBlock,
    OutlineEditorBlock,
} from '../../blocks';
import type { UiStory } from '../types';

export const blockStories: UiStory[] = [
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
];
