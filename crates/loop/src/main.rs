// src/main.rs
mod cli;
mod commands;
mod host;
mod project;
mod runtime;
mod watcher;

use anyhow::Result;
use clap::Parser;
use cli::{Cli, Commands};

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    
    match cli.command {
        Commands::New { name, path } => {
            commands::new::execute(name, path)?;
        }
        Commands::Build { path, release } => {
            commands::build::execute(path, release).await?;
        }
        Commands::Run { path, release } => {
            commands::run::execute(path, release).await?;
        }
        Commands::Dev { path } => {
            commands::dev::execute(path).await?;
        }
    }
    
    Ok(())
}