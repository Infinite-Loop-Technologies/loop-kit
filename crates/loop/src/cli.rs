// src/cli.rs
use clap::{Parser, Subcommand};
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "loop")]
#[command(author, version, about = "A WASM-based software building toolkit", long_about = None)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Create a new Loop project
    New {
        /// Name of the project
        name: String,

        /// Path where to create the project (defaults to current directory)
        #[arg(short, long)]
        path: Option<PathBuf>,
    },

    /// Build a Loop project
    Build {
        /// Path to the project (defaults to current directory)
        #[arg(short, long, default_value = ".")]
        path: PathBuf,

        /// Build in release mode
        #[arg(short, long)]
        release: bool,
    },

    /// Run a Loop project
    Run {
        /// Path to the project (defaults to current directory)
        #[arg(short, long, default_value = ".")]
        path: PathBuf,

        /// Run in release mode
        #[arg(short, long)]
        release: bool,
    },

    /// Development mode with hot reload
    Dev {
        /// Path to the project (defaults to current directory)
        #[arg(short, long, default_value = ".")]
        path: PathBuf,
    },
}
