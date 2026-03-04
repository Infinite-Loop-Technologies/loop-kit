import { Slot } from '@radix-ui/react-slot';

import { cn } from './utils';
import './prose.css';

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
