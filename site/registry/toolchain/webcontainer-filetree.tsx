import * as React from 'react';
import type { WebContainer } from '@webcontainer/api';
import {
    ChevronRight,
    File as FileIcon,
    Folder as FolderIcon,
} from 'lucide-react';

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

export type FileState = 'U' | 'M' | string;

export interface PinnedItem {
    file: string; // full path, e.g. "src/app/page.tsx"
    state: FileState; // git-ish state or any label
}

export type FileKind = 'file' | 'directory';

export interface FileTreeNode {
    name: string; // basename, e.g. "page.tsx" or "src"
    path: string; // full path from root, e.g. "/src/page.tsx"
    kind: FileKind;
    children?: FileTreeNode[]; // only for kind === "directory"
}

export interface FileTreeSection {
    id: string;
    label: string;
    nodes: FileTreeNode[];
}

export interface FileTreeProps {
    nodes: FileTreeNode[];
    activePath?: string | null;
    onSelect?: (node: FileTreeNode) => void;
    /**
     * Optional: which directory paths should be expanded by default.
     * E.g. ["/", "/src", "/src/app"]
     */
    defaultExpandedPaths?: string[];
}

/**
 * Sidebar wrapper that matches your existing UI:
 * - "Changes" group for pinned items
 * - dynamic sections (Atoms / Components / Libraries / etc.)
 */
export interface FileSidebarProps {
    pinned?: PinnedItem[];
    sections: FileTreeSection[];
    activePath?: string | null;
    onSelect?: (node: FileTreeNode) => void;
    defaultExpandedPaths?: string[];
}

// ---------- Low-level: FileTree ----------

export function FileTree(props: FileTreeProps) {
    const { nodes, activePath, onSelect, defaultExpandedPaths } = props;

    const isExpandedByDefault = React.useCallback(
        (path: string) => defaultExpandedPaths?.includes(path) ?? false,
        [defaultExpandedPaths]
    );

    return (
        <SidebarMenu>
            {nodes.map((node) => (
                <FileTreeNodeRow
                    key={node.path}
                    node={node}
                    activePath={activePath}
                    onSelect={onSelect}
                    isExpandedByDefault={isExpandedByDefault}
                />
            ))}
        </SidebarMenu>
    );
}

interface FileTreeNodeRowProps {
    node: FileTreeNode;
    activePath?: string | null;
    onSelect?: (node: FileTreeNode) => void;
    isExpandedByDefault: (path: string) => boolean;
}

function FileTreeNodeRow(props: FileTreeNodeRowProps) {
    const { node, activePath, onSelect, isExpandedByDefault } = props;
    const { name, path, kind, children } = node;

    if (kind === 'file') {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    isActive={activePath === path}
                    className='data-[active=true]:bg-transparent'
                    onClick={() => onSelect?.(node)}>
                    <FileIcon className='shrink-0' />
                    <span className='truncate'>{name}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    // Directory
    const hasChildren = !!children && children.length > 0;

    if (!hasChildren) {
        // Empty folder, still clickable/selectable if you want
        return (
            <SidebarMenuItem>
                <SidebarMenuButton
                    isActive={activePath === path}
                    onClick={() => onSelect?.(node)}>
                    <FolderIcon className='shrink-0' />
                    <span className='truncate'>{name}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <Collapsible
                className='group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90'
                defaultOpen={isExpandedByDefault(path)}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                        <ChevronRight className='transition-transform shrink-0' />
                        <FolderIcon className='shrink-0' />
                        <span className='truncate'>{name}</span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {children?.map((child) => (
                            <FileTreeNodeRow
                                key={child.path}
                                node={child}
                                activePath={activePath}
                                onSelect={onSelect}
                                isExpandedByDefault={isExpandedByDefault}
                            />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
}

// ---------- High-level: Sidebar composition ----------

export function FileSidebar(props: FileSidebarProps) {
    const {
        pinned = [],
        sections,
        activePath,
        onSelect,
        defaultExpandedPaths,
        ...sidebarProps
    } = props;

    const hasPinned = pinned.length > 0;

    return (
        <Sidebar {...sidebarProps}>
            <SidebarContent>
                {hasPinned && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Changes</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {pinned.map((item, index) => (
                                    <SidebarMenuItem key={index}>
                                        <SidebarMenuButton
                                            isActive={
                                                activePath ===
                                                `/${item.file.replace(
                                                    /^\/+/,
                                                    ''
                                                )}`
                                            }
                                            onClick={() =>
                                                onSelect?.({
                                                    name:
                                                        item.file
                                                            .split('/')
                                                            .pop() ?? item.file,
                                                    path: `/${item.file.replace(
                                                        /^\/+/,
                                                        ''
                                                    )}`,
                                                    kind: 'file',
                                                })
                                            }>
                                            <FileIcon className='shrink-0' />
                                            <span className='truncate'>
                                                {item.file}
                                            </span>
                                        </SidebarMenuButton>
                                        <SidebarMenuBadge>
                                            {item.state}
                                        </SidebarMenuBadge>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {sections.map((section) => (
                    <SidebarGroup key={section.id}>
                        <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <FileTree
                                nodes={section.nodes}
                                activePath={activePath}
                                onSelect={onSelect}
                                defaultExpandedPaths={defaultExpandedPaths}
                            />
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}

// ---------- WebContainer helpers ----------

/**
 * Recursively read a directory from WebContainer.fs and build a FileTreeNode[].
 *
 * Example:
 *   const nodes = await readWebContainerTree(webcontainer, '/');
 */
export async function readWebContainerTree(
    webcontainer: WebContainer,
    rootDir: string = '/'
): Promise<FileTreeNode[]> {
    const fs = webcontainer.fs;

    async function readDir(dir: string): Promise<FileTreeNode[]> {
        const entries = await fs.readdir(dir, { withFileTypes: true } as any);

        // entries is an array of Dirent objects: { name, isFile(), isDirectory(), ... }
        const nodes: FileTreeNode[] = [];

        for (const entry of entries as any[]) {
            const name: string = entry.name;
            const isFile = entry.isFile();
            const isDirectory = entry.isDirectory();
            const path =
                dir === '/' || dir === ''
                    ? `/${name}`
                    : `${dir.replace(/\/+$/, '')}/${name}`;

            if (isDirectory) {
                const children = await readDir(path);
                nodes.push({
                    name,
                    path,
                    kind: 'directory',
                    children: children.sort(sortNodes),
                });
            } else if (isFile) {
                nodes.push({
                    name,
                    path,
                    kind: 'file',
                });
            }
        }

        return nodes.sort(sortNodes);
    }

    return readDir(rootDir);
}

function sortNodes(a: FileTreeNode, b: FileTreeNode): number {
    // Directories first, then files, both alphabetically
    if (a.kind === b.kind) {
        return a.name.localeCompare(b.name);
    }
    return a.kind === 'directory' ? -1 : 1;
}

/**
 * Tiny hook to keep the file tree in React state.
 * Call this after the WebContainer instance is ready.
 */
export function useWebContainerFileTree(
    webcontainer: WebContainer | null,
    rootDir: string = '/'
) {
    const [nodes, setNodes] = React.useState<FileTreeNode[] | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<unknown>(null);

    React.useEffect(() => {
        if (!webcontainer) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        readWebContainerTree(webcontainer, rootDir)
            .then((result) => {
                if (!cancelled) setNodes(result);
            })
            .catch((err) => {
                if (!cancelled) setError(err);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [webcontainer, rootDir]);

    return { nodes, loading, error };
}

// ---------- Example usage ----------

// Somewhere in your app:
//
// const { nodes, loading } = useWebContainerFileTree(webcontainer, '/');
// const [activePath, setActivePath] = React.useState<string | null>(null);
//
// const sections: FileTreeSection[] = [
//   {
//     id: 'root',
//     label: 'Files',
//     nodes: nodes ?? [],
//   },
// ];
//
// <FileSidebar
//   pinned={[
//     { file: 'api/hello/route.ts', state: 'U' },
//     { file: 'app/layout.tsx', state: 'M' },
//   ]}
//   sections={sections}
//   activePath={activePath}
//   onSelect={(node) => {
//     setActivePath(node.path);
//     // e.g. open editor tab, load file contents from webcontainer.fs.readFile(node.path, 'utf-8')
//   }}
//   defaultExpandedPaths={['/', '/src', '/app']}
// />
