use anyhow::{Context, Result};
use std::path::Path;
use std::process::Command;

pub fn execute(path: &str, release: bool) -> Result<()> {
    let project_path = Path::new(path);

    if !project_path.join("Cargo.toml").exists() {
        anyhow::bail!("No Cargo.toml found in {}", path);
    }

    println!(
        "Building component{}...",
        if release { " (release)" } else { "" }
    );

    let mut cmd = Command::new("cargo");
    cmd.current_dir(project_path)
        .arg("build")
        .arg("--target")
        .arg("wasm32-wasi");

    if release {
        cmd.arg("--release");
    }

    let status = cmd.status().context("Failed to execute cargo build")?;

    if !status.success() {
        anyhow::bail!("Build failed");
    }

    // Get the project name from Cargo.toml
    let cargo_toml = std::fs::read_to_string(project_path.join("Cargo.toml"))?;
    let project_name = extract_project_name(&cargo_toml)?;

    let profile = if release { "release" } else { "debug" };
    let wasm_path = project_path
        .join("target")
        .join("wasm32-wasi")
        .join(profile)
        .join(format!("{}.wasm", project_name.replace("-", "_")));

    if !wasm_path.exists() {
        anyhow::bail!("Expected wasm file not found at {}", wasm_path.display());
    }

    // Convert to component model
    let component_path = wasm_path.with_extension("component.wasm");
    println!("Converting to component model...");

    wit_component::ComponentEncoder::default()
        .validate(true)
        .module(&std::fs::read(&wasm_path)?)?
        .encode()
        .context("Failed to encode component")
        .and_then(|bytes| {
            std::fs::write(&component_path, bytes).context("Failed to write component")
        })?;

    println!("✓ Built component: {}", component_path.display());

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
