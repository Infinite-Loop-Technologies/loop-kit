import * as React from 'react';
import { motion } from 'motion/react';
import {
    type PanelSurfaceFrameProps,
    type UiExtensionDefinition,
} from '@loop-kit/ui/extensions';
import { useUiProviderState } from '@loop-kit/ui/skins';
import { cn } from '@loop-kit/ui/utils';

function AtelierPanelSurface({
    DefaultSurface,
    children,
    className,
    contentClassName,
    contentStyle,
    ...props
}: PanelSurfaceFrameProps & {
    DefaultSurface: (props: PanelSurfaceFrameProps) => React.ReactNode;
}) {
    const { activeSkin } = useUiProviderState();

    if (activeSkin.id !== 'atelier') {
        return (
            <DefaultSurface
                {...props}
                className={className}
                contentClassName={contentClassName}
                contentStyle={contentStyle}>
                {children}
            </DefaultSurface>
        );
    }

    return (
        <DefaultSurface
            {...props}
            className={cn('ring-1 ring-white/30', className)}
            contentClassName={cn('relative overflow-hidden', contentClassName)}
            contentStyle={{
                boxShadow:
                    'inset 0 1px 0 color-mix(in oklch, white 65%, transparent), inset 0 0 0 1px color-mix(in oklch, var(--accent) 12%, transparent)',
                ...contentStyle,
            }}
            style={{
                background:
                    'linear-gradient(180deg, color-mix(in oklch, white 80%, var(--card)) 0%, color-mix(in oklch, var(--accent) 10%, var(--card)) 100%)',
                border: '1px solid color-mix(in oklch, var(--accent) 26%, var(--border))',
                boxShadow:
                    '0 28px 60px color-mix(in oklch, var(--accent) 14%, transparent), var(--loop-elevation-level2)',
                ...props.style,
            }}>
            <motion.div
                data-loop-panel-extension='atelier-panel-surface'
                initial={{ opacity: 0, scale: 0.985, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className='relative flex min-h-0 flex-1 flex-col'>
                <div
                    aria-hidden='true'
                    className='pointer-events-none absolute inset-[10px] rounded-[calc(var(--loop-radius-xl)*0.92)] border border-white/35'
                />
                <div
                    aria-hidden='true'
                    className='pointer-events-none absolute inset-0 opacity-70'
                    style={{
                        background:
                            'radial-gradient(circle at top left, color-mix(in oklch, white 70%, transparent), transparent 36%), radial-gradient(circle at bottom right, color-mix(in oklch, var(--accent) 18%, transparent), transparent 34%)',
                    }}
                />
                <div className='relative flex min-h-0 flex-1 flex-col'>{children}</div>
            </motion.div>
        </DefaultSurface>
    );
}

export const atelierPanelSurfaceExtension: UiExtensionDefinition = {
    id: 'atelier-panel-surface',
    label: 'Atelier Panel Surface',
    description: 'Trusted local panel chrome override for the atelier skin family.',
    metadata: {
        trusted: true,
    },
    slots: {
        'panel.surface': AtelierPanelSurface,
    },
};

export default atelierPanelSurfaceExtension;
