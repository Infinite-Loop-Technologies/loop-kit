import { useMemo, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';

import { Button } from '@loop-kit/ui/primitives';
import { stories, type UiStory } from '@loop-kit/ui/stories';
import { useTheme } from '@loop-kit/ui/theme';

import { filterCatalog } from './componentCatalog';

type ThemePreset = {
    id: string;
    label: string;
};

type AppProps = {
    themePreset: string;
    presets: ThemePreset[];
    onThemePresetChange: (nextPreset: string) => void;
};

function storyMatchesQuery(story: UiStory, query: string): boolean {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
        return true;
    }

    const tags = story.tags ?? [];
    const haystack = `${story.id} ${story.title} ${tags.join(' ')}`.toLowerCase();
    return haystack.includes(trimmed);
}

function copyToClipboard(value: string): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        return navigator.clipboard.writeText(value);
    }

    return Promise.resolve();
}

function CommandButton({
    label,
    command,
}: {
    label: string;
    command: string;
}) {
    const [copied, setCopied] = useState(false);

    return (
        <Button
            tone='outline'
            onClick={async () => {
                await copyToClipboard(command);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
            }}>
            {copied ? `${label}: copied` : label}
        </Button>
    );
}

function Section({
    section,
    query,
}: {
    section: UiStory['section'];
    query: string;
}) {
    const sectionStories = stories.filter(
        (story) => story.section === section && storyMatchesQuery(story, query),
    );

    if (sectionStories.length === 0) {
        return (
            <section className='workbench-main'>
                <article className='story-card'>
                    <header className='story-header'>No stories matched.</header>
                </article>
            </section>
        );
    }

    return (
        <section className='workbench-main'>
            {sectionStories.map((story) => (
                <article className='story-card' key={story.id}>
                    <header className='story-header'>
                        <div>
                            <div>{story.title}</div>
                            <small className='story-id'>{story.id}</small>
                        </div>
                    </header>
                    <div className='story-body'>{story.render()}</div>
                </article>
            ))}
        </section>
    );
}

function ComponentsSection({ query }: { query: string }) {
    const components = useMemo(() => filterCatalog(query), [query]);
    if (components.length === 0) {
        return (
            <section className='workbench-main'>
                <article className='story-card'>
                    <header className='story-header'>No components matched.</header>
                </article>
            </section>
        );
    }

    return (
        <section className='workbench-main'>
            {components.map((component) => (
                <article className='story-card' key={component.id}>
                    <header className='story-header'>
                        <div>
                            <div>{component.name}</div>
                            <small className='story-id'>
                                {component.id}@{component.version}
                            </small>
                        </div>
                    </header>
                    <div className='story-body'>
                        {component.description ? <p>{component.description}</p> : null}
                        <p>
                            files: {component.fileCount} | manifest: {component.manifestPath}
                        </p>
                        {component.tags.length > 0 ? (
                            <p>tags: {component.tags.join(', ')}</p>
                        ) : null}
                        <div className='command-row'>
                            <CommandButton label='Install command' command={component.installCommand} />
                            <CommandButton label='Adopt command' command={component.adoptCommand} />
                        </div>
                    </div>
                </article>
            ))}
        </section>
    );
}

function ThemeSwitch({
    themePreset,
    presets,
    onThemePresetChange,
}: {
    themePreset: string;
    presets: ThemePreset[];
    onThemePresetChange: (nextPreset: string) => void;
}) {
    const { mode, setMode } = useTheme();

    return (
        <div className='theme-controls'>
            <label className='theme-select'>
                Theme:
                <select
                    value={themePreset}
                    onChange={(event) => onThemePresetChange(event.target.value)}>
                    {presets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                            {preset.label}
                        </option>
                    ))}
                </select>
            </label>
            <Button
                tone='outline'
                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
                Mode: {mode}
            </Button>
        </div>
    );
}

export function App({
    themePreset,
    presets,
    onThemePresetChange,
}: AppProps) {
    const [query, setQuery] = useState('');

    return (
        <div className='workbench-shell'>
            <header className='workbench-header'>
                <strong>Loop Workbench</strong>
                <nav className='workbench-nav'>
                    <NavLink to='/primitives'>Primitives</NavLink>
                    <NavLink to='/blocks'>Blocks</NavLink>
                    <NavLink to='/legacy'>Legacy</NavLink>
                    <NavLink to='/components'>Components</NavLink>
                </nav>
                <input
                    className='workbench-search'
                    value={query}
                    placeholder='Search id/name/tags'
                    onChange={(event) => setQuery(event.target.value)}
                />
                <ThemeSwitch
                    themePreset={themePreset}
                    presets={presets}
                    onThemePresetChange={onThemePresetChange}
                />
            </header>

            <Routes>
                <Route path='/' element={<Navigate replace to='/primitives' />} />
                <Route path='/primitives' element={<Section section='primitives' query={query} />} />
                <Route path='/blocks' element={<Section section='blocks' query={query} />} />
                <Route path='/legacy' element={<Section section='legacy' query={query} />} />
                <Route path='/components' element={<ComponentsSection query={query} />} />
            </Routes>
        </div>
    );
}
