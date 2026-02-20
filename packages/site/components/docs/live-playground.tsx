'use client';

import * as React from 'react';
import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeEditor from '@/registry/new-york/blocks/code-editor/components/code-editor';
import type { SupportedPlaygroundPreset } from '@/lib/docs/embeds';

type PlaygroundPreset = {
    title: string;
    html: string;
    css: string;
    js: string;
};

const PLAYGROUND_PRESETS: Record<SupportedPlaygroundPreset, PlaygroundPreset> = {
    starter: {
        title: 'Starter',
        html: `<main class="app">
  <h1>loop/cn playground</h1>
  <p>Edit the code tabs and this preview updates in real time.</p>
  <button id="action">Click me</button>
  <pre id="log"></pre>
</main>`,
        css: `:root { color-scheme: dark; }
body {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  background: #0a0b0f;
  color: #f7f7fb;
}
.app {
  padding: 24px;
  max-width: 720px;
  margin: 0 auto;
}
button {
  border: 1px solid #3b82f6;
  background: #111827;
  color: #e5edff;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
pre {
  margin-top: 12px;
  padding: 10px;
  border: 1px solid #1f2937;
  border-radius: 8px;
  background: #07080b;
}`,
        js: `const button = document.getElementById('action');
const log = document.getElementById('log');
let count = 0;

button?.addEventListener('click', () => {
  count += 1;
  if (log) {
    log.textContent = 'Clicked ' + count + ' time(s)';
  }
});`,
    },
    layout: {
        title: 'Layout Grid',
        html: `<section class="surface">
  <header>Toolbar</header>
  <aside>Sidebar</aside>
  <main>Main content</main>
  <footer>Status bar</footer>
</section>`,
        css: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0d1117;
  color: #e6edf3;
  font: 14px/1.4 'IBM Plex Sans', ui-sans-serif, system-ui;
}
.surface {
  width: min(860px, 92vw);
  height: 440px;
  border: 1px solid #30363d;
  border-radius: 12px;
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: 52px 1fr 36px;
  grid-template-areas:
    'header header'
    'aside main'
    'footer footer';
  overflow: hidden;
}
header { grid-area: header; background: #161b22; padding: 14px; }
aside { grid-area: aside; background: #0f141a; padding: 14px; border-right: 1px solid #30363d; }
main { grid-area: main; padding: 14px; }
footer { grid-area: footer; background: #161b22; padding: 8px 14px; }`,
        js: `document.body.dataset.ready = 'true';`,
    },
};

function toSrcDoc(html: string, css: string, js: string) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>${css}</style>
  </head>
  <body>
    ${html}
    <script type="module">${js}<\/script>
  </body>
</html>`;
}

type LivePlaygroundProps = {
    preset: SupportedPlaygroundPreset;
    height?: number;
};

export function LivePlayground({ preset, height = 460 }: LivePlaygroundProps) {
    const template = PLAYGROUND_PRESETS[preset] ?? PLAYGROUND_PRESETS.starter;
    const [html, setHtml] = React.useState(template.html);
    const [css, setCss] = React.useState(template.css);
    const [js, setJs] = React.useState(template.js);
    const [tab, setTab] = React.useState<'html' | 'css' | 'js'>('html');

    React.useEffect(() => {
        setHtml(template.html);
        setCss(template.css);
        setJs(template.js);
        setTab('html');
    }, [template]);

    const srcDoc = React.useMemo(() => toSrcDoc(html, css, js), [html, css, js]);

    return (
        <div className='overflow-hidden rounded-xl border bg-card'>
            <div className='flex items-center justify-between border-b px-3 py-2'>
                <p className='text-sm font-medium'>{template.title} Playground</p>
                <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                        setHtml(template.html);
                        setCss(template.css);
                        setJs(template.js);
                    }}>
                    <RotateCcw className='mr-1.5 h-3.5 w-3.5' />
                    Reset
                </Button>
            </div>
            <div className='grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(320px,40%)]'>
                <div className='min-h-[320px] border-b lg:border-b-0 lg:border-r'>
                    <iframe
                        title={`${template.title} playground preview`}
                        srcDoc={srcDoc}
                        className='h-full w-full border-0 bg-background'
                        style={{ minHeight: `${height}px` }}
                        sandbox='allow-scripts allow-forms allow-modals allow-popups'
                    />
                </div>
                <div className='min-h-[320px]'>
                    <Tabs
                        value={tab}
                        onValueChange={(value) => {
                            if (value === 'html' || value === 'css' || value === 'js') {
                                setTab(value);
                            }
                        }}
                        className='h-full'>
                        <div className='border-b px-3 py-2'>
                            <TabsList>
                                <TabsTrigger value='html'>html</TabsTrigger>
                                <TabsTrigger value='css'>css</TabsTrigger>
                                <TabsTrigger value='js'>js</TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value='html' className='mt-0'>
                            <CodeEditor
                                value={html}
                                height={`${height}px`}
                                onChange={(next) => setHtml(next)}
                            />
                        </TabsContent>
                        <TabsContent value='css' className='mt-0'>
                            <CodeEditor
                                value={css}
                                height={`${height}px`}
                                onChange={(next) => setCss(next)}
                            />
                        </TabsContent>
                        <TabsContent value='js' className='mt-0'>
                            <CodeEditor
                                value={js}
                                height={`${height}px`}
                                onChange={(next) => setJs(next)}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
