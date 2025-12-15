// crates/loop-cli/src/commands/build.rs
use std::path::PathBuf;
use std::process::Command;

use anyhow::{Context, Result, bail};
use clap::Args;
use console::style;
use indicatif::{ProgressBar, ProgressStyle};

use super::{
    command_exists, find_project_root, get_package_name, print_error, print_info, print_success,
};

#[derive(Args)]
pub struct BuildArgs {
    /// Build in release mode
    #[arg(short, long)]
    release: bool,

    /// Project directory
    #[arg(short, long)]
    path: Option<PathBuf>,
}

pub fn execute(args: BuildArgs) -> Result<()> {
    if !command_exists("cargo") {
        bail!("cargo not found. Please install Rust: https://rustup.rs");
    }

    let project_root = args
        .path
        .map(Ok)
        .unwrap_or_else(|| find_project_root(&std::env::current_dir()?))?;

    print_info(&format!(
        "Building {}",
        style(project_root.display()).cyan()
    ));

    // Check if wit/deps exists, suggest running wit-deps if not
    let wit_deps_dir = project_root.join("wit/deps");
    if !wit_deps_dir.exists() {
        print_info("WIT dependencies not found, running wit-deps update...");

        if command_exists("wit-deps") {
            let status = Command::new("wit-deps")
                .arg("update")
                .current_dir(&project_root)
                .status()
                .context("Failed to run wit-deps")?;

            if !status.success() {
                bail!("wit-deps update failed");
            }
        } else {
            print_error("wit-deps not installed. Install with: cargo install wit-deps-cli");
            print_info("Then run: wit-deps update");
            bail!("Missing WIT dependencies");
        }
    }

    let pb = ProgressBar::new_spinner();
    pb.set_style(
        ProgressStyle::default_spinner()
            .template("{spinner:.green} {msg}")
            .unwrap(),
    );
    pb.set_message("Compiling...");
    pb.enable_steady_tick(std::time::Duration::from_millis(100));

    let mut cmd = Command::new("cargo");
    cmd.current_dir(&project_root);
    cmd.arg("build");
    cmd.arg("--target").arg("wasm32-wasip2");

    if args.release {
        cmd.arg("--release");
    }

    let output = cmd.output().context("Failed to run cargo build")?;
    pb.finish_and_clear();

    if !output.status.success() {
        print_error("Build failed");
        eprintln!("{}", String::from_utf8_lossy(&output.stderr));
        bail!("Build failed");
    }

    let profile = if args.release { "release" } else { "debug" };
    let package_name = get_package_name(&project_root)?.replace('-', "_");
    let wasm_path = project_root
        .join("target/wasm32-wasip2")
        .join(profile)
        .join(format!("{}.wasm", package_name));

    if wasm_path.exists() {
        let size = std::fs::metadata(&wasm_path)?.len();
        let size_str = if size > 1024 * 1024 {
            format!("{:.2} MB", size as f64 / (1024.0 * 1024.0))
        } else {
            format!("{:.2} KB", size as f64 / 1024.0)
        };
        print_success(&format!(
            "Built {} ({})",
            style(wasm_path.display()).cyan(),
            size_str
        ));
    }

    Ok(())
}
