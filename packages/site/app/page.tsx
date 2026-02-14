import Link from 'next/link';
import {
    ArrowRight,
    Blocks,
    BookOpen,
    Braces,
    Github,
    PanelsTopLeft,
    Sparkles,
    Workflow,
} from 'lucide-react';

import PixelBlast from '@/components/PixelBlast';
import { LoopCnLogo } from '@/components/loopcn-logo';
import { FeatureCard, InstallSnippet } from '@/components/snippets';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const BLOCKS = [
    {
        title: 'Dockview Workbench',
        description: 'Multi-panel workspace with shadcn-native controls and custom drop guides.',
        href: '/docs/dockview-panels',
        icon: PanelsTopLeft,
    },
    {
        title: 'Outline Editor',
        description: 'Workflowy-style nested blocks with zoom and reference-friendly structure.',
        href: '/docs/outline-editor',
        icon: Workflow,
    },
    {
        title: 'Code Editor',
        description: 'Shadcn-themed editor surface for code-focused docs and demos.',
        href: '/docs/code-editor',
        icon: Braces,
    },
];

export default function Home() {
    return (
        <div className='relative min-h-screen overflow-clip'>
            <div className='fixed inset-0 z-0'>
                <PixelBlast
                    variant='circle'
                    pixelSize={6}
                    color='#74c7ff'
                    patternScale={3}
                    patternDensity={1.2}
                    pixelSizeJitter={0.45}
                    enableRipples
                    rippleSpeed={0.35}
                    rippleThickness={0.12}
                    rippleIntensityScale={1.35}
                    liquid={false}
                    speed={0.55}
                    edgeFade={0.05}
                    transparent
                />
                <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(9,10,14,0.34),transparent_54%),linear-gradient(to_bottom,rgba(8,10,13,0.22),rgba(8,10,13,0.62))]' />
            </div>

            <div className='relative z-10 pointer-events-none'>
                <header className='pointer-events-auto sticky top-0 z-40 w-full'>
                    <div className='mx-auto max-w-7xl px-6'>
                        <div className='mt-5 flex items-center justify-between rounded-2xl border bg-background/60 px-4 py-2 backdrop-blur-md'>
                            <Link href='/' className='inline-flex items-center'>
                                <LoopCnLogo />
                            </Link>
                            <nav className='hidden gap-6 md:flex'>
                                <Link
                                    href='#getting-started'
                                    className='text-sm text-muted-foreground hover:text-foreground'>
                                    Getting Started
                                </Link>
                                <Link
                                    href='#blocks'
                                    className='text-sm text-muted-foreground hover:text-foreground'>
                                    Blocks
                                </Link>
                                <Link
                                    href='#faq'
                                    className='text-sm text-muted-foreground hover:text-foreground'>
                                    FAQ
                                </Link>
                            </nav>
                            <div className='flex items-center gap-2'>
                                <Button variant='ghost' size='icon' asChild aria-label='GitHub'>
                                    <Link href='https://github.com/your-org/loop-cn'>
                                        <Github className='h-5 w-5' />
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link href='/docs'>
                                        Docs
                                        <ArrowRight className='ml-2 h-4 w-4' />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <section className='relative'>
                    <div className='mx-auto max-w-7xl px-6'>
                        <div className='mx-auto grid max-w-4xl gap-6 py-20 text-center sm:py-28'>
                            <Badge className='mx-auto w-fit' variant='secondary'>
                                Advanced shadcn ecosystem blocks
                            </Badge>
                            <div className='space-y-4'>
                                <h1 className='text-balance text-4xl font-semibold tracking-tight sm:text-6xl'>
                                    loop/cn
                                </h1>
                                <p className='mx-auto max-w-2xl text-balance text-base text-muted-foreground sm:text-lg'>
                                    A component registry for complex product surfaces in the shadcn ecosystem. Build docs,
                                    editors, and workbench-style UIs with production-minded blocks.
                                </p>
                            </div>
                            <div className='pointer-events-auto mx-auto flex flex-col items-center gap-3 sm:flex-row sm:justify-center'>
                                <Button size='lg' asChild>
                                    <Link href='#getting-started'>Get Started</Link>
                                </Button>
                                <Button size='lg' variant='outline' asChild>
                                    <Link href='/docs'>Explore docs</Link>
                                </Button>
                            </div>

                            <Card
                                id='getting-started'
                                className='pointer-events-auto mx-auto mt-6 w-full max-w-3xl border-primary/20 bg-background/65 backdrop-blur'>
                                <CardHeader>
                                    <div className='flex items-center justify-between gap-3'>
                                        <CardTitle className='flex items-center gap-2 text-base'>
                                            <Sparkles className='h-4 w-4' />
                                            Install from registry
                                        </CardTitle>
                                        <Badge variant='outline'>shadcn registry</Badge>
                                    </div>
                                    <CardDescription>
                                        Start by pulling a real block into your app, then customize freely.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <InstallSnippet />
                                </CardContent>
                                <CardFooter className='justify-between gap-2'>
                                    <p className='text-left text-xs text-muted-foreground'>
                                        Tip: swap `@loop-cn/dockview` for the block package you want.
                                    </p>
                                    <Button size='sm' variant='ghost' asChild>
                                        <Link href='/docs'>
                                            Read docs
                                            <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </section>

                <section id='blocks' className='pb-14 sm:pb-20'>
                    <div className='mx-auto max-w-7xl px-6'>
                        <div className='mb-8 space-y-2'>
                            <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>Block Display</h2>
                            <p className='max-w-2xl text-sm text-muted-foreground sm:text-base'>
                                A small map of where loop/cn is headed: practical blocks for editor-heavy and tool-heavy
                                web apps.
                            </p>
                        </div>
                        <div className='pointer-events-auto grid gap-4 md:grid-cols-12'>
                            <Card className='md:col-span-7 bg-background/65 backdrop-blur'>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2'>
                                        <Blocks className='h-4 w-4 text-primary' />
                                        Workspace Surface
                                    </CardTitle>
                                    <CardDescription>
                                        Panel orchestration, saved layouts, group controls, and drag/drop behavior tuned for real tools.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className='grid h-32 grid-cols-12 gap-2 rounded-xl border p-2'>
                                        <div className='col-span-4 rounded-md border bg-card/80' />
                                        <div className='col-span-5 rounded-md border bg-card/80' />
                                        <div className='col-span-3 rounded-md border bg-card/80' />
                                        <div className='col-span-6 rounded-md border bg-muted/50' />
                                        <div className='col-span-3 rounded-md border bg-muted/50' />
                                        <div className='col-span-3 rounded-md border bg-muted/50' />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className='grid gap-4 md:col-span-5'>
                                {BLOCKS.map((block) => (
                                    <Card key={block.title} className='bg-background/65 backdrop-blur'>
                                        <CardHeader className='pb-4'>
                                            <CardTitle className='flex items-center gap-2 text-base'>
                                                <block.icon className='h-4 w-4 text-primary' />
                                                {block.title}
                                            </CardTitle>
                                            <CardDescription>{block.description}</CardDescription>
                                        </CardHeader>
                                        <CardFooter className='pt-0'>
                                            <Button variant='outline' size='sm' asChild>
                                                <Link href={block.href}>
                                                    Open docs
                                                    <ArrowRight className='ml-1.5 h-3.5 w-3.5' />
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className='pb-14 sm:pb-20'>
                    <div className='mx-auto max-w-7xl px-6'>
                        <Separator className='mb-8 opacity-55' />
                        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            <FeatureCard
                                icon={<PanelsTopLeft className='h-5 w-5' />}
                                title='Workbench-first components'
                                blurb='Multi-panel and multi-view components designed for desktop-grade web UIs.'
                            />
                            <FeatureCard
                                icon={<Workflow className='h-5 w-5' />}
                                title='Editor-centric building blocks'
                                blurb='Outline editing, rich editing, and state-heavy interactions with practical defaults.'
                            />
                            <FeatureCard
                                icon={<BookOpen className='h-5 w-5' />}
                                title='Docs + demos in one loop'
                                blurb='Content-driven docs with live demos so each block is documented where it runs.'
                            />
                        </div>
                    </div>
                </section>

                <section id='faq' className='pb-24'>
                    <div className='mx-auto max-w-4xl px-6'>
                        <h2 className='text-2xl font-semibold tracking-tight sm:text-3xl'>FAQ</h2>
                        <Accordion type='single' collapsible className='pointer-events-auto mt-4'>
                            <AccordionItem value='q1'>
                                <AccordionTrigger>
                                    Is loop/cn a replacement for shadcn/ui?
                                </AccordionTrigger>
                                <AccordionContent>
                                    No. loop/cn extends the ecosystem with higher-level and app-like blocks. Keep shadcn/ui as your
                                    base primitives and use loop/cn for heavier interfaces.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value='q2'>
                                <AccordionTrigger>
                                    Are these blocks theme-safe?
                                </AccordionTrigger>
                                <AccordionContent>
                                    Yes. Components are styled against shadcn CSS variables so they adapt across light/dark and custom
                                    themes without hardcoded palettes.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value='q3'>
                                <AccordionTrigger>
                                    How should I evaluate a block before adopting it?
                                </AccordionTrigger>
                                <AccordionContent>
                                    Use the docs demos first, then add one block in a sandbox route. Validate keyboard behavior,
                                    persistence, and layout flow in your own design system before broad rollout.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value='q4'>
                                <AccordionTrigger>
                                    Can I contribute custom blocks to this registry?
                                </AccordionTrigger>
                                <AccordionContent>
                                    Yes. The project is organized around registry items, docs metadata, and live demos. Add a block,
                                    link it to docs, and keep both behavior and documentation in the same loop.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </section>

                <footer className='pointer-events-auto pb-10'>
                    <div className='mx-auto max-w-7xl px-6'>
                        <div className='flex flex-col items-center justify-between gap-4 rounded-2xl border bg-background/65 p-6 backdrop-blur sm:flex-row'>
                            <div className='inline-flex items-center gap-3'>
                                <LoopCnLogo />
                                <span className='text-sm text-muted-foreground'>Serious blocks for serious app surfaces.</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Button variant='outline' size='sm' asChild>
                                    <Link href='/docs'>Docs</Link>
                                </Button>
                                <Button size='sm' asChild>
                                    <Link href='#getting-started'>Get Started</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
