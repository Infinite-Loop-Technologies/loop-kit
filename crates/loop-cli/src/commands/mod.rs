// crates/loop-cli/src/commands/mod.rs
pub mod build;
pub mod check;
pub mod new;
pub mod run;

use std::path::{Path, PathBuf};

use anyhow::{Result, bail};
use console::style;

/// Find project root by looking for Cargo.toml with loop-kit metadata or wit/ directory
pub fn find_project_root(start: &Path) -> Result<PathBuf> {
    let mut current = start.to_path_buf();
    loop {
        let cargo_toml = current.join("Cargo.toml");
        let wit_dir = current.join("wit");

        if cargo_toml.exists() && wit_dir.exists() {
            return Ok(current);
        }

        if !current.pop() {
            bail!("Could not find loop-kit project (no Cargo.toml with wit/ directory)");
        }
    }
}

/// Get package name from Cargo.toml
pub fn get_package_name(project_root: &Path) -> Result<String> {
    let cargo_toml_path = project_root.join("Cargo.toml");
    let content = std::fs::read_to_string(&cargo_toml_path)?;
    let parsed: toml::Value = toml::from_str(&content)?;

    parsed["package"]["name"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| anyhow::anyhow!("Could not find package name in Cargo.toml"))
}

pub fn print_success(msg: &str) {
    println!("{} {}", style("✓").green().bold(), msg);
}

pub fn print_info(msg: &str) {
    println!("{} {}", style("→").blue().bold(), msg);
}

pub fn print_error(msg: &str) {
    eprintln!("{} {}", style("✗").red().bold(), msg);
}

pub fn command_exists(cmd: &str) -> bool {
    which::which(cmd).is_ok()
}
