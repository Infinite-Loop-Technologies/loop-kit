import type { SVGProps } from 'react';

import { useOptionalUiProviderState } from '../skins';
import { defaultIconRegistry } from './default-pack';
import type { IconId, IconRegistry } from './types';

export type IconProps = SVGProps<SVGSVGElement> & {
    id: IconId;
    registry?: IconRegistry;
};

export function Icon({
    id,
    registry,
    ...props
}: IconProps) {
    const ui = useOptionalUiProviderState();
    const activeRegistry = registry ?? ui?.iconRegistry ?? defaultIconRegistry;
    const Component = activeRegistry.get(id);
    if (!Component) {
        return null;
    }

    return <Component aria-hidden='true' focusable='false' {...props} />;
}
