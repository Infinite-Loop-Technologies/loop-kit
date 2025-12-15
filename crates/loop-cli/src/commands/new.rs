use anyhow::{Result, bail};
use clap::Args;
use console::style;
use dialoguer::{Input, theme::ColorfulTheme};
use std::{fs, path::PathBuf};

use super::{print_info, print_success};

#[derive(Args)]
pub struct NewArgs {
    /// Project name
    name: String,
}

pub fn execute(args: NewArgs) -> Result<()> {
    let name = &args.name;
    let path = PathBuf::from(name);

    if path.exists() {
        bail!("Directory already exists: {}", path.display());
    }

    print_info(&format!("Creating project '{}'...", style(name).cyan()));

    // Create directories
    fs::create_dir_all(path.join("src"))?;
    fs::create_dir_all(path.join("wit"))?;

    // Cargo.toml
    fs::write(
        path.join("Cargo.toml"),
        format!(
            r#"[package]
name = "{}"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
wit-bindgen = "0.36"

[profile.release]
opt-level = "s"
lto = true
strip = true
"#,
            name
        ),
    )?;

    // .cargo/config.toml
    fs::create_dir_all(path.join(".cargo"))?;
    fs::write(
        path.join(".cargo/config.toml"),
        r#"[build]
target = "wasm32-wasip2"
"#,
    )?;

    // wit/deps.toml
    fs::write(
        path.join("wit/deps.toml"),
        r#"[surface]
url = "https://github.com/WebAssembly/wasi-gfx/archive/refs/heads/v0.0.1.tar.gz"
subdir = "surface"

[graphics-context]
url = "https://github.com/WebAssembly/wasi-gfx/archive/refs/heads/v0.0.1.tar.gz"
subdir = "graphics-context"

[frame-buffer]
url = "https://github.com/WebAssembly/wasi-gfx/archive/refs/heads/v0.0.1.tar.gz"
subdir = "frame-buffer"
"#,
    )?;

    // wit/world.wit
    fs::write(
        path.join("wit/world.wit"),
        format!(
            r#"package {}:app;

world app {{
    include wasi:surface/imports@0.0.1;
    include wasi:graphics-context/imports@0.0.1;
    include wasi:frame-buffer/imports@0.0.1;

    export start: func();
    import log: func(message: string);
}}
"#,
            name
        ),
    )?;

    // src/lib.rs
    let struct_name = to_pascal_case(name);
    fs::write(
        path.join("src/lib.rs"),
        format!(
            r#"wit_bindgen::generate!({{
    path: "wit",
    world: "app",
}});

export!({});

struct {};

impl Guest for {} {{
    fn start() {{
        log(&"Hello from loop-kit!".to_string());
        draw_window();
    }}
}}

use wasi::{{
    frame_buffer::frame_buffer,
    graphics_context::graphics_context,
    surface::surface,
}};

fn draw_window() {{
    // Create a window
    let canvas = surface::Surface::new(surface::CreateDesc {{
        height: Some(600),
        width: Some(800),
    }});

    // Create graphics context
    let ctx = graphics_context::Context::new();
    canvas.connect_graphics_context(&ctx);

    // Create frame buffer
    let fb = frame_buffer::Device::new();
    fb.connect_graphics_context(&ctx);

    // Subscribe to events
    let frame_pollable = canvas.subscribe_frame();
    let resize_pollable = canvas.subscribe_resize();
    let pointer_up_pollable = canvas.subscribe_pointer_up();

    let pollables = vec![&frame_pollable, &resize_pollable, &pointer_up_pollable];

    let mut width = canvas.width();
    let mut height = canvas.height();

    log(&format!("Window created: {{}}x{{}}", width, height));

    loop {{
        let ready = wasi::io::poll::poll(&pollables);

        if ready.contains(&1) {{
            let event = canvas.get_resize().unwrap();
            width = event.width;
            height = event.height;
            log(&format!("Resized: {{}}x{{}}", width, height));
        }}

        if ready.contains(&2) {{
            let event = canvas.get_pointer_up();
            log(&format!("Click at: {{:?}}", event));
        }}

        if ready.contains(&0) {{
            canvas.get_frame();

            let graphics_buffer = ctx.get_current_buffer();
            let buffer = frame_buffer::Buffer::from_graphics_buffer(graphics_buffer);

            // Fill with a gradient
            let mut pixels = vec![0u32; (width * height) as usize];
            for y in 0..height {{
                for x in 0..width {{
                    let r = (x * 255 / width.max(1)) as u32;
                    let g = (y * 255 / height.max(1)) as u32;
                    let b = 128u32;
                    pixels[(y * width + x) as usize] = (r << 16) | (g << 8) | b;
                }}
            }}

            buffer.set(bytemuck::cast_slice(&pixels));
            ctx.present();
        }}
    }}
}}
"#,
            struct_name, struct_name, struct_name
        ),
    )?;

    // .gitignore
    fs::write(
        path.join(".gitignore"),
        r#"target/
*.wasm
wit/deps/
"#,
    )?;

    print_success(&format!("Created project '{}'", name));
    println!("\n  Next steps:");
    println!("    cd {}", name);
    println!("    wit-deps  # Fetch WIT dependencies");
    println!("    loop build");
    println!("    loop run\n");

    Ok(())
}

fn to_pascal_case(s: &str) -> String {
    s.split(|c: char| !c.is_alphanumeric())
        .filter(|s| !s.is_empty())
        .map(|s| {
            let mut c = s.chars();
            match c.next() {
                None => String::new(),
                Some(f) => f.to_uppercase().chain(c).collect(),
            }
        })
        .collect()
}
