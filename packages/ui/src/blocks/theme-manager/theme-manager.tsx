'use client';

import type { ThemeMode } from '../../theme';
import { Badge } from '../../legacy/ui/badge';
import { Button } from '../../legacy/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../legacy/ui/card';
import { Label } from '../../legacy/ui/label';
import { Separator } from '../../legacy/ui/separator';
import { Switch } from '../../legacy/ui/switch';

export type ThemeManagerPreset = {
    id: string;
    label: string;
    description?: string;
};

export type ThemeManagerBlockProps = {
    mode: ThemeMode;
    presetId: string;
    presets: ThemeManagerPreset[];
    onModeChange: (mode: ThemeMode) => void;
    onPresetChange: (presetId: string) => void;
    validationMessage?: string | null;
    className?: string;
};

export function ThemeManagerBlock({
    mode,
    presetId,
    presets,
    onModeChange,
    onPresetChange,
    validationMessage,
    className,
}: ThemeManagerBlockProps) {
    const activePreset = presets.find((preset) => preset.id === presetId) ?? presets[0];

    return (
        <Card className={className}>
            <CardHeader className='pb-3'>
                <CardTitle className='flex items-center justify-between text-sm'>
                    <span>Theme Manager</span>
                    <Badge variant='outline'>{mode}</Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className='space-y-3 text-xs'>
                <div className='grid gap-1.5'>
                    <Label htmlFor='theme-preset'>Preset</Label>
                    <select
                        id='theme-preset'
                        value={presetId}
                        className='h-8 rounded border border-input bg-background px-2 text-xs'
                        onChange={(event) => onPresetChange(event.target.value)}>
                        {presets.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                                {preset.label}
                            </option>
                        ))}
                    </select>
                    {activePreset?.description ? (
                        <p className='text-[11px] text-muted-foreground'>
                            {activePreset.description}
                        </p>
                    ) : null}
                </div>

                <Separator />

                <div className='flex items-center justify-between rounded border bg-muted/20 px-2 py-1.5'>
                    <span className='text-[11px] text-muted-foreground'>Dark Mode</span>
                    <Switch
                        checked={mode === 'dark'}
                        onCheckedChange={(checked) => onModeChange(checked ? 'dark' : 'light')}
                    />
                </div>

                <div className='grid grid-cols-2 gap-2'>
                    <Button
                        size='sm'
                        variant={mode === 'light' ? 'default' : 'outline'}
                        onClick={() => onModeChange('light')}>
                        Light
                    </Button>
                    <Button
                        size='sm'
                        variant={mode === 'dark' ? 'default' : 'outline'}
                        onClick={() => onModeChange('dark')}>
                        Dark
                    </Button>
                </div>

                {validationMessage ? (
                    <p className='rounded border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-700'>
                        {validationMessage}
                    </p>
                ) : (
                    <p className='rounded border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-700'>
                        Token schema valid.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
