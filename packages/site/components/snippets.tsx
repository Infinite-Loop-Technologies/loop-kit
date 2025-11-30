'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';

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
        pnpm: 'pnpm dlx @loop-kit/cli new my-app',
        npm: 'npx @loop-kit/cli new my-app',
        bun: 'bunx @loop-kit/cli new my-app',
    } as const;

    return (
        <Tabs defaultValue='pnpm' className='w-full'>
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
    return (
        <Button
            variant='secondary'
            size='sm'
            onClick={() => navigator.clipboard.writeText(text)}
            className='cursor-copy'>
            Copy
        </Button>
    );
}
