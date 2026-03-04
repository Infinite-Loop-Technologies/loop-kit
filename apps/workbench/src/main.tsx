import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import {
    defaultDarkTheme,
    defaultLightTheme,
    ThemeProvider,
    type ThemeSet,
} from '@loop-kit/ui/theme';

import './index.css';
import { App } from './App';

type Preset = {
    id: string;
    label: string;
    theme: ThemeSet;
};

const presetList: Preset[] = [
    {
        id: 'default',
        label: 'Default',
        theme: {
            light: defaultLightTheme,
            dark: defaultDarkTheme,
        },
    },
    {
        id: 'signal',
        label: 'Signal',
        theme: {
            light: {
                ...defaultLightTheme,
                id: 'signal-light',
                tokens: {
                    ...defaultLightTheme.tokens,
                    colors: {
                        ...defaultLightTheme.tokens.colors,
                        accent: 'oklch(0.58 0.2 215)',
                        accentForeground: 'oklch(0.98 0.01 250)',
                    },
                },
            },
            dark: {
                ...defaultDarkTheme,
                id: 'signal-dark',
                tokens: {
                    ...defaultDarkTheme.tokens,
                    colors: {
                        ...defaultDarkTheme.tokens.colors,
                        accent: 'oklch(0.72 0.19 215)',
                        accentForeground: 'oklch(0.17 0.03 250)',
                    },
                },
            },
        },
    },
];

function WorkbenchRoot() {
    const [presetId, setPresetId] = useState(presetList[0]?.id ?? 'default');
    const activePreset = useMemo(
        () => presetList.find((preset) => preset.id === presetId) ?? presetList[0],
        [presetId],
    );
    const presets = useMemo(
        () => presetList.map((preset) => ({ id: preset.id, label: preset.label })),
        [],
    );

    return (
        <ThemeProvider theme={activePreset?.theme ?? presetList[0].theme}>
            <BrowserRouter>
                <App
                    themePreset={presetId}
                    presets={presets}
                    onThemePresetChange={setPresetId}
                />
            </BrowserRouter>
        </ThemeProvider>
    );
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <WorkbenchRoot />
    </StrictMode>,
);
