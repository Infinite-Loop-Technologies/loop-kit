import { DockWorkspaceDemo } from '@loop-kit/ui/blocks';

export function App() {
    return (
        <main className='ui-demo-shell'>
            <section className='ui-demo-hero'>
                <div className='ui-demo-copy'>
                    <p className='ui-demo-kicker'>Loop UI atelier</p>
                    <h1>Docked UI authoring, but with an actual point of view.</h1>
                    <p className='ui-demo-body'>
                        The workbench should feel like a polished skin studio, not a pile of
                        debug panels. This slice shifts the default demo toward a more atmospheric,
                        design-led direction while keeping the live token tooling intact.
                    </p>
                </div>

                <div className='ui-demo-meta'>
                    <span>atelier skin</span>
                    <span>light mode</span>
                    <span>live token editing</span>
                </div>
            </section>

            <section className='ui-demo-stage'>
                <DockWorkspaceDemo mode='full' initialSkinId='atelier' initialMode='light' />
            </section>
        </main>
    );
}
