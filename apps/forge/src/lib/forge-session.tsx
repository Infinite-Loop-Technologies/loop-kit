'use client';

import * as React from 'react';

import { init } from '@instantdb/react';

import schema from '../../instant.schema';

type ForgePublicConfig = {
    appId: string | null;
    authMode: 'magic-code';
    configured: boolean;
};

type ForgeBootstrapState = {
    error: string | null;
    ready: boolean;
};

type ForgeSessionContextValue = {
    authError: string | null;
    authLoading: boolean;
    bootstrap: ForgeBootstrapState;
    code: string;
    config: ForgePublicConfig;
    db: ReturnType<typeof init>;
    email: string;
    resetMagicCode: () => void;
    sentEmail: string;
    setCode: (value: string) => void;
    setEmail: (value: string) => void;
    signInWithMagicCode: () => Promise<void>;
    signOut: () => Promise<void>;
    startMagicCode: () => Promise<void>;
    user: {
        email?: string;
        id: string;
        refresh_token?: string;
    } | null;
    workspaceLoading: boolean;
    workspaces: Array<Record<string, any>>;
    updateWorkspace: (workspaceId: string, patch: Record<string, string | boolean>) => Promise<void>;
};

const ForgeSessionContext = React.createContext<ForgeSessionContextValue | null>(null);

function ForgeConfigBlocker({ message }: { message: string }) {
    return (
        <div
            style={{
                alignItems: 'center',
                background:
                    'radial-gradient(circle at top, rgba(53, 123, 255, 0.22), transparent 38%), #0a0d12',
                color: 'white',
                display: 'flex',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '2rem',
            }}>
            <div
                style={{
                    background: 'rgba(18, 23, 31, 0.92)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.45)',
                    maxWidth: '40rem',
                    padding: '1.5rem',
                    width: '100%',
                }}>
                <div
                    style={{
                        color: '#89a0bd',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        marginBottom: '0.75rem',
                        textTransform: 'uppercase',
                    }}>
                    Forge Setup Required
                </div>
                <div style={{ fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1rem' }}>{message}</div>
                <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '14px',
                        color: '#89a0bd',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        padding: '1rem',
                    }}>
                    Fill `apps/forge/.env.example` values into your local env before running Forge.
                </div>
            </div>
        </div>
    );
}

function ForgeSessionProviderInner({
    children,
    config,
    db,
}: {
    children: React.ReactNode;
    config: ForgePublicConfig;
    db: ReturnType<typeof init>;
}) {
    const auth = db.useAuth();
    const workspaceQuery = db.useQuery({
        workspaces: {
            nodes: {
                $: {
                    order: {
                        updatedAt: 'desc',
                    },
                },
            },
        },
    });
    const [email, setEmail] = React.useState('');
    const [code, setCode] = React.useState('');
    const [sentEmail, setSentEmail] = React.useState('');
    const [authError, setAuthError] = React.useState<string | null>(null);
    const [bootstrap, setBootstrap] = React.useState<ForgeBootstrapState>({
        error: null,
        ready: false,
    });

    React.useEffect(() => {
        if (!auth.user?.refresh_token) {
            setBootstrap({
                error: null,
                ready: false,
            });
            return;
        }

        let cancelled = false;
        setBootstrap({
            error: null,
            ready: false,
        });

        void fetch('/api/workspaces/bootstrap', {
            headers: {
                token: auth.user.refresh_token,
            },
            method: 'POST',
        })
            .then(async (response) => {
                if (!response.ok) {
                    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
                    throw new Error(payload?.error ?? 'Failed to bootstrap the workspace.');
                }
                if (!cancelled) {
                    setBootstrap({
                        error: null,
                        ready: true,
                    });
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setBootstrap({
                        error: error instanceof Error ? error.message : 'Failed to bootstrap the workspace.',
                        ready: false,
                    });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [auth.user?.refresh_token]);

    const startMagicCode = React.useCallback(async () => {
        setAuthError(null);
        await db.auth.sendMagicCode({ email });
        setSentEmail(email);
    }, [db.auth, email]);

    const signInWithMagicCode = React.useCallback(async () => {
        setAuthError(null);
        await db.auth.signInWithMagicCode({
            code,
            email: sentEmail,
        });
        setCode('');
    }, [code, db.auth, sentEmail]);

    const signOut = React.useCallback(async () => {
        setAuthError(null);
        setCode('');
        setEmail('');
        setSentEmail('');
        await db.auth.signOut();
    }, [db.auth]);

    const updateWorkspace = React.useCallback(
        async (workspaceId: string, patch: Record<string, string | boolean>) => {
            await db.transact(db.tx.workspaces[workspaceId].update(patch));
        },
        [db],
    );

    const value = React.useMemo<ForgeSessionContextValue>(
        () => ({
            authError,
            authLoading: auth.isLoading,
            bootstrap,
            code,
            config,
            db,
            email,
            resetMagicCode: () => {
                setAuthError(null);
                setCode('');
                setSentEmail('');
            },
            sentEmail,
            setCode,
            setEmail,
            signInWithMagicCode: async () => {
                try {
                    await signInWithMagicCode();
                } catch (error) {
                    setAuthError(error instanceof Error ? error.message : 'Failed to verify code.');
                }
            },
            signOut,
            startMagicCode: async () => {
                try {
                    await startMagicCode();
                } catch (error) {
                    setAuthError(error instanceof Error ? error.message : 'Failed to send code.');
                    setSentEmail('');
                }
            },
            user: auth.user
                ? {
                      email: auth.user.email ?? undefined,
                      id: auth.user.id,
                      refresh_token: auth.user.refresh_token,
                  }
                : null,
            workspaceLoading: Boolean(auth.user) && (!bootstrap.ready || workspaceQuery.isLoading),
            workspaces: workspaceQuery.data?.workspaces ?? [],
            updateWorkspace,
        }),
        [
            auth.isLoading,
            auth.user,
            authError,
            bootstrap,
            code,
            config,
            db,
            email,
            sentEmail,
            signInWithMagicCode,
            signOut,
            startMagicCode,
            updateWorkspace,
            workspaceQuery.data?.workspaces,
            workspaceQuery.isLoading,
        ],
    );

    return <ForgeSessionContext.Provider value={value}>{children}</ForgeSessionContext.Provider>;
}

export function ForgeSessionProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = React.useState<ForgePublicConfig | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        void fetch('/api/config')
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Failed to load Forge runtime configuration.');
                }
                const payload = (await response.json()) as ForgePublicConfig;
                if (!cancelled) {
                    setConfig(payload);
                }
            })
            .catch((fetchError: unknown) => {
                if (!cancelled) {
                    setError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : 'Failed to load Forge runtime configuration.',
                    );
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const db = React.useMemo(
        () => (config?.appId ? init({ appId: config.appId, schema }) : null),
        [config?.appId],
    );

    if (error) {
        return <ForgeConfigBlocker message={error} />;
    }

    if (!config) {
        return <ForgeConfigBlocker message='Loading Forge runtime configuration…' />;
    }

    if (!config.configured || !config.appId || !db) {
        return (
            <ForgeConfigBlocker message='Forge needs `INSTANT_APP_ID` and `INSTANT_ADMIN_TOKEN` before auth and workspace bootstrap can run.' />
        );
    }

    return (
        <ForgeSessionProviderInner config={config} db={db}>
            {children}
        </ForgeSessionProviderInner>
    );
}

export function useForgeSession() {
    const value = React.useContext(ForgeSessionContext);
    if (!value) {
        throw new Error('ForgeSessionProvider is required before using Forge session state.');
    }
    return value;
}
