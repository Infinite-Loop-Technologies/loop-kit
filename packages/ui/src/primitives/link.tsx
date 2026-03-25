import {
    forwardRef,
    type AnchorHTMLAttributes,
} from 'react';

import { cn } from '../utils';

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    tone?: 'default' | 'muted' | 'accent';
};

function resolveTone(tone: LinkProps['tone']): string {
    if (tone === 'muted') {
        return 'var(--muted-foreground)';
    }

    if (tone === 'accent') {
        return 'var(--primary)';
    }

    return 'var(--foreground)';
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
    { className, style, tone = 'accent', ...props },
    ref,
) {
    return (
        <a
            ref={ref}
            className={cn(className)}
            style={{
                color: resolveTone(tone),
                fontFamily: 'var(--loop-typography-familySans)',
                fontSize: 'var(--loop-typography-sizeMd)',
                fontWeight: 'var(--loop-typography-weightMedium)',
                textDecoration: 'none',
                textUnderlineOffset: '0.18em',
                transition: 'color 140ms ease, opacity 140ms ease',
                ...style,
            }}
            {...props}
        />
    );
});
