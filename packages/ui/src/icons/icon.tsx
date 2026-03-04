import type { SVGProps } from 'react';

import { defaultIconRegistry } from './default-pack';
import type { IconId, IconRegistry } from './types';

export type IconProps = SVGProps<SVGSVGElement> & {
    id: IconId;
    registry?: IconRegistry;
};

export function Icon({
    id,
    registry = defaultIconRegistry,
    ...props
}: IconProps) {
    const Component = registry.get(id);
    if (!Component) {
        return null;
    }

    return <Component aria-hidden='true' focusable='false' {...props} />;
}
