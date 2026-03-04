import type { ReactNode } from 'react';

export type UiStory = {
    id: string;
    title: string;
    section: 'primitives' | 'blocks' | 'legacy';
    tags?: string[];
    render: () => ReactNode;
};
