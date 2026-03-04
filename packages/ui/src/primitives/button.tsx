import {
    forwardRef,
    type ButtonHTMLAttributes,
    type CSSProperties,
} from 'react';

import { cn } from '../utils';

export type PrimitiveButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    tone?: 'default' | 'outline' | 'ghost' | 'danger';
};

function toneToStyles(tone: PrimitiveButtonProps['tone']): CSSProperties {
    if (tone === 'outline') {
        return {
            background: 'transparent',
            color: 'var(--foreground)',
            borderColor: 'var(--border)',
        };
    }

    if (tone === 'ghost') {
        return {
            background: 'transparent',
            color: 'var(--foreground)',
            borderColor: 'transparent',
        };
    }

    if (tone === 'danger') {
        return {
            background: 'var(--destructive)',
            color: 'var(--destructive-foreground)',
            borderColor: 'transparent',
        };
    }

    return {
        background: 'var(--primary)',
        color: 'var(--primary-foreground)',
        borderColor: 'transparent',
    };
}

export const Button = forwardRef<HTMLButtonElement, PrimitiveButtonProps>(
    function PrimitiveButton(
        { className, style, tone = 'default', ...props },
        ref,
    ) {
        return (
            <button
                ref={ref}
                className={cn('loop-button', className)}
                style={{
                    alignItems: 'center',
                    border: '1px solid',
                    borderRadius: 'var(--loop-radius-md)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    fontFamily: 'var(--loop-typography-familySans)',
                    fontSize: 'var(--loop-typography-sizeSm)',
                    fontWeight: 'var(--loop-typography-weightMedium)',
                    gap: '0.5rem',
                    justifyContent: 'center',
                    lineHeight: 1,
                    minHeight: '2.25rem',
                    padding: '0 0.875rem',
                    transition: 'filter 120ms ease',
                    ...toneToStyles(tone),
                    ...style,
                }}
                {...props}
            />
        );
    },
);
