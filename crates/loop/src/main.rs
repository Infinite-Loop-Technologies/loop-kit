use clap::{Parser, Subcommand};
use anyhow::Result;

mod commands;
mod runtime;
mod templates;

#[derive(Parser)]
#[command(name = "loop")]
#[command(about = "A WASM-based software building toolkit", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Create a new loop component project
    New {
        /// Name of the project
        name: String,
        
        /// Directory to create the project in (defaults to current directory)
        #[arg(short, long)]
        path: Option<String>,
    },
    
    /// Build the component
    Build {
        /// Build in release mode
        #[arg(short, long)]
        release: bool,
        
        /// Project directory
        #[arg(short, long, default_value = ".")]
        path: String,
    },
    
    /// Run the component
    Run {
        /// Build in release mode
        #[arg(short, long)]
        release: bool,
        
        /// Project directory
        #[arg(short, long, default_value = ".")]
        path: String,
    },
    
    /// Watch and rebuild on changes (dev mode)
    Dev {
        /// Project directory
        #[arg(short, long, default_value = ".")]
        path: String,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::New { name, path } => {
            commands::new::execute(name, path)?;
        }
        Commands::Build { release, path } => {
            commands::build::execute(&path, release)?;
        }
        Commands::Run { release, path } => {
            commands::run::execute(&path, release).await?;
        }
        Commands::Dev { path } => {
            commands::dev::execute(&path).await?;
        }
    }

    Ok(())
}