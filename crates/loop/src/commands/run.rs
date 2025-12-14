use anyhow::{Context, Result};
use std::path::Path;

use crate::commands::build;
use crate::runtime;

pub async fn execute(path: &str, release: bool) -> Result<()> {
    // Build first
    build::execute(path, release)?;

    let project_path = Path::new(path);
    let cargo_toml = std::fs::read_to_string(project_path.join("Cargo.toml"))?;
    let project_name = extract_project_name(&cargo_toml)?;

    let profile = if release { "release" } else { "debug" };
    let component_path = project_path
        .join("target")
        .join("wasm32-wasi")
        .join(profile)
        .join(format!("{}.component.wasm", project_name.replace("-", "_")));

    println!("Running component...\n");
    
    runtime::run_component(&component_path).await?;

    Ok(())
}

fn extract_project_name(cargo_toml: &str) -> Result<String> {
    for line in cargo_toml.lines() {
        if line.trim().starts_with("name") {
            if let Some(name) = line.split('=').nth(1) {
                return Ok(name.trim().trim_matches('"').to_string());
            }
        }
    }
    anyhow::bail!("Could not find project name in Cargo.toml")
}