// crates/loop-cli/src/commands/new.rs
use std::fs;
use std::path::PathBuf;

use anyhow::{Result, bail};
use clap::Args;
use console::style;

use super::{print_info, print_success};

#[derive(Args)]
pub struct NewArgs {
    /// Project name
    name: String,

    /// Project directory (defaults to project name)
    #[arg(short, long)]
    path: Option<PathBuf>,
}

pub fn execute(args: NewArgs) -> Result<()> {
    let project_path = args.path.unwrap_or_else(|| PathBuf::from(&args.name));

    if project_path.exists() {
        bail!("Directory already exists: {}", project_path.display());
    }

    print_info(&format!(
        "Creating project '{}'...",
        style(&args.name).cyan()
    ));

    // Create directories
    fs::create_dir_all(project_path.join("src"))?;
    fs::create_dir_all(project_path.join("wit"))?;
    fs::create_dir_all(project_path.join(".cargo"))?;

    // Cargo.toml
    let cargo_toml = format!(
        r#"[package]
name = "{name}"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
wit-bindgen = "0.36"

[profile.release]
opt-level = "s"
lto = true
"#,
        name = args.name
    );
    fs::write(project_path.join("Cargo.toml"), cargo_toml)?;

    // .cargo/config.toml
    let cargo_config = r#"[build]
target = "wasm32-wasip2"

[target.wasm32-wasip2]
runner = "loop run"
"#;
    fs::write(project_path.join(".cargo/config.toml"), cargo_config)?;

    // wit/deps.toml
    let wit_deps = r#"# WASI GFX dependencies - run `wit-deps update` to fetch
[surface]
url = "https://github.com/aspect-build/aspect/archive/refs/heads/main.tar.gz"
subdir = "crates/wasi-surface/wit"

[graphics-context]
url = "https://github.com/aspect-build/aspect/archive/refs/heads/main.tar.gz"
subdir = "crates/wasi-graphics-context/wit"

[frame-buffer]
url = "https://github.com/aspect-build/aspect/archive/refs/heads/main.tar.gz"
subdir = "crates/wasi-frame-buffer/wit"

[io]
url = "https://github.com/aspect-build/aspect/archive/refs/heads/main.tar.gz"
subdir = "crates/wasi-surface/wit/deps/io"
"#;
    fs::write(project_path.join("wit/deps.toml"), wit_deps)?;

    // wit/world.wit
    let world_wit = format!(
        r#"package {name}:{name}@0.1.0;

world app {{
    include wasi:surface/imports@0.0.1;
    include wasi:graphics-context/imports@0.0.1;
    include wasi:frame-buffer/imports@0.0.1;

    export start: func();
    import print: func(s: string);
}}
"#,
        name = args.name.replace('-', "_")
    );
    fs::write(project_path.join("wit/world.wit"), world_wit)?;

    // src/lib.rs
    let lib_rs = format!(
        r#"//! {name} - A loop-kit application

wit_bindgen::generate!({{
    path: "wit",
    world: "app",
    generate_all,
}});

export!(App);

struct App;

impl Guest for App {{
    fn start() {{
        print("Hello from {name}!");
        run_app();
    }}
}}

use wasi::{{
    frame_buffer::frame_buffer,
    graphics_context::graphics_context,
    surface::surface,
}};

fn run_app() {{
    // Create a window/surface
    let canvas = surface::Surface::new(surface::CreateDesc {{
        height: Some(600),
        width: Some(800),
    }});

    // Create graphics context and connect it
    let gfx_ctx = graphics_context::Context::new();
    canvas.connect_graphics_context(&gfx_ctx);

    // Create frame buffer device
    let fb_device = frame_buffer::Device::new();
    fb_device.connect_graphics_context(&gfx_ctx);

    // Subscribe to events
    let frame_pollable = canvas.subscribe_frame();
    let resize_pollable = canvas.subscribe_resize();
    let pointer_down_pollable = canvas.subscribe_pointer_down();

    let pollables = vec![&frame_pollable, &resize_pollable, &pointer_down_pollable];

    let mut width = canvas.width();
    let mut height = canvas.height();
    let mut frame_count: u64 = 0;

    print(&format!("Window created: {{}}x{{}}", width, height));

    // Main loop
    loop {{
        let ready = wasi::io::poll::poll(&pollables);

        // Handle resize
        if ready.contains(&1) {{
            if let Some(event) = canvas.get_resize() {{
                width = event.width;
                height = event.height;
                print(&format!("Resized to: {{}}x{{}}", width, height));
            }}
        }}

        // Handle pointer/mouse
        if ready.contains(&2) {{
            if let Some(event) = canvas.get_pointer_down() {{
                print(&format!("Click at: ({{}}, {{}})", event.x, event.y));
            }}
        }}

        // Handle frame
        if ready.contains(&0) {{
            canvas.get_frame();
            frame_count += 1;

            // Get the current buffer
            let gfx_buffer = gfx_ctx.get_current_buffer();
            let buffer = frame_buffer::Buffer::from_graphics_buffer(gfx_buffer);

            // Create pixel data
            let mut pixels = vec![0u32; (width * height) as usize];
            
            // Draw a simple pattern
            for y in 0..height {{
                for x in 0..width {{
                    let idx = (y * width + x) as usize;
                    
                    // Animated gradient background
                    let t = (frame_count as f32 * 0.02).sin() * 0.5 + 0.5;
                    let r = ((x as f32 / width as f32) * 255.0 * t) as u32;
                    let g = ((y as f32 / height as f32) * 255.0) as u32;
                    let b = (128.0 + t * 127.0) as u32;
                    
                    pixels[idx] = (r << 16) | (g << 8) | b;
                }}
            }}

            // Draw a rectangle in the center
            let rect_size = 100u32;
            let rx = width / 2 - rect_size / 2;
            let ry = height / 2 - rect_size / 2;
            
            for y in ry..(ry + rect_size).min(height) {{
                for x in rx..(rx + rect_size).min(width) {{
                    let idx = (y * width + x) as usize;
                    pixels[idx] = 0xFFFFFF; // White
                }}
            }}

            // Send to buffer
            buffer.set(bytemuck::cast_slice(&pixels));
            
            // Present
            gfx_ctx.present();
        }}
    }}
}}
"#,
        name = args.name
    );
    fs::write(project_path.join("src/lib.rs"), lib_rs)?;

    // .gitignore
    let gitignore = r#"target/
wit/deps/
wit/deps.lock
"#;
    fs::write(project_path.join(".gitignore"), gitignore)?;

    // README
    let readme = format!(
        r#"# {name}

    A loop-kit application.
    ```bash
    loop run
    ```

    ## Setup

    First, fetch WIT dependencies:

    ```bash
    wit-deps update
    ```

    ## Building

    ```bash
    loop build
    # or
    cargo build --target wasm32-wasip2
    ```

    ## Running

    ```bash
    loop run
    ```
"#,
        name = args.name
    );

    fs::write(project_path.join("README.md"), readme)?;

    print_success(&format!("Created project '{}'", args.name));
    println!();
    println!("  Next steps:");
    println!("    {} {}", style("cd").cyan(), project_path.display());
    println!("    {} update", style("wit-deps").cyan());
    println!("    {} build", style("loop").cyan());
    println!("    {} run", style("loop").cyan());

    Ok(())
}
