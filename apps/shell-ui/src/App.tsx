import { useState } from 'react';
import { Button, Panel, Text } from '@loop-kit/ui/primitives';

type PingState = {
    status: 'idle' | 'loading' | 'ok' | 'error';
    message?: string;
    raw?: unknown;
};

export function App() {
    const [ping, setPing] = useState<PingState>({ status: 'idle' });

    return (
        <main className='shell-layout'>
            <Panel className='shell-panel'>
                <Text as='h1'>Loop Shell UI</Text>
                <Text tone='muted'>
                    Vite app talking to Rust host-shell over named pipes.
                </Text>

                <div className='actions'>
                    <Button
                        onClick={async () => {
                            setPing({ status: 'loading' });
                            try {
                                const response = await fetch('/api/host/ping');
                                const body = await response.json() as {
                                    ok?: boolean;
                                    result?: { message?: string };
                                    error?: { message?: string } | string;
                                };
                                if (!response.ok || !body.ok) {
                                    const message = typeof body.error === 'string'
                                        ? body.error
                                        : body.error?.message ?? `HTTP ${response.status}`;
                                    setPing({
                                        status: 'error',
                                        message,
                                        raw: body,
                                    });
                                    return;
                                }

                                setPing({
                                    status: 'ok',
                                    message: body.result?.message ?? 'pong',
                                    raw: body,
                                });
                            } catch (error) {
                                setPing({
                                    status: 'error',
                                    message: String(error),
                                });
                            }
                        }}>
                        Ping host
                    </Button>
                </div>

                <pre className='status' data-status={ping.status}>
                    {ping.status === 'idle' ? 'idle' : JSON.stringify(ping, null, 2)}
                </pre>
            </Panel>
        </main>
    );
}
