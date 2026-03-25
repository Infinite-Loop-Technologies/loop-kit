'use client';

import {
    createContext,
    useContext,
    useMemo,
    type ComponentType,
    type PropsWithChildren,
} from 'react';

import { type IconRegistry } from '../icons';
import {
    Button as BaseButton,
    Link as BaseLink,
    Panel as BasePanel,
    Text as BaseText,
    type LinkProps,
    type PanelProps,
    type PrimitiveButtonProps,
    type TextProps,
} from '../primitives';
import {
    UiProvider,
    type ResolvedUiSkin,
    type UiSkinDefinition,
} from '../skins';
import type { ThemeMode } from '../theme';
import type { UiSkinRegistry } from '../skins/registry';

export type UiPrimitiveComponentMap = {
    Button: ComponentType<PrimitiveButtonProps>;
    Link: ComponentType<LinkProps>;
    Panel: ComponentType<PanelProps>;
    Text: ComponentType<TextProps>;
};

export type UiThemePackDefinition = {
    id: string;
    label: string;
    description?: string;
    tags?: string[];
    skin: UiSkinDefinition | ResolvedUiSkin;
    components?: Partial<UiPrimitiveComponentMap>;
    iconRegistry?: IconRegistry;
};

export type ThemePackProviderProps = PropsWithChildren<{
    pack: UiThemePackDefinition;
    mode?: ThemeMode;
    target?: HTMLElement | null;
    registry?: UiSkinRegistry;
}>;

type ThemePackContextValue = {
    activePack: UiThemePackDefinition;
    components: UiPrimitiveComponentMap;
};

const defaultPrimitiveComponents: UiPrimitiveComponentMap = {
    Button: BaseButton,
    Link: BaseLink,
    Panel: BasePanel,
    Text: BaseText,
};

const ThemePackContext = createContext<ThemePackContextValue | undefined>(undefined);

function usePrimitiveComponent<K extends keyof UiPrimitiveComponentMap>(
    key: K,
): UiPrimitiveComponentMap[K] {
    const context = useContext(ThemePackContext);
    return (context?.components[key] ?? defaultPrimitiveComponents[key]) as UiPrimitiveComponentMap[K];
}

export function ThemePackProvider({
    children,
    pack,
    mode,
    target,
    registry,
}: ThemePackProviderProps) {
    const components = useMemo(
        () => ({
            ...defaultPrimitiveComponents,
            ...(pack.components ?? {}),
        }),
        [pack],
    );
    const contextValue = useMemo<ThemePackContextValue>(
        () => ({
            activePack: pack,
            components,
        }),
        [components, pack],
    );

    return (
        <ThemePackContext.Provider value={contextValue}>
            <UiProvider
                skin={pack.skin}
                mode={mode}
                target={target}
                registry={registry}
                iconRegistry={pack.iconRegistry}>
                {children}
            </UiProvider>
        </ThemePackContext.Provider>
    );
}

export function useThemePack(): ThemePackContextValue | undefined {
    return useContext(ThemePackContext);
}

export function ThemedPanel(props: PanelProps) {
    const Component = usePrimitiveComponent('Panel');
    return <Component {...props} />;
}

export function ThemedButton(props: PrimitiveButtonProps) {
    const Component = usePrimitiveComponent('Button');
    return <Component {...props} />;
}

export function ThemedText(props: TextProps) {
    const Component = usePrimitiveComponent('Text');
    return <Component {...props} />;
}

export function ThemedLink(props: LinkProps) {
    const Component = usePrimitiveComponent('Link');
    return <Component {...props} />;
}
