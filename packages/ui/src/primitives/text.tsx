import {
    forwardRef,
    type CSSProperties,
    type ElementType,
    type HTMLAttributes,
} from 'react';

import { cn } from '../utils';

export type TextProps = HTMLAttributes<HTMLElement> & {
    as?: ElementType;
    tone?: 'default' | 'muted' | 'accent';
};

function resolveTone(tone: TextProps['tone']): CSSProperties {
    if (tone === 'muted') {
        return { color: 'var(--muted-foreground)' };
    }

    if (tone === 'accent') {
        return { color: 'var(--primary)' };
    }

    return { color: 'var(--foreground)' };
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
    { as: As = 'p', className, style, tone = 'default', ...props },
    ref,
) {
    return (
        <As
            ref={ref}
            className={cn(className)}
            style={{
                fontFamily: 'var(--loop-typography-familySans)',
                fontSize: 'var(--loop-typography-sizeMd)',
                lineHeight: 'var(--loop-typography-lineHeight)',
                margin: 0,
                ...resolveTone(tone),
                ...style,
            }}
            {...props}
        />
    );
});
