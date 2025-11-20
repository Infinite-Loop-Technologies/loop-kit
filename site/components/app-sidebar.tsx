import * as React from 'react';
import { ChevronRight, File, Folder } from 'lucide-react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarRail,
} from '@/components/ui/sidebar';

// ---------- Types ----------

type FileState = 'U' | 'M' | string;

interface PinnedItem {
    file: string;
    state: FileState;
}

// Recursive node:
// - "page.tsx"
// - ["folderName", child1, child2, ...]
export type TreeNode = string | [string, ...TreeNode[]];

// Dynamic sections: "Atoms" | "Components" | "Libraries" | whatever
export interface FileTreeData extends Record<string, TreeNode[]> {}

// ---------- Sample data ----------

const pinned: PinnedItem[] = [
    { file: 'api/hello/route.ts', state: 'U' },
    { file: 'app/layout.tsx', state: 'M' },
];

const treeData: FileTreeData = {
    Atoms: [
        [
            'api',
            ['hello', 'route.ts'],
            'page.tsx',
            'layout.tsx',
            ['blog', 'page.tsx'],
        ],
    ],
    Components: [['ui', 'button.tsx', 'card.tsx'], 'header.tsx', 'footer.tsx'],
    Libraries: ['util.ts'],
};

// ---------- Sidebar ----------

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarContent>
                {/* Pinned / Changes */}
                <SidebarGroup>
                    <SidebarGroupLabel>Changes</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {pinned.map((item, index) => (
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButton>
                                        <File />
                                        {item.file}
                                    </SidebarMenuButton>
                                    <SidebarMenuBadge>
                                        {item.state}
                                    </SidebarMenuBadge>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Dynamic file sections */}
                {Object.entries(treeData).map(([sectionName, nodes]) => (
                    <SidebarGroup key={sectionName}>
                        <SidebarGroupLabel>{sectionName}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {nodes.map((node, index) => (
                                    <Tree key={index} item={node} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}

// ---------- Tree ----------

function Tree({ item }: { item: TreeNode }) {
    const [name, ...items] = Array.isArray(item) ? item : [item];

    // Leaf / file
    if (!items.length) {
        return (
            <SidebarMenuButton
                isActive={name === 'button.tsx'}
                className='data-[active=true]:bg-transparent'>
                <File />
                {name}
            </SidebarMenuButton>
        );
    }

    // Folder
    return (
        <SidebarMenuItem>
            <Collapsible
                className='group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90'
                defaultOpen={name === 'Components' || name === 'ui'}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <ChevronRight className='transition-transform' />
                        <Folder />
                        {name}
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {items.map((subItem, index) => (
                            <Tree key={index} item={subItem} />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
}
