'use client';

import { useMemo, useState } from 'react';

import {
    DockWorkspaceDemo,
    Icon,
    ThemePackProvider,
    ThemedButton,
    ThemedLink,
    ThemedPanel,
    ThemedText,
    describeThemePackSurface,
} from '@loop-kit/ui';

import {
    forgeCapabilityPolicies,
    forgeControlPlanes,
    forgeLocalServices,
} from '../lib/forge-stack';

const packIds = ['slate-glow', 'liquid-glass', 'neo-brutal', 'textured-panels'] as const;

export function ForgePrototype() {
    const [packId, setPackId] = useState<(typeof packIds)[number]>('slate-glow');
    const { pack, previewStyle } = useMemo(() => describeThemePackSurface(packId), [packId]);

    return (
        <ThemePackProvider pack={pack} mode='dark'>
            <main className='forge-shell'>
                <section className='forge-hero'>
                    <div className='forge-copy'>
                        <p className='forge-kicker'>Forge prototype</p>
                        <h1>Policy-aware agent work with a real shell, not a vague backend sketch.</h1>
                        <ThemedText className='forge-body'>
                            Forge is converging on a Bun-first Next.js PWA with Jazz as the
                            collaborative fabric, Vercel Workflow as the execution plane, Clerk
                            for auth, Polar for billing, and a local OCI lab for artifacts and
                            controlled runtime work.
                        </ThemedText>

                        <div className='forge-hero-actions'>
                            <ThemedButton>Approve capability grant</ThemedButton>
                            <ThemedButton tone='outline'>Inspect workflow policy</ThemedButton>
                            <ThemedLink href='https://jazz.tools/llms-full.txt' target='_blank' rel='noreferrer'>
                                Jazz research anchor
                            </ThemedLink>
                        </div>
                    </div>

                    <ThemedPanel className='forge-theme-card' style={previewStyle}>
                        <div className='forge-theme-card__header'>
                            <div>
                                <p className='forge-eyebrow'>Theme packs</p>
                                <h2>{pack.label}</h2>
                            </div>
                            <Icon id='menu' width={20} height={20} />
                        </div>
                        <ThemedText tone='muted'>{pack.description}</ThemedText>
                        <div className='forge-pack-grid'>
                            {packIds.map((option) => {
                                const active = option === packId;
                                const preview = describeThemePackSurface(option);
                                return (
                                    <button
                                        key={option}
                                        className={active ? 'forge-pack-chip is-active' : 'forge-pack-chip'}
                                        onClick={() => setPackId(option)}
                                        type='button'>
                                        <span>{preview.pack.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </ThemedPanel>
                </section>

                <section className='forge-grid forge-grid--three'>
                    {forgeControlPlanes.map((plane) => (
                        <ThemedPanel key={plane.id} className='forge-card'>
                            <div className='forge-card__title'>
                                <Icon id='search' width={18} height={18} />
                                <h3>{plane.label}</h3>
                            </div>
                            <ThemedText tone='muted'>{plane.detail}</ThemedText>
                        </ThemedPanel>
                    ))}
                </section>

                <section className='forge-grid forge-grid--split'>
                    <ThemedPanel className='forge-card forge-card--list'>
                        <p className='forge-eyebrow'>Capability policy</p>
                        <h2>Grants stay explicit and approval-first.</h2>
                        <ul>
                            {forgeCapabilityPolicies.map((policy) => (
                                <li key={policy}>
                                    <ThemedText>{policy}</ThemedText>
                                </li>
                            ))}
                        </ul>
                    </ThemedPanel>

                    <ThemedPanel className='forge-card forge-card--list'>
                        <p className='forge-eyebrow'>Local stack</p>
                        <h2>Dagger-shaped orchestration, pragmatic first pass.</h2>
                        <ul>
                            {forgeLocalServices.map((service) => (
                                <li key={service.id}>
                                    <strong>{service.label}</strong>
                                    <ThemedText tone='muted'>{service.detail}</ThemedText>
                                </li>
                            ))}
                        </ul>
                    </ThemedPanel>
                </section>

                <section className='forge-dock'>
                    <div className='forge-dock__copy'>
                        <p className='forge-eyebrow'>Dock in Forge</p>
                        <h2>Reuse the same workbench surface, but let the pack drive the look.</h2>
                        <ThemedText tone='muted'>
                            This keeps the prototype aligned with `packages/ui` instead of
                            rebuilding the layout stack from scratch.
                        </ThemedText>
                    </div>
                    <div className='forge-dock__stage'>
                        <DockWorkspaceDemo
                            initialMode='dark'
                            initialSkinId={pack.id}
                            mode='preview'
                        />
                    </div>
                </section>
            </main>
        </ThemePackProvider>
    );
}
