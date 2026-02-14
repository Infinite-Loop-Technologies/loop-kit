import { TextAttributes } from '@opentui/core';
import { parseArgs } from 'util';

const { values, positionals } = parseArgs({
    args: Bun.argv,
    options: {
        asdf: { type: 'string', default: 'default value' },
    },
    strict: true,
    allowPositionals: true,
});
console.log(values);
console.log(positionals);

// Make this a TUI using @opentui/react for a simple scriptable package management system
// HOW:
/**
 * This CLI will act as a host for loop-kit projects
 *
 * All that means is that it's an app that uses some loop-kit
 * capabilities/providers to be useful for making more stuff with loop-kit.
 *
 * So just as easily this could be a desktop app, or a web app.
 * The toolchain/compilation stuff can be ran through wRPC
 * The real key is just being able to run intents that succeed or fail,
 * and have structured requirements that make it obvious what you still need to set up
 * So in conclusion: maybe reuse shadcn react components in Tauri for temporary loop-kit.
 * Or better yet - try to get cef-rs working with Bun, and a nice windowing lib (tao unless cef-rs has one)
 */
switch (positionals[2]) {
    case 'start':
        console.log('Hi hi hi hi hi todo start');
        break;
    default:
        // Handle unknown command
        break;
}

export default function Entry() {
    <box flexDirection='column' flexGrow={1}>
        <text>Hello</text>
        <text attributes={TextAttributes.DIM}>Testing</text>
    </box>;
}
