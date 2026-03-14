import {
    ForgeApp,
    createForgeApiDataSource,
    createForgeStubDataSource,
    type ForgeShellConfig,
} from '@loop-kit/forge-app';

const forgeApiBaseUrl = import.meta.env.VITE_FORGE_API_BASE_URL?.trim();
const forgeApiToken = import.meta.env.VITE_FORGE_API_TOKEN?.trim();

const webDataSource = forgeApiBaseUrl
    ? createForgeApiDataSource({
          authToken: forgeApiToken || undefined,
          baseUrl: forgeApiBaseUrl,
      })
    : createForgeStubDataSource({
          label: 'web preview stub',
      });

const webShell: ForgeShellConfig = {
    id: 'forge-web',
    title: 'Forge',
    platform: 'web',
    organizationName: 'Infinite Loop Technologies',
    workspaceName: 'loop-kit',
    environmentLabel: 'Web preview',
    navigationMode: 'history',
    skinId: 'forge',
    skinMode: 'dark',
    dataSource: webDataSource,
    capabilitySummary: [
        'Browser-native deep links for shell routes',
        'Preview-deploy friendly static build output',
        'Thin shell wrapper around the shared Forge app package',
    ],
    notes: [
        'Web shell owns browser routing and deployment concerns.',
        'Shared frontend package stays free of web-specific deploy logic.',
        'Future auth and data loading can attach without replacing the shell frame.',
    ],
};

export function App() {
    return <ForgeApp shell={webShell} />;
}
