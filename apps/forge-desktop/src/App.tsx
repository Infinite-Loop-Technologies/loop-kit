import {
    ForgeApp,
    createForgeApiDataSource,
    createForgeStubDataSource,
    type ForgeShellConfig,
} from '@loop-kit/forge-app';

const forgeApiBaseUrl = import.meta.env.VITE_FORGE_API_BASE_URL?.trim();
const forgeApiToken = import.meta.env.VITE_FORGE_API_TOKEN?.trim();

const desktopDataSource = forgeApiBaseUrl
    ? createForgeApiDataSource({
          authToken: forgeApiToken || undefined,
          baseUrl: forgeApiBaseUrl,
      })
    : createForgeStubDataSource({
          label: 'desktop preview stub',
      });

const desktopShell: ForgeShellConfig = {
    id: 'forge-desktop',
    title: 'Forge Desktop',
    platform: 'desktop',
    organizationName: 'Infinite Loop Technologies',
    workspaceName: 'loop-kit',
    environmentLabel: 'Tauri desktop shell',
    navigationMode: 'hash',
    skinId: 'forge',
    skinMode: 'dark',
    dataSource: desktopDataSource,
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
