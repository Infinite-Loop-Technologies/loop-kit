'use client';

import * as React from 'react';
import type {
    FrameNode,
    SplitDirection,
} from '@/components/panels/panel-board';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

export function makeRow(leaves: string[]): FrameNode {
    return {
        type: 'row',
        sizes: normalize(leaves.map(() => 1)),
        children: leaves.map((slotId) => ({ type: 'leaf', slotId })),
    };
}

export function normalize(sizes: number[]) {
    const sum = sizes.reduce((a, b) => a + b, 0) || 1;
    const n = sizes.map((s) => (s / sum) * 100);
    const r = n.map((x) => Math.max(1, Math.round(x)));
    const diff = 100 - r.reduce((a, b) => a + b, 0);
    if (diff) {
        let iMax = 0;
        for (let i = 1; i < r.length; i++) if (r[i] > r[iMax]) iMax = i;
        r[iMax] = Math.max(1, r[iMax] + diff);
    }
    return r;
}

export function useFrame(initialSlots: string[]) {
    const [frame, setFrame] = React.useState<FrameNode>(() =>
        makeRow(initialSlots)
    );

    const contains = React.useCallback(
        (node: FrameNode, slotId: string): boolean => {
            if (node.type === 'leaf') return node.slotId === slotId;
            return node.children.some((c) => contains(c, slotId));
        },
        []
    );

    const split = React.useCallback(
        (slotId: string, dir: SplitDirection, newSlotId: string) => {
            if (dir === 'C') return;
            setFrame((prev) => {
                const next = clone(prev);
                function walk(n: FrameNode): FrameNode {
                    if (n.type === 'leaf') {
                        if (n.slotId !== slotId) return n;
                        if (dir === 'E' || dir === 'W') {
                            const children =
                                dir === 'E'
                                    ? [
                                          n,
                                          {
                                              type: 'leaf',
                                              slotId: newSlotId,
                                          } as FrameNode,
                                      ]
                                    : [
                                          {
                                              type: 'leaf',
                                              slotId: newSlotId,
                                          } as FrameNode,
                                          n,
                                      ];
                            return {
                                type: 'row',
                                children,
                                sizes: normalize([1, 1]),
                            };
                        }
                        const children =
                            dir === 'S'
                                ? [
                                      n,
                                      {
                                          type: 'leaf',
                                          slotId: newSlotId,
                                      } as FrameNode,
                                  ]
                                : [
                                      {
                                          type: 'leaf',
                                          slotId: newSlotId,
                                      } as FrameNode,
                                      n,
                                  ];
                        return {
                            type: 'col',
                            children,
                            sizes: normalize([1, 1]),
                        };
                    }
                    const idx = n.children.findIndex((c) =>
                        contains(c, slotId)
                    );
                    if (idx === -1) return n;
                    const kids = n.children.map((c, i) =>
                        i === idx ? walk(c) : c
                    );
                    return {
                        type: n.type,
                        children: kids,
                        sizes: normalize(kids.map(() => 1)),
                    };
                }
                return walk(next);
            });
        },
        [contains]
    );

    const prune = React.useCallback((slotId: string) => {
        setFrame((prev) => {
            function walk(n: FrameNode): FrameNode | null {
                if (n.type === 'leaf') return n.slotId === slotId ? null : n;
                const kids = n.children
                    .map(walk)
                    .filter(Boolean) as FrameNode[];
                if (kids.length === 0) return null;
                if (kids.length === 1) return kids[0];
                return {
                    type: n.type,
                    children: kids,
                    sizes: normalize(kids.map(() => 1)),
                };
            }
            return walk(prev) ?? prev;
        });
    }, []);

    return { frame, setFrame, split, prune };
}
