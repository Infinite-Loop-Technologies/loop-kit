'use client';

import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Home, ShieldCheck } from 'lucide-react';

import type { DocNavSection } from '@/lib/docs/types';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
    sections: DocNavSection[];
    isAdmin: boolean;
};

export function AppSidebar({ sections, isAdmin, ...props }: AppSidebarProps) {
    const pathname = usePathname();

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === '/docs'}>
                            <Link href='/docs'>
                                <Home />
                                Docs Home
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {isAdmin ? (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === '/docs/admin'}>
                                <Link href='/docs/admin'>
                                    <ShieldCheck />
                                    Admin Panel
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ) : null}
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {sections.map((section) => (
                    <SidebarGroup key={section.name}>
                        <SidebarGroupLabel>{section.name}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {section.pages.map((page) => {
                                    const href = `/docs/${page.slug}`;
                                    return (
                                        <SidebarMenuItem key={page.slug}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={pathname === href}
                                                tooltip={page.description || page.title}>
                                                <Link href={href}>
                                                    <FileText />
                                                    {page.title}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    );
}
