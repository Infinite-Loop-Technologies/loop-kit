import React, { render } from '@use-gpu/live';
import LiveGame from './live-game';
import { LiveCanvas } from '@use-gpu/react/mjs/index.mjs';

export default function Game() {
    return <LiveCanvas>{(canvas) => <LiveGame canvas={canvas} />}</LiveCanvas>;
}
