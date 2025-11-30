import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import './prose.css';

// TODO: Maybe cva stuff? Probably not needed.

function Prose({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<'article'> & {
    asChild?: boolean;
}) {
    const Comp = asChild ? Slot : 'article';

    return (
        <Comp
            data-slot='article'
            className={cn('prose', className)}
            {...props}
        />
    );
}

export { Prose };
