'use client';

import type { ThemeMode } from '../../theme';
import { cn } from '../../utils';
import { Badge } from '../../legacy/ui/badge';
import { Button } from '../../legacy/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../legacy/ui/card';
import { Label } from '../../legacy/ui/label';
import { Separator } from '../../legacy/ui/separator';
import { Switch } from '../../legacy/ui/switch';

export type ThemeManagerSkin = {
    id: string;
    label: string;
    description?: string;
};

export type ThemeManagerBlockProps = {
    mode: ThemeMode;
    skinId: string;
    skins: ThemeManagerSkin[];
    onModeChange: (mode: ThemeMode) => void;
    onSkinChange: (skinId: string) => void;
    validationMessage?: string | null;
    exportValue?: string;
    onCopyExport?: () => void;
    importValue?: string;
    onImportValueChange?: (value: string) => void;
    onImportApply?: () => void;
    importStatus?: string | null;
    className?: string;
};

export function ThemeManagerBlock({
    mode,
    skinId,
    skins,
    onModeChange,
    onSkinChange,
    validationMessage,
    exportValue,
    onCopyExport,
    importValue,
    onImportValueChange,
    onImportApply,
    importStatus,
    className,
}: ThemeManagerBlockProps) {
    const activeSkin = skins.find((skin) => skin.id === skinId) ?? skins[0];

    return (
        <Card className={cn('flex h-full min-h-0 flex-col bg-card/82 backdrop-blur-md', className)}>
            <CardHeader className='pb-3'>
                <CardTitle className='flex items-center justify-between text-sm'>
                    <span>Skin Manager</span>
                    <Badge variant='outline'>{mode}</Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className='flex min-h-0 flex-1 flex-col space-y-3 text-xs'>
                <div className='grid gap-1.5'>
                    <Label htmlFor='theme-skin'>Skin</Label>
                    <select
                        id='theme-skin'
                        value={skinId}
                        className='h-8 rounded border border-input bg-background px-2 text-xs'
                        onChange={(event) => onSkinChange(event.target.value)}>
                        {skins.map((skin) => (
                            <option key={skin.id} value={skin.id}>
                                {skin.label}
                            </option>
                        ))}
                    </select>
                    {activeSkin?.description ? (
                        <p className='text-[11px] text-muted-foreground'>
                            {activeSkin.description}
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

                {exportValue ? (
                    <>
                        <Separator />
                        <div className='space-y-1.5'>
                            <div className='flex items-center justify-between gap-2'>
                                <Label htmlFor='skin-export'>Export Skin</Label>
                                {onCopyExport ? (
                                    <Button size='sm' variant='outline' onClick={onCopyExport}>
                                        Copy JSON
                                    </Button>
                                ) : null}
                            </div>
                            <textarea
                                id='skin-export'
                                readOnly
                                value={exportValue}
                                className='max-h-36 min-h-28 w-full rounded border border-input bg-background px-2 py-2 font-mono text-[11px]'
                            />
                        </div>
                    </>
                ) : null}

                {onImportValueChange ? (
                    <div className='space-y-1.5'>
                        <div className='flex items-center justify-between gap-2'>
                            <Label htmlFor='skin-import'>Import Skin</Label>
                            {onImportApply ? (
                                <Button size='sm' variant='outline' onClick={onImportApply}>
                                    Apply Import
                                </Button>
                            ) : null}
                        </div>
                        <textarea
                            id='skin-import'
                            value={importValue ?? ''}
                            onChange={(event) => onImportValueChange(event.target.value)}
                            className='max-h-32 min-h-24 w-full rounded border border-input bg-background px-2 py-2 font-mono text-[11px]'
                            placeholder='Paste a skin JSON payload'
                        />
                        {importStatus ? (
                            <p className='rounded border border-border/70 bg-muted/20 px-2 py-1 text-[11px] text-muted-foreground'>
                                {importStatus}
                            </p>
                        ) : null}
                    </div>
                ) : null}

                {validationMessage ? (
                    <p className='rounded border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-700'>
                        {validationMessage}
                    </p>
                ) : (
                    <p className='rounded border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-700'>
                        Skin schema valid.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
