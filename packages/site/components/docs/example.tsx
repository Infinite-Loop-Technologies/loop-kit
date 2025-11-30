'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';

/** ----------------------------------------------------------------
 *  Example (single demo)
 *  ---------------------------------------------------------------- */
export function Example({
    title,
    description,
    children,
    className,
    ratio,
    height = 480,
    padded = false,
    actions,
}: {
    title?: string;
    description?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    ratio?: number;
    height?: number;
    padded?: boolean;
    actions?: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                'my-10 rounded-lg border bg-card shadow-sm',
                className
            )}>
            {(title || description || actions) && (
                <div className='flex items-start gap-3 border-b bg-card/50 px-5 py-4'>
                    <div className='flex-1'>
                        {title && (
                            <h3 className='text-base font-semibold tracking-tight'>
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className='mt-1 text-sm text-muted-foreground'>
                                {description}
                            </p>
                        )}
                    </div>
                    {actions ? <div className='shrink-0'>{actions}</div> : null}
                </div>
            )}

            <div
                className={cn(
                    'overflow-hidden bg-background',
                    padded && 'p-3'
                )}>
                {ratio ? (
                    <AspectRatio ratio={ratio}>
                        <div className='h-full w-full rounded-md border bg-background'>
                            <div className='size-full overflow-hidden rounded-md'>
                                {children}
                            </div>
                        </div>
                    </AspectRatio>
                ) : (
                    <div
                        className='rounded-md border bg-background'
                        style={{ height }}>
                        <div className='size-full overflow-hidden rounded-md'>
                            {children}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/** ----------------------------------------------------------------
 *  ExampleTabs (multiple demos in one container)
 *  ---------------------------------------------------------------- */
export type ExampleTabSpec = {
    id: string;
    label: string;
    content: React.ReactNode;
    description?: React.ReactNode;
};

export function ExampleTabs({
    title,
    tabs,
    defaultTabId,
    className,
    ratio,
    height = 480,
    padded = false,
    actions,
}: {
    title?: string;
    tabs: ExampleTabSpec[];
    defaultTabId?: string;
    className?: string;
    ratio?: number;
    height?: number;
    padded?: boolean;
    actions?: React.ReactNode;
}) {
    const first = tabs[0]?.id ?? 'example';
    const [value, setValue] = React.useState<string>(defaultTabId ?? first);

    return (
        <div
            className={cn(
                'my-10 rounded-lg border bg-card shadow-sm',
                className
            )}>
            {(title || actions) && (
                <div className='flex items-center justify-between border-b bg-card/50 px-5 py-4'>
                    {title ? (
                        <h3 className='text-base font-semibold tracking-tight'>
                            {title}
                        </h3>
                    ) : (
                        <span />
                    )}
                    {actions ? <div className='shrink-0'>{actions}</div> : null}
                </div>
            )}

            <Tabs value={value} onValueChange={setValue} className='w-full'>
                <div className='border-b bg-muted/30'>
                    <TabsList className='h-10 w-full justify-start gap-1 rounded-none bg-transparent px-3'>
                        {tabs.map((t) => (
                            <TabsTrigger
                                key={t.id}
                                value={t.id}
                                className={cn(
                                    'rounded-none border-x border-t border-b-0 -mb-px',
                                    'data-[state=active]:bg-background data-[state=active]:shadow-sm',
                                    'data-[state=inactive]:bg-muted/20'
                                )}>
                                {t.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {tabs.map((t) =>
                    t.description && t.id === value ? (
                        <div
                            key={`${t.id}-desc`}
                            className='px-5 py-3 text-sm text-muted-foreground border-b'>
                            {t.description}
                        </div>
                    ) : null
                )}

                <div
                    className={cn(
                        'overflow-hidden bg-background',
                        padded && 'p-3'
                    )}>
                    {ratio ? (
                        <AspectRatio ratio={ratio}>
                            {tabs.map((t) => (
                                <TabsContent
                                    key={t.id}
                                    value={t.id}
                                    className='m-0 size-full p-0'>
                                    <div className='size-full rounded-md border bg-background overflow-hidden'>
                                        {t.content}
                                    </div>
                                </TabsContent>
                            ))}
                        </AspectRatio>
                    ) : (
                        <div
                            className='rounded-md border bg-background'
                            style={{ height }}>
                            {tabs.map((t) => (
                                <TabsContent
                                    key={t.id}
                                    value={t.id}
                                    className='m-0 size-full p-0'>
                                    <div className='size-full rounded-md bg-background overflow-hidden'>
                                        {t.content}
                                    </div>
                                </TabsContent>
                            ))}
                        </div>
                    )}
                </div>
            </Tabs>
        </div>
    );
}
