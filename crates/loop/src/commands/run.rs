// src/commands/run.rs
use anyhow::{Context, Result};
use colored::*;
use std::path::PathBuf;

pub async fn execute(path: PathBuf, release: bool) -> Result<()> {
    // First build the project
    super::build::execute(path.clone(), release).await?;
    
    println!("{} Running Loop application...", "🚀".cyan());
    
    let project_name = super::build::get_project_name(&path)?;
    let wasm_path = path
        .join("target/wasm32-wasi")
        .join(if release { "release" } else { "debug" })
        .join(format!("{}.wasm", project_name));
    
    // Create and run the WASM runtime
    let runtime = crate::runtime::Runtime::new()?;
    runtime.run(&wasm_path).await?;
    
    Ok(())
}