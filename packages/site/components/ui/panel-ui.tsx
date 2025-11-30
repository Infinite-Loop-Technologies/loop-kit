'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function PanelShell({
    children,
    className,
}: React.PropsWithChildren<{ className?: string }>) {
    // 3 columns by default; override via className if you want different templates.
    return (
        <div
            className={cn(
                'grid h-dvh w-full grid-cols-12 gap-3 p-3',
                className
            )}>
            {children}
        </div>
    );
}

export function PanelColumn({
    header,
    children,
    className,
    colSpan = 4,
}: React.PropsWithChildren<{
    header?: React.ReactNode;
    className?: string;
    colSpan?: number;
}>) {
    return (
        <div
            className={cn(
                `col-span-${colSpan} min-h-0 flex flex-col rounded-md border bg-card`,
                className
            )}
            data-panel-column>
            {header ? (
                <div className='px-2 py-1 text-xs text-muted-foreground'>
                    {header}
                </div>
            ) : null}
            <ScrollArea className='flex-1 p-2 space-y-2'>{children}</ScrollArea>
        </div>
    );
}

export function PanelCard({
    title,
    tone = 'default',
    end,
    children,
    className,
}: React.PropsWithChildren<{
    title?: React.ReactNode;
    tone?: 'default' | 'info' | 'warn' | 'success';
    end?: React.ReactNode;
    className?: string;
}>) {
    const toneCls =
        tone === 'info'
            ? 'border-sky-500/40'
            : tone === 'warn'
            ? 'border-amber-500/40'
            : tone === 'success'
            ? 'border-emerald-500/40'
            : 'border-muted';
    return (
        <Card
            className={cn(
                'p-3 select-none cursor-grab active:cursor-grabbing',
                toneCls,
                className
            )}>
            {(title || end) && (
                <>
                    <div className='flex items-center justify-between'>
                        {title ? (
                            <strong className='text-sm'>{title}</strong>
                        ) : (
                            <span />
                        )}
                        {end ?? null}
                    </div>
                    <Separator className='my-2' />
                </>
            )}
            {children}
        </Card>
    );
}

export function KindBadge({ kind }: { kind?: string }) {
    if (!kind) return null;
    return (
        <Badge variant='secondary' className='capitalize'>
            {kind}
        </Badge>
    );
}
