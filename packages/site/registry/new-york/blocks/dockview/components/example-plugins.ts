// my-awesome-plugin/index.ts
import { definePanelPlugin } from '@loop-kit/panels';

export default definePanelPlugin('awesome', (ctx) => {
    // reactive options come from props at mount time:
    const { featureFlags } = ctx.options; // e.g. { audit: true }

    ctx.route({
        path: '/awesome/:tab?',
        component: () => <AwesomePanel flags={featureFlags} />,
        meta: { icon: 'sparkles' },
    });

    ctx.command({
        id: 'awesome.open',
        title: 'Open Awesome',
        run: () => ctx.actions.open('/awesome/overview', { kind: 'activate' }),
    });

    // Optional lifecycle hooks
    ctx.onSerialize((snapshot) => {
        /* store plugin state */
    });
    ctx.onDispose(() => {
        /* cleanup */
    });
});
