import { LoopRuntime } from '../runtime/runtime';
import { JsProvider } from '../providers/js/js-provider';

const rt = new LoopRuntime();

await rt.addProvider(new JsProvider('echo', (req) => req.payload), [
    'debug.echo',
]);

const res = await rt.call({
    capability: 'debug.echo',
    payload: { hello: 'loop-kit' },
});

console.log(res);
await rt.shutdown();
