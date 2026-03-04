import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Arena, chooseWinner } from '../src/interaction/arena.js';

test('arena chooses winner deterministically when scores tie', () => {
    const winner = chooseWinner([
        { recognizerId: 'z-recognizer', decision: { proposeScore: 10 } },
        { recognizerId: 'a-recognizer', decision: { proposeScore: 10 } },
    ]);

    assert.equal(winner?.recognizerId, 'a-recognizer');
});

test('arena honors capture precedence until release', () => {
    const arena = new Arena();

    const down = arena.resolve(
        { kind: 'pointerdown', pointerId: 1, x: 0, y: 0 },
        [{ recognizerId: 'drag', decision: { proposeScore: 1, capture: true } }],
    );
    assert.equal(down.winnerId, 'drag');
    assert.equal(down.capturedBy, 'drag');

    const move = arena.resolve(
        { kind: 'pointermove', pointerId: 1, x: 20, y: 20 },
        [
            { recognizerId: 'drag', decision: { proposeScore: 0 } },
            { recognizerId: 'hover', decision: { proposeScore: 100 } },
        ],
    );
    assert.equal(move.winnerId, 'drag');

    const up = arena.resolve(
        { kind: 'pointerup', pointerId: 1, x: 20, y: 20 },
        [{ recognizerId: 'drag', decision: { proposeScore: 0 } }],
    );
    assert.equal(up.releasedCapture, true);
    assert.equal(arena.getCapturedRecognizerId(), undefined);
});
