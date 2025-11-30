import { React, LC, useResource } from '@use-gpu/live/mjs/index.mjs';
import { Pass } from '@use-gpu/workbench/mjs/index.mjs';
import { AutoCanvas, WebGPU } from '@use-gpu/webgpu/mjs/index.mjs';
import { HTML } from '@use-gpu/react/mjs/index.mjs';
import {
    Axis,
    Cartesian,
    Grid,
    Label,
    Plot,
    Point,
    Scale,
} from '@use-gpu/plot/mjs/index.mjs';
// This is annoying - it exports nothing.
import * as wgsl from '@use-gpu/wgsl';
import { FontLoader, OrbitCamera } from '@use-gpu/workbench';
import { OrbitControls } from '@use-gpu/interact';

const LiveGame: LC<{ canvas: HTMLCanvasElement }> = ({ canvas }) => {
    // NOT my favorite way of doing this
    useResource(() => {
        // shitty feature flag
        return;
        import('@dimforge/rapier3d').then((RAPIER) => {
            // Use the RAPIER module here.
            let gravity = { x: 0.0, y: -9.81, z: 0.0 };
            let world = new RAPIER.World(gravity);

            // Create the ground
            let groundColliderDesc = RAPIER.ColliderDesc.cuboid(
                10.0,
                0.1,
                10.0
            );
            world.createCollider(groundColliderDesc);

            // Create a dynamic rigid-body.
            let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
                0.0,
                1.0,
                0.0
            );
            let rigidBody = world.createRigidBody(rigidBodyDesc);

            // Create a cuboid collider attached to the dynamic rigidBody.
            let colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
            let collider = world.createCollider(colliderDesc, rigidBody);

            // Game loop. Replace by your own game loop system.
            let gameLoop = () => {
                // Step the simulation forward.
                world.step();

                // Get and print the rigid-body's position.
                let position = rigidBody.translation();
                console.log('Rigid-body position: ', position.x, position.y);

                setTimeout(gameLoop, 16);
            };

            gameLoop();
        });
    }, []);
    return (
        // TODO this boilerplate is lame.
        <WebGPU
            fallback={
                <HTML>
                    <h1>broke! or loading idk.</h1>
                </HTML>
            }>
            <AutoCanvas canvas={canvas} samples={4}>
                <OrbitControls>
                    {(radius, bearing, pitch, target) => (
                        <OrbitCamera radius={radius} target={[...target]}>
                            <Pass></Pass>
                        </OrbitCamera>
                    )}
                </OrbitControls>
            </AutoCanvas>
        </WebGPU>
    );
};
export default LiveGame;
