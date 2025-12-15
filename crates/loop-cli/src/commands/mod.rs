// crates/loop-cli/src/commands/mod.rs
pub mod build;
pub mod check;
pub mod init;
pub mod new;
pub mod run;

use anyhow::{Context, Result, bail};
use console::style;
use std::path::Path;

/// Find the project root by looking for Cargo.toml
pub fn find_project_root(start: &Path) -> Result<std::path::PathBuf> {
    let mut current = start.to_path_buf();
    loop {
        let cargo_toml = current.join("Cargo.toml");
        if cargo_toml.exists() {
            // Check if it's a loop-kit project
            let content = std::fs::read_to_string(&cargo_toml)?;
            if content.contains("wasm32-wasip2") || current.join("wit").exists() {
                return Ok(current);
            }
        }
        if !current.pop() {
            bail!("Could not find loop-kit project root");
        }
    }
}

/// Print a success message
pub fn print_success(msg: &str) {
    println!("{} {}", style("✓").green().bold(), msg);
}

/// Print an info message
pub fn print_info(msg: &str) {
    println!("{} {}", style("ℹ").blue().bold(), msg);
}

/// Print a warning message
pub fn print_warn(msg: &str) {
    println!("{} {}", style("⚠").yellow().bold(), msg);
}

/// Print an error message
pub fn print_error(msg: &str) {
    eprintln!("{} {}", style("✗").red().bold(), msg);
}

/// Check if a command exists
pub fn command_exists(cmd: &str) -> bool {
    which::which(cmd).is_ok()
}
