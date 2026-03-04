import type { ComponentType, SVGProps } from 'react';

export type IconId = string;
export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type IconRegistry = {
    get: (id: IconId) => IconComponent | undefined;
    has: (id: IconId) => boolean;
    ids: () => IconId[];
};
