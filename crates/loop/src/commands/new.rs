use anyhow::{Context, Result};
use std::fs;
use std::path::PathBuf;

use crate::templates;

pub fn execute(name: String, path: Option<String>) -> Result<()> {
    let base_path = path.unwrap_or_else(|| ".".to_string());
    let project_path = PathBuf::from(base_path).join(&name);

    if project_path.exists() {
        anyhow::bail!("Directory '{}' already exists", project_path.display());
    }

    println!("Creating new loop component: {}", name);

    // Create project directory structure
    fs::create_dir_all(&project_path)?;
    fs::create_dir_all(project_path.join("src"))?;
    fs::create_dir_all(project_path.join("wit"))?;

    // Write Cargo.toml
    fs::write(
        project_path.join("Cargo.toml"),
        templates::cargo_toml(&name),
    )?;

    // Write main.rs
    fs::write(project_path.join("src").join("lib.rs"), templates::lib_rs())?;

    // Write WIT definition
    fs::write(
        project_path.join("wit").join("world.wit"),
        templates::world_wit(&name),
    )?;

    // Write .cargo/config.toml for wasm target
    fs::create_dir_all(project_path.join(".cargo"))?;
    fs::write(
        project_path.join(".cargo").join("config.toml"),
        templates::cargo_config(),
    )?;

    // Write README
    fs::write(project_path.join("README.md"), templates::readme(&name))?;

    println!("✓ Created project at {}", project_path.display());
    println!("\nNext steps:");
    println!("  cd {}", name);
    println!("  loop build");
    println!("  loop run");

    Ok(())
}
