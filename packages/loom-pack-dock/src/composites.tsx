'use client';

import * as React from 'react';

import {
    Avatar,
    Badge,
    Box,
    Breadcrumbs,
    Button,
    Heading,
    Icon,
    IconButton,
    Inline,
    Kbd,
    Panel,
    ScrollArea,
    Separator,
    Stack,
    Surface,
    Text,
    Toolbar,
} from '@loop-kit/loom-react';
import type { IconName } from '@loop-kit/loom-core';

export function DockTitlebar({
    actions,
    breadcrumbs,
    title,
}: {
    actions?: React.ReactNode;
    breadcrumbs?: React.ComponentProps<typeof Breadcrumbs>['items'];
    title: string;
}) {
    return (
        <Toolbar density='comfortable' style={{ border: 'none', borderRadius: 0 }}>
            <Stack gap='1' style={{ minWidth: 0 }}>
                {breadcrumbs?.length ? (
                    <Breadcrumbs items={breadcrumbs} size='sm' tone='muted' />
                ) : null}
                <Heading level={1} size='md'>
                    {title}
                </Heading>
            </Stack>
            {actions ? (
                <Inline align='center' gap='2' style={{ marginLeft: 'auto' }}>
                    {actions}
                </Inline>
            ) : null}
        </Toolbar>
    );
}

export function DockInspectorSection({
    children,
    title,
}: {
    children: React.ReactNode;
    title: string;
}) {
    return (
        <Stack gap='3'>
            <Text
                size='sm'
                tone='muted'
                style={{
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                }}>
                {title}
            </Text>
            {children}
        </Stack>
    );
}

export function DockPropertyRow({
    icon,
    label,
    value,
}: {
    icon: IconName;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <Inline align='center' gap='3' style={{ flexWrap: 'nowrap', width: '100%' }}>
            <Icon name={icon} size='sm' tone='muted' />
            <Text tone='muted' style={{ minWidth: '4.5rem' }}>
                {label}
            </Text>
            <Text style={{ flex: 1 }}>{value}</Text>
        </Inline>
    );
}

export function DockCommandItem({
    active,
    detail,
    icon,
    onClick,
    shortcut,
    title,
}: {
    active?: boolean;
    detail?: React.ReactNode;
    icon: IconName;
    onClick?: () => void;
    shortcut?: React.ReactNode;
    title: React.ReactNode;
}) {
    return (
        <Button
            kind={active ? 'soft' : 'ghost'}
            onClick={onClick}
            size='sm'
            style={{
                justifyContent: 'space-between',
                width: '100%',
            }}>
            <Inline align='center' gap='3' style={{ flexWrap: 'nowrap' }}>
                <Icon name={icon} size='md' tone='muted' />
                <Stack gap='1'>
                    <Text>{title}</Text>
                    {detail ? (
                        <Text size='sm' tone='muted'>
                            {detail}
                        </Text>
                    ) : null}
                </Stack>
            </Inline>
            {shortcut ? <Inline align='center' gap='1'>{shortcut}</Inline> : null}
        </Button>
    );
}

export function DockCommandSurface({
    children,
    query,
}: {
    children: React.ReactNode;
    query: string;
}) {
    return (
        <Panel density='compact' emphasis='strong' style={{ minWidth: 0 }}>
            <Stack gap='3'>
                <Toolbar density='comfortable' style={{ border: 'none', borderRadius: 0, paddingLeft: 0, paddingRight: 0 }}>
                    <Icon name='search' size='md' tone='muted' />
                    <Text emphasis='strong' style={{ flex: 1 }}>
                        {query}
                    </Text>
                    <Kbd size='sm'>Esc</Kbd>
                </Toolbar>
                <Separator />
                <Stack gap='1'>{children}</Stack>
            </Stack>
        </Panel>
    );
}

export function DockPeekCard({
    children,
    meta,
}: {
    children: React.ReactNode;
    meta?: React.ReactNode;
}) {
    return (
        <Surface emphasis='subtle' style={{ padding: '1rem' }}>
            <Stack gap='2'>
                {meta ? <Text size='sm' tone='muted'>{meta}</Text> : null}
                <Text>{children}</Text>
            </Stack>
        </Surface>
    );
}

export function DockBrowserFrame({
    children,
    url,
}: {
    children: React.ReactNode;
    url: string;
}) {
    return (
        <Panel density='compact' emphasis='subtle'>
            <Stack gap='3'>
                <Toolbar density='compact' style={{ border: 'none', borderRadius: 0, paddingLeft: 0, paddingRight: 0 }}>
                    <Inline align='center' gap='2'>
                        <Icon name='arrowLeft' size='sm' tone='muted' />
                        <Icon name='arrowRight' size='sm' tone='muted' />
                        <Icon name='refresh' size='sm' tone='muted' />
                    </Inline>
                    <Surface
                        emphasis='subtle'
                        style={{
                            flex: 1,
                            marginLeft: '0.5rem',
                            padding: '0.5rem 0.75rem',
                        }}>
                        <Inline align='center' gap='2' style={{ flexWrap: 'nowrap' }}>
                            <Icon name='lock' size='sm' tone='muted' />
                            <Text
                                size='sm'
                                style={{
                                    fontFamily: 'var(--loom-font-family-mono)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                {url}
                            </Text>
                        </Inline>
                    </Surface>
                </Toolbar>
                <Box>{children}</Box>
            </Stack>
        </Panel>
    );
}

export function DockMetaBadge({
    children,
    tone = 'muted',
}: {
    children: React.ReactNode;
    tone?: React.ComponentProps<typeof Badge>['tone'];
}) {
    return (
        <Badge kind='soft' tone={tone}>
            {children}
        </Badge>
    );
}

export function DockUserChip({
    name,
    src,
}: {
    name: string;
    src?: string;
}) {
    return (
        <Inline align='center' gap='2' style={{ flexWrap: 'nowrap' }}>
            <Avatar name={name} size='sm' src={src} />
            <Text>{name}</Text>
        </Inline>
    );
}

export function DockPanelActions({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Inline align='center' gap='1'>
            {children}
        </Inline>
    );
}

export function DockCloseButton({
    label,
    onClick,
}: {
    label: string;
    onClick?: () => void;
}) {
    return <IconButton kind='ghost' label={label} name='close' onClick={onClick} size='sm' />;
}
