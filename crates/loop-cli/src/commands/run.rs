// crates/loop-cli/src/commands/run.rs
use std::path::PathBuf;

use anyhow::{Result, bail};
use clap::Args;
use console::style;
use loop_runtime::{Runtime, RuntimeConfig};

use super::{find_project_root, get_package_name, print_info};

#[derive(Args)]
pub struct RunArgs {
    /// Run in release mode
    #[arg(short, long)]
    release: bool,

    /// Project directory
    #[arg(short, long)]
    path: Option<PathBuf>,

    /// Path to a specific wasm component
    #[arg(short, long)]
    component: Option<PathBuf>,

    /// Enable debug output
    #[arg(short, long)]
    debug: bool,
}

pub fn execute(args: RunArgs) -> Result<()> {
    let wasm_path = if let Some(component) = args.component {
        if !component.exists() {
            bail!("Component not found: {}", component.display());
        }
        component
    } else {
        let project_root = args
            .path
            .clone()
            .map(Ok)
            .unwrap_or_else(|| find_project_root(&std::env::current_dir()?))?;

        // Build first
        let build_args = super::build::BuildArgs {
            release: args.release,
            path: Some(project_root.clone()),
        };
        super::build::execute(build_args)?;

        // Find output
        let profile = if args.release { "release" } else { "debug" };
        let package_name = get_package_name(&project_root)?.replace('-', "_");

        project_root
            .join("target/wasm32-wasip2")
            .join(profile)
            .join(format!("{}.wasm", package_name))
    };

    print_info(&format!("Running {}", style(wasm_path.display()).cyan()));

    let config = RuntimeConfig { debug: args.debug };
    let runtime = Runtime::new(config);
    runtime.run(&wasm_path)?;

    Ok(())
}
