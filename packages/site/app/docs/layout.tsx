import { AppSidebar } from '@/components/app-sidebar';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/ui/theme-toggle';
import { Separator } from '@radix-ui/react-separator';
import { Metadata } from 'next';
import { ReactNode } from 'react';

type ChildrenProps = {
    children: ReactNode;
};

export const metadata: Metadata = {
    title: 'loop-kit docs',
    description: 'The awesomest way to build stuff.',
};

export default function DocsLayout({ children }: ChildrenProps) {
    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className='flex items-center justify-between  border-b px-4'>
                        <div className='flex h-16 shrink-0 items-center gap-2'>
                            <SidebarTrigger className='-ml-1' />
                            <Separator
                                orientation='vertical'
                                className='mr-2 data-[orientation=vertical]:h-4'
                            />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className='hidden md:block'>
                                        <BreadcrumbLink href='#'>
                                            Infinite Design System
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className='hidden md:block' />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>Docs</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <ModeToggle />
                    </header>
                    <div className='flex flex-1 flex-col gap-4 p-4'>
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
