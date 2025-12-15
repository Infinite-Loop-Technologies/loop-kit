// src/commands/dev.rs
use anyhow::Result;
use colored::*;
use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn execute(path: PathBuf) -> Result<()> {
    println!("{} Starting development mode...", "👁️".yellow());
    println!("  Watching for changes in: {}", path.display());
    println!("  Press Ctrl+C to stop\n");
    
    let watcher = Arc::new(Mutex::new(crate::watcher::DevWatcher::new(path.clone())));
    
    // Initial build and run
    watcher.lock().await.rebuild_and_run().await?;
    
    // Set up file watcher
    let (tx, rx) = std::sync::mpsc::channel();
    
    let mut watcher_impl = RecommendedWatcher::new(
        move |res| {
            if let Ok(event) = res {
                let _ = tx.send(event);
            }
        },
        Config::default(),
    )?;
    
    watcher_impl.watch(path.join("src").as_ref(), RecursiveMode::Recursive)?;
    watcher_impl.watch(path.join("wit").as_ref(), RecursiveMode::Recursive)?;
    
    // Watch for changes
    let watcher_clone = watcher.clone();
    tokio::spawn(async move {
        for event in rx {
            if let notify::Event {
                kind: notify::EventKind::Modify(_),
                ..
            } = event
            {
                println!("{} Changes detected, rebuilding...", "♻️".blue());
                if let Err(e) = watcher_clone.lock().await.rebuild_and_run().await {
                    eprintln!("{} Build failed: {}", "❌".red(), e);
                }
            }
        }
    });
    
    // Keep the main thread alive
    tokio::signal::ctrl_c().await?;
    println!("\n{} Shutting down...", "👋".yellow());
    
    Ok(())
}