import { DockWorkspaceDemo } from '@loop-kit/loom-pack-dock';

export function App() {
    return (
        <main className='dock-demo-shell'>
            <section className='dock-demo-hero'>
                <div className='dock-demo-copy'>
                    <p className='dock-demo-kicker'>Dock Demo</p>
                    <h1>Dock composition now lives in a Loom pack, not in the legacy UI system.</h1>
                    <p className='dock-demo-body'>
                        This app is focused on the dock workbench itself: tabs, splits, overlays,
                        shortcuts, and theme swapping through the new Loom provider stack.
                    </p>
                </div>
                <div className='dock-demo-meta'>
                    <span>loom-pack-dock</span>
                    <span>graphite-backed layout</span>
                    <span>theme swap</span>
                    <span>interaction registries</span>
                </div>
            </section>

            <section className='dock-demo-stage'>
                <DockWorkspaceDemo mode='full' />
            </section>
        </main>
    );
}
