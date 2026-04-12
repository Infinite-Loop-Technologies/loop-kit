export function createGraphiteDockFixture() {
    const dock = {
        floatRootId: 'float-root-main',
        rootId: 'split-root',
        nodes: {
            'group-center': {
                data: {
                    activePanelId: 'panel-preview',
                },
                id: 'group-center',
                kind: 'group' as const,
                links: {
                    children: ['panel-preview', 'panel-settings'],
                },
            },
            'group-left': {
                data: {
                    activePanelId: 'panel-catalog',
                },
                id: 'group-left',
                kind: 'group' as const,
                links: {
                    children: ['panel-catalog', 'panel-notes'],
                },
            },
            'group-bottom': {
                data: {
                    activePanelId: 'panel-shortcuts',
                },
                id: 'group-bottom',
                kind: 'group' as const,
                links: {
                    children: ['panel-shortcuts'],
                },
            },
            'panel-catalog': {
                data: { title: 'Catalog' },
                id: 'panel-catalog',
                kind: 'panel' as const,
                links: { children: [] },
            },
            'panel-notes': {
                data: { title: 'Notes' },
                id: 'panel-notes',
                kind: 'panel' as const,
                links: { children: [] },
            },
            'panel-preview': {
                data: { title: 'Preview' },
                id: 'panel-preview',
                kind: 'panel' as const,
                links: { children: [] },
            },
            'panel-settings': {
                data: { title: 'Settings' },
                id: 'panel-settings',
                kind: 'panel' as const,
                links: { children: [] },
            },
            'panel-shortcuts': {
                data: { title: 'Shortcuts' },
                id: 'panel-shortcuts',
                kind: 'panel' as const,
                links: { children: [] },
            },
            'split-center': {
                data: {
                    direction: 'col' as const,
                    weights: [0.7, 0.3],
                },
                id: 'split-center',
                kind: 'split' as const,
                links: {
                    children: ['group-center', 'group-bottom'],
                },
            },
            'split-root': {
                data: {
                    direction: 'row' as const,
                    weights: [0.34, 0.66],
                },
                id: 'split-root',
                kind: 'split' as const,
                links: {
                    children: ['group-left', 'split-center'],
                },
            },
        },
    };

    return {
        dock,
        ids: {
            groupLeft: 'group-left',
            panelEditor: 'panel-preview',
        },
    };
}
