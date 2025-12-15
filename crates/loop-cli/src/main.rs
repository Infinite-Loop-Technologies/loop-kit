// crates/loop-cli/src/main.rs
mod commands;

use anyhow::Result;
use clap::{Parser, Subcommand};
use tracing::Level;
use tracing_subscriber::FmtSubscriber;

#[derive(Parser)]
#[command(name = "loop")]
#[command(about = "Loop-Kit: WASM Component Toolkit")]
#[command(version)]
struct Cli {
    /// Enable verbose output
    #[arg(short, long, global = true)]
    verbose: bool,

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
    /// Check environment and project
    Check,
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    let log_level = if cli.verbose {
        Level::DEBUG
    } else {
        Level::INFO
    };
    let subscriber = FmtSubscriber::builder()
        .with_max_level(log_level)
        .with_target(false)
        .without_time()
        .finish();
    tracing::subscriber::set_global_default(subscriber).ok();

    match cli.command {
        Commands::New(args) => commands::new::execute(args),
        Commands::Build(args) => commands::build::execute(args),
        Commands::Run(args) => commands::run::execute(args),
        Commands::Check => commands::check::execute(),
    }
}
