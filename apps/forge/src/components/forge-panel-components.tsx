'use client';

import * as React from 'react';

import { useKeyboardScope } from '@loop-kit/loom-interactions';
import type { DockPanelRendererProps, DockPanelRegistry } from '@loop-kit/loom-pack-dock';
import {
    Avatar,
    Badge,
    Box,
    Breadcrumbs,
    Button,
    Grid,
    Heading,
    Icon,
    IconButton,
    Inline,
    Kbd,
    ScrollArea,
    Stack,
    Surface,
    Table,
    Text,
} from '@loop-kit/loom-react';

import { forgeMockData, type ForgeTask } from '../lib/forge-mocks';
import {
    dockForgeInspector,
    forgeGroupIds,
    getForgeWorkspaceMode,
    isForgeGroupOpen,
    openForgeCommandPalette,
    toggleForgeCommandPalette,
    toggleForgeInspector,
    toggleForgeSidePeek,
    toggleForgeWorkspaceMode,
} from '../lib/forge-dock-model';

const chrome = {
    background: 'var(--loom-color-surface-sunken)',
    border: '1px solid var(--loom-color-border-default)',
    card: 'var(--loom-color-surface-raised)',
    muted: '#0f0f10',
    secondary: '#202226',
    shadow: '0 24px 60px rgba(0, 0, 0, 0.55)',
    sidebar: 'var(--loom-color-surface-default)',
    sidebarActive: '#202428',
    sidebarActiveText: '#e8f7ff',
    success: '#28c08b',
    successForeground: '#041612',
    warning: '#ffb86b',
};

function ForgePill({
    children,
    tone = 'muted',
}: {
    children: React.ReactNode;
    tone?: 'muted' | 'accent' | 'info' | 'success';
}) {
    return (
        <Badge kind='soft' tone={tone}>
            {children}
        </Badge>
    );
}

function HeaderAction({
    active = false,
    icon,
    label,
    onClick,
}: {
    active?: boolean;
    icon: React.ComponentProps<typeof Icon>['name'];
    label: string;
    onClick: () => void;
}) {
    return (
        <Button
            kind='ghost'
            onClick={onClick}
            size='sm'
            style={{
                borderRadius: '6px',
                color: active ? 'var(--loom-color-text-default)' : 'var(--loom-color-text-muted)',
                minHeight: '2rem',
                padding: '0 0.5rem',
            }}>
            <Icon name={icon} size='sm' tone={active ? 'info' : 'muted'} />
            {label}
        </Button>
    );
}

function SplitHeaderPill({
    active = false,
    label,
}: {
    active?: boolean;
    label: string;
}) {
    return (
        <Box
            style={{
                alignItems: 'center',
                background: active ? chrome.secondary : 'transparent',
                border: chrome.border,
                borderRadius: '6px',
                color: active ? 'var(--loom-color-text-default)' : 'var(--loom-color-text-muted)',
                display: 'inline-flex',
                fontSize: '0.75rem',
                fontWeight: 500,
                minHeight: '1.875rem',
                padding: '0 0.625rem',
                whiteSpace: 'nowrap',
            }}>
            {label}
        </Box>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <Text
            as='div'
            size='sm'
            tone='muted'
            style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                padding: '0 12px',
                textTransform: 'uppercase',
            }}>
            {children}
        </Text>
    );
}

function SidebarItem({
    active = false,
    children,
    indent = 0,
    onClick,
}: {
    active?: boolean;
    children: React.ReactNode;
    indent?: number;
    onClick?: () => void;
}) {
    return (
        <Button
            kind='ghost'
            onClick={onClick}
            size='sm'
            style={{
                background: active ? chrome.sidebarActive : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: active ? chrome.sidebarActiveText : 'var(--loom-color-text-default)',
                justifyContent: 'flex-start',
                minHeight: '2rem',
                padding: `0.375rem 0.75rem 0.375rem ${0.75 + indent}rem`,
                width: '100%',
            }}>
            {children}
        </Button>
    );
}

function NodeBullet({
    open = false,
    withChildren = false,
}: {
    open?: boolean;
    withChildren?: boolean;
}) {
    return (
        <Box
            style={{
                alignItems: 'center',
                color: 'var(--loom-color-text-muted)',
                display: 'flex',
                height: '1.5rem',
                justifyContent: 'center',
                width: '1.25rem',
            }}>
            {withChildren ? (
                <Icon name={open ? 'chevronDown' : 'chevronRight'} size='sm' tone='muted' />
            ) : (
                <Box
                    style={{
                        background: 'currentColor',
                        borderRadius: '999px',
                        height: '6px',
                        width: '6px',
                    }}
                />
            )}
        </Box>
    );
}

function ForgeNode({
    children,
    open = false,
    tags,
    title,
    view,
}: {
    children?: React.ReactNode;
    open?: boolean;
    tags?: React.ReactNode;
    title: React.ReactNode;
    view?: React.ReactNode;
}) {
    return (
        <Stack gap='1'>
            <Inline align='flex-start' gap='2' style={{ flexWrap: 'nowrap' }}>
                <NodeBullet open={open} withChildren={Boolean(children)} />
                <Inline
                    align='center'
                    gap='2'
                    style={{
                        flexWrap: 'wrap',
                        fontSize: '14px',
                        lineHeight: 1.5,
                        minHeight: '1.5rem',
                        minWidth: 0,
                    }}>
                    <Text as='span'>{title}</Text>
                    {tags}
                    {view}
                </Inline>
            </Inline>
            {children ? (
                <Box
                    style={{
                        borderLeft: chrome.border,
                        marginLeft: '0.5625rem',
                        paddingBottom: '0.25rem',
                        paddingLeft: '0.875rem',
                        paddingTop: '0.25rem',
                    }}>
                    {children}
                </Box>
            ) : null}
        </Stack>
    );
}

function TasksTable() {
    return (
        <Surface
            emphasis='subtle'
            style={{
                background: chrome.background,
                overflow: 'hidden',
            }}>
            <Table
                columns={[
                    {
                        cell: (row: ForgeTask) => row.name,
                        header: 'Name',
                        key: 'name',
                    },
                    {
                        cell: (row: ForgeTask) => (
                            <Inline align='center' gap='2' style={{ flexWrap: 'nowrap' }}>
                                <Avatar name={row.assignee} size='sm' src={row.avatar} />
                                <Text as='span'>{row.assignee}</Text>
                            </Inline>
                        ),
                        header: 'Assignee',
                        key: 'assignee',
                    },
                    {
                        cell: (row: ForgeTask) => (
                            <ForgePill tone={row.status === 'In Progress' ? 'info' : 'muted'}>
                                {row.status}
                            </ForgePill>
                        ),
                        header: 'Status',
                        key: 'status',
                    },
                    {
                        cell: (row: ForgeTask) => (
                            <Text as='span' tone='muted'>
                                {row.due}
                            </Text>
                        ),
                        header: 'Due',
                        key: 'due',
                    },
                ]}
                rows={forgeMockData.tasks}
            />
            <Box
                style={{
                    color: 'var(--loom-color-text-muted)',
                    fontSize: '13px',
                    fontStyle: 'italic',
                    padding: '0.625rem 0.75rem',
                }}>
                + Add new task
            </Box>
        </Surface>
    );
}

function IssueCard({ compact = false }: { compact?: boolean }) {
    return (
        <Surface
            emphasis='subtle'
            style={{
                background: chrome.background,
                padding: compact ? '0.75rem' : '1rem',
            }}>
            <Stack gap='3'>
                <Inline align='flex-start' gap='3' style={{ flexWrap: 'nowrap' }}>
                    <Icon name='github' size='md' />
                    <Stack gap='1' style={{ flex: 1, minWidth: 0 }}>
                        <Text as='div' size='sm' tone='muted'>
                            {forgeMockData.issue.repo} • {forgeMockData.issue.id}
                        </Text>
                        <Text as='div' emphasis='strong' style={{ fontSize: compact ? '16px' : '15px' }}>
                            {forgeMockData.issue.title}
                        </Text>
                    </Stack>
                    {compact ? (
                        <Box
                            style={{
                                background: chrome.success,
                                borderRadius: '999px',
                                color: chrome.successForeground,
                                fontSize: '11px',
                                fontWeight: 600,
                                lineHeight: 1,
                                padding: '0.25rem 0.5rem',
                                whiteSpace: 'nowrap',
                            }}>
                            {forgeMockData.issue.status}
                        </Box>
                    ) : null}
                </Inline>
                {compact ? (
                    <Inline align='center' gap='3' style={{ flexWrap: 'wrap', marginLeft: '2rem' }}>
                        <Inline align='center' gap='2' style={{ flexWrap: 'nowrap' }}>
                            <Avatar
                                name={forgeMockData.issue.user.handle}
                                size='sm'
                                src={forgeMockData.issue.user.avatar}
                            />
                            <Text as='span'>{forgeMockData.issue.user.handle}</Text>
                        </Inline>
                        <Text as='span' size='sm' tone='muted'>
                            {forgeMockData.issue.updatedAt}
                        </Text>
                        <Text as='span' size='sm' tone='muted'>
                            {forgeMockData.issue.comments} comments
                        </Text>
                        <Text as='span' size='sm' tone='muted' style={{ marginLeft: 'auto' }}>
                            {forgeMockData.issue.lastSync}
                        </Text>
                    </Inline>
                ) : (
                    <Stack gap='2'>
                        <Inline align='center' justify='space-between'>
                            <Text as='span' tone='muted'>
                                Status
                            </Text>
                            <Text as='span' style={{ color: chrome.success }}>
                                {forgeMockData.issue.status}
                            </Text>
                        </Inline>
                        <Inline align='center' justify='space-between'>
                            <Text as='span' tone='muted'>
                                Comments
                            </Text>
                            <Text as='span'>{forgeMockData.issue.comments}</Text>
                        </Inline>
                        <Inline align='center' justify='space-between'>
                            <Text as='span' tone='muted'>
                                Last sync
                            </Text>
                            <Text as='span'>{forgeMockData.issue.lastSync.replace('Synced ', '')}</Text>
                        </Inline>
                    </Stack>
                )}
            </Stack>
        </Surface>
    );
}

function BrowserCard({ compact = false }: { compact?: boolean }) {
    return (
        <Surface
            emphasis='subtle'
            style={{
                background: chrome.background,
                overflow: 'hidden',
                padding: compact ? '0.25rem' : '0.75rem',
            }}>
            <Stack gap='3'>
                <Inline
                    align='center'
                    gap='3'
                    style={{
                        background: compact ? chrome.sidebar : 'transparent',
                        borderRadius: compact ? '6px' : undefined,
                        color: 'var(--loom-color-text-muted)',
                        minHeight: compact ? '2.125rem' : undefined,
                        padding: compact ? '0 0.5rem' : '0',
                    }}>
                    <Inline align='center' gap='2'>
                        <Icon name='arrowLeft' size='sm' tone='muted' />
                        <Icon name='arrowRight' size='sm' tone='muted' />
                        <Icon name='refresh' size='sm' tone='muted' />
                    </Inline>
                    <Box
                        style={{
                            background: chrome.background,
                            borderRadius: '4px',
                            flex: 1,
                            minWidth: 0,
                            padding: '0.375rem 0.625rem',
                        }}>
                        <Inline align='center' gap='2' style={{ flexWrap: 'nowrap' }}>
                            <Icon name='lock' size='sm' tone='muted' />
                            <Text
                                as='span'
                                size='sm'
                                style={{
                                    fontFamily: 'var(--loom-font-family-mono)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                {forgeMockData.browser.url}
                            </Text>
                        </Inline>
                    </Box>
                </Inline>
                <img
                    alt='Design reference'
                    src={forgeMockData.browser.image}
                    style={{
                        borderRadius: compact ? '0' : '6px',
                        display: 'block',
                        filter: 'brightness(0.9)',
                        height: compact ? '280px' : '190px',
                        objectFit: 'cover',
                        width: '100%',
                    }}
                />
                {!compact ? (
                    <Text as='div' size='sm' tone='muted'>
                        {forgeMockData.browser.note}
                    </Text>
                ) : null}
            </Stack>
        </Surface>
    );
}

function OutlineContent({ compact = false }: { compact?: boolean }) {
    return (
        <Stack gap='5'>
            <Heading
                level={1}
                size='xl'
                style={{ fontSize: compact ? '32px' : '34px' }}>
                Forge Redesign
            </Heading>

            <ForgeNode tags={<ForgePill tone='accent'>#milestone</ForgePill>} title={forgeMockData.outline.title}>
                <Stack gap='2'>
                    {forgeMockData.outline.children.map((item) => (
                        <ForgeNode key={item} title={item} />
                    ))}
                </Stack>
            </ForgeNode>

            <ForgeNode
                open
                tags={<ForgePill tone='accent'>#task-db</ForgePill>}
                title='Current Tasks'
                view={<ForgePill>Table View</ForgePill>}>
                {compact ? (
                    <Surface
                        emphasis='subtle'
                        style={{
                            background: chrome.background,
                            padding: '0.75rem',
                        }}>
                        <Stack gap='3'>
                            <Grid
                                columns='minmax(0, 1.5fr) minmax(120px, 0.8fr) minmax(100px, 0.7fr)'
                                gap='3'
                                style={{ color: 'var(--loom-color-text-muted)', fontSize: '12px' }}>
                                <Box>Name</Box>
                                <Box>Assignee</Box>
                                <Box>Status</Box>
                            </Grid>
                            {forgeMockData.tasks.map((task) => (
                                <Grid
                                    key={task.id}
                                    columns='minmax(0, 1.5fr) minmax(120px, 0.8fr) minmax(100px, 0.7fr)'
                                    gap='3'
                                    style={{ alignItems: 'center' }}>
                                    <Text as='span'>{task.name}</Text>
                                    <Text as='span'>{task.assignee}</Text>
                                    <Box>
                                        <ForgePill tone={task.status === 'In Progress' ? 'info' : 'muted'}>
                                            {task.status === 'In Progress' ? 'Active' : task.status}
                                        </ForgePill>
                                    </Box>
                                </Grid>
                            ))}
                        </Stack>
                    </Surface>
                ) : (
                    <TasksTable />
                )}
            </ForgeNode>

            {!compact ? (
                <>
                    <ForgeNode
                        open
                        tags={<ForgePill tone='accent'>#github</ForgePill>}
                        title='Blocker Issue'
                        view={<ForgePill>Sync View</ForgePill>}>
                        <IssueCard compact />
                    </ForgeNode>

                    <ForgeNode
                        open
                        tags={<ForgePill tone='accent'>#link</ForgePill>}
                        title='Design Reference'
                        view={<ForgePill>Browser View</ForgePill>}>
                        <BrowserCard compact />
                    </ForgeNode>
                </>
            ) : null}
        </Stack>
    );
}

function ForgeSidebarPanel({ controller }: DockPanelRendererProps) {
    return (
        <Box
            style={{
                background: chrome.sidebar,
                borderRight: chrome.border,
                color: 'var(--loom-color-text-default)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
            }}>
            <Box
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: '10px',
                    height: '56px',
                    padding: '0 12px 0 16px',
                }}>
                <Box
                    style={{
                        alignItems: 'center',
                        background: 'var(--loom-color-accent-default)',
                        borderRadius: '4px',
                        color: 'var(--loom-color-accent-text)',
                        display: 'inline-flex',
                        height: '24px',
                        justifyContent: 'center',
                        width: '24px',
                    }}>
                    <Icon name='hexagon' size='sm' />
                </Box>
                <Text
                    as='div'
                    emphasis='strong'
                    style={{
                        fontSize: '14px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                    Forge Workspace
                </Text>
                <IconButton
                    kind='soft'
                    label='Open command palette'
                    name='panelLeft'
                    onClick={() => {
                        openForgeCommandPalette(controller);
                    }}
                    size='sm'
                />
            </Box>

            <Box
                onClick={() => {
                    openForgeCommandPalette(controller);
                }}
                style={{
                    alignItems: 'center',
                    background: chrome.muted,
                    borderRadius: '6px',
                    color: 'var(--loom-color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '8px',
                    margin: '0 16px 20px',
                    minHeight: '38px',
                    padding: '0 10px',
                }}>
                <Icon name='search' size='sm' tone='muted' />
                <Text as='span' tone='muted'>
                    Search...
                </Text>
                <Box style={{ marginLeft: 'auto' }}>
                    <Kbd size='sm'>⌘K</Kbd>
                </Box>
            </Box>

            <ScrollArea style={{ flex: 1, minHeight: 0, padding: '0 8px 12px' }}>
                <Stack gap='5'>
                    <Stack gap='2'>
                        <SectionLabel>Favorites</SectionLabel>
                        <Stack gap='1'>
                            {forgeMockData.favorites.map((item) => (
                                <SidebarItem key={item.id}>
                                    <Icon name='star' size='sm' style={{ color: chrome.warning }} />
                                    <span>{item.label}</span>
                                </SidebarItem>
                            ))}
                        </Stack>
                    </Stack>

                    <Stack gap='2'>
                        <SectionLabel>Workspace</SectionLabel>
                        <Stack gap='1'>
                            <SidebarItem>
                                <Icon name='chevronRight' size='sm' tone='muted' />
                                <Icon name='fileText' size='sm' tone='muted' />
                                <span>Personal Notes</span>
                            </SidebarItem>
                            <SidebarItem active>
                                <Icon name='chevronDown' size='sm' tone='muted' />
                                <Icon name='folderOpen' size='sm' tone='info' />
                                <span>Projects</span>
                            </SidebarItem>
                            {forgeMockData.workspaceItems[1]?.children?.map((child) => (
                                <SidebarItem key={child.id} indent={1}>
                                    <Icon name={child.icon} size='sm' tone='muted' />
                                    <span>{child.label}</span>
                                </SidebarItem>
                            ))}
                        </Stack>
                    </Stack>
                </Stack>
            </ScrollArea>

            <Box
                style={{
                    borderTop: chrome.border,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '12px 8px 16px',
                }}>
                <SidebarItem>
                    <Icon name='blocks' size='sm' tone='muted' />
                    <span>Extensions</span>
                </SidebarItem>
                <SidebarItem>
                    <Icon name='settings' size='sm' tone='muted' />
                    <span>Settings</span>
                </SidebarItem>
            </Box>
        </Box>
    );
}

function ForgeFocusWorkspace({ controller, state }: DockPanelRendererProps) {
    const split = getForgeWorkspaceMode(state) === 'split';
    const inspectorOpen = isForgeGroupOpen(state, forgeGroupIds.inspector);

    return (
        <Box
            style={{
                background: chrome.background,
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                minHeight: 0,
            }}>
            <Box
                style={{
                    alignItems: 'center',
                    borderBottom: chrome.border,
                    color: 'var(--loom-color-text-muted)',
                    display: 'flex',
                    gap: '16px',
                    height: '56px',
                    padding: '0 24px',
                }}>
                <Breadcrumbs
                    items={[
                        { id: 'workspace', label: 'Workspace' },
                        { id: 'projects', label: 'Projects' },
                        { id: 'forge-redesign', label: 'Forge Redesign' },
                    ]}
                    size='sm'
                />
                <Inline align='center' gap='2' style={{ marginLeft: 'auto' }}>
                    <HeaderAction active icon='fileText' label='Outline' onClick={() => {}} />
                    <HeaderAction
                        active={inspectorOpen}
                        icon='panelRight'
                        label='Inspector'
                        onClick={() => {
                            toggleForgeInspector(controller);
                        }}
                    />
                    <HeaderAction
                        active={isForgeGroupOpen(state, forgeGroupIds.command)}
                        icon='search'
                        label='Command'
                        onClick={() => {
                            toggleForgeCommandPalette(controller);
                        }}
                    />
                    <HeaderAction
                        active={isForgeGroupOpen(state, forgeGroupIds.peek)}
                        icon='panelRight'
                        label='Peek'
                        onClick={() => {
                            toggleForgeSidePeek(controller);
                        }}
                    />
                    <HeaderAction
                        active={split}
                        icon='panelLeft'
                        label={split ? 'Focused layout' : 'Split layout'}
                        onClick={() => {
                            toggleForgeWorkspaceMode(controller);
                        }}
                    />
                </Inline>
            </Box>

            <Box
                style={{
                    display: 'flex',
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden',
                    padding: '28px 24px',
                }}>
                <Box
                    style={{
                        background: chrome.card,
                        borderRadius: '8px',
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'column',
                        minHeight: 0,
                        overflow: 'hidden',
                    }}>
                    <Box
                        style={{
                            alignItems: 'center',
                            color: 'var(--loom-color-text-muted)',
                            display: 'flex',
                            gap: '12px',
                            minHeight: '56px',
                            padding: '18px 24px 14px',
                        }}>
                        <Breadcrumbs
                            items={[
                                { id: 'workspace-card', label: 'Workspace' },
                                { id: 'projects-card', label: 'Projects' },
                                { id: 'forge-redesign-card', label: 'Forge Redesign' },
                            ]}
                            size='sm'
                        />
                        <Inline align='center' gap='1' style={{ marginLeft: 'auto' }}>
                            <SplitHeaderPill active label='Outline' />
                            <SplitHeaderPill label='Table' />
                            <SplitHeaderPill label='Sync' />
                            <SplitHeaderPill label='Browser' />
                        </Inline>
                    </Box>

                    <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                        <Box style={{ padding: '8px 24px 32px' }}>
                            <OutlineContent />
                        </Box>
                    </ScrollArea>
                </Box>
            </Box>
        </Box>
    );
}

function ForgeSplitMainPanel() {
    return (
        <Box style={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
            <Box
                style={{
                    alignItems: 'center',
                    color: 'var(--loom-color-text-muted)',
                    display: 'flex',
                    gap: '10px',
                    minHeight: '52px',
                    padding: '0 16px',
                }}>
                <Icon name='moreHorizontal' size='sm' tone='muted' />
                <Text
                    as='div'
                    emphasis='strong'
                    style={{
                        flex: 1,
                        fontSize: '13px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                    Workspace › Projects › Forge Redesign
                </Text>
                <Inline align='center' gap='1'>
                    <SplitHeaderPill active label='Outline' />
                    <SplitHeaderPill label='Table' />
                </Inline>
            </Box>
            <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                <Box style={{ padding: '8px 16px 20px' }}>
                    <OutlineContent compact />
                </Box>
            </ScrollArea>
        </Box>
    );
}

function ForgeMainPanel(props: DockPanelRendererProps) {
    if (getForgeWorkspaceMode(props.state) === 'split') {
        return <ForgeSplitMainPanel />;
    }

    return <ForgeFocusWorkspace {...props} />;
}

function ForgeIssuePanel() {
    return (
        <Box style={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
            <Box
                style={{
                    alignItems: 'center',
                    color: 'var(--loom-color-text-muted)',
                    display: 'flex',
                    gap: '10px',
                    minHeight: '52px',
                    padding: '0 16px',
                }}>
                <Icon name='panelRight' size='sm' tone='muted' />
                <Text as='div' emphasis='strong' style={{ fontSize: '13px' }}>
                    Connected issue
                </Text>
                <Box style={{ marginLeft: 'auto' }}>
                    <ForgePill>Sync</ForgePill>
                </Box>
            </Box>
            <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                <Box style={{ padding: '8px 16px 20px' }}>
                    <Text as='div' size='sm' tone='muted' style={{ marginBottom: '0.375rem' }}>
                        {forgeMockData.issue.repo} • {forgeMockData.issue.id}
                    </Text>
                    <Text
                        as='div'
                        emphasis='strong'
                        style={{
                            fontSize: '16px',
                            lineHeight: 1.45,
                            marginBottom: '0.75rem',
                        }}>
                        {forgeMockData.issue.title}
                    </Text>
                    <IssueCard />
                </Box>
            </ScrollArea>
        </Box>
    );
}

function ForgeBrowserPanel() {
    return (
        <Box style={{ display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0 }}>
            <Box
                style={{
                    alignItems: 'center',
                    color: 'var(--loom-color-text-muted)',
                    display: 'flex',
                    gap: '10px',
                    minHeight: '52px',
                    padding: '0 16px',
                }}>
                <Icon name='globe' size='sm' tone='muted' />
                <Text as='div' emphasis='strong' style={{ fontSize: '13px' }}>
                    Design reference node
                </Text>
                <Box style={{ marginLeft: 'auto' }}>
                    <ForgePill>Browser</ForgePill>
                </Box>
            </Box>
            <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                <Box style={{ padding: '8px 16px 20px' }}>
                    <BrowserCard />
                </Box>
            </ScrollArea>
        </Box>
    );
}

function ForgeInspectorPanel({ controller, state }: DockPanelRendererProps) {
    const workspaceGroups = state.layers['layer-workspace']?.groupIds ?? [];
    const inspectorIndex = workspaceGroups.indexOf(forgeGroupIds.inspector);
    const workspaceIndex = workspaceGroups.indexOf(forgeGroupIds.workspace);
    const dockLeft = inspectorIndex >= 0 && inspectorIndex < workspaceIndex;

    return (
        <Box
            style={{
                background: chrome.sidebar,
                borderLeft: dockLeft ? 'none' : chrome.border,
                borderRight: dockLeft ? chrome.border : 'none',
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                minHeight: 0,
            }}>
            <Box
                style={{
                    alignItems: 'center',
                    borderBottom: chrome.border,
                    display: 'flex',
                    height: '56px',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                }}>
                <Text as='div' emphasis='strong'>
                    Inspector
                </Text>
                <Inline align='center' gap='1'>
                    <IconButton
                        kind='ghost'
                        label='Dock inspector left'
                        name='panelLeft'
                        onClick={() => {
                            dockForgeInspector(controller, 'left');
                        }}
                        size='sm'
                        style={{
                            color: dockLeft ? 'var(--loom-color-text-default)' : 'var(--loom-color-text-muted)',
                        }}
                    />
                    <IconButton
                        kind='ghost'
                        label='Dock inspector right'
                        name='panelRight'
                        onClick={() => {
                            dockForgeInspector(controller, 'right');
                        }}
                        size='sm'
                        style={{
                            color: dockLeft ? 'var(--loom-color-text-muted)' : 'var(--loom-color-text-default)',
                        }}
                    />
                    <IconButton
                        kind='ghost'
                        label='Hide inspector'
                        name='close'
                        onClick={() => {
                            toggleForgeInspector(controller);
                        }}
                        size='sm'
                    />
                </Inline>
            </Box>

            <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                <Box style={{ padding: '16px' }}>
                    <Stack gap='4'>
                        <Stack gap='2'>
                            <Text
                                as='div'
                                size='sm'
                                tone='muted'
                                style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                Inspecting Node
                            </Text>
                            <Inline align='center' gap='2'>
                                <Text as='span' emphasis='strong'>
                                    Current Tasks
                                </Text>
                                <ForgePill tone='accent'>#task-db</ForgePill>
                            </Inline>
                        </Stack>

                        <Stack gap='3'>
                            <Inline align='center' justify='space-between'>
                                <Text as='div' emphasis='strong' size='sm'>
                                    Fields
                                </Text>
                                <IconButton kind='ghost' label='Add field' name='plus' size='sm' />
                            </Inline>
                            {forgeMockData.inspector.fields.map((field) => (
                                <Inline key={field.label} align='center' gap='3' style={{ flexWrap: 'nowrap' }}>
                                    <Icon name={field.icon} size='sm' tone='muted' />
                                    <Text as='span' size='sm' tone='muted' style={{ minWidth: '4.5rem' }}>
                                        {field.label}
                                    </Text>
                                    <Text as='span' size='sm'>
                                        {field.value}
                                    </Text>
                                </Inline>
                            ))}
                        </Stack>

                        <Stack gap='3'>
                            <Inline align='center' gap='2'>
                                <Icon name='zap' size='sm' style={{ color: chrome.warning }} />
                                <Text as='div' emphasis='strong' size='sm'>
                                    Automations
                                </Text>
                            </Inline>
                            {forgeMockData.inspector.automations.map((item) => (
                                <Surface
                                    key={item.id}
                                    emphasis='subtle'
                                    style={{
                                        background: chrome.card,
                                        padding: '12px',
                                    }}>
                                    <Stack gap='2'>
                                        <Inline align='center' justify='space-between'>
                                            <Text as='span' emphasis='strong' size='sm'>
                                                {item.title}
                                            </Text>
                                            <ForgePill tone={item.status === 'Active' ? 'success' : 'muted'}>
                                                {item.status}
                                            </ForgePill>
                                        </Inline>
                                        <Text
                                            as='div'
                                            size='sm'
                                            tone='muted'
                                            style={
                                                item.status === 'Script'
                                                    ? {
                                                          fontFamily: 'var(--loom-font-family-mono)',
                                                          whiteSpace: 'pre-wrap',
                                                      }
                                                    : undefined
                                            }>
                                            {item.detail}
                                        </Text>
                                    </Stack>
                                </Surface>
                            ))}
                            <Button kind='outline' size='sm'>
                                <Icon name='plus' size='sm' tone='muted' />
                                Add Automation
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </ScrollArea>
        </Box>
    );
}

function ForgeSidePeekPanel({ controller }: DockPanelRendererProps) {
    return (
        <Box
            style={{
                background: chrome.sidebar,
                borderLeft: chrome.border,
                boxShadow: chrome.shadow,
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                minHeight: 0,
            }}>
            <Box
                style={{
                    alignItems: 'center',
                    borderBottom: chrome.border,
                    color: 'var(--loom-color-text-muted)',
                    display: 'flex',
                    gap: '8px',
                    height: '56px',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                }}>
                <Text as='div' tone='muted'>
                    Side Peek
                </Text>
                <IconButton
                    kind='ghost'
                    label='Close side peek'
                    name='close'
                    onClick={() => {
                        toggleForgeSidePeek(controller);
                    }}
                    size='sm'
                />
            </Box>
            <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                <Box style={{ padding: '16px' }}>
                    <Stack gap='4'>
                        <Stack gap='2'>
                            <Heading level={2} size='md'>
                                {forgeMockData.sidePeek.title}
                            </Heading>
                            <ForgePill tone='accent'>#milestone</ForgePill>
                        </Stack>
                        <Text as='div' tone='muted'>
                            {forgeMockData.sidePeek.summary}
                        </Text>
                        <Stack gap='2'>
                            <Text
                                as='div'
                                size='sm'
                                tone='muted'
                                style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                Linked References (2)
                            </Text>
                            <Surface
                                emphasis='subtle'
                                style={{
                                    background: chrome.card,
                                    padding: '1rem',
                                }}>
                                <Stack gap='2'>
                                    <Text as='div' size='sm' tone='muted'>
                                        {forgeMockData.sidePeek.noteMeta}
                                    </Text>
                                    <Text as='div'>{forgeMockData.sidePeek.note}</Text>
                                </Stack>
                            </Surface>
                        </Stack>
                    </Stack>
                </Box>
            </ScrollArea>
        </Box>
    );
}

function ForgeCommandPalettePanel({ controller }: DockPanelRendererProps) {
    const [activeIndex, setActiveIndex] = React.useState(0);

    const closePalette = React.useCallback(() => {
        toggleForgeCommandPalette(controller);
    }, [controller]);

    useKeyboardScope(
        'forge-command-palette',
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closePalette();
                return true;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex((current) => (current + 1) % forgeMockData.commandItems.length);
                return true;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((current) =>
                    current === 0 ? forgeMockData.commandItems.length - 1 : current - 1,
                );
                return true;
            }

            if (event.key === 'Enter') {
                event.preventDefault();
                closePalette();
                return true;
            }

            return false;
        },
        true,
    );

    return (
        <Box
            style={{
                background: chrome.card,
                borderRadius: '8px',
                boxShadow: chrome.shadow,
                minWidth: 0,
                overflow: 'hidden',
            }}>
            <Box
                style={{
                    alignItems: 'center',
                    borderBottom: chrome.border,
                    display: 'flex',
                    gap: '12px',
                    minHeight: '58px',
                    padding: '0 18px',
                }}>
                <Icon name='search' size='md' tone='muted' />
                <Text as='div' emphasis='strong' style={{ flex: 1, fontSize: '15px' }}>
                    Convert view to
                </Text>
                <Kbd size='sm'>ESC</Kbd>
            </Box>
            <Box style={{ padding: '8px' }}>
                <Text
                    as='div'
                    size='sm'
                    tone='muted'
                    style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        padding: '8px 12px',
                        textTransform: 'uppercase',
                    }}>
                    Views
                </Text>
                <Stack gap='1'>
                    {forgeMockData.commandItems.map((item, index) => {
                        const active = index === activeIndex;
                        return (
                            <Button
                                key={item.id}
                                kind='ghost'
                                onClick={closePalette}
                                size='sm'
                                style={{
                                    background: active ? chrome.sidebarActive : 'transparent',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: active ? chrome.sidebarActiveText : 'var(--loom-color-text-muted)',
                                    justifyContent: 'space-between',
                                    minHeight: '42px',
                                    padding: '0.625rem 0.75rem',
                                    width: '100%',
                                }}>
                                <Inline align='center' gap='3' style={{ flexWrap: 'nowrap' }}>
                                    <Icon name={item.icon} size='md' tone={active ? 'info' : 'muted'} />
                                    <Text as='span' style={{ fontSize: '14px' }}>
                                        {item.title}
                                    </Text>
                                </Inline>
                                {active ? <Kbd size='sm'>↵</Kbd> : null}
                            </Button>
                        );
                    })}
                </Stack>
            </Box>
        </Box>
    );
}

export function createForgePanelRegistry(): DockPanelRegistry {
    return {
        kinds: {
            'command-palette': ForgeCommandPalettePanel,
            inspector: ForgeInspectorPanel,
            sidebar: ForgeSidebarPanel,
            'side-peek': ForgeSidePeekPanel,
            'workspace-browser': ForgeBrowserPanel,
            'workspace-issue': ForgeIssuePanel,
            'workspace-main': ForgeMainPanel,
        },
    };
}
