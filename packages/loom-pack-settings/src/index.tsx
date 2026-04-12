import * as React from 'react';

import {
    Button,
    Heading,
    Icon,
    Inline,
    Panel,
    Select,
    Stack,
    Switch,
    Text,
} from '@loop-kit/loom-react';

export type ThemeOption = {
    description?: string;
    id: string;
    label: string;
};

export type ThemeSettingsPanelProps = {
    className?: string;
    colorMode: 'light' | 'dark';
    onColorModeChange: (mode: 'light' | 'dark') => void;
    onThemeChange: (themeId: string) => void;
    themeId: string;
    themes: readonly ThemeOption[];
};

export function ThemeSettingsPanel({
    className,
    colorMode,
    onColorModeChange,
    onThemeChange,
    themeId,
    themes,
}: ThemeSettingsPanelProps) {
    const activeTheme = themes.find((theme) => theme.id === themeId) ?? themes[0];

    return (
        <Panel className={className}>
            <Stack gap='3'>
                <Stack gap='2'>
                    <Inline align='center' gap='2'>
                        <Icon name='settings' tone='accent' />
                        <Heading level={3} size='sm'>
                            Theme Settings
                        </Heading>
                    </Inline>
                    <Text tone='muted'>
                        Provider-level color mode and theme selection. Light/dark stays outside primitive variants.
                    </Text>
                </Stack>

                <Select
                    onChange={(event) => onThemeChange(event.currentTarget.value)}
                    options={themes.map((theme) => ({
                        label: theme.label,
                        value: theme.id,
                    }))}
                    value={themeId}
                />

                {activeTheme?.description ? (
                    <Text tone='muted'>{activeTheme.description}</Text>
                ) : null}

                <Inline align='center' gap='3'>
                    <Text as='span'>Dark mode</Text>
                    <Switch
                        checked={colorMode === 'dark'}
                        onCheckedChange={(checked) => onColorModeChange(checked ? 'dark' : 'light')}
                    />
                </Inline>

                <Inline gap='2'>
                    <Button
                        kind={colorMode === 'light' ? 'solid' : 'outline'}
                        onClick={() => onColorModeChange('light')}
                        startIcon={colorMode === 'light' ? 'check' : undefined}
                        type='button'>
                        Light
                    </Button>
                    <Button
                        kind={colorMode === 'dark' ? 'solid' : 'outline'}
                        onClick={() => onColorModeChange('dark')}
                        startIcon={colorMode === 'dark' ? 'check' : undefined}
                        type='button'>
                        Dark
                    </Button>
                </Inline>
            </Stack>
        </Panel>
    );
}
