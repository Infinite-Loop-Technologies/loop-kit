use anyhow::{Context, Result};
use notify::{RecursiveMode, Watcher, Event};
use std::path::Path;
use std::time::Duration;
use tokio::sync::mpsc;

use crate::commands::{build, run};

pub async fn execute(path: &str) -> Result<()> {
    let project_path = Path::new(path).canonicalize()?;
    
    println!("Starting dev mode for {}...", project_path.display());
    println!("Watching for changes...\n");

    // Initial build and run
    if let Err(e) = build::execute(path, false) {
        eprintln!("Initial build failed: {}", e);
    }

    let (tx, mut rx) = mpsc::channel(100);

    // Set up file watcher
    let mut watcher = notify::recommended_watcher(move |res: Result<Event, notify::Error>| {
        if let Ok(event) = res {
            // Only trigger on modify and create events
            if matches!(event.kind, 
                notify::EventKind::Modify(_) | 
                notify::EventKind::Create(_)
            ) {
                // Filter for rust and wit files
                let should_rebuild = event.paths.iter().any(|p| {
                    p.extension().map_or(false, |ext| {
                        ext == "rs" || ext == "wit" || ext == "toml"
                    })
                });

                if should_rebuild {
                    let _ = tx.blocking_send(());
                }
            }
        }
    })?;

    watcher.watch(&project_path.join("src"), RecursiveMode::Recursive)?;
    watcher.watch(&project_path.join("wit"), RecursiveMode::Recursive)?;
    watcher.watch(&project_path.join("Cargo.toml"), RecursiveMode::NonRecursive)?;

    let mut debounce = tokio::time::interval(Duration::from_millis(100));
    let mut pending_rebuild = false;

    loop {
        tokio::select! {
            _ = rx.recv() => {
                pending_rebuild = true;
            }
            _ = debounce.tick() => {
                if pending_rebuild {
                    pending_rebuild = false;
                    println!("\n🔄 Change detected, rebuilding...\n");
                    
                    match build::execute(path, false) {
                        Ok(_) => println!("\n✓ Build successful. Run 'loop run' to test.\n"),
                        Err(e) => eprintln!("\n✗ Build failed: {}\n", e),
                    }
                }
            }
        }
    }
}