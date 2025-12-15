// src/commands/new.rs
use anyhow::{Context, Result};
use colored::*;
use std::fs;
use std::path::{Path, PathBuf};

pub fn execute(name: String, path: Option<PathBuf>) -> Result<()> {
    let project_path = if let Some(p) = path {
        p.join(&name)
    } else {
        PathBuf::from(&name)
    };

    if project_path.exists() {
        anyhow::bail!("Directory {} already exists", project_path.display());
    }

    println!(
        "{} Creating new Loop project: {}",
        "✨".green(),
        name.bold()
    );

    // Create project directory structure
    fs::create_dir_all(&project_path)?;
    fs::create_dir_all(project_path.join("src"))?;
    fs::create_dir_all(project_path.join("wit"))?;

    // Create Cargo.toml
    let cargo_toml = format!(
        r#"[package]
name = "{}"
version = "0.1.0"
edition = "2021"

[dependencies]
wit-bindgen = "0.16"

[lib]
crate-type = ["cdylib"]

[profile.release]
opt-level = "z"
lto = true
"#,
        name
    );
    fs::write(project_path.join("Cargo.toml"), cargo_toml)?;

    // Create .cargo/config.toml for WASM target
    fs::create_dir_all(project_path.join(".cargo"))?;
    let cargo_config = r#"[build]
target = "wasm32-wasi"

[target.wasm32-wasi]
runner = "loop run"
"#;
    fs::write(project_path.join(".cargo/config.toml"), cargo_config)?;

    // Create WIT interface
    let wit_interface = r#"package loop:app;

world app {
    import loop:host/window;
    import loop:host/graphics;
    
    export run: func();
}
"#;
    fs::write(project_path.join("wit/app.wit"), wit_interface)?;

    // Create host interfaces WIT
    let window_wit = r#"package loop:host;

interface window {
    record window-config {
        title: string,
        width: u32,
        height: u32,
        resizable: bool,
    }
    
    create-window: func(config: window-config) -> result<window-handle, string>;
    show-window: func(handle: window-handle);
    close-window: func(handle: window-handle);
    
    record window-handle {
        id: u32,
    }
}

interface graphics {
    clear: func(r: f32, g: f32, b: f32, a: f32);
    present: func();
}
"#;
    fs::write(project_path.join("wit/host.wit"), window_wit)?;

    // Create main library file
    let lib_rs = r#"wit_bindgen::generate!({
    world: "app",
    path: "./wit",
});

use crate::loop::host::window::{WindowConfig, WindowHandle};

struct Component;

impl Guest for Component {
    fn run() {
        // Create a window
        let config = WindowConfig {
            title: "Loop App".to_string(),
            width: 800,
            height: 600,
            resizable: true,
        };
        
        match loop::host::window::create_window(&config) {
            Ok(handle) => {
                loop::host::window::show_window(&handle);
                
                // Simple render loop
                loop {
                    loop::host::graphics::clear(0.2, 0.3, 0.3, 1.0);
                    loop::host::graphics::present();
                }
            }
            Err(e) => {
                eprintln!("Failed to create window: {}", e);
            }
        }
    }
}

export!(Component);
"#;
    fs::write(project_path.join("src/lib.rs"), lib_rs)?;

    // Create loop.toml configuration
    let loop_toml = r#"[project]
name = "{}"
version = "0.1.0"

[build]
target = "wasm32-wasi"

[runtime]
memory_limit = "100MB"
"#;
    fs::write(
        project_path.join("loop.toml"),
        loop_toml.replace("{}", &name),
    )?;

    println!("{} Project created successfully!", "✅".green());
    println!("\n{}", "To get started:".bold());
    println!("  cd {}", project_path.display());
    println!("  loop build");
    println!("  loop run");
    println!("\n{}", "Or start development mode:".bold());
    println!("  loop dev");

    Ok(())
}
