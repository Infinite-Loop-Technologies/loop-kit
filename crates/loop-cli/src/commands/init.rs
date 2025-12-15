// crates/loop-cli/src/commands/init.rs
//! Initialize loop-kit in an existing project

use std::fs;
use std::path::PathBuf;

use anyhow::{Context, Result, bail};
use clap::Args;
use console::style;
use dialoguer::{Confirm, theme::ColorfulTheme};

use super::{print_info, print_success, print_warn};

#[derive(Args)]
pub struct InitArgs {
    /// Project directory
    #[arg(short, long)]
    path: Option<PathBuf>,

    /// Overwrite existing files
    #[arg(long)]
    force: bool,
}

pub fn execute(args: InitArgs) -> Result<()> {
    let theme = ColorfulTheme::default();

    let project_path = args
        .path
        .unwrap_or_else(|| std::env::current_dir().unwrap());

    // Check for Cargo.toml
    let cargo_toml_path = project_path.join("Cargo.toml");
    if !cargo_toml_path.exists() {
        bail!("No Cargo.toml found. Run 'loop new' to create a new project.");
    }

    print_info(&format!(
        "Initializing loop-kit in {}",
        style(project_path.display()).cyan()
    ));

    // Create wit directory
    let wit_dir = project_path.join("wit");
    if wit_dir.exists() && !args.force {
        let overwrite = Confirm::with_theme(&theme)
            .with_prompt("WIT directory already exists. Overwrite?")
            .default(false)
            .interact()?;

        if !overwrite {
            print_warn("Skipping WIT files");
        } else {
            copy_wit_files(&project_path)?;
            print_success("WIT files updated");
        }
    } else {
        fs::create_dir_all(&wit_dir)?;
        copy_wit_files(&project_path)?;
        print_success("WIT files created");
    }

    // Create/update .cargo/config.toml
    let cargo_config_dir = project_path.join(".cargo");
    let cargo_config_path = cargo_config_dir.join("config.toml");

    if !cargo_config_path.exists() || args.force {
        fs::create_dir_all(&cargo_config_dir)?;
        let config = r#"[build]
target = "wasm32-wasip2"

[target.wasm32-wasip2]
runner = "loop run"
"#;
        fs::write(&cargo_config_path, config)?;
        print_success(".cargo/config.toml created");
    } else {
        print_warn(".cargo/config.toml already exists (use --force to overwrite)");
    }

    // Update Cargo.toml
    let cargo_toml_content = fs::read_to_string(&cargo_toml_path)?;
    let mut updated = false;

    if !cargo_toml_content.contains("[lib]") || !cargo_toml_content.contains("cdylib") {
        print_warn("Please ensure your Cargo.toml has:");
        println!("  [lib]");
        println!("  crate-type = [\"cdylib\"]");
        updated = true;
    }

    if !cargo_toml_content.contains("wit-bindgen") {
        print_warn("Please add to your Cargo.toml dependencies:");
        println!("  wit-bindgen = \"0.36\"");
        updated = true;
    }

    if !updated {
        print_success("Cargo.toml looks good");
    }

    println!();
    print_success("Loop-kit initialized!");
    println!();
    println!("  Next steps:");
    println!("    1. Update your src/lib.rs to use the WIT bindings");
    println!("    2. Run {} to build", style("loop build").cyan());
    println!("    3. Run {} to test", style("loop run").cyan());

    Ok(())
}

fn copy_wit_files(project_path: &PathBuf) -> Result<()> {
    // Same as in new.rs
    let wit_dir = project_path.join("wit");

    let types_wit = include_str!("../../../../wit/types.wit");
    fs::write(wit_dir.join("types.wit"), types_wit)?;

    let window_wit = include_str!("../../../../wit/window.wit");
    fs::write(wit_dir.join("window.wit"), window_wit)?;

    let canvas_wit = include_str!("../../../../wit/canvas.wit");
    fs::write(wit_dir.join("canvas.wit"), canvas_wit)?;

    let logging_wit = include_str!("../../../../wit/logging.wit");
    fs::write(wit_dir.join("logging.wit"), logging_wit)?;

    let world_wit = include_str!("../../../../wit/world.wit");
    fs::write(wit_dir.join("world.wit"), world_wit)?;

    Ok(())
}
