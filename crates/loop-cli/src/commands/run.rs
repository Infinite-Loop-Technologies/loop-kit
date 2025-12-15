// crates/loop-cli/src/commands/run.rs
//! Run a loop-kit project

use std::path::PathBuf;
use std::process::Command;

use anyhow::{Context, Result, bail};
use clap::Args;
use console::style;
use loop_runtime::{Runtime, RuntimeConfig};

use super::{find_project_root, print_error, print_info};

#[derive(Args)]
pub struct RunArgs {
    /// Run in release mode
    #[arg(short, long)]
    release: bool,

    /// Project directory
    #[arg(short, long)]
    path: Option<PathBuf>,

    /// Path to a specific wasm component to run
    #[arg(short, long)]
    component: Option<PathBuf>,

    /// Enable debug mode (verbose logging)
    #[arg(short, long)]
    debug: bool,

    /// Target FPS (0 for unlimited)
    #[arg(long, default_value = "60")]
    fps: u32,
}

pub fn execute(args: RunArgs) -> Result<()> {
    let wasm_path = if let Some(component) = args.component {
        // Direct component path specified
        if !component.exists() {
            bail!("Component not found: {}", component.display());
        }
        component
    } else {
        // Find and build project
        let project_root = if let Some(path) = &args.path {
            path.clone()
        } else {
            find_project_root(&std::env::current_dir()?)?
        };

        // Build first
        print_info("Building project...");
        let build_args = super::build::BuildArgs {
            release: args.release,
            path: Some(project_root.clone()),
            cargo_args: vec![],
        };
        super::build::execute(build_args)?;

        // Find the wasm file
        let profile = if args.release { "release" } else { "debug" };
        let target_dir = project_root.join("target/wasm32-wasip2").join(profile);

        let cargo_toml_path = project_root.join("Cargo.toml");
        let cargo_toml: toml::Value = toml::from_str(&std::fs::read_to_string(&cargo_toml_path)?)?;
        let package_name = cargo_toml["package"]["name"]
            .as_str()
            .context("Could not find package name")?
            .replace('-', "_");

        target_dir.join(format!("{}.wasm", package_name))
    };

    print_info(&format!("Running {}", style(wasm_path.display()).cyan()));

    // Create and run the runtime
    let config = RuntimeConfig {
        debug: args.debug,
        target_fps: args.fps,
    };

    let runtime = Runtime::new(config)?;
    runtime.run(&wasm_path)?;

    Ok(())
}
