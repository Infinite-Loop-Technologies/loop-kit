'use client';

import * as React from 'react';
import type { FC } from 'react';
import {
    WebContainer as WebContainerAPI,
    type WebContainer,
    type WebContainerProcess,
    type FileSystemTree,
} from '@webcontainer/api';

import type { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useXTerm } from 'react-xtermjs';

// ✅ Your CodeEditor import
import CodeEditor from '@/registry/new-york/blocks/code-editor/components/code-editor';

// ❗ TODO: fix these imports to wherever your file tree pieces live
// (names based on your example)
import type { FileTreeSection } from './webcontainer-filetree';
import { FileSidebar } from './webcontainer-filetree';
import { useWebContainerFileTree } from './webcontainer-filetree';

// ---------------------------------------------------------------------------
//  WebContainer SINGLETON (module scope)
// ---------------------------------------------------------------------------

let webcontainerPromise: Promise<WebContainer> | null = null;
let webcontainerInstance: WebContainer | null = null;
let fsMounted = false;

const INITIAL_CODE = `console.log("Hello from WebContainers!");\n`;

const FILES: FileSystemTree = {
    'package.json': {
        file: {
            contents: JSON.stringify(
                {
                    name: 'webcontainer-demo',
                    type: 'module',
                    dependencies: {},
                    scripts: {
                        dev: 'node index.js',
                    },
                },
                null,
                2
            ),
        },
    },
    'index.js': {
        file: {
            contents: INITIAL_CODE,
        },
    },
};

async function getWebContainerSingleton(): Promise<WebContainer> {
    if (webcontainerInstance) return webcontainerInstance;

    if (!webcontainerPromise) {
        webcontainerPromise = WebContainerAPI.boot().then((instance) => {
            webcontainerInstance = instance;
            return instance;
        });
    }

    return webcontainerPromise;
}

async function ensureFilesystemMounted() {
    const webcontainer = await getWebContainerSingleton();
    if (!fsMounted) {
        await webcontainer.mount(FILES);
        fsMounted = true;
    }
    return webcontainer;
}

// ---------------------------------------------------------------------------
//  Component
// ---------------------------------------------------------------------------

type IdeStatus = 'idle' | 'booting' | 'installing' | 'running' | 'error';

const FullIDE: FC = () => {
    const [code, setCode] = React.useState<string>(INITIAL_CODE);
    const [status, setStatus] = React.useState<IdeStatus>('idle');
    const [error, setError] = React.useState<string | null>(null);

    // currently-open file in editor
    const [activePath, setActivePath] = React.useState<string>('/index.js');

    // actual WebContainer instance in React state (for hooks like file tree)
    const [webcontainer, setWebcontainer] = React.useState<WebContainer | null>(
        null
    );

    // track process so we can re-wire streams when it changes
    const processRef = React.useRef<WebContainerProcess | null>(null);
    const [processGeneration, setProcessGeneration] = React.useState(0);

    // stdin writer for the running process
    const inputWriterRef =
        React.useRef<WritableStreamDefaultWriter<string> | null>(null);

    // xterm instance
    const { instance: terminal, ref: xtermRef } = useXTerm();
    const fitAddonRef = React.useRef<FitAddon | null>(null);

    // -------------------------------------------------------------------------
    //  Boot WebContainer + mount FS + start dev process (once)
    // -------------------------------------------------------------------------

    const startProcess = React.useCallback(async () => {
        try {
            setStatus('running');
            setError(null);

            const wc = await getWebContainerSingleton();

            // kill previous process if any
            if (processRef.current) {
                try {
                    await processRef.current.kill();
                } catch {
                    // ignore
                }
            }

            const proc = await wc.spawn('npm', ['run', 'dev']);
            processRef.current = proc;
            inputWriterRef.current = proc.input.getWriter();
            setProcessGeneration((g) => g + 1);
        } catch (err) {
            console.error(err);
            setStatus('error');
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to start process in WebContainer'
            );
        }
    }, [setStatus, setError]);

    React.useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setStatus('booting');
                setError(null);

                await getWebContainerSingleton();
                if (cancelled) return;

                setStatus('installing');
                const wc = await ensureFilesystemMounted();
                if (cancelled) return;

                setWebcontainer(wc);
                await startProcess();
            } catch (err) {
                console.error(err);
                if (cancelled) return;
                setStatus('error');
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to initialize WebContainer'
                );
            }
        })();

        return () => {
            cancelled = true;
            // kill the dev process on unmount
            if (processRef.current) {
                void processRef.current.kill();
            }
        };
    }, [startProcess, setStatus, setError]);

    // -------------------------------------------------------------------------
    //  XTerm: addons + resize + stdin
    // -------------------------------------------------------------------------

    // set up FitAddon + welcome text
    React.useEffect(() => {
        if (!terminal) return;

        const fitAddon = new FitAddon();
        fitAddonRef.current = fitAddon;
        terminal.loadAddon(fitAddon);
        fitAddon.fit();

        terminal.writeln('WebContainers terminal ready.');
        terminal.write('$ ');

        const handleResize = () => {
            try {
                fitAddon.fit();
            } catch {
                // ignore
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [terminal]);

    // hook stdin: terminal -> process.input
    React.useEffect(() => {
        if (!terminal) return;

        const disposable = terminal.onData((data: string) => {
            const writer = inputWriterRef.current;
            if (!writer) return;

            // Echo locally (xterm already shows the char, but this lets us tweak if needed)
            // terminal.write(data);

            if (data === '\r') {
                // Enter
                terminal.write('\r\n');
                void writer.write('\n');
                terminal.write('$ ');
            } else {
                void writer.write(data);
            }
        });

        return () => {
            disposable.dispose();
        };
    }, [terminal]);

    // -------------------------------------------------------------------------
    //  Wire process.stdout to xterm (uses getReader, no WritableStream typing)
    // -------------------------------------------------------------------------

    React.useEffect(() => {
        if (!terminal) return;
        const proc = processRef.current;
        if (!proc) return;

        const reader = proc.output.getReader();
        let cancelled = false;

        (async () => {
            try {
                // WebContainer's output is ReadableStream<string>
                while (!cancelled) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    if (value) {
                        terminal.write(value.replace(/\n/g, '\r\n'));
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('process output error', err);
                }
            } finally {
                reader.releaseLock();
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [terminal, processGeneration]);

    // -------------------------------------------------------------------------
    //  File tree integration (WebContainer FS)
    // -------------------------------------------------------------------------

    const { nodes, loading: fileTreeLoading } = useWebContainerFileTree(
        webcontainer,
        '/'
    );

    const sections = React.useMemo<FileTreeSection[]>(
        () => [
            {
                id: 'root',
                label: 'Files',
                nodes: nodes ?? [],
            },
        ],
        [nodes]
    );

    // loading a file into editor on sidebar select
    const handleSelectFile = React.useCallback(
        async (node: { path: string }) => {
            setActivePath(node.path);
            if (!webcontainer) return;

            try {
                const content = await webcontainer.fs.readFile(
                    node.path,
                    'utf-8'
                );
                setCode(content as string);
            } catch (err) {
                console.error('readFile error', err);
                setError('Failed to read file from WebContainer');
                setStatus('error');
            }
        },
        [webcontainer, setError, setStatus]
    );

    // -------------------------------------------------------------------------
    //  Editor <-> FS sync
    // -------------------------------------------------------------------------

    const handleCodeChange = React.useCallback(
        async (next: string) => {
            setCode(next);

            if (!webcontainer || !activePath) return;

            try {
                await webcontainer.fs.writeFile(activePath, next);
            } catch (err) {
                console.error('writeFile error', err);
                setError('Failed to sync file into WebContainer');
                setStatus('error');
            }
        },
        [webcontainer, activePath, setError, setStatus]
    );

    // -------------------------------------------------------------------------
    //  Restart process
    // -------------------------------------------------------------------------

    const handleRestart = React.useCallback(() => {
        (async () => {
            if (terminal) {
                terminal.writeln('\r\n[ restarting dev process... ]');
            }
            await startProcess();
        })();
    }, [terminal, startProcess]);

    // -------------------------------------------------------------------------
    //  UI
    // -------------------------------------------------------------------------

    return (
        <div className='flex h-full min-h-[600px] flex-col gap-2 p-4'>
            <div className='flex items-center justify-between border-b pb-2'>
                <div className='flex items-center gap-3'>
                    <h1 className='text-lg font-semibold'>Full IDE</h1>
                    <span className='text-xs text-muted-foreground'>
                        Status:&nbsp;
                        <span className='font-mono'>
                            {status.toUpperCase()}
                            {fileTreeLoading ? ' · SCANNING FS...' : ''}
                        </span>
                    </span>
                    {error && (
                        <span className='text-xs text-destructive'>
                            {error}
                        </span>
                    )}
                </div>
                <div className='flex items-center gap-2'>
                    <button
                        type='button'
                        className='rounded border px-2 py-1 text-xs hover:bg-accent'
                        onClick={handleRestart}
                        disabled={
                            status === 'booting' || status === 'installing'
                        }>
                        Restart process
                    </button>
                </div>
            </div>

            <div className='flex flex-1 gap-4 overflow-hidden'>
                {/* File tree sidebar */}
                <div className='w-64 min-w-[220px] border rounded-md overflow-hidden flex flex-col'>
                    <div className='border-b px-3 py-2 text-xs font-medium bg-muted'>
                        Files
                    </div>
                    <div className='flex-1 min-h-0'>
                        <FileSidebar
                            pinned={[{ file: 'index.js', state: 'M' as const }]}
                            sections={sections}
                            activePath={activePath}
                            onSelect={handleSelectFile}
                            defaultExpandedPaths={['/', '/src', '/app']}
                        />
                    </div>
                </div>

                {/* Editor */}
                <div className='flex-1 min-w-0 border rounded-md overflow-hidden flex flex-col'>
                    <div className='border-b px-3 py-2 text-xs font-medium bg-muted flex items-center justify-between'>
                        <span className='truncate'>
                            {activePath || 'index.js'}
                        </span>
                    </div>
                    <div className='flex-1 min-h-0'>
                        <CodeEditor
                            value={code}
                            language='javascript'
                            onChange={handleCodeChange}
                        />
                    </div>
                </div>

                {/* Terminal */}
                <div className='w-[40%] min-w-[320px] border rounded-md flex flex-col overflow-hidden'>
                    <div className='border-b px-3 py-2 text-xs font-medium bg-muted'>
                        Terminal
                    </div>
                    <div className='flex-1 min-h-0'>
                        <div
                            ref={xtermRef}
                            className='h-full w-full bg-[#0b0b10]'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullIDE;
