'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Check, ChevronDown, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

type PackageManager = 'pnpm' | 'npm' | 'bun';

const DEFAULT_NAMESPACE = '@loop-cn';
const DEFAULT_ITEM = 'dockview';
const QUICK_CONFIGURATION_DOCS_URL =
    'https://ui.shadcn.com/docs/registry/namespace#quick-configuration';

function normalizeOrigin(value?: string | null) {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
        const withProtocol =
            trimmed.startsWith('http://') || trimmed.startsWith('https://')
                ? trimmed
                : `https://${trimmed}`;
        return new URL(withProtocol).origin;
    } catch {
        return null;
    }
}

function getCommand(manager: PackageManager, scopedItem: string) {
    if (manager === 'pnpm') {
        return `pnpm dlx shadcn@latest add ${scopedItem}`;
    }

    if (manager === 'npm') {
        return `npx shadcn@latest add ${scopedItem}`;
    }

    return `bunx shadcn@latest add ${scopedItem}`;
}

export type InstallSnippetProps = {
    itemName?: string;
    namespace?: string;
    className?: string;
    variant?: 'default' | 'compact';
};

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

export function InstallSnippet({
    itemName = DEFAULT_ITEM,
    namespace = DEFAULT_NAMESPACE,
    className,
    variant = 'default',
}: InstallSnippetProps) {
    const [manager, setManager] = React.useState<PackageManager>('pnpm');
    const [origin, setOrigin] = React.useState<string>(() => {
        const envOrigin = normalizeOrigin(
            process.env.NEXT_PUBLIC_REGISTRY_ORIGIN ??
                process.env.NEXT_PUBLIC_SITE_URL ??
                process.env.NEXT_PUBLIC_APP_URL
        );
        return envOrigin ?? 'https://your-domain.com';
    });

    React.useEffect(() => {
        const runtimeOrigin = normalizeOrigin(window.location.origin);
        if (runtimeOrigin) {
            setOrigin(runtimeOrigin);
        }
    }, []);

    const scopedItem = `${namespace}/${itemName}`;
    const registryPattern = `${origin}/r/{name}.json`;
    const commandMap = React.useMemo<Record<PackageManager, string>>(
        () => ({
            pnpm: getCommand('pnpm', scopedItem),
            npm: getCommand('npm', scopedItem),
            bun: getCommand('bun', scopedItem),
        }),
        [scopedItem]
    );
    const registriesSnippet = React.useMemo(
        () =>
            `{\n  "registries": {\n    "${namespace}": "${registryPattern}"\n  }\n}`,
        [namespace, registryPattern]
    );

    const renderCommandTabs = (
        <div className='space-y-2'>
            <Tabs
                value={manager}
                onValueChange={(value) => {
                    if (value === 'pnpm' || value === 'npm' || value === 'bun') {
                        setManager(value);
                    }
                }}
                className='w-full'>
                <TabsList className='mb-3'>
                    <TabsTrigger value='pnpm'>pnpm</TabsTrigger>
                    <TabsTrigger value='npm'>npm</TabsTrigger>
                    <TabsTrigger value='bun'>bun</TabsTrigger>
                </TabsList>

                {Object.entries(commandMap).map(([name, command]) => (
                    <TabsContent key={name} value={name} className='space-y-3'>
                        <div className='group relative overflow-hidden rounded-xl border bg-muted/30'>
                            <pre className='scrollbar-hide overflow-x-auto p-4 text-sm'>
                                {`$ ${command}`}
                            </pre>
                            <div className='absolute right-2 top-2'>
                                <CopyButton text={command} />
                            </div>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
            <p className='text-xs text-muted-foreground'>
                Registry endpoint: <code>{registryPattern}</code>
            </p>
        </div>
    );

    if (variant === 'compact') {
        return (
            <div className={cn('space-y-3', className)}>
                <div className='space-y-1'>
                    <p className='text-xs font-medium text-foreground'>
                        Install this block
                    </p>
                    {renderCommandTabs}
                </div>
                <Collapsible>
                    <CollapsibleTrigger className='inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'>
                        Show one-time registry setup
                        <ChevronDown className='h-3.5 w-3.5' />
                    </CollapsibleTrigger>
                    <CollapsibleContent className='mt-2 space-y-2'>
                        <div className='group relative overflow-hidden rounded-xl border bg-muted/30'>
                            <pre className='scrollbar-hide overflow-x-auto p-4 text-sm'>
                                <code>{registriesSnippet}</code>
                            </pre>
                            <div className='absolute right-2 top-2'>
                                <CopyButton text={registriesSnippet} />
                            </div>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                            Add this to your existing <code>registries</code> object.{' '}
                            <a
                                href={QUICK_CONFIGURATION_DOCS_URL}
                                target='_blank'
                                rel='noreferrer'
                                className='underline decoration-dotted underline-offset-2'>
                                Quick configuration docs
                            </a>
                            .
                        </p>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            <div className='space-y-2'>
                <p className='text-xs font-medium text-foreground'>
                    1. Configure namespace in <code>components.json</code>
                </p>
                <div className='group relative overflow-hidden rounded-xl border bg-muted/30'>
                    <pre className='scrollbar-hide overflow-x-auto p-4 text-sm'>
                        <code>{registriesSnippet}</code>
                    </pre>
                    <div className='absolute right-2 top-2'>
                        <CopyButton text={registriesSnippet} />
                    </div>
                </div>
                <p className='text-xs text-muted-foreground'>
                    Merge this into your existing `registries` object.{' '}
                    <a
                        href={QUICK_CONFIGURATION_DOCS_URL}
                        target='_blank'
                        rel='noreferrer'
                        className='underline decoration-dotted underline-offset-2'>
                        Quick configuration docs
                    </a>
                    .
                </p>
            </div>

            <div className='space-y-2'>
                <p className='text-xs font-medium text-foreground'>
                    2. Install from the registry
                </p>
                {renderCommandTabs}
            </div>
        </div>
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
