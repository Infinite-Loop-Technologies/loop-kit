import { forwardRef } from 'react';

import { PanelSurfaceFrame } from './panel-surface';
import type { PanelSurfaceFrameProps } from '../extensions/types';

export type PanelProps = PanelSurfaceFrameProps;

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(props, ref) {
    return <PanelSurfaceFrame ref={ref} {...props} />;
});
