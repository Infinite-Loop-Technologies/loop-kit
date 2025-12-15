// src/host/graphics.rs
use anyhow::Result;
use wasmtime::component::Linker;

pub fn add_to_linker<T>(linker: &mut Linker<T>) -> Result<()>
where
    T: Send + 'static,
{
    linker.func_wrap(
        "loop:host/graphics",
        "clear",
        |_caller: wasmtime::Caller<'_, T>, r: f32, g: f32, b: f32, a: f32| {
            // Clear the screen with the given color
            // This would integrate with a graphics backend like wgpu or OpenGL
            println!("Clearing screen with color: ({}, {}, {}, {})", r, g, b, a);
        },
    )?;

    linker.func_wrap(
        "loop:host/graphics",
        "present",
        |_caller: wasmtime::Caller<'_, T>| {
            // Present/swap buffers
            // This would integrate with the graphics backend
        },
    )?;

    Ok(())
}
