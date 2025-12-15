use anyhow::{Context, Result, bail};
use clap::Args;
use console::style;
use std::{path::PathBuf, process::Command};

use super::{find_project_root, print_error, print_info, print_success};

#[derive(Args)]
pub struct BuildArgs {
    #[arg(short, long)]
    release: bool,
}

pub fn execute(args: BuildArgs) -> Result<()> {
    let root = find_project_root(&std::env::current_dir()?)?;

    print_info(&format!("Building {}", style(root.display()).cyan()));

    let mut cmd = Command::new("cargo");
    cmd.current_dir(&root);
    cmd.arg("build");

    if args.release {
        cmd.arg("--release");
    }

    let status = cmd.status().context("Failed to run cargo build")?;

    if !status.success() {
        bail!("Build failed");
    }

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

    print_success(&format!("Built {}", style(wasm.display()).cyan()));

    Ok(())
}
