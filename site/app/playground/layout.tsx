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
                <div>{children}</div>
            </SidebarProvider>
        </>
    );
}
