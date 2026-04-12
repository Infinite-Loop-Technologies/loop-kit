'use client';

import * as React from 'react';

import { Badge, Box, Button, Heading, Inline, Stack, Surface, Text } from '@loop-kit/loom-react';

import { useForgeSession } from '../lib/forge-session';

const page = {
    background:
        'radial-gradient(circle at top left, rgba(65, 114, 255, 0.22), transparent 30%), radial-gradient(circle at bottom right, rgba(16, 194, 160, 0.14), transparent 34%), #090c11',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    card: 'rgba(15, 20, 27, 0.88)',
    input: '#080b10',
    muted: '#95a0b2',
};

function AuthInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            style={{
                background: page.input,
                border: page.border,
                borderRadius: '14px',
                color: 'white',
                fontSize: '1rem',
                minHeight: '3rem',
                outline: 'none',
                padding: '0 0.95rem',
                width: '100%',
            }}
        />
    );
}

export function ForgeLanding() {
    const {
        authError,
        code,
        email,
        resetMagicCode,
        sentEmail,
        setCode,
        setEmail,
        signInWithMagicCode,
        startMagicCode,
    } = useForgeSession();

    const verifying = Boolean(sentEmail);

    return (
        <Box
            style={{
                background: page.background,
                color: 'white',
                display: 'flex',
                minHeight: '100vh',
                padding: '2.5rem',
            }}>
            <Box
                style={{
                    display: 'grid',
                    gap: '2rem',
                    gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 28rem)',
                    margin: 'auto',
                    maxWidth: '75rem',
                    width: '100%',
                }}>
                <Stack gap='6' style={{ alignSelf: 'center', paddingRight: '1rem' }}>
                    <Inline align='center' gap='2'>
                        <Badge kind='soft' tone='info'>
                            Instant-backed Forge
                        </Badge>
                        <Text as='span' tone='muted'>
                            Routing, auth, workspace bootstrap, and dock runtime all wired together.
                        </Text>
                    </Inline>
                    <Stack gap='4'>
                        <Heading level={1} size='xl' style={{ fontSize: '4rem', lineHeight: 0.95 }}>
                            Forge now lands cleanly, then drops you into a real workspace.
                        </Heading>
                        <Text as='div' tone='muted' style={{ fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '42rem' }}>
                            The shell is deliberately lightweight: a single landing page, a workspace route, real Instant auth,
                            and the dock doing the heavy lifting for modal, peek, tabs, split panels, and keyboard-first flows.
                        </Text>
                    </Stack>
                    <Inline align='center' gap='3' style={{ flexWrap: 'wrap' }}>
                        <Surface emphasis='subtle' style={{ background: page.card, padding: '1rem 1.1rem' }}>
                            <Stack gap='2'>
                                <Text as='div' emphasis='strong'>
                                    Real auth
                                </Text>
                                <Text as='div' tone='muted'>
                                    Instant magic-code sign in, sign up, sign out, and backend bootstrap.
                                </Text>
                            </Stack>
                        </Surface>
                        <Surface emphasis='subtle' style={{ background: page.card, padding: '1rem 1.1rem' }}>
                            <Stack gap='2'>
                                <Text as='div' emphasis='strong'>
                                    Real routes
                                </Text>
                                <Text as='div' tone='muted'>
                                    `/` for landing, `/workspaces/:slug` for the actual product surface.
                                </Text>
                            </Stack>
                        </Surface>
                        <Surface emphasis='subtle' style={{ background: page.card, padding: '1rem 1.1rem' }}>
                            <Stack gap='2'>
                                <Text as='div' emphasis='strong'>
                                    Real dock state
                                </Text>
                                <Text as='div' tone='muted'>
                                    Workspace tabs are draggable and splittable instead of being static mock chrome.
                                </Text>
                            </Stack>
                        </Surface>
                    </Inline>
                </Stack>

                <Surface
                    emphasis='subtle'
                    style={{
                        alignSelf: 'center',
                        background: page.card,
                        border: page.border,
                        borderRadius: '24px',
                        boxShadow: '0 35px 90px rgba(0, 0, 0, 0.45)',
                        padding: '1.5rem',
                    }}>
                    <Stack gap='5'>
                        <Stack gap='2'>
                            <Text
                                as='div'
                                size='sm'
                                tone='muted'
                                style={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                {verifying ? 'Verify code' : 'Login or sign up'}
                            </Text>
                            <Heading level={2} size='lg'>
                                {verifying ? 'Check your inbox.' : 'Enter your email to continue.'}
                            </Heading>
                            <Text as='div' tone='muted' style={{ lineHeight: 1.7 }}>
                                {verifying
                                    ? `We sent a code to ${sentEmail}. New users are created automatically when they verify their first code.`
                                    : 'Forge uses Instant magic codes here to keep the product shell simple while the workspace becomes real.'}
                            </Text>
                        </Stack>

                        <Stack gap='3'>
                            {!verifying ? (
                                <>
                                    <AuthInput
                                        autoFocus
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder='you@company.com'
                                        type='email'
                                        value={email}
                                    />
                                    <Button
                                        kind='solid'
                                        onClick={() => {
                                            void startMagicCode();
                                        }}
                                        size='md'>
                                        Send magic code
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <AuthInput
                                        autoFocus
                                        onChange={(event) => setCode(event.target.value)}
                                        placeholder='123456'
                                        value={code}
                                    />
                                    <Inline align='center' gap='3'>
                                        <Button
                                            kind='solid'
                                            onClick={() => {
                                                void signInWithMagicCode();
                                            }}
                                            size='md'
                                            style={{ flex: 1 }}>
                                            Verify and continue
                                        </Button>
                                        <Button
                                            kind='outline'
                                            onClick={() => {
                                                setEmail(sentEmail);
                                                resetMagicCode();
                                            }}
                                            size='md'>
                                            Back
                                        </Button>
                                    </Inline>
                                </>
                            )}
                        </Stack>

                        {authError ? (
                            <Box
                                style={{
                                    background: 'rgba(255, 102, 102, 0.08)',
                                    border: '1px solid rgba(255, 102, 102, 0.25)',
                                    borderRadius: '14px',
                                    color: '#ffb3b3',
                                    padding: '0.875rem 1rem',
                                }}>
                                {authError}
                            </Box>
                        ) : null}

                        <Text as='div' tone='muted' style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>
                            The first successful login automatically provisions a default workspace and seeds a few dockable
                            surfaces so drag and split interactions have something real to operate on.
                        </Text>
                    </Stack>
                </Surface>
            </Box>
        </Box>
    );
}
