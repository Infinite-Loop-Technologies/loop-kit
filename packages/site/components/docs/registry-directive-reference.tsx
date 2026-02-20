import type { RegistryItemMeta } from '@/lib/docs/types';

type RegistryDirectiveReferenceProps = {
    registryItems: RegistryItemMeta[];
    className?: string;
};

export function RegistryDirectiveReference({
    registryItems,
    className,
}: RegistryDirectiveReferenceProps) {
    return (
        <div className={className}>
            <p className='text-xs text-muted-foreground'>
                Embed blocks directly in markdown:
                <code className='mx-1'>
                    {'{{demo item="graphite-studio" mode="iframe" size="large"}}'}
                </code>
                and
                <code className='mx-1'>
                    {'{{registry-item-link item="graphite-studio"}}'}
                </code>
                .
            </p>
            <div className='mt-2 max-h-40 overflow-auto rounded-md border bg-muted/30 p-2 text-xs'>
                {registryItems.length === 0 ? (
                    <p className='text-muted-foreground'>No registry items found.</p>
                ) : (
                    <ul className='space-y-1'>
                        {registryItems.map((item) => (
                            <li key={item.name} className='flex items-center justify-between gap-2'>
                                <code className='rounded bg-background px-1 py-0.5'>
                                    {item.name}
                                </code>
                                <span className='text-muted-foreground'>
                                    {item.title ?? item.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

