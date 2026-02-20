'use client';

import { useEffect, useState } from 'react';

import { RegistryLiveDemo } from '@/components/docs/registry-live-demo';
import type { DocDemoSize } from '@/lib/docs/types';

type RegistryEmbedShellProps = {
  itemName: string;
  size: DocDemoSize;
  trapShortcuts?: boolean;
};

const TRAPPED_SHORTCUTS = [
  'alt+shift+n',
  'alt+shift+t',
  'alt+shift+l',
  'alt+shift+u',
  'alt+shift+backspace',
  'mod+k',
] as const;

function normalizeToken(token: string): string {
  const lowered = token.toLowerCase();
  if (lowered === 'cmd') return 'meta';
  if (lowered === 'command') return 'meta';
  if (lowered === 'option') return 'alt';
  if (lowered === 'cmdorctrl') return 'mod';
  return lowered;
}

function normalizeShortcut(shortcut: string): string[] {
  return shortcut
    .split('+')
    .map((part) => normalizeToken(part.trim()))
    .filter(Boolean);
}

function normalizeEventKey(key: string) {
  const lowered = key.toLowerCase();
  if (lowered === 'esc') return 'escape';
  if (lowered === 'del') return 'backspace';
  return lowered;
}

function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = normalizeShortcut(shortcut);
  const keyToken = parts.find(
    (part) =>
      part !== 'alt' &&
      part !== 'shift' &&
      part !== 'ctrl' &&
      part !== 'meta' &&
      part !== 'mod'
  );
  if (!keyToken) return false;

  const hasMod = parts.includes('mod');
  const hasCtrl = parts.includes('ctrl') || hasMod;
  const hasMeta = parts.includes('meta') || hasMod;
  const hasAlt = parts.includes('alt');
  const hasShift = parts.includes('shift');

  if (hasCtrl !== event.ctrlKey && !hasMod) return false;
  if (hasMeta !== event.metaKey && !hasMod) return false;
  if (hasMod && !(event.ctrlKey || event.metaKey)) return false;
  if (hasAlt !== event.altKey) return false;
  if (hasShift !== event.shiftKey) return false;

  return normalizeEventKey(event.key) === keyToken;
}

export function RegistryEmbedShell({
  itemName,
  size,
  trapShortcuts = false,
}: RegistryEmbedShellProps) {
  const [activeTrap, setActiveTrap] = useState(trapShortcuts);

  useEffect(() => {
    if (!activeTrap) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && normalizeEventKey(event.key) === 'escape') {
        if (event.cancelable) event.preventDefault();
        setActiveTrap(false);
        return;
      }

      const shouldTrap = TRAPPED_SHORTCUTS.some((shortcut) =>
        matchesShortcut(event, shortcut)
      );
      if (!shouldTrap) return;
      if (event.cancelable) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true });
    };
  }, [activeTrap]);

  return (
    <main className='h-screen w-screen overflow-hidden bg-background p-2'>
      <div
        className={`relative h-full rounded-xl ${
          activeTrap ? 'ring-2 ring-amber-500/90' : 'ring-1 ring-border'
        }`}
      >
        {activeTrap ? (
          <div className='absolute inset-x-3 top-3 z-20 rounded-md border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-xs font-medium text-amber-100 backdrop-blur'>
            Keyboard shortcuts are trapped in this iframe. Press <strong>Shift+Escape</strong> to release.
          </div>
        ) : (
          <button
            type='button'
            className='absolute right-3 top-3 z-20 rounded-md border border-border bg-card/80 px-3 py-1.5 text-xs text-foreground hover:bg-accent'
            onClick={() => setActiveTrap(true)}
          >
            Enable iframe shortcut trap
          </button>
        )}

        <RegistryLiveDemo
          itemName={itemName}
          size={size}
          mode='inline'
          className='h-full'
        />
      </div>
    </main>
  );
}
