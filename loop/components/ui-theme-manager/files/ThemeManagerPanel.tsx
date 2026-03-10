import { useMemo, useState } from 'react';
import { ThemeManagerBlock } from '@loop-kit/ui/blocks';
import { defaultThemeSet, type ThemeMode } from '@loop-kit/ui/theme';

const presets = [
    { id: 'default', label: 'Default', description: 'Loop default theme set' },
    { id: 'signal', label: 'Signal', description: 'Accent-forward variant' },
];

export function ThemeManagerPanel() {
    const [mode, setMode] = useState<ThemeMode>('light');
    const [presetId, setPresetId] = useState('default');

    const validationMessage = useMemo(() => {
        const active = mode === 'dark' ? defaultThemeSet.dark : defaultThemeSet.light;
        return active.tokens.colors.accent ? null : 'Accent token missing.';
    }, [mode]);

    return (
        <ThemeManagerBlock
            mode={mode}
            presetId={presetId}
            presets={presets}
            validationMessage={validationMessage}
            onModeChange={setMode}
            onPresetChange={setPresetId}
        />
    );
}
