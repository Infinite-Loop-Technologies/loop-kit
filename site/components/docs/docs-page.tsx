import { Prose } from '@/registry/new-york/ui/prose/prose';
import { cn } from '@/lib/utils';
import React from 'react';
import { ReactNode } from 'react';
import Image from 'next/image';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import {
    ItemContent,
    ItemTitle,
    ItemDescription,
    ItemActions,
    Item,
} from '@/components/ui/item';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
    ArrowLeftIcon,
    MoreHorizontalIcon,
    MailCheckIcon,
    ArchiveIcon,
    ClockIcon,
    CalendarPlusIcon,
    ListFilterPlusIcon,
    TagIcon,
    Trash2Icon,
    ArrowRightIcon,
} from 'lucide-react';
import { ButtonGroup } from '@/components/ui/button-group';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import useToggle, { Actions } from '@/hooks/use-toggle';

type DocsPageProps = {
    children: ReactNode;
    header?: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
};

export function DocsPage({
    children,
    header,
    subtitle,
    actions,
}: DocsPageProps) {
    return (
        <div className='flex basis-full'>
            <Prose className='' asChild>
                <div className='flex flex-col min-w-full  align-center basis-full '>
                    {/* Row: header left, actions right, vertically centered */}
                    <div className='flex w-full basis-full justify-between items-end-safe'>
                        {header}
                        {actions}
                    </div>
                    {/* Subtitle directly under both */}
                    {subtitle && (
                        <div className='text-sm text-muted-foreground'>
                            {subtitle}
                        </div>
                    )}
                    {children}
                </div>
            </Prose>
        </div>
    );
}

export function ExamplePreview({ children }: { children?: ReactNode }) {
    return (
        <ScrollArea>
            <AspectRatio ratio={16 / 9} className='bg-card rounded-lg'>
                {children}
            </AspectRatio>
        </ScrollArea>
    );
}

export function PageActions({
    children,
    toggleFullWidth,
}: {
    children?: ReactNode;
    toggleFullWidth: Actions<boolean>;
}) {
    if (!children) {
        return (
            <ButtonGroup>
                <ButtonGroup>
                    <Button variant='outline' size='sm'>
                        Snooze
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='outline'
                                size='sm'
                                aria-label='More Options'>
                                <MoreHorizontalIcon />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-52'>
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <MailCheckIcon />
                                    Mark as Read
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <ArchiveIcon />
                                    Archive
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <ClockIcon />
                                    Snooze
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <CalendarPlusIcon />
                                    Add to Calendar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <ListFilterPlusIcon />
                                    Add to List
                                </DropdownMenuItem>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <TagIcon />
                                        Label As...
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuRadioGroup value={'asdf'}>
                                            <DropdownMenuRadioItem value='personal'>
                                                Personal
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value='work'>
                                                Work
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value='other'>
                                                Other
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem variant='destructive'>
                                    <Trash2Icon />
                                    Trash
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </ButtonGroup>
                <ButtonGroup className='hidden sm:flex'>
                    <Button variant='outline' size='sm' aria-label='Go Back'>
                        <ArrowLeftIcon />
                    </Button>
                    <Button variant='outline' size='sm' aria-label='Go Back'>
                        <ArrowRightIcon />
                    </Button>
                </ButtonGroup>
            </ButtonGroup>
        );
    }
    return <>{children}</>;
}

type NormalDocsPageProps = {
    header: string;
    subtitle?: string;
    children: ReactNode;
};

export function NormalDocsPage({
    header,
    subtitle,
    children,
}: NormalDocsPageProps) {
    const [fullWidth, toggle] = useToggle(false, true);

    return (
        <div className='flex justify-center content-center items-center'>
            <div className={cn('p-8', fullWidth ? 'w-full' : 'w-1/2')}>
                <DocsPage
                    header={
                        <h1
                            className={cn(
                                'mt-0 mb-0 text-3xl font-semibold leading-tight'
                            )}>
                            {header}
                        </h1>
                    }
                    subtitle={
                        subtitle ? (
                            <p className='mt-0 mb-0 text-sm text-muted-foreground'>
                                {subtitle}
                            </p>
                        ) : undefined
                    }
                    actions={<PageActions toggleFullWidth={toggle} />}>
                    {children}
                </DocsPage>
            </div>
        </div>
    );
}
