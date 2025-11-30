'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

// ----------------------------------------
// Surface
// ----------------------------------------
export const Surface = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        variant?: 'card' | 'subtle' | 'ghost';
        padded?: boolean;
    }
>(function Surface({ className, variant = 'card', padded, ...props }, ref) {
    return (
        <div
            ref={ref}
            className={cn(
                'rounded-md border',
                variant === 'card' && 'bg-card',
                variant === 'subtle' && 'bg-muted/30',
                variant === 'ghost' && 'bg-transparent border-transparent',
                padded && 'p-3',
                className
            )}
            {...props}
        />
    );
});

// ----------------------------------------
// Button / IconButton (very light wrappers)
// ----------------------------------------
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    tone?: 'default' | 'secondary' | 'destructive' | 'outline';
    size?: 'xs' | 'sm' | 'md';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    function Button(
        { className, asChild, tone = 'default', size = 'sm', ...props },
        ref
    ) {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-md text-xs transition-colors',
                    'focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring',
                    size === 'xs' && 'h-6 px-2',
                    size === 'sm' && 'h-7 px-2.5',
                    size === 'md' && 'h-8 px-3',
                    tone === 'default' &&
                        'bg-primary text-primary-foreground hover:bg-primary/90',
                    tone === 'secondary' &&
                        'bg-secondary text-secondary-foreground hover:bg-secondary/90',
                    tone === 'destructive' &&
                        'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                    tone === 'outline' && 'border bg-background hover:bg-muted',
                    className
                )}
                {...props}
            />
        );
    }
);

export const IconButton = React.forwardRef<
    HTMLButtonElement,
    Omit<ButtonProps, 'children'> & { children?: React.ReactNode }
>(function IconButton(
    { className, tone = 'outline', size = 'xs', ...props },
    ref
) {
    return (
        <Button
            ref={ref}
            tone={tone}
            size={size}
            className={cn('gap-1 px-2', className)}
            {...props}
        />
    );
});
// ----------------------------------------
// Toolbar (typed slots)
// ----------------------------------------
type ToolbarRootProps = React.HTMLAttributes<HTMLDivElement> & {
    dense?: boolean;
};

const ToolbarRoot = React.forwardRef<HTMLDivElement, ToolbarRootProps>(
    function ToolbarRoot({ className, dense, ...props }, ref) {
        return (
            <div
                ref={ref}
                data-dense={dense ? 'true' : 'false'}
                className={cn(
                    // base layout
                    'flex items-center gap-2 border-b bg-muted/30',
                    // default (non-dense)
                    'h-10 px-3',
                    // dense override
                    'data-[dense=true]:h-8 data-[dense=true]:px-2',
                    className
                )}
                {...props}
            />
        );
    }
);

const ToolbarLeft = ({
    className,
    ...p
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex items-center gap-1', className)} {...p} />
);
const ToolbarRight = ({
    className,
    ...p
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('ml-auto flex items-center gap-1', className)} {...p} />
);

export const Toolbar = Object.assign(ToolbarRoot, {
    Left: ToolbarLeft,
    Right: ToolbarRight,
});
