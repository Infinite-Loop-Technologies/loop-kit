'use client';

import * as React from 'react';
import type { BoardLayout } from '@/components/panels/panel-board';
import type { TabItem } from '@/components/panels/animated-tab-strip';

export type PanelBoardAPI<T = unknown> = {
    // slots
    addSlot: (
        slotId: string,
        opts?: { tabs?: TabItem<T>[]; activeId?: string }
    ) => void;
    ensureSlot: (
        slotId: string,
        opts?: { tabs?: TabItem<T>[]; activeId?: string }
    ) => void;
    removeSlot: (slotId: string) => void;

    // tabs
    addTab: (
        slotId: string,
        tab: TabItem<T>,
        index?: number | 'append'
    ) => void;
    closeTab: (tabId: string) => void;
    activateTab: (tabId: string) => void;
    moveTab: (
        tabId: string,
        toSlotId: string,
        index: number | 'append'
    ) => void;
    reorderTabs: (slotId: string, ids: string[]) => void;

    // queries
    findTabSlot: (tabId: string) => string | null;
};

export function genId(prefix = 't') {
    return `${prefix}${Math.random().toString(36).slice(2, 8)}`;
}

export function usePanelBoard<T>(initial: BoardLayout<T>) {
    const [layout, setLayout] = React.useState<BoardLayout<T>>(initial);

    const findTabSlot = React.useCallback(
        (tabId: string) => {
            for (const slot of Object.values(layout)) {
                if (slot.tabs.some((t) => t.id === tabId)) return slot.id;
            }
            return null;
        },
        [layout]
    );

    const addSlot = React.useCallback(
        (slotId: string, opts?: { tabs?: any[]; activeId?: string }) => {
            setLayout((cur) => {
                if (cur[slotId]) return cur;
                return {
                    ...cur,
                    [slotId]: {
                        id: slotId,
                        tabs: opts?.tabs ?? [],
                        activeId: opts?.activeId,
                    },
                };
            });
        },
        []
    );

    const ensureSlot = React.useCallback(
        (slotId: string, opts?: { tabs?: any[]; activeId?: string }) => {
            setLayout((cur) => {
                if (cur[slotId]) return cur;
                return {
                    ...cur,
                    [slotId]: {
                        id: slotId,
                        tabs: opts?.tabs ?? [],
                        activeId: opts?.activeId,
                    },
                };
            });
        },
        []
    );

    const removeSlot = React.useCallback((slotId: string) => {
        setLayout((cur) => {
            if (!cur[slotId]) return cur;
            const next = { ...cur };
            delete next[slotId];
            return next;
        });
    }, []);

    const addTab = React.useCallback(
        (
            slotId: string,
            tab: TabItem<T>,
            index: number | 'append' = 'append'
        ) => {
            setLayout((cur) => {
                const slot = cur[slotId];
                if (!slot) return cur;
                const pos =
                    index === 'append'
                        ? slot.tabs.length
                        : Math.max(0, Math.min(index, slot.tabs.length));
                const tabs = slot.tabs.slice();
                tabs.splice(pos, 0, tab);
                return {
                    ...cur,
                    [slotId]: { ...slot, tabs, activeId: tab.id },
                };
            });
        },
        []
    );

    const closeTab = React.useCallback((tabId: string) => {
        setLayout((cur) => {
            const next = { ...cur };
            for (const slot of Object.values(next)) {
                const idx = slot.tabs.findIndex((t) => t.id === tabId);
                if (idx !== -1) {
                    const removed = slot.tabs[idx];
                    slot.tabs = slot.tabs
                        .slice(0, idx)
                        .concat(slot.tabs.slice(idx + 1));
                    if (slot.activeId === removed.id)
                        slot.activeId = slot.tabs[0]?.id;
                    break;
                }
            }
            return next;
        });
    }, []);

    const activateTab = React.useCallback((tabId: string) => {
        setLayout((cur) => {
            const next = { ...cur };
            for (const slot of Object.values(next)) {
                if (slot.tabs.some((t) => t.id === tabId)) {
                    slot.activeId = tabId;
                    break;
                }
            }
            return next;
        });
    }, []);

    const moveTab = React.useCallback(
        (tabId: string, toSlotId: string, index: number | 'append') => {
            setLayout((cur) => {
                // safe structural copy, no functions cloned
                const next: BoardLayout<T> = Object.fromEntries(
                    Object.entries(cur).map(([sid, s]) => [
                        sid,
                        {
                            id: s.id,
                            activeId: s.activeId,
                            tabs: s.tabs.map((t) => ({
                                id: t.id,
                                title: t.title,
                                data: t.data,
                            })),
                        },
                    ])
                );

                // find source
                let srcId: string | null = null;
                let srcIdx = -1;
                for (const s of Object.values(next)) {
                    const i = s.tabs.findIndex((t) => t.id === tabId);
                    if (i !== -1) {
                        srcId = s.id;
                        srcIdx = i;
                        break;
                    }
                }
                if (!srcId) return cur;

                const [tab] = next[srcId].tabs.splice(srcIdx, 1);
                if (next[srcId].activeId === tab.id)
                    next[srcId].activeId = next[srcId].tabs[0]?.id;

                // insert
                if (!next[toSlotId])
                    next[toSlotId] = {
                        id: toSlotId,
                        tabs: [],
                        activeId: undefined,
                    };
                const dst = next[toSlotId];
                const pos =
                    index === 'append'
                        ? dst.tabs.length
                        : Math.max(0, Math.min(index, dst.tabs.length));
                dst.tabs.splice(pos, 0, tab);
                dst.activeId = tab.id;

                return next;
            });
        },
        []
    );

    const reorderTabs = React.useCallback((slotId: string, ids: string[]) => {
        setLayout((cur) => {
            const slot = cur[slotId];
            if (!slot) return cur;
            const map = new Map(slot.tabs.map((t) => [t.id, t]));
            const tabs = ids.map((id) => map.get(id)!).filter(Boolean);
            return { ...cur, [slotId]: { ...slot, tabs } };
        });
    }, []);

    const addTabUnique = React.useCallback(
        (
            slotId: string,
            tab: TabItem<T> & { id?: string },
            index: number | 'append' = 'append'
        ) => {
            // ensure uniqueness within the target slot
            const id = tab.id ?? genId('tab_');
            setLayout((cur) => {
                const slot = cur[slotId];
                if (!slot) return cur;
                const finalId = slot.tabs.some((t) => t.id === id)
                    ? genId(`${id}_`)
                    : id;
                const newTab = { ...tab, id: finalId };
                const pos =
                    index === 'append'
                        ? slot.tabs.length
                        : Math.max(0, Math.min(index, slot.tabs.length));
                const tabs = slot.tabs.slice();
                tabs.splice(pos, 0, newTab);
                return {
                    ...cur,
                    [slotId]: { ...slot, tabs, activeId: newTab.id },
                };
            });
        },
        []
    );

    const api: PanelBoardAPI<T> = {
        addSlot,
        ensureSlot,
        removeSlot,
        addTab,
        closeTab,
        activateTab,
        moveTab,
        reorderTabs,
        findTabSlot,
    };
    // expose helpers
    return { layout, setLayout, api, addTabUnique, genId };
}
