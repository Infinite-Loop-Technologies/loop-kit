import { useState } from 'react';
import { TokenEditorBlock, type DesignTokenEntry } from '@loop-kit/ui/blocks';

const initialEntries: DesignTokenEntry[] = [
    { path: 'colors.background', value: 'oklch(0.97 0.02 250)', group: 'colors' },
    { path: 'colors.foreground', value: 'oklch(0.2 0.02 250)', group: 'colors' },
    { path: 'colors.accent', value: 'oklch(0.71 0.2 212)', group: 'colors' },
    { path: 'radius.md', value: '0.5rem', group: 'radius' },
];

export function TokenEditorPanel() {
    const [entries, setEntries] = useState(initialEntries);

    return (
        <TokenEditorBlock
            entries={entries}
            onTokenChange={(path, value) =>
                setEntries((current) =>
                    current.map((entry) => (entry.path === path ? { ...entry, value } : entry)),
                )
            }
        />
    );
}
