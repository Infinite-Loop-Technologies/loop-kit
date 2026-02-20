import { LC } from '@use-gpu/live';
import { HTML } from '@use-gpu/react/mjs/index.mjs';
import { wgsl } from '@use-gpu/shader/wgsl';
import { AutoCanvas, WebGPU } from '@use-gpu/webgpu/mjs/index.mjs';
import {
    FullScreen,
    Pass,
    useAnimationFrame,
} from '@use-gpu/workbench/mjs/index.mjs';

type Pointer = [number, number];

type LiveShadertoyProps = {
    canvas: HTMLCanvasElement;
    getTime: () => number;
    getMouse: () => Pointer;
};

const SHADERTOY_SHADER = wgsl`
@optional @link fn getTargetSize() -> vec2<f32> {
  return vec2<f32>(1280.0, 720.0);
}

@link fn getTime() -> f32;
@link fn getMouse() -> vec2<f32>;

fn rotate(v: vec2<f32>, angle: f32) -> vec2<f32> {
  let c = cos(angle);
  let s = sin(angle);
  return vec2<f32>(v.x * c - v.y * s, v.x * s + v.y * c);
}

fn palette(t: f32) -> vec3<f32> {
  let a = vec3<f32>(0.42, 0.31, 0.24);
  let b = vec3<f32>(0.38, 0.36, 0.58);
  let c = vec3<f32>(1.0, 1.0, 1.0);
  let d = vec3<f32>(0.08, 0.24, 0.41);
  return a + b * cos(6.28318 * (c * t + d));
}

@export fn getToyTexture(uv: vec2<f32>) -> vec4<f32> {
  let resolution = max(getTargetSize(), vec2<f32>(1.0, 1.0));
  let mouse = clamp(getMouse(), vec2<f32>(0.0, 0.0), vec2<f32>(1.0, 1.0));
  let time = getTime();
  let p = (uv * resolution * 2.0 - resolution) / resolution.y;
  let aspectMouse = vec2<f32>(
    (mouse.x * 2.0 - 1.0) * (resolution.x / resolution.y),
    mouse.y * 2.0 - 1.0
  );

  var z = p;
  var glow = 0.0;
  let twist = (mouse.x - 0.5) * 3.2;
  let speed = 0.35 + mouse.y * 2.25;

  for (var i: i32 = 0; i < 6; i = i + 1) {
    let fi = f32(i);
    z = rotate(z, twist + fi * 0.65);
    var wave = sin(z.x * (3.8 + fi * 0.15) + time * speed + fi);
    wave = wave + cos(z.y * (4.1 + fi * 0.2) - time * (speed * 0.6) + fi * 1.2);
    glow = glow + 0.22 / (0.18 + abs(wave));
    z = z * 1.36 + vec2<f32>(-0.19, 0.12);
  }

  let pulse = 0.6 + 0.4 * sin(time * (0.8 + mouse.x));
  let mouseGlow = exp(-length(p - aspectMouse) * (3.5 - mouse.y * 1.5));
  var color = palette(glow * 0.11 + time * 0.04) * (0.22 + glow * 0.55);
  color = color + vec3<f32>(1.0, 0.45, 0.22) * mouseGlow * pulse;

  let vignette = smoothstep(1.35, 0.18, length(p));
  return vec4<f32>(color * vignette, 1.0);
}
`;

const LiveShadertoy: LC<LiveShadertoyProps> = ({ canvas, getTime, getMouse }) => {
    useAnimationFrame();

    return (
        <WebGPU
            fallback={
                <HTML>
                    <div className='grid h-full place-items-center bg-black text-xs text-muted-foreground'>
                        WebGPU is unavailable in this browser.
                    </div>
                </HTML>
            }>
            <AutoCanvas canvas={canvas} samples={4}>
                <Pass>
                    <FullScreen
                        shader={SHADERTOY_SHADER}
                        args={[getTime, getMouse]}
                    />
                </Pass>
            </AutoCanvas>
        </WebGPU>
    );
};

export default LiveShadertoy;
