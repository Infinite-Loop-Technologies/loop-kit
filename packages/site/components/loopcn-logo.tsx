import { cn } from '@/lib/utils';

type LoopCnLogoProps = {
    className?: string;
    showDocsTag?: boolean;
};

export function LoopCnLogo({ className, showDocsTag = false }: LoopCnLogoProps) {
    return (
        <span className={cn('inline-flex items-center gap-2.5', className)}>
            <span className='relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10'>
                <span className='absolute inset-0 rounded-md bg-primary/15 blur-[1px] animate-pulse' />
                <span className='relative grid grid-cols-2 grid-rows-2 gap-0.5'>
                    <span className='h-1.5 w-1.5 rounded-[2px] bg-primary' />
                    <span className='h-1.5 w-1.5 rounded-[2px] bg-primary/75' />
                    <span className='h-1.5 w-1.5 rounded-[2px] bg-primary/75' />
                    <span className='h-1.5 w-1.5 rounded-[2px] bg-primary' />
                </span>
            </span>
            <span className='inline-flex items-baseline gap-1.5'>
                <span className='text-sm font-semibold tracking-tight'>loop</span>
                <span className='rounded-sm border border-border/70 bg-muted px-1.5 py-0.5 text-[0.68rem] font-semibold leading-none tracking-[0.08em] text-muted-foreground'>
                    /cn
                </span>
                {showDocsTag ? (
                    <span className='text-xs font-medium text-muted-foreground'>
                        docs
                    </span>
                ) : null}
            </span>
        </span>
    );
}
