// crates/loop-cli/src/main.rs
//! Loop CLI - The command-line interface for loop-kit

mod commands;

use anyhow::Result;
use clap::{Parser, Subcommand};
use tracing::Level;
use tracing_subscriber::FmtSubscriber;

#[derive(Parser)]
#[command(name = "loop")]
#[command(
    author,
    version,
    about = "Loop-Kit: WASM Component Toolkit for Frontend Development"
)]
#[command(propagate_version = true)]
struct Cli {
    /// Enable verbose output
    #[arg(short, long, global = true)]
    verbose: bool,

    /// Enable debug mode
    #[arg(short, long, global = true)]
    debug: bool,

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

    /// Check project configuration and dependencies
    Check(commands::check::CheckArgs),

    /// Initialize loop-kit in an existing project
    Init(commands::init::InitArgs),
}

fn main() -> Result<()> {
    let cli = Cli::parse();

    // Set up logging
    let log_level = if cli.debug {
        Level::DEBUG
    } else if cli.verbose {
        Level::INFO
    } else {
        Level::WARN
    };

    let subscriber = FmtSubscriber::builder()
        .with_max_level(log_level)
        .with_target(false)
        .finish();
    tracing::subscriber::set_global_default(subscriber)?;

    match cli.command {
        Commands::New(args) => commands::new::execute(args),
        Commands::Build(args) => commands::build::execute(args),
        Commands::Run(args) => commands::run::execute(args),
        Commands::Check(args) => commands::check::execute(args),
        Commands::Init(args) => commands::init::execute(args),
    }
}
