// src/commands/build.rs
use anyhow::{Context, Result};
use colored::*;
use indicatif::{ProgressBar, ProgressStyle};
use std::path::PathBuf;
use std::process::Command;

pub async fn execute(path: PathBuf, release: bool) -> Result<()> {
    println!("{} Building Loop project...", "🔨".blue());
    
    let spinner = ProgressBar::new_spinner();
    spinner.set_style(
        ProgressStyle::default_spinner()
            .tick_strings(&["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"])
            .template("{spinner:.green} {msg}")?,
    );
    spinner.set_message("Compiling WASM component...");
    spinner.enable_steady_tick(std::time::Duration::from_millis(100));
    
    // Build with cargo
    let mut cmd = Command::new("cargo");
    cmd.current_dir(&path)
        .arg("build")
        .arg("--target=wasm32-wasi");
    
    if release {
        cmd.arg("--release");
    }
    
    let output = cmd
        .output()
        .context("Failed to execute cargo build")?;
    
    spinner.finish_and_clear();
    
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        anyhow::bail!("Build failed:\n{}", stderr);
    }
    
    // Post-process WASM (componentize)
    let wasm_path = path
        .join("target/wasm32-wasi")
        .join(if release { "release" } else { "debug" })
        .join(format!("{}.wasm", get_project_name(&path)?));
    
    if !wasm_path.exists() {
        anyhow::bail!("WASM file not found at: {}", wasm_path.display());
    }
    
    println!("{} Build completed successfully!", "✅".green());
    println!("  Output: {}", wasm_path.display().to_string().dimmed());
    
    Ok(())
}

fn get_project_name(path: &PathBuf) -> Result<String> {
    let cargo_toml = path.join("Cargo.toml");
    let contents = std::fs::read_to_string(&cargo_toml)
        .context("Failed to read Cargo.toml")?;
    
    let manifest: toml::Value = toml::from_str(&contents)
        .context("Failed to parse Cargo.toml")?;
    
    manifest
        .get("package")
        .and_then(|p| p.get("name"))
        .and_then(|n| n.as_str())
        .map(String::from)
        .ok_or_else(|| anyhow::anyhow!("Failed to get project name from Cargo.toml"))
}