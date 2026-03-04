'use client';

import * as React from 'react';
import { AspectRatio } from './aspect-ratio';
import { Button } from './button';
import { Dialog, DialogContent, DialogTrigger } from './dialog';
import { ScrollArea } from './scroll-area';
import { Maximize2, Minimize2, Square } from 'lucide-react';

type PreviewProps = {
    children?: React.ReactNode;
    ratio?: number;
    className?: string;
};

type WebkitFullscreenElement = HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
};

type WebkitFullscreenDocument = Document & {
    webkitExitFullscreen?: () => Promise<void> | void;
};

/**
 * Centered modal + true fullscreen.
 * - Dialog is cleanly centered (uses shadcn defaults; no funky viewport widths).
 * - Fullscreen uses the browser Fullscreen API on the preview region.
 */
export function PreviewWithFullscreen({
    children,
    ratio = 16 / 9,
    className,
}: PreviewProps) {
    const [modalOpen, setModalOpen] = React.useState(false);
    const [isFs, setIsFs] = React.useState(false);
    const fsRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const onChange = () => setIsFs(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    const enterFs = async () => {
        const el = fsRef.current as WebkitFullscreenElement | null;
        if (!el) return;
        try {
            if (el.requestFullscreen) await el.requestFullscreen();
            else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        } catch {
            /* noop */
        }
    };

    const exitFs = async () => {
        const webkitDocument = document as WebkitFullscreenDocument;
        try {
            if (document.exitFullscreen) await document.exitFullscreen();
            else if (webkitDocument.webkitExitFullscreen) {
                await webkitDocument.webkitExitFullscreen();
            }
        } catch {
            /* noop */
        }
    };

    return (
        <div
            className={['relative w-full', className]
                .filter(Boolean)
                .join(' ')}>
            {/* Toolbar */}
            <div className='absolute right-2 top-2 z-10'>
                <div className='flex items-center gap-2 rounded-md border bg-background/80 px-2 py-1 shadow-sm backdrop-blur'>
                    {/* Centered modal trigger */}
                    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size='sm'
                                variant='outline'
                                aria-label='Open preview modal'>
                                <Square className='h-4 w-4' />
                            </Button>
                        </DialogTrigger>
                        <DialogContent
                            className='
                p-0 overflow-hidden
                w-[min(1200px,90vw)] sm:max-w-[90vw]
                max-h-[85dvh]
              '>
                            {/* Default shadcn Dialog centers content; no extra centering hacks */}
                            <ScrollArea className='h-full w-full'>
                                <div className='p-4'>
                                    <AspectRatio
                                        ratio={ratio}
                                        className='bg-card rounded-lg'>
                                        {children}
                                    </AspectRatio>
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>

                    {/* True fullscreen toggle */}
                    <Button
                        size='sm'
                        variant='outline'
                        onClick={() => (isFs ? exitFs() : enterFs())}
                        aria-label={
                            isFs ? 'Exit fullscreen' : 'Enter fullscreen'
                        }
                        title={isFs ? 'Exit fullscreen' : 'Enter fullscreen'}>
                        {isFs ? (
                            <Minimize2 className='h-4 w-4' />
                        ) : (
                            <Maximize2 className='h-4 w-4' />
                        )}
                    </Button>
                </div>
            </div>

            {/* Preview area (fullscreen target) */}
            <div ref={fsRef}>
                <ScrollArea>
                    <AspectRatio ratio={ratio} className='bg-card rounded-lg'>
                        {children}
                    </AspectRatio>
                </ScrollArea>
            </div>
        </div>
    );
}

