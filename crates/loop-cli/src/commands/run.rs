use anyhow::{Context, Result};
use clap::Args;
use console::style;
use loop_runtime::{Runtime, RuntimeConfig};

use super::{build, find_project_root, print_info};

#[derive(Args)]
pub struct RunArgs {
    #[arg(short, long)]
    release: bool,

    #[arg(short, long)]
    debug: bool,
}

pub fn execute(args: RunArgs) -> Result<()> {
    let root = find_project_root(&std::env::current_dir()?)?;

    // Build first
    build::execute(build::BuildArgs {
        release: args.release,
    })?;

    let profile = if args.release { "release" } else { "debug" };
    let cargo_toml: toml::Value =
        toml::from_str(&std::fs::read_to_string(root.join("Cargo.toml"))?)?;
    let name = cargo_toml["package"]["name"]
        .as_str()
        .unwrap()
        .replace('-', "_");

    let wasm = root
        .join("target/wasm32-wasip2")
        .join(profile)
        .join(format!("{}.wasm", name));

    print_info(&format!("Running {}", style(wasm.display()).cyan()));

    let runtime = Runtime::new(RuntimeConfig { debug: args.debug })?;
    runtime.run(&wasm)?;

    Ok(())
}
