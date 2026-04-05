'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import {
    Badge,
    Button,
    Heading,
    Icon,
    IconButton,
    Input,
    LoomProvider,
    Panel,
    ScrollArea,
    Surface,
    Text,
} from '@loop-kit/loom-react';
import { baseReactTheme } from '@loop-kit/loom-theme-base-react';
import { foundryReactTheme } from '@loop-kit/loom-theme-foundry-react';

import styles from './forge-prototype.module.css';

type ViewMode = 'Outline' | 'Table' | 'Board' | 'Browser Embed';

const favorites = ['Q3 Roadmap', 'Engineering Docs'] as const;
const projectChildren = ['Forge Redesign', 'Marketing Site'] as const;
const outlineTasks = [
    'Refine drag and drop targeting logic',
    'Implement full keyboard navigation (Up/Down/Indent/Outdent)',
] as const;
const currentTasks = [
    {
        name: 'Design side peek overlay component',
        assignee: 'Sarah',
        avatar:
            'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FEuropean%2F1',
        status: { label: 'In Progress', tone: 'info' as const },
        due: 'Oct 12',
    },
    {
        name: 'Update color tokens to strict #111 base',
        assignee: 'Alex',
        avatar:
            'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FEuropean%2F2',
        status: { label: 'Todo', tone: 'muted' as const },
        due: 'Oct 14',
    },
] as const;

const linkedReferenceAvatar =
    'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F18-25%2FEuropean%2F3';
const designReferenceImage =
    'https://storage.googleapis.com/banani-generated-images/generated-images/aac1f2f9-5f19-4320-b30b-345896ca2b2d.jpg';

const viewOptions = [
    { id: 'Table', icon: 'table', actionLabel: 'Table' },
    { id: 'Board', icon: 'kanban', actionLabel: 'Board' },
    { id: 'Browser Embed', icon: 'globe', actionLabel: 'Browser Embed' },
] as const;

const inspectorFields = [
    { icon: 'type', label: 'Name', value: 'Text' },
    { icon: 'user', label: 'Assignee', value: 'User' },
    { icon: 'list', label: 'Status', value: 'Select' },
    { icon: 'calendar', label: 'Due', value: 'Date' },
] as const;

function SidebarRow({
    children,
    active = false,
    indented = false,
    leading,
    trailing,
    muted = false,
}: {
    children: string;
    active?: boolean;
    indented?: boolean;
    leading: ReactNode;
    trailing?: ReactNode;
    muted?: boolean;
}) {
    return (
        <button
            className={[
                styles.sidebarButton,
                active ? styles.sidebarButtonActive : '',
                indented ? styles.sidebarButtonIndented : '',
                muted ? styles.sidebarButtonMuted : '',
            ].join(' ')}
            type='button'>
            {leading}
            <span className={styles.buttonGrow}>
                <span className={styles.buttonText}>{children}</span>
            </span>
            {trailing}
        </button>
    );
}

function OutlineLeaf({ children }: { children: string }) {
    return (
        <div className={styles.node}>
            <div className={styles.nodeHeader}>
                <div className={styles.nodeBullet}>
                    <span className={styles.nodeDot} />
                </div>
                <div className={styles.nodeContent}>
                    <span className={styles.nodeLabel}>{children}</span>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({
    label,
    tone,
}: {
    label: string;
    tone: 'info' | 'muted' | 'success';
}) {
    return <Badge kind='soft' tone={tone}>{label}</Badge>;
}

export function ForgePrototype() {
    const [viewMode, setViewMode] = useState<ViewMode>('Outline');
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(true);
    const [sidePeekOpen, setSidePeekOpen] = useState(true);

    return (
        <LoomProvider colorMode='dark' themes={[baseReactTheme, foundryReactTheme]}>
            <div className={styles.workspace}>
                <aside className={styles.sidebar}>
                    <div className={styles.workspaceHeader}>
                        <div className={styles.workspaceBrand}>
                            <span className={styles.workspaceMark}>
                                <Icon name='hexagon' size='sm' />
                            </span>
                            <span>Forge Workspace</span>
                        </div>
                        <Icon name='chevronDown' tone='muted' />
                    </div>

                    <div className={styles.sidebarSearchWrap}>
                        <button
                            aria-label='Open global search'
                            className={styles.searchTrigger}
                            onClick={() => setCommandPaletteOpen(true)}
                            type='button'>
                            <span className={styles.footerItem}>
                                <Icon name='search' tone='muted' size='sm' />
                                <span>Search...</span>
                            </span>
                            <span className={styles.kbd}>⌘K</span>
                        </button>
                    </div>

                    <ScrollArea className={styles.sidebarScroll}>
                        <div className={styles.sidebarSection}>
                            <span className={styles.sectionLabel}>Favorites</span>
                            {favorites.map((item) => (
                                <SidebarRow
                                    key={item}
                                    leading={<Icon name='star' size='sm' style={{ color: '#facc15' }} />}>
                                    {item}
                                </SidebarRow>
                            ))}
                        </div>

                        <div className={styles.sidebarSection}>
                            <span className={styles.sectionLabel}>Workspace</span>
                            <SidebarRow
                                leading={
                                    <>
                                        <Icon name='chevronRight' tone='muted' size='sm' />
                                        <Icon name='fileText' tone='muted' size='sm' />
                                    </>
                                }>
                                Personal Notes
                            </SidebarRow>

                            <SidebarRow
                                active
                                leading={
                                    <>
                                        <Icon name='chevronDown' tone='muted' size='sm' />
                                        <Icon
                                            name='folderOpen'
                                            size='sm'
                                            style={{ color: '#60a5fa' }}
                                        />
                                    </>
                                }>
                                Projects
                            </SidebarRow>

                            {projectChildren.map((item) => (
                                <SidebarRow
                                    key={item}
                                    indented
                                    leading={<Icon name='file' tone='muted' size='sm' />}>
                                    {item}
                                </SidebarRow>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className={styles.sidebarFooter}>
                        <SidebarRow leading={<Icon name='blocks' tone='muted' size='sm' />} muted>
                            Extensions
                        </SidebarRow>
                        <SidebarRow leading={<Icon name='settings' tone='muted' size='sm' />} muted>
                            Settings
                        </SidebarRow>
                    </div>
                </aside>

                <main className={styles.main}>
                    <header className={styles.toolbar}>
                        <div className={styles.breadcrumbs}>
                            <button className={styles.treeButton} type='button'>
                                Workspace
                            </button>
                            <Icon name='chevronRight' tone='muted' size='sm' />
                            <button className={styles.treeButton} type='button'>
                                Projects
                            </button>
                            <Icon name='chevronRight' tone='muted' size='sm' />
                            <span>Forge Redesign</span>
                        </div>

                        <div className={styles.toolbarActions}>
                            <button
                                className={styles.viewTrigger}
                                onClick={() => setCommandPaletteOpen((open) => !open)}
                                type='button'>
                                <Icon name='eye' tone='muted' size='sm' />
                                View: {viewMode}
                            </button>
                            <div className={styles.toolbarDivider} />
                            <IconButton kind='ghost' label='More actions' name='moreHorizontal' />
                        </div>
                    </header>

                    <ScrollArea className={styles.editorScroll}>
                        <div className={styles.editorContent}>
                            <div className={styles.pageTitle}>
                                <Heading level={1} size='xl'>
                                    Forge Redesign
                                </Heading>
                            </div>

                            <div className={styles.outlineTree}>
                                <div className={styles.node}>
                                    <div className={styles.nodeHeader}>
                                        <div className={styles.nodeBullet}>
                                            <span className={styles.nodeDot} />
                                        </div>
                                        <div className={styles.nodeContent}>
                                            <span className={styles.nodeLabel}>
                                                Phase 1: Core Outline Interaction
                                            </span>
                                            <Badge tone='accent'>#milestone</Badge>
                                        </div>
                                    </div>
                                    <div className={styles.nodeChildren}>
                                        {outlineTasks.map((task) => (
                                            <OutlineLeaf key={task}>{task}</OutlineLeaf>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.node}>
                                    <div className={styles.nodeHeader}>
                                        <div className={styles.nodeBullet}>
                                            <Icon name='chevronDown' tone='muted' size='sm' />
                                        </div>
                                        <div className={styles.nodeContent}>
                                            <span className={styles.nodeLabel}>Current Tasks</span>
                                            <Badge tone='accent'>#task-db</Badge>
                                            <Badge kind='outline' tone='muted'>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Icon name='table' size='sm' />
                                                    Table View
                                                </span>
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className={styles.nodeChildren}>
                                        <Panel className={styles.embeddedPanel} density='compact' emphasis='subtle'>
                                            <table className={styles.table}>
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Assignee</th>
                                                        <th>Status</th>
                                                        <th>Due</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentTasks.map((task) => (
                                                        <tr key={task.name}>
                                                            <td>{task.name}</td>
                                                            <td>
                                                                <span className={styles.avatarRow}>
                                                                    <img
                                                                        alt=''
                                                                        className={styles.avatar}
                                                                        src={task.avatar}
                                                                    />
                                                                    <span>{task.assignee}</span>
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <StatusBadge
                                                                    label={task.status.label}
                                                                    tone={task.status.tone}
                                                                />
                                                            </td>
                                                            <td className={styles.mutedCell}>{task.due}</td>
                                                        </tr>
                                                    ))}
                                                    <tr>
                                                        <td className={styles.italicMuted} colSpan={4}>
                                                            + Add new task
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </Panel>
                                    </div>
                                </div>

                                <div className={styles.node}>
                                    <div className={styles.nodeHeader}>
                                        <div className={styles.nodeBullet}>
                                            <Icon name='chevronDown' tone='muted' size='sm' />
                                        </div>
                                        <div className={styles.nodeContent}>
                                            <span className={styles.nodeLabel}>Design Reference</span>
                                            <Badge tone='accent'>#link</Badge>
                                            <Badge kind='outline' tone='muted'>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Icon name='globe' size='sm' />
                                                    Browser View
                                                </span>
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className={styles.nodeChildren}>
                                        <Panel className={styles.embeddedPanel} density='compact' emphasis='subtle'>
                                            <div className={styles.browserChrome}>
                                                <span className={styles.footerItem}>
                                                    <Icon name='arrowLeft' size='sm' />
                                                    <Icon name='arrowRight' size='sm' />
                                                    <Icon name='refresh' size='sm' />
                                                </span>
                                                <Surface className={styles.buttonGrow} emphasis='subtle'>
                                                    <div className={styles.footerItem}>
                                                        <Icon name='lock' tone='muted' size='sm' />
                                                        <Text as='span' size='sm'>
                                                            https://linear.app/methodology
                                                        </Text>
                                                    </div>
                                                </Surface>
                                            </div>
                                            <img
                                                alt='Linear-inspired dark workspace reference'
                                                className={styles.browserImage}
                                                src={designReferenceImage}
                                            />
                                        </Panel>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {sidePeekOpen ? (
                        <aside className={styles.sidePeek}>
                            <div className={styles.sidePeekHeader}>
                                <span className={styles.sidePeekLabel}>
                                    <Icon name='panelRight' size='sm' />
                                    Side Peek
                                </span>
                                <IconButton
                                    kind='ghost'
                                    label='Close side peek'
                                    name='close'
                                    onClick={() => setSidePeekOpen(false)}
                                />
                            </div>

                            <div className={styles.sidePeekBody}>
                                <Heading level={2} size='md'>
                                    Phase 1: Core Outline Interaction
                                </Heading>
                                <div>
                                    <Badge tone='accent'>#milestone</Badge>
                                </div>
                                <Text className={styles.bodyText}>
                                    This milestone covers the fundamental interactions of the
                                    tree view. Users should be able to navigate completely via
                                    keyboard without touching the mouse, matching the speed of
                                    top-tier outlining tools.
                                </Text>
                                <span className={styles.referenceLabel}>
                                    Linked References (2)
                                </span>
                                <Panel className={styles.referenceCard} density='compact' emphasis='subtle'>
                                    <div className={styles.referenceMeta}>
                                        <Icon name='calendar' size='sm' />
                                        Daily Note
                                        <span>•</span>
                                        Oct 12
                                    </div>
                                    <Text>
                                        Need to prioritize{' '}
                                        <span className={styles.referenceHighlight}>
                                            [[Phase 1: Core Outline Interaction]]
                                        </span>{' '}
                                        for this week&apos;s sprint. The dragging logic feels too
                                        loose right now.
                                    </Text>
                                </Panel>
                            </div>
                        </aside>
                    ) : null}

                    {commandPaletteOpen ? (
                        <Panel className={styles.commandPalette} emphasis='strong'>
                            <div className={styles.commandHeader}>
                                <Icon name='search' tone='muted' />
                                <div className={styles.commandInputWrap}>
                                    <Input
                                        aria-label='Command palette query'
                                        readOnly
                                        value='Convert view to'
                                    />
                                </div>
                                <span className={styles.kbd}>ESC</span>
                            </div>

                            <span className={`${styles.sectionLabel} ${styles.commandSectionLabel}`}>
                                Views
                            </span>
                            <div className={styles.commandList}>
                                {viewOptions.map((option, index) => {
                                    const active = index === 0;
                                    return (
                                        <button
                                            key={option.id}
                                            className={`${styles.commandRow} ${
                                                active ? styles.commandRowActive : ''
                                            }`}
                                            onClick={() => {
                                                setViewMode(option.id);
                                                setCommandPaletteOpen(false);
                                            }}
                                            type='button'>
                                            <Icon name={option.icon} tone='muted' />
                                            <span className={styles.commandRowLabel}>
                                                Convert view to <strong>{option.actionLabel}</strong>
                                            </span>
                                            {active ? <span className={styles.commandKey}>↵</span> : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </Panel>
                    ) : null}
                </main>

                <aside className={styles.inspector}>
                    <div className={styles.inspectorHeader}>
                        <Text as='span' emphasis='strong'>
                            Inspector
                        </Text>
                        <div className={styles.footerItem}>
                            <IconButton kind='ghost' label='Pin inspector' name='pin' />
                            <IconButton kind='ghost' label='Close inspector' name='close' />
                        </div>
                    </div>

                    <ScrollArea className={styles.inspectorScroll}>
                        <section className={styles.inspectorSection}>
                            <span className={styles.sectionLabel}>Inspecting Node</span>
                            <div className={styles.inspectingRow}>
                                <Text as='span' emphasis='strong'>
                                    Current Tasks
                                </Text>
                                <Badge tone='accent'>#task-db</Badge>
                            </div>
                        </section>

                        <section className={styles.inspectorSection}>
                            <div className={styles.workspaceHeader}>
                                <Text as='span' emphasis='strong'>
                                    Fields
                                </Text>
                                <IconButton kind='ghost' label='Add field' name='plus' size='sm' />
                            </div>
                            <div className={styles.fieldList}>
                                {inspectorFields.map((field) => (
                                    <div key={field.label} className={styles.fieldRow}>
                                        <Icon name={field.icon} tone='muted' size='sm' />
                                        <span className={styles.fieldName}>{field.label}</span>
                                        <span className={styles.fieldType}>{field.value}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={styles.inspectorSection}>
                            <div className={styles.workspaceHeader}>
                                <span className={styles.footerItem}>
                                    <Icon name='zap' size='sm' style={{ color: '#facc15' }} />
                                    <Text as='span' emphasis='strong'>
                                        Automations
                                    </Text>
                                </span>
                            </div>
                            <div className={styles.automationList}>
                                <Panel className={styles.automationCard} density='compact' emphasis='subtle'>
                                    <div className={styles.automationHeader}>
                                        <span className={styles.automationName}>Mark complete</span>
                                        <span className={styles.toggle}>
                                            <span className={styles.toggleThumb} />
                                        </span>
                                    </div>
                                    <div className={styles.automationCopy}>
                                        <span>
                                            <strong>When</strong> Status changes to Done
                                        </span>
                                        <span>
                                            <strong>Then</strong> Set Due to Now
                                        </span>
                                    </div>
                                </Panel>

                                <Panel className={styles.automationCard} density='compact' emphasis='subtle'>
                                    <div className={styles.automationHeader}>
                                        <span className={styles.automationName}>Auto-Archive</span>
                                        <span className={styles.footerItem}>
                                            <span className={styles.scriptBadge}>Script</span>
                                            <span className={styles.toggle}>
                                                <span className={styles.toggleThumb} />
                                            </span>
                                        </span>
                                    </div>
                                    <div className={styles.scriptBlock}>
                                        <span className={styles.scriptKeyword}>if</span> (node.status =={' '}
                                        <span className={styles.scriptString}>&apos;Done&apos;</span>) {'{'}
                                        <br />
                                        &nbsp;&nbsp;archive(node);
                                        <br />
                                        {'}'}
                                    </div>
                                </Panel>

                                <Button kind='outline' startIcon='plus' type='button'>
                                    Add Automation
                                </Button>
                            </div>
                        </section>
                    </ScrollArea>
                </aside>
            </div>
        </LoomProvider>
    );
}
