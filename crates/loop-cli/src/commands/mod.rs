pub mod build;
pub mod new;
pub mod run;

use anyhow::{Result, bail};
use console::style;
use std::path::Path;

pub fn find_project_root(start: &Path) -> Result<std::path::PathBuf> {
    let mut current = start.to_path_buf();
    loop {
        if current.join("Cargo.toml").exists() && current.join("wit").exists() {
            return Ok(current);
        }
        if !current.pop() {
            bail!("Not in a loop-kit project");
        }
    }
}

pub fn print_success(msg: &str) {
    println!("{} {}", style("✓").green().bold(), msg);
}

pub fn print_info(msg: &str) {
    println!("{} {}", style("ℹ").cyan(), msg);
}

pub fn print_error(msg: &str) {
    eprintln!("{} {}", style("✗").red().bold(), msg);
}
