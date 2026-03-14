import type { ThemeMode } from '@loop-kit/ui';

export type ForgeRouteId =
    | 'home'
    | 'workspace'
    | 'runs'
    | 'settings'
    | 'billing';

export type ForgePlatformKind = 'web' | 'desktop' | 'mobile';
export type ForgeNavigationMode = 'history' | 'hash' | 'memory';

export type ForgeRouteDefinition = {
    id: ForgeRouteId;
    path: string;
    navLabel: string;
    title: string;
    description: string;
    kicker: string;
};

export type ForgeShellConfig = {
    id: string;
    title: string;
    platform: ForgePlatformKind;
    organizationName: string;
    workspaceName: string;
    environmentLabel: string;
    navigationMode?: ForgeNavigationMode;
    skinId?: string;
    skinMode?: ThemeMode;
    capabilitySummary?: readonly string[];
    notes?: readonly string[];
};
