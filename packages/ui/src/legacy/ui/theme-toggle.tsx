'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './dropdown-menu';
import { useTheme } from '../../theme';

export function ModeToggle() {
    const { mode, setMode } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='outline' size='icon'>
                    <Sun
                        className='h-[1.2rem] w-[1.2rem] transition-all'
                        style={{
                            opacity: mode === 'dark' ? 0 : 1,
                            transform:
                                mode === 'dark'
                                    ? 'rotate(-90deg) scale(0.8)'
                                    : 'rotate(0deg) scale(1)',
                        }}
                    />
                    <Moon
                        className='absolute h-[1.2rem] w-[1.2rem] transition-all'
                        style={{
                            opacity: mode === 'dark' ? 1 : 0,
                            transform:
                                mode === 'dark'
                                    ? 'rotate(0deg) scale(1)'
                                    : 'rotate(90deg) scale(0.8)',
                        }}
                    />
                    <span className='sr-only'>Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => setMode('light')}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode('dark')}>
                    Dark
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

