import { rolldown } from '@rolldown/browser';

// CHECK THIS OUT: https://github.com/sxzz/bundler-explorer/blob/main/app/composables/bundlers/rolldown.ts

const bundle = await rolldown({
    // input options
    input: 'src/main.js',
});

// generate bundles in memory with different output options
await bundle.generate({
    // output options
    format: 'esm',
});
await bundle.generate({
    // output options
    format: 'cjs',
});

// or directly write to disk
await bundle.write({
    file: 'bundle.js',
});

// The question: what the fuck does src/main.js resolve to?
