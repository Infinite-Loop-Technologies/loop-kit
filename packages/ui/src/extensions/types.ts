import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';

import type { AssetResolver } from '../assets';

export type PanelSurfaceVariant = 'surface' | 'muted' | 'accent';
export type UiExtensionSlotId = 'panel.surface';

export type PanelSurfaceFrameProps = HTMLAttributes<HTMLDivElement> & {
    children?: ReactNode;
    contentClassName?: string;
    contentStyle?: CSSProperties;
    resolver?: AssetResolver;
    rootRef?: Ref<HTMLDivElement>;
    texture?: string;
    variant?: PanelSurfaceVariant;
};

export type PanelSurfaceRenderComponent = (
    props: PanelSurfaceFrameProps,
) => ReactNode;

export type UiPanelSurfaceComponent = (
    props: PanelSurfaceFrameProps & {
        DefaultSurface: PanelSurfaceRenderComponent;
    },
) => ReactNode;

export type UiExtensionDefinition = {
    id: string;
    label?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    slots?: Partial<{
        'panel.surface': UiPanelSurfaceComponent;
    }>;
};

export type UiExtensionRegistry = {
    definitions: Record<string, UiExtensionDefinition>;
    enabledIds: readonly string[];
    getSlot: (slotId: UiExtensionSlotId) => UiPanelSurfaceComponent | undefined;
};
