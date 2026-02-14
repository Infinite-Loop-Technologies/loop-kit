import { AppSidebar } from '@/components/app-sidebar';
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/ui/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Metadata } from 'next';
import { ReactNode } from 'react';
import { getDocsNavigation } from '@/lib/docs/store';
import { isAdminAuthenticated } from '@/lib/docs/auth';

type ChildrenProps = {
    children: ReactNode;
};

export const metadata: Metadata = {
    title: 'loop-kit docs',
    description: 'The awesomest way to build stuff.',
};

export default async function DocsLayout({ children }: ChildrenProps) {
    const [sections, isAdmin] = await Promise.all([
        getDocsNavigation(),
        isAdminAuthenticated(),
    ]);

    return (
        <SidebarProvider>
            <AppSidebar sections={sections} isAdmin={isAdmin} />
            <SidebarInset>
                <header className='flex items-center justify-between border-b px-4'>
                    <div className='flex h-16 shrink-0 items-center gap-2'>
                        <SidebarTrigger className='-ml-1' />
                        <Separator orientation='vertical' className='mr-2 h-4' />
                        <Link href='/docs' className='text-sm font-medium'>
                            loop-kit docs
                        </Link>
                    </div>
                    <div className='flex items-center gap-2'>
                        {isAdmin ? <Badge variant='secondary'>Admin</Badge> : null}
                        <ModeToggle />
                    </div>
                </header>
                <div className='flex flex-1 flex-col gap-4 p-4'>{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}
