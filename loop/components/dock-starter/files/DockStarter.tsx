import { GraphiteRuntime, asScopeId } from '@loop-kit/graphite-core';
import { GraphiteProvider } from '@loop-kit/graphite-react';
import { DockView, registerDockFacet } from '@loop-kit/dock';

const runtime = new GraphiteRuntime({ enableHistory: true });
registerDockFacet(runtime);

export function DockStarter() {
    return (
        <GraphiteProvider runtime={runtime} scopeId={asScopeId('dock')}>
            <DockView />
        </GraphiteProvider>
    );
}
