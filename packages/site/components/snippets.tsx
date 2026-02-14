'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FeatureCard({
    icon,
    title,
    blurb,
}: {
    icon: React.ReactNode;
    title: string;
    blurb: string;
}) {
    return (
        <Card className='bg-background/60 backdrop-blur'>
            <CardHeader className='flex flex-row items-center gap-3 space-y-0'>
                <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary'>
                    {icon}
                </div>
                <div>
                    <CardTitle className='text-base'>{title}</CardTitle>
                    <CardDescription className='mt-1'>{blurb}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    );
}

export function InstallSnippet() {
    const map = {
        pnpm: 'pnpm dlx shadcn@latest add @loop-cn/dockview',
        npm: 'npx shadcn@latest add @loop-cn/dockview',
        bun: 'bunx shadcn@latest add @loop-cn/dockview',
    } as const;
    const [manager, setManager] = React.useState<keyof typeof map>('pnpm');

    return (
        <Tabs
            value={manager}
            onValueChange={(value) => {
                if (value in map) {
                    setManager(value as keyof typeof map);
                }
            }}
            className='w-full'>
            <TabsList className='mb-3'>
                <TabsTrigger value='pnpm'>pnpm</TabsTrigger>
                <TabsTrigger value='npm'>npm</TabsTrigger>
                <TabsTrigger value='bun'>bun</TabsTrigger>
            </TabsList>

            {Object.entries(map).map(([k, cmd]) => (
                <TabsContent key={k} value={k} className='space-y-3'>
                    <div className='group relative overflow-hidden rounded-xl border bg-muted/30'>
                        <pre className='scrollbar-hide overflow-x-auto p-4 text-sm'>
                            {`$ ${cmd}`}
                        </pre>
                        <div className='absolute right-2 top-2'>
                            <CopyButton text={cmd} />
                        </div>
                    </div>
                </TabsContent>
            ))}
        </Tabs>
    );
}

export function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = React.useCallback(async () => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.setAttribute('readonly', 'true');
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        } catch {
            setCopied(false);
        }
    }, [text]);

    return (
        <Button
            variant='secondary'
            size='sm'
            onClick={handleCopy}
            className={cn('cursor-copy gap-1.5', copied && 'text-emerald-600')}>
            {copied ? <Check className='h-3.5 w-3.5' /> : <Copy className='h-3.5 w-3.5' />}
            {copied ? 'Copied' : 'Copy'}
        </Button>
    );
}
