export type ForgeTaskStatus = 'In Progress' | 'Todo';

export type ForgeTask = {
    assignee: string;
    avatar: string;
    due: string;
    id: string;
    name: string;
    status: ForgeTaskStatus;
};

export const forgeMockData = {
    browser: {
        image:
            'https://storage.googleapis.com/banani-generated-images/generated-images/aac1f2f9-5f19-4320-b30b-345896ca2b2d.jpg',
        note: 'Panels are supportive here: useful for comparison, not the default mode.',
        summary:
            'Clean, low-noise product surfaces with strong hierarchy, restrained chrome, and fast keyboard-first flows.',
        title: 'Linear-style methodology notes',
        url: 'https://linear.app/methodology',
    },
    commandItems: [
        {
            description: 'Switch the current node view to a table',
            id: 'table',
            icon: 'table',
            title: 'Convert view to Table',
        },
        {
            description: 'Switch the current node view to a board',
            id: 'board',
            icon: 'kanban',
            title: 'Convert view to Board',
        },
        {
            description: 'Embed a browser reference inside the node',
            id: 'browser',
            icon: 'globe',
            title: 'Convert view to Browser Embed',
        },
    ],
    favorites: [
        { accentIcon: 'star', id: 'fav-roadmap', label: 'Q3 Roadmap' },
        { accentIcon: 'star', id: 'fav-docs', label: 'Engineering Docs' },
    ],
    inspector: {
        automations: [
            {
                detail: 'When Status changes to Done, set Due to Now.',
                id: 'mark-complete',
                status: 'Active',
                title: 'Mark complete',
            },
            {
                detail: "if (node.status === 'Done') {\n  archive(node);\n}",
                id: 'auto-archive',
                status: 'Script',
                title: 'Auto-Archive',
            },
        ],
        fields: [
            { icon: 'type', label: 'Name', value: 'Text' },
            { icon: 'user', label: 'Assignee', value: 'User' },
            { icon: 'list', label: 'Status', value: 'Select' },
            { icon: 'calendar', label: 'Due', value: 'Date' },
        ],
    },
    issue: {
        comments: 4,
        id: '#142',
        lastSync: 'Synced 2m ago',
        repo: 'forge-app / core',
        status: 'Open',
        title: 'Outline nested rendering infinite loop on deep hierarchies',
        updatedAt: '2 days ago',
        user: {
            avatar:
                'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F18-25%2FEuropean%2F3',
            handle: 'jsmith',
        },
    },
    outline: {
        children: [
            'Refine drag and drop targeting logic',
            'Implement full keyboard navigation (Up/Down/Indent/Outdent)',
        ],
        title: 'Phase 1: Core Outline Interaction',
    },
    sidePeek: {
        note: "Need to prioritize [[Phase 1: Core Outline Interaction]] for this week's sprint. The dragging logic feels too loose right now.",
        noteMeta: 'Daily Note • Oct 12',
        summary:
            'This milestone covers the fundamental interactions of the tree view. Users should be able to navigate completely via keyboard without touching the mouse, matching the speed of top-tier outlining tools.',
        title: 'Phase 1: Core Outline Interaction',
    },
    tasks: [
        {
            assignee: 'Sarah',
            avatar:
                'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FEuropean%2F1',
            due: 'Oct 12',
            id: 'task-side-peek',
            name: 'Design side peek overlay component',
            status: 'In Progress',
        },
        {
            assignee: 'Alex',
            avatar:
                'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FEuropean%2F2',
            due: 'Oct 14',
            id: 'task-color-tokens',
            name: 'Update color tokens for selection states',
            status: 'Todo',
        },
    ] satisfies ForgeTask[],
    workspaceItems: [
        {
            collapsed: true,
            icon: 'fileText',
            id: 'personal-notes',
            label: 'Personal Notes',
        },
        {
            children: [
                { icon: 'file', id: 'forge-redesign', label: 'Forge Redesign' },
                { icon: 'file', id: 'marketing-site', label: 'Marketing Site' },
            ],
            expanded: true,
            icon: 'folderOpen',
            id: 'projects',
            label: 'Projects',
            selected: true,
        },
    ],
} as const;
