import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { InstallSnippet } from '@/components/snippets';
import { getRegistryItemByName } from '@/lib/docs/registry';

type RegistryItemLinkCardProps = {
    itemName: string;
    title?: string;
};

export async function RegistryItemLinkCard({
    itemName,
    title,
}: RegistryItemLinkCardProps) {
    const item = await getRegistryItemByName(itemName);
    const displayTitle = title ?? item?.title ?? itemName;

    return (
        <section className='space-y-2'>
            <h2 className='text-lg font-medium'>{displayTitle}</h2>
            <div className='flex flex-wrap items-center gap-2'>
                <Button variant='outline' size='sm' asChild>
                    <Link href={`/r/${itemName}.json`}>
                        View registry item JSON
                    </Link>
                </Button>
            </div>
            <div className='rounded-xl border bg-card/60 p-3'>
                <InstallSnippet itemName={itemName} variant='compact' />
            </div>
        </section>
    );
}

