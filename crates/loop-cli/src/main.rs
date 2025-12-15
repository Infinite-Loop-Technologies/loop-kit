mod commands;

use anyhow::Result;
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "loop")]
#[command(about = "Loop-Kit: WASM Component Toolkit")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Create a new loop-kit project
    New(commands::new::NewArgs),
    /// Build a loop-kit project
    Build(commands::build::BuildArgs),
    /// Run a loop-kit project
    Run(commands::run::RunArgs),
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::New(args) => commands::new::execute(args),
        Commands::Build(args) => commands::build::execute(args),
        Commands::Run(args) => commands::run::execute(args),
    }
}
