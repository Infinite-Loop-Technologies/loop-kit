import { ForgeApp, type ForgeShellConfig } from '@loop-kit/forge-app';

const webShell: ForgeShellConfig = {
    id: 'forge-web',
    title: 'Forge Web',
    platform: 'web',
    organizationName: 'Infinite Loop Technologies',
    workspaceName: 'loop-kit',
    environmentLabel: 'Vite web shell',
    navigationMode: 'history',
    skinId: 'forge',
    skinMode: 'dark',
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
