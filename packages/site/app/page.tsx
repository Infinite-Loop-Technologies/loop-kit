// app/page.tsx (Next.js App Router)
import Link from 'next/link';
import {
    Github,
    ArrowRight,
    Sparkles,
    Rocket,
    Boxes,
    Shield,
    Zap,
    Terminal,
    Stars,
} from 'lucide-react';
import PixelBlast from '@/components/PixelBlast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion';
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Prose } from '@/registry/new-york/ui/prose/prose';
import { FeatureCard, InstallSnippet } from '@/components/snippets';
import GlassSurface from '@/registry/new-york/ui/glass-surface';
export default function Home() {
    return (
        <div className='relative min-h-screen overflow-clip'>
            {/* Background */}
            <div className='fixed inset-0 z-0'>
                <PixelBlast
                    variant='circle'
                    pixelSize={6}
                    color='#B19EEF'
                    patternScale={3}
                    patternDensity={1.2}
                    pixelSizeJitter={0.5}
                    enableRipples
                    rippleSpeed={0.4}
                    rippleThickness={0.12}
                    rippleIntensityScale={1.5}
                    liquid={false}
                    liquidStrength={0.12}
                    liquidRadius={1.2}
                    liquidWobbleSpeed={5}
                    speed={0.6}
                    edgeFade={0.05}
                    transparent
                />
                <div className='absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(10,10,15,0.35),transparent_55%),linear-gradient(to_bottom,rgba(10,10,15,0.25),rgba(10,10,15,0.6))]' />
            </div>

            {/* NAV */}
            <div className='relative z-10 pointer-events-none'>
                <header className='pointer-events-auto sticky top-0 z-40 w-full'>
                    <div className='mx-auto max-w-7xl px-6'>
                        <div className='mt-5 flex items-center justify-between rounded-2xl border bg-background/60 px-4 py-2 backdrop-blur-md'>
                            <Link
                                href='/'
                                className='inline-flex items-center gap-2 font-semibold tracking-tight'>
                                <span className='inline-flex h-6 w-6 items-center justify-center rounded bg-primary/15 text-primary'>
                                    <Stars className='h-3.5 w-3.5' />
                                </span>
                                loop-kit
                            </Link>
                            <nav className='hidden gap-6 md:flex'>
                                <Link
                                    href='#features'
                                    className='text-sm text-muted-foreground hover:text-foreground'>
                                    Features
                                </Link>
                                <Link
                                    href='#install'
                                    className='text-sm text-muted-foreground hover:text-foreground'>
                                    Install
                                </Link>
                                <Link
                                    href='#faq'
                                    className='text-sm text-muted-foreground hover:text-foreground'>
                                    FAQ
                                </Link>
                            </nav>
                            <div className='flex items-center gap-2'>
                                <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                asChild
                                                aria-label='GitHub'>
                                                <Link href='https://github.com/your-org/loop-kit'>
                                                    <Github className='h-5 w-5' />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>GitHub</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <Button className='group' asChild>
                                    <Link href='#install'>
                                        Get Started
                                        <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* HERO */}
                <section className='relative'>
                    <div className='mx-auto max-w-7xl px-6'>
                        <div className='mx-auto grid max-w-4xl gap-6 py-20 text-center sm:py-28'>
                            <Badge
                                className='mx-auto w-fit'
                                variant='secondary'>
                                WASM-native • Live-powered
                            </Badge>
                            <Prose className='mx-auto'>
                                <h1>
                                    Build composable software like it’s{' '}
                                    <em>2026</em>
                                </h1>
                                <p>
                                    Loop-Kit is a ruthless toolkit for
                                    effect-driven apps and engines. JS/TS-first,
                                    WASM-ready, Live-friendly. Components,
                                    pipelines, and infra that actually
                                    compose—across browser, desktop, and
                                    servers.
                                </p>
                            </Prose>
                            <div className='pointer-events-auto mx-auto flex flex-col items-center gap-3 sm:flex-row sm:justify-center'>
                                <Button size='lg' asChild>
                                    <Link href='#install'>Install the CLI</Link>
                                </Button>
                                <Button size='lg' variant='outline' asChild>
                                    <Link href='/docs'>Read the docs</Link>
                                </Button>
                            </div>
                            <Card className='pointer-events-auto mx-auto mt-6 w-full max-w-3xl border-primary/20 bg-background/60 backdrop-blur'>
                                <Tabs
                                    defaultValue='pnpm'
                                    className='w-full'
                                    id='install'>
                                    <CardHeader>
                                        <div className='flex items-center justify-between'>
                                            <CardTitle className='flex items-center gap-2 text-base'>
                                                <Terminal className='h-4 w-4' />{' '}
                                                Install
                                            </CardTitle>
                                            <TabsList>
                                                <TabsTrigger value='pnpm'>
                                                    pnpm
                                                </TabsTrigger>
                                                <TabsTrigger value='npm'>
                                                    npm
                                                </TabsTrigger>
                                                <TabsTrigger value='bun'>
                                                    bun
                                                </TabsTrigger>
                                            </TabsList>
                                        </div>
                                        <CardDescription>
                                            Pick your poison and go.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <InstallSnippet />
                                    </CardContent>
                                    <CardFooter className='justify-between'>
                                        <div className='text-xs text-muted-foreground'>
                                            CLI ships with type-safe generators
                                            and WASM runtime helpers.
                                        </div>
                                        <Badge variant='outline'>
                                            v0.1.0-alpha
                                        </Badge>
                                    </CardFooter>
                                    <TabsContent
                                        value='pnpm'
                                        className='hidden'
                                    />
                                    <TabsContent
                                        value='npm'
                                        className='hidden'
                                    />
                                    <TabsContent
                                        value='bun'
                                        className='hidden'
                                    />
                                </Tabs>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* FEATURE GRID */}
                <section id='features' className='pb-10 sm:pb-20'>
                    <div className='mx-auto max-w-7xl px-6'>
                        <Prose>
                            <h2>Why teams pick Loop-Kit</h2>
                        </Prose>
                        <div className='mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            <FeatureCard
                                icon={<Rocket className='h-5 w-5' />}
                                title='WASM-native toolchain'
                                blurb='Ship components as portable capsules with zero-drama builds. Fallback to native when you must.'
                            />
                            <FeatureCard
                                icon={<Boxes className='h-5 w-5' />}
                                title='Effect-driven runtime'
                                blurb='Live/UseGPU-aligned APIs: yeet/capture/reconcile without the DOM brain damage.'
                            />
                            <FeatureCard
                                icon={<Zap className='h-5 w-5' />}
                                title='Hot reload pipelines'
                                blurb='Incremental steps compile to reusable units; swap at runtime with state intact.'
                            />
                            <FeatureCard
                                icon={<Shield className='h-5 w-5' />}
                                title='Schema-first safety'
                                blurb='Type/Result everywhere. Zero exceptions in normal flow. Strong branded types.'
                            />
                            <FeatureCard
                                icon={<Sparkles className='h-5 w-5' />}
                                title='Design-system friendly'
                                blurb='ShadCN tokens + Tailwind v4 + your renderer of choice. UI stays portable.'
                            />
                            <FeatureCard
                                icon={<Terminal className='h-5 w-5' />}
                                title='CLI that respects you'
                                blurb='Generators, DX utilities, and infra hooks—no mystery scaffolds, no lock-in.'
                            />
                        </div>
                    </div>
                </section>

                {/* STRIP / SOCIAL PROOF */}
                <section className='pointer-events-auto  pb-16'>
                    <div className='mx-auto max-w-7xl px-6'>
                        <Separator className='mb-8 opacity-50' />
                        <div className='flex flex-wrap items-center justify-center gap-8 opacity-70'>
                            {[
                                'Vercelish',
                                'Cloudflary',
                                'Nitric-ish',
                                'Rolldown',
                                'Use-GPU',
                            ].map((n) => (
                                <div
                                    key={n}
                                    className='text-sm font-medium text-muted-foreground'>
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TESTIMONIAL */}
                <section className='pb-20'>
                    <div className='mx-auto max-w-7xl px-6'>
                        <Card className='mx-auto max-w-3xl bg-background/60 backdrop-blur'>
                            <CardContent className='pt-6'>
                                <blockquote className='text-balance text-lg leading-relaxed'>
                                    “Loop-Kit let us ship a complex GPU app with
                                    hot-swappable WASM components. The effect
                                    runtime meant multiplayer logic didn’t fork
                                    into a nightmare.”
                                </blockquote>
                                <div className='mt-4 flex items-center gap-3'>
                                    <Avatar className='h-8 w-8'>
                                        <AvatarFallback>NP</AvatarFallback>
                                    </Avatar>
                                    <div className='text-sm'>
                                        <div className='font-medium'>
                                            Nova P.
                                        </div>
                                        <div className='text-muted-foreground'>
                                            Founder, Quantum Garden
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* FAQ */}
                <section id='faq' className='pb-24'>
                    <div className='mx-auto max-w-4xl px-6'>
                        <Prose>
                            <h2>FAQ</h2>
                        </Prose>
                        <Accordion
                            type='single'
                            collapsible
                            className='pointer-events-auto mt-4'>
                            <AccordionItem value='1'>
                                <AccordionTrigger>
                                    Is Loop-Kit tied to a UI framework?
                                </AccordionTrigger>
                                <AccordionContent>
                                    No. It’s renderer-agnostic and plays best
                                    with Live/UseGPU; React can sit at the
                                    edges.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value='2'>
                                <AccordionTrigger>
                                    Can I use it without WASM?
                                </AccordionTrigger>
                                <AccordionContent>
                                    Yep. WASM is a first-class target, not a
                                    requirement. Run native where it makes
                                    sense.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value='3'>
                                <AccordionTrigger>
                                    What’s the stability story?
                                </AccordionTrigger>
                                <AccordionContent>
                                    APIs are pre-1.0 but guarded by schemas and
                                    typed Results. Breaking changes come with
                                    codemods.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className='pointer-events-auto pb-10'>
                    <div className='mx-auto max-w-7xl px-6'>
                        <div className='rounded-2xl border bg-background/60 p-6 backdrop-blur'>
                            <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
                                <div className='text-sm text-muted-foreground'>
                                    © {new Date().getFullYear()} Infinite Loop
                                    Technologies
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Input
                                        placeholder='Email for updates'
                                        className='w-56'
                                    />
                                    <Button>Subscribe</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
