'use client';

import { useMemo, useState } from 'react';
import { Badge } from '../../legacy/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../legacy/ui/card';
import { Input } from '../../legacy/ui/input';
import { Label } from '../../legacy/ui/label';
import { ColorPicker } from './color-picker';

export type DesignTokenEntry = {
    path: string;
    value: string;
    group: string;
};

export type TokenEditorBlockProps = {
    entries: DesignTokenEntry[];
    onTokenChange: (path: string, value: string) => void;
    validationMessage?: string | null;
    className?: string;
};

export function TokenEditorBlock({
    entries,
    onTokenChange,
    validationMessage,
    className,
}: TokenEditorBlockProps) {
    const [query, setQuery] = useState('');
    const normalizedQuery = query.trim().toLowerCase();

    const filteredEntries = useMemo(() => {
        if (!normalizedQuery) {
            return entries;
        }
        return entries.filter((entry) =>
            `${entry.path} ${entry.group}`.toLowerCase().includes(normalizedQuery),
        );
    }, [entries, normalizedQuery]);

    const isColorEntry = (entry: DesignTokenEntry) =>
        entry.group === 'colors' || entry.path.startsWith('colors.');

    return (
        <Card className={className}>
            <CardHeader className='pb-3'>
                <CardTitle className='flex items-center justify-between text-sm'>
                    <span>Design Tokens</span>
                    <Badge variant='outline'>{entries.length}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
                <div className='space-y-1.5'>
                    <Label htmlFor='token-filter' className='text-xs text-muted-foreground'>
                        Filter tokens
                    </Label>
                    <Input
                        id='token-filter'
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className='h-8 text-xs'
                        placeholder='colors.accent'
                    />
                </div>

                {validationMessage ? (
                    <p className='rounded border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-700'>
                        {validationMessage}
                    </p>
                ) : null}

                <div className='max-h-[360px] space-y-2 overflow-auto pr-1'>
                    {filteredEntries.map((entry) => (
                        <label
                            key={entry.path}
                            data-testid={`token-row-${entry.path}`}
                            className='grid gap-1 rounded border border-border/60 bg-background/60 p-2 text-[11px]'>
                            <span className='flex items-center justify-between gap-2'>
                                <span className='font-medium text-foreground'>{entry.path}</span>
                                <span className='flex items-center gap-1.5'>
                                    {isColorEntry(entry) ? (
                                        <ColorPicker
                                            value={entry.value}
                                            onChange={(next) => onTokenChange(entry.path, next)}
                                            title={`Pick color for ${entry.path}`}
                                        />
                                    ) : null}
                                    <Badge variant='outline' className='text-[10px]'>
                                        {entry.group}
                                    </Badge>
                                </span>
                            </span>
                            <Input
                                value={entry.value}
                                onChange={(event) => onTokenChange(entry.path, event.target.value)}
                                className='h-7 text-[11px]'
                                data-testid={`token-input-${entry.path}`}
                            />
                        </label>
                    ))}
                    {filteredEntries.length === 0 ? (
                        <p className='text-xs text-muted-foreground'>No tokens match the filter.</p>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}
