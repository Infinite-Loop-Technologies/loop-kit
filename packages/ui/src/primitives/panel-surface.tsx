import {
    forwardRef,
    type CSSProperties,
} from 'react';

import { createAssetResolver } from '../assets';
import { useOptionalUiProviderState } from '../skins';
import { cn } from '../utils';
import type {
    PanelSurfaceFrameProps,
    PanelSurfaceRenderComponent,
    PanelSurfaceVariant,
} from '../extensions/types';

function resolvePanelSurfaceStyles(
    variant: PanelSurfaceVariant,
): CSSProperties {
    if (variant === 'muted') {
        return {
            background:
                'color-mix(in oklch, var(--secondary) 72%, var(--card))',
            color: 'var(--secondary-foreground)',
        };
    }

    if (variant === 'accent') {
        return {
            background:
                'color-mix(in oklch, var(--accent) 72%, var(--card))',
            color: 'var(--accent-foreground)',
        };
    }

    return {
        background: 'var(--card)',
        color: 'var(--card-foreground)',
    };
}

export const DefaultPanelSurfaceFrame: PanelSurfaceRenderComponent = ({
    children,
    className,
    contentClassName,
    contentStyle,
    resolver,
    rootRef,
    style,
    texture,
    variant = 'surface',
    ...props
}) => {
    const ui = useOptionalUiProviderState();
    const activeResolver = resolver ?? ui?.assetResolver ?? createAssetResolver();
    const activeTexture =
        texture ?? ui?.activeTheme.tokens.fx.panelTexture ?? 'asset://texture/panel/noise-01';
    const textureUrl = activeResolver.resolve(activeTexture);

    return (
        <div
            ref={rootRef}
            className={cn('loop-panel-surface', className)}
            style={{
                border: '1px solid color-mix(in oklch, var(--border) 88%, transparent)',
                borderRadius: 'var(--loop-radius-lg)',
                boxShadow: 'var(--loop-elevation-level1)',
                backdropFilter: 'blur(var(--loop-fx-glassBlur))',
                WebkitBackdropFilter: 'blur(var(--loop-fx-glassBlur))',
                display: 'flex',
                flexDirection: 'column',
                isolation: 'isolate',
                minHeight: 0,
                overflow: 'hidden',
                position: 'relative',
                ...resolvePanelSurfaceStyles(variant),
                ...style,
            }}
            {...props}>
            {textureUrl ? (
                <div
                    aria-hidden='true'
                    style={{
                        backgroundImage: `url(${textureUrl})`,
                        backgroundRepeat: 'repeat',
                        inset: 0,
                        opacity: 'var(--loop-fx-panelOverlayOpacity)',
                        pointerEvents: 'none',
                        position: 'absolute',
                    }}
                />
            ) : null}
            <div
                className={cn('loop-panel-surface-content', contentClassName)}
                style={{
                    flex: '1 1 auto',
                    minHeight: 0,
                    position: 'relative',
                    ...contentStyle,
                }}>
                {children}
            </div>
        </div>
    );
};

export const PanelSurfaceFrame = forwardRef<HTMLDivElement, PanelSurfaceFrameProps>(
    function PanelSurfaceFrame(props, ref) {
        const ui = useOptionalUiProviderState();
        const Extension = ui?.extensionRegistry.getSlot('panel.surface');
        const nextProps = {
            ...props,
            rootRef: ref,
        };

        if (Extension) {
            return (
                <Extension
                    DefaultSurface={DefaultPanelSurfaceFrame}
                    {...nextProps}
                />
            );
        }

        return <DefaultPanelSurfaceFrame {...nextProps} />;
    },
);
