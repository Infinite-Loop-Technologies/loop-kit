import {
    forwardRef,
    type CSSProperties,
    type HTMLAttributes,
} from 'react';

import { createAssetResolver, type AssetResolver } from '../assets';
import { useOptionalUiProviderState } from '../skins';
import { cn } from '../utils';

export type PanelProps = HTMLAttributes<HTMLDivElement> & {
    variant?: 'surface' | 'muted' | 'accent';
    texture?: string;
    resolver?: AssetResolver;
};

function resolvePanelStyles(variant: PanelProps['variant']): CSSProperties {
    if (variant === 'muted') {
        return {
            background: 'color-mix(in oklch, var(--muted) 84%, transparent)',
        };
    }

    if (variant === 'accent') {
        return {
            background: 'color-mix(in oklch, var(--primary) 8%, var(--card))',
        };
    }

    return {
        background: 'var(--card)',
    };
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
    {
        className,
        children,
        style,
        texture,
        variant = 'surface',
        resolver,
        ...props
    },
    ref,
) {
    const ui = useOptionalUiProviderState();
    const activeResolver = resolver ?? ui?.assetResolver ?? createAssetResolver();
    const activeTexture =
        texture ?? ui?.activeTheme.tokens.fx.panelTexture ?? 'asset://texture/panel/noise-01';
    const textureUrl = activeResolver.resolve(activeTexture);

    return (
        <div
            ref={ref}
            className={cn('loop-panel', className)}
            style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--loop-radius-lg)',
                boxShadow: 'var(--loop-elevation-level1)',
                backdropFilter: 'blur(var(--loop-fx-glassBlur))',
                WebkitBackdropFilter: 'blur(var(--loop-fx-glassBlur))',
                color: 'var(--card-foreground)',
                overflow: 'hidden',
                position: 'relative',
                ...resolvePanelStyles(variant),
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
            <div style={{ position: 'relative' }}>{children}</div>
        </div>
    );
});
