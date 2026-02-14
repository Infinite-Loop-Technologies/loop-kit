import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function DocNotFound() {
    return (
        <div className='mx-auto flex w-full max-w-2xl flex-col gap-4 py-10'>
            <h1 className='text-2xl font-semibold tracking-tight'>
                Docs page not found
            </h1>
            <p className='text-muted-foreground'>
                The requested page does not exist or is currently unpublished.
            </p>
            <div>
                <Button asChild>
                    <Link href='/docs'>Back to docs home</Link>
                </Button>
            </div>
        </div>
    );
}
