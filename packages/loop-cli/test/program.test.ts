import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgram } from '../src/program.js';

test('program exposes expected top-level commands', () => {
    const program = createProgram();
    const names = program.commands.map((command) => command.name());

    assert.ok(names.includes('init'));
    assert.ok(names.includes('doctor'));
    assert.ok(names.includes('fix'));
    assert.ok(names.includes('graph'));
    assert.ok(names.includes('run'));
    assert.ok(names.includes('ci'));
    assert.ok(names.includes('new'));
    assert.ok(names.includes('add'));
    assert.ok(names.includes('update'));
    assert.ok(names.includes('diff'));
    assert.ok(names.includes('extract'));
    assert.ok(names.includes('adopt'));
    assert.ok(names.includes('undo'));
    assert.ok(names.includes('component'));
    assert.ok(names.includes('request'));
    assert.ok(names.includes('loopd'));
    assert.ok(names.includes('mcp'));
    assert.ok(names.includes('ai'));
    assert.ok(names.includes('lane'));
    assert.ok(names.includes('toolchain'));
});

test('lane add exposes --config and legacy --options flags', () => {
    const program = createProgram();
    const lane = program.commands.find((command) => command.name() === 'lane');
    assert.ok(lane);
    if (!lane) {
        return;
    }

    const laneAdd = lane.commands.find((command) => command.name() === 'add');
    assert.ok(laneAdd);
    if (!laneAdd) {
        return;
    }

    const flags = laneAdd.options.map((option) => option.flags);
    assert.ok(flags.includes('--config <json>'));
    assert.ok(flags.includes('--options <json>'));
});

test('all new commands include shared --cwd root option', () => {
    const program = createProgram();
    const rootFlags = program.options.map((option) => option.flags);
    assert.ok(rootFlags.includes('--cwd <path>'));
});
