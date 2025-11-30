import { LC } from '@use-gpu/live';
import { AutoCanvas, WebGPU } from '@use-gpu/webgpu/mjs/index.mjs';
import { Pass } from '@use-gpu/workbench/mjs/index.mjs';

const LiveGame: LC<{ canvas: HTMLCanvasElement }> = ({ canvas }) => {
    return (
        <WebGPU fallback={undefined}>
            <AutoCanvas canvas={canvas} samples={4}>
                <Pass></Pass>
            </AutoCanvas>
        </WebGPU>
    );
};
export default LiveGame;
