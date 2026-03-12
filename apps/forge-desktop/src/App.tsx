import { ForgeApp, type ForgeShellConfig } from '@loop-kit/forge-app';

const desktopShell: ForgeShellConfig = {
    id: 'forge-desktop',
    title: 'Forge Desktop',
    platform: 'desktop',
    organizationName: 'Infinite Loop Technologies',
    workspaceName: 'loop-kit',
    environmentLabel: 'Tauri desktop shell',
    navigationMode: 'hash',
    capabilitySummary: [
        'Tauri v2 native shell around the shared Forge frontend package',
        'Hash-safe route handling for local desktop bootstrapping',
        'Rust host scaffold ready for future platform bridge commands',
    ],
    notes: [
        'Desktop-specific bridges should remain app-owned in this shell package.',
        'The Rust entrypoint already uses the lib/main split needed for future mobile support.',
        'Native packaging is intentionally separate from the default monorepo build script.',
    ],
};

export function App() {
    return <ForgeApp shell={desktopShell} />;
}
