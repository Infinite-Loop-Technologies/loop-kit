'use client';

import { useMemo, useState } from 'react';

import { DockWorkspaceDemo } from '@loop-kit/loom-pack-dock';
import {
    Badge,
    Button,
    Heading,
    Inline,
    Link,
    LoomProvider,
    Panel,
    Stack,
    Text,
} from '@loop-kit/loom-react';
import { aquaticReactTheme } from '@loop-kit/loom-theme-aquatic-react';
import { baseReactTheme } from '@loop-kit/loom-theme-base-react';
import { neumorphReactTheme } from '@loop-kit/loom-theme-neumorph-react';

import {
    forgeCapabilityPolicies,
    forgeControlPlanes,
    forgeLocalServices,
} from '../lib/forge-stack';

const themeIds = ['base', 'aquatic', 'neumorph'] as const;

function resolveThemes(themeId: (typeof themeIds)[number]) {
    switch (themeId) {
        case 'aquatic':
            return [baseReactTheme, aquaticReactTheme];
        case 'neumorph':
            return [baseReactTheme, neumorphReactTheme];
        case 'base':
        default:
            return [baseReactTheme];
    }
}

export function ForgePrototype() {
    const [themeId, setThemeId] = useState<(typeof themeIds)[number]>('aquatic');
    const themes = useMemo(() => resolveThemes(themeId), [themeId]);

    return (
        <LoomProvider colorMode='dark' themes={themes}>
            <main className='forge-shell'>
                <section className='forge-hero'>
                    <div className='forge-copy'>
                        <p className='forge-kicker'>Forge prototype</p>
                        <Heading level={1} size='xl'>
                            Policy-aware agent work with a real shell, not a vague backend sketch.
                        </Heading>
                        <Text className='forge-body' tone='muted'>
                            Forge is converging on a Bun-first Next.js PWA with Jazz as the
                            collaborative fabric, Vercel Workflow as the execution plane, Clerk
                            for auth, Polar for billing, and a local OCI lab for artifacts and
                            controlled runtime work.
                        </Text>

                        <Inline className='forge-hero-actions' gap='2'>
                            <Button type='button'>Approve capability grant</Button>
                            <Button kind='outline' type='button'>Inspect workflow policy</Button>
                            <Link href='https://jazz.tools/llms-full.txt' rel='noreferrer' target='_blank'>
                                Jazz research anchor
                            </Link>
                        </Inline>
                    </div>

                    <Panel className='forge-theme-card' emphasis='strong'>
                        <Stack gap='3'>
                            <div className='forge-theme-card__header'>
                                <div>
                                    <p className='forge-eyebrow'>Forge + Loom</p>
                                    <Heading level={2} size='md'>
                                        Theme layers
                                    </Heading>
                                </div>
                                <Badge tone='accent'>{themeId}</Badge>
                            </div>
                            <Text tone='muted'>
                                Forge now consumes Loom primitives and packs directly instead of the
                                removed legacy UI package.
                            </Text>
                            <div className='forge-pack-grid'>
                                {themeIds.map((option) => {
                                    const active = option === themeId;
                                    return (
                                        <button
                                            key={option}
                                            className={active ? 'forge-pack-chip is-active' : 'forge-pack-chip'}
                                            onClick={() => setThemeId(option)}
                                            type='button'>
                                            <span>{option}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </Stack>
                    </Panel>
                </section>

                <section className='forge-grid forge-grid--three'>
                    {forgeControlPlanes.map((plane) => (
                        <Panel key={plane.id} className='forge-card' emphasis='subtle'>
                            <Stack gap='2'>
                                <Heading level={3} size='sm'>
                                    {plane.label}
                                </Heading>
                                <Text tone='muted'>{plane.detail}</Text>
                            </Stack>
                        </Panel>
                    ))}
                </section>

                <section className='forge-grid forge-grid--split'>
                    <Panel className='forge-card forge-card--list' emphasis='subtle'>
                        <p className='forge-eyebrow'>Capability policy</p>
                        <Heading level={2} size='md'>
                            Grants stay explicit and approval-first.
                        </Heading>
                        <ul>
                            {forgeCapabilityPolicies.map((policy) => (
                                <li key={policy}>
                                    <Text>{policy}</Text>
                                </li>
                            ))}
                        </ul>
                    </Panel>

                    <Panel className='forge-card forge-card--list' emphasis='subtle'>
                        <p className='forge-eyebrow'>Local stack</p>
                        <Heading level={2} size='md'>
                            Dagger-shaped orchestration, pragmatic first pass.
                        </Heading>
                        <ul>
                            {forgeLocalServices.map((service) => (
                                <li key={service.id}>
                                    <strong>{service.label}</strong>
                                    <Text tone='muted'>{service.detail}</Text>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                </section>

                <section className='forge-dock'>
                    <div className='forge-dock__copy'>
                        <p className='forge-eyebrow'>Dock in Forge</p>
                        <Heading level={2} size='lg'>
                            Reuse the same workbench surface, but let Loom themes drive the look.
                        </Heading>
                        <Text tone='muted'>
                            TODO: continue migrating deeper Forge-specific reusable shells into Loom
                            packs once the current prototype surfaces stabilize.
                        </Text>
                    </div>
                    <div className='forge-dock__stage'>
                        <DockWorkspaceDemo
                            initialColorMode='dark'
                            initialThemeId={themeId}
                            mode='preview'
                        />
                    </div>
                </section>
            </main>
        </LoomProvider>
    );
}
