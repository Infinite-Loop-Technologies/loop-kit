// crates/loop-cli/src/commands/build.rs
//! Build a loop-kit project

use std::path::PathBuf;
use std::process::Command;

use anyhow::{Context, Result, bail};
use clap::Args;
use console::style;
use indicatif::{ProgressBar, ProgressStyle};

use super::{command_exists, find_project_root, print_error, print_info, print_success};

#[derive(Args)]
pub struct BuildArgs {
    /// Build in release mode
    #[arg(short, long)]
    release: bool,

    /// Project directory
    #[arg(short, long)]
    path: Option<PathBuf>,

    /// Additional arguments to pass to cargo
    #[arg(last = true)]
    cargo_args: Vec<String>,
}

pub fn execute(args: BuildArgs) -> Result<()> {
    // Check for required tools
    if !command_exists("cargo") {
        bail!("cargo not found. Please install Rust: https://rustup.rs");
    }

    // Find project root
    let project_root = if let Some(path) = args.path {
        path
    } else {
        find_project_root(&std::env::current_dir()?)?
    };

    print_info(&format!(
        "Building project at {}",
        style(project_root.display()).cyan()
    ));

    // Create progress bar
    let pb = ProgressBar::new_spinner();
    pb.set_style(
        ProgressStyle::default_spinner()
            .template("{spinner:.green} {msg}")
            .unwrap(),
    );
    pb.set_message("Compiling...");
    pb.enable_steady_tick(std::time::Duration::from_millis(100));

    // Build command
    let mut cmd = Command::new("cargo");
    cmd.current_dir(&project_root);
    cmd.arg("build");
    cmd.arg("--target").arg("wasm32-wasip2");

    if args.release {
        cmd.arg("--release");
    }

    for arg in &args.cargo_args {
        cmd.arg(arg);
    }

    // Run cargo build
    let output = cmd.output().context("Failed to run cargo build")?;

    pb.finish_and_clear();

    if !output.status.success() {
        print_error("Build failed");
        eprintln!("{}", String::from_utf8_lossy(&output.stderr));
        bail!("Build failed");
    }

    // Find the output wasm file
    let profile = if args.release { "release" } else { "debug" };
    let target_dir = project_root.join("target/wasm32-wasip2").join(profile);

    // Get package name from Cargo.toml
    let cargo_toml_path = project_root.join("Cargo.toml");
    let cargo_toml: toml::Value = toml::from_str(&std::fs::read_to_string(&cargo_toml_path)?)?;
    let package_name = cargo_toml["package"]["name"]
        .as_str()
        .context("Could not find package name")?
        .replace('-', "_");

    let wasm_file = target_dir.join(format!("{}.wasm", package_name));

    if !wasm_file.exists() {
        bail!("Expected wasm file not found: {}", wasm_file.display());
    }

    let file_size = std::fs::metadata(&wasm_file)?.len();
    let size_str = if file_size > 1024 * 1024 {
        format!("{:.2} MB", file_size as f64 / (1024.0 * 1024.0))
    } else if file_size > 1024 {
        format!("{:.2} KB", file_size as f64 / 1024.0)
    } else {
        format!("{} bytes", file_size)
    };

    print_success(&format!(
        "Built {} ({})",
        style(wasm_file.display()).cyan(),
        size_str
    ));

    Ok(())
}
