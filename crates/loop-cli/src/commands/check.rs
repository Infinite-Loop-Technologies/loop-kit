// crates/loop-cli/src/commands/check.rs
//! Check project configuration

use std::path::PathBuf;

use anyhow::{Context, Result};
use clap::Args;
use console::style;

use super::{
    command_exists, find_project_root, print_error, print_info, print_success, print_warn,
};

#[derive(Args)]
pub struct CheckArgs {
    /// Project directory
    #[arg(short, long)]
    path: Option<PathBuf>,
}

pub fn execute(args: CheckArgs) -> Result<()> {
    println!("{}", style("Loop-Kit Environment Check").bold());
    println!();

    let mut all_ok = true;

    // Check Rust toolchain
    print_info("Checking Rust toolchain...");
    if command_exists("rustc") {
        let output = std::process::Command::new("rustc")
            .arg("--version")
            .output()?;
        let version = String::from_utf8_lossy(&output.stdout);
        print_success(&format!("rustc: {}", version.trim()));
    } else {
        print_error("rustc not found");
        all_ok = false;
    }

    // Check cargo
    if command_exists("cargo") {
        let output = std::process::Command::new("cargo")
            .arg("--version")
            .output()?;
        let version = String::from_utf8_lossy(&output.stdout);
        print_success(&format!("cargo: {}", version.trim()));
    } else {
        print_error("cargo not found");
        all_ok = false;
    }

    // Check wasm32-wasip2 target
    print_info("Checking WASM target...");
    let output = std::process::Command::new("rustup")
        .args(["target", "list", "--installed"])
        .output();

    if let Ok(output) = output {
        let targets = String::from_utf8_lossy(&output.stdout);
        if targets.contains("wasm32-wasip2") {
            print_success("wasm32-wasip2 target installed");
        } else {
            print_warn("wasm32-wasip2 target not installed");
            println!("  Run: rustup target add wasm32-wasip2");
            all_ok = false;
        }
    } else {
        print_warn("Could not check installed targets (rustup not found?)");
    }

    // Check project if we're in one
    println!();
    print_info("Checking project...");

    let project_root = if let Some(path) = args.path {
        Some(path)
    } else {
        find_project_root(&std::env::current_dir()?).ok()
    };

    if let Some(root) = project_root {
        print_success(&format!("Project found at: {}", root.display()));

        // Check Cargo.toml
        let cargo_toml_path = root.join("Cargo.toml");
        if cargo_toml_path.exists() {
            let content = std::fs::read_to_string(&cargo_toml_path)?;

            if content.contains("cdylib") {
                print_success("Cargo.toml: crate-type includes cdylib");
            } else {
                print_warn("Cargo.toml: crate-type should include cdylib");
            }

            if content.contains("wit-bindgen") {
                print_success("Cargo.toml: wit-bindgen dependency found");
            } else {
                print_warn("Cargo.toml: wit-bindgen dependency not found");
            }
        }

        // Check WIT directory
        let wit_dir = root.join("wit");
        if wit_dir.exists() {
            print_success("WIT directory found");

            // Check for required WIT files
            let required_files = ["world.wit", "types.wit", "window.wit", "canvas.wit"];
            for file in required_files {
                if wit_dir.join(file).exists() {
                    print_success(&format!("  wit/{} present", file));
                } else {
                    print_warn(&format!("  wit/{} missing", file));
                }
            }
        } else {
            print_error("WIT directory not found");
            all_ok = false;
        }

        // Check .cargo/config.toml
        let cargo_config = root.join(".cargo/config.toml");
        if cargo_config.exists() {
            let content = std::fs::read_to_string(&cargo_config)?;
            if content.contains("wasm32-wasip2") {
                print_success(".cargo/config.toml: WASM target configured");
            } else {
                print_warn(".cargo/config.toml: WASM target not configured");
            }
        } else {
            print_warn(".cargo/config.toml not found (optional but recommended)");
        }
    } else {
        print_info("Not in a loop-kit project directory");
    }

    println!();
    if all_ok {
        print_success("All checks passed!");
    } else {
        print_warn("Some checks failed. Please address the issues above.");
    }

    Ok(())
}
